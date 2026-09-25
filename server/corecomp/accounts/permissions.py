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


class AllowAnonymousWithQuotaList(BasePermission):
    """Batch counterpart to AllowAnonymousWithQuota, for endpoints that take a
    "symbols" list (e.g. /pages/dip).

    Shares the same anon_quota:{session_id} set, so a visitor's allowance is
    spent across /dip and the single-symbol endpoints alike rather than being
    granted twice. Unlike the scalar permission, this one checks first and
    writes only once the request is known to fit -- a denied request must not
    grow the set or refresh its TTL.
    """

    QUOTA = 5
    TTL_SECONDS = 60 * 60 * 24 * 30  # ~1 month

    def has_permission(self, request, view):
        user = request.user
        if user and user.is_authenticated:
            return True

        session_id = request.headers.get("X-Anonymous-Session")
        if not session_id:
            raise PermissionDenied(detail="quota_exceeded")

        # DRF checks permissions before the serializer runs, so request.data is
        # unvalidated here and is not guaranteed to be a mapping.
        payload = request.data if isinstance(request.data, dict) else {}
        symbols = payload.get("symbols")
        if not isinstance(symbols, (list, tuple)):
            raise PermissionDenied(detail="quota_exceeded")

        requested = {
            str(symbol).strip().upper() for symbol in symbols if str(symbol).strip()
        }
        if not requested:
            raise PermissionDenied(detail="quota_exceeded")

        redis = get_redis_connection("default")
        key = f"anon_quota:{session_id}"
        # Written outside django-redis, so no cache key prefix -- this set is
        # shared with AllowAnonymousWithQuota and must stay unprefixed.
        existing = {
            member.decode() if isinstance(member, bytes) else str(member)
            for member in redis.smembers(key)
        }

        new_symbols = requested - existing
        if len(existing) + len(new_symbols) > self.QUOTA:
            raise PermissionDenied(detail="quota_exceeded")

        # The request fits, so it is now safe to spend the quota.
        if new_symbols:
            redis.sadd(key, *new_symbols)
            redis.expire(key, self.TTL_SECONDS)
        return True
