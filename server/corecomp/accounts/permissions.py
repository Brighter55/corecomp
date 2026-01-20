from rest_framework.permissions import BasePermission


class IsSubscribed(BasePermission):
    def has_permission(self, request, view):
        user = request.user

        #check if the user is anonymous
        if user.is_anonymous:
            return False

        # check if the user is subscribed
        if user.subscription_status in ["trialing", "active"]:
            return True
        else:
            return False
