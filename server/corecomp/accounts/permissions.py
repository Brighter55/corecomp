from rest_framework.permissions import BasePermission
from rest_framework.exceptions import PermissionDenied
from django_redis import get_redis_connection


class AllowAnonymousWithQuota(BasePermission):
    """Authenticated users get unlimited access. Anonymous users get QUOTA
    unique symbols per ~30 days, tracked per X-Anonymous-Session header."""

    QUOTA = 5
    TTL_SECONDS = 60 * 60 * 24 * 30  # ~1 month

    def has_permission(self, request, view):
        user = request.user
        if user and user.is_authenticated:
            return True

        session_id = request.headers.get("X-Anonymous-Session")
        if not session_id:
            raise PermissionDenied(detail="quota_exceeded")

        symbol = (request.data or {}).get("symbol")
        if not symbol:
            raise PermissionDenied(detail="quota_exceeded")

        redis = get_redis_connection("default")
        key = f"anon_quota:{session_id}"
        added = redis.sadd(key, str(symbol).upper())
        if added:
            redis.expire(key, self.TTL_SECONDS)
        if redis.scard(key) > self.QUOTA:
            raise PermissionDenied(detail="quota_exceeded")
        return True
