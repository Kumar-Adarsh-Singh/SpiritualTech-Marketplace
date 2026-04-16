from rest_framework.permissions import BasePermission


class IsCreator(BasePermission):
    """Only allow users with the 'creator' role."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "creator"
        )


class IsOwnerOrReadOnly(BasePermission):
    """
    Object-level permission:
    - Read (GET, HEAD, OPTIONS) → allowed for anyone.
    - Write (PUT, PATCH, DELETE) → only the object owner.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True
        # `obj` must have a `creator` or `user` attribute
        owner = getattr(obj, "creator", None) or getattr(obj, "user", None)
        return owner == request.user
