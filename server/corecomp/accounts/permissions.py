from rest_framework.permissions import BasePermission


class IsSubscribed(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if user.subscription_status in ["trialing", "active"]:
            return True
        else:
            return False
