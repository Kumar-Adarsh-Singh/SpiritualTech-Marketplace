import requests as http_requests
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.serializers import (
    OAuthCallbackSerializer,
    ProfileUpdateSerializer,
    UserSerializer,
)

User = get_user_model()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def get_tokens_for_user(user):
    """Generate JWT access + refresh tokens for a user."""
    refresh = RefreshToken.for_user(user)
    # Embed custom claims
    refresh["role"] = user.role
    refresh["email"] = user.email
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


def get_or_create_oauth_user(provider, uid, email, first_name, last_name, avatar):
    """
    Find an existing user by OAuth provider+uid, or by email.
    Create a new one if neither exists.
    """
    # Try by provider + uid first
    user = User.objects.filter(oauth_provider=provider, oauth_uid=uid).first()
    if user:
        return user

    # Try by email
    user = User.objects.filter(email=email).first()
    if user:
        # Link OAuth to existing account
        user.oauth_provider = provider
        user.oauth_uid = uid
        if avatar and not user.avatar:
            user.avatar = avatar
        user.save(update_fields=["oauth_provider", "oauth_uid", "avatar"])
        return user

    # Create new user
    username = email.split("@")[0]
    # Ensure unique username
    base_username = username
    counter = 1
    while User.objects.filter(username=username).exists():
        username = f"{base_username}{counter}"
        counter += 1

    user = User.objects.create_user(
        username=username,
        email=email,
        first_name=first_name or "",
        last_name=last_name or "",
        avatar=avatar or "",
        oauth_provider=provider,
        oauth_uid=uid,
    )
    return user


# ---------------------------------------------------------------------------
# Google OAuth
# ---------------------------------------------------------------------------

class GoogleLoginView(APIView):
    """
    Receive an authorization code from the frontend, exchange it with Google
    for an access token, fetch user info, create/get the user, and return JWT.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OAuthCallbackSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        code = serializer.validated_data["code"]
        redirect_uri = serializer.validated_data.get(
            "redirect_uri", settings.GOOGLE_REDIRECT_URI
        )

        # Step 1: Exchange code for access token
        token_response = http_requests.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code",
            },
            timeout=10,
        )

        if token_response.status_code != 200:
            return Response(
                {"error": "Failed to exchange code with Google.", "details": token_response.json()},
                status=status.HTTP_400_BAD_REQUEST,
            )

        access_token = token_response.json().get("access_token")

        # Step 2: Fetch user info from Google
        user_info_response = http_requests.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=10,
        )

        if user_info_response.status_code != 200:
            return Response(
                {"error": "Failed to fetch user info from Google."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user_info = user_info_response.json()

        # Step 3: Create or get user
        user = get_or_create_oauth_user(
            provider="google",
            uid=str(user_info.get("id")),
            email=user_info.get("email", ""),
            first_name=user_info.get("given_name", ""),
            last_name=user_info.get("family_name", ""),
            avatar=user_info.get("picture", ""),
        )

        # Step 4: Return JWT tokens + user info
        tokens = get_tokens_for_user(user)
        return Response(
            {
                "tokens": tokens,
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


# ---------------------------------------------------------------------------
# GitHub OAuth
# ---------------------------------------------------------------------------

class GitHubLoginView(APIView):
    """
    Receive an authorization code from the frontend, exchange it with GitHub
    for an access token, fetch user info, create/get the user, and return JWT.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OAuthCallbackSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        code = serializer.validated_data["code"]
        redirect_uri = serializer.validated_data.get(
            "redirect_uri", settings.GITHUB_REDIRECT_URI
        )

        # Step 1: Exchange code for access token
        token_response = http_requests.post(
            "https://github.com/login/oauth/access_token",
            data={
                "code": code,
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "redirect_uri": redirect_uri,
            },
            headers={"Accept": "application/json"},
            timeout=10,
        )

        if token_response.status_code != 200:
            return Response(
                {"error": "Failed to exchange code with GitHub."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token_data = token_response.json()
        access_token = token_data.get("access_token")

        if not access_token:
            return Response(
                {"error": "No access token received from GitHub.", "details": token_data},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Step 2: Fetch user info from GitHub
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json",
        }

        user_info_response = http_requests.get(
            "https://api.github.com/user",
            headers=headers,
            timeout=10,
        )
        user_info = user_info_response.json()

        # GitHub might not expose email publicly; fetch from /user/emails
        email = user_info.get("email")
        if not email:
            emails_response = http_requests.get(
                "https://api.github.com/user/emails",
                headers=headers,
                timeout=10,
            )
            emails = emails_response.json()
            primary_emails = [e for e in emails if e.get("primary") and e.get("verified")]
            if primary_emails:
                email = primary_emails[0]["email"]
            elif emails:
                email = emails[0]["email"]

        if not email:
            return Response(
                {"error": "Could not retrieve email from GitHub. Please make your email public."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Parse name
        full_name = user_info.get("name", "") or ""
        name_parts = full_name.split(" ", 1)
        first_name = name_parts[0] if name_parts else ""
        last_name = name_parts[1] if len(name_parts) > 1 else ""

        # Step 3: Create or get user
        user = get_or_create_oauth_user(
            provider="github",
            uid=str(user_info.get("id")),
            email=email,
            first_name=first_name,
            last_name=last_name,
            avatar=user_info.get("avatar_url", ""),
        )

        # Step 4: Return JWT tokens + user info
        tokens = get_tokens_for_user(user)
        return Response(
            {
                "tokens": tokens,
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


# ---------------------------------------------------------------------------
# Profile
# ---------------------------------------------------------------------------

class ProfileView(generics.RetrieveUpdateAPIView):
    """
    GET  → retrieve the authenticated user's profile.
    PUT/PATCH → update profile fields (name, avatar, bio, phone, role).
    """

    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return ProfileUpdateSerializer
        return UserSerializer


# ---------------------------------------------------------------------------
# JWT Refresh (convenience wrapper)
# ---------------------------------------------------------------------------

class TokenRefreshView(APIView):
    """
    Accept a refresh token and return a new access + refresh pair.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {"error": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            refresh = RefreshToken(refresh_token)
            return Response(
                {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
                status=status.HTTP_200_OK,
            )
        except Exception:
            return Response(
                {"error": "Invalid or expired refresh token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
