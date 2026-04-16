from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Full user details – used for profile responses."""

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "avatar",
            "bio",
            "phone",
            "oauth_provider",
            "date_joined",
        ]
        read_only_fields = ["id", "username", "email", "oauth_provider", "date_joined"]


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Allows users to update their profile details."""

    class Meta:
        model = User
        fields = ["first_name", "last_name", "avatar", "bio", "phone", "role"]

    def validate_role(self, value):
        """Ensure role is a valid choice."""
        if value not in [User.Role.USER, User.Role.CREATOR]:
            raise serializers.ValidationError("Role must be 'user' or 'creator'.")
        return value


class OAuthCallbackSerializer(serializers.Serializer):
    """Validates the authorization code sent from the frontend."""

    code = serializers.CharField(required=True, help_text="Authorization code from OAuth provider")
    redirect_uri = serializers.URLField(
        required=False,
        help_text="Redirect URI used in the OAuth flow (must match the one registered with the provider)",
    )
