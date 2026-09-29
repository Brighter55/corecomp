#!/usr/bin/env python3
"""Mint a valid `access_token` cookie value for a local browser-test user.

The browser suite cannot complete a real Google OAuth flow, so it authenticates
by setting the same httpOnly JWT cookie a real sign-in would produce. The token
is signed offline with the same SECRET_KEY the running server has, which is
exactly what `RefreshToken.for_user()` does.

DELIBERATELY NOT a Django management command. `render.yaml` deploys only
`server/` (rootDir: server), so a file under `scripts/` can never be reached in
production. A script that prints a working access token is a
privilege-escalation tool, and "it cannot be deployed" is the guard that
actually holds -- not a flag someone could set.

Belt and braces: it refuses to run unless the environment is unmistakably a
browser-test one.

Usage:
    python scripts/e2e_mint_token.py --email e2e@corecomp.test
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DJANGO_DIR = ROOT / "server" / "corecomp"

sys.path.insert(0, str(DJANGO_DIR))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "corecomp.settings")

import django  # noqa: E402

django.setup()

from django.contrib.auth import get_user_model  # noqa: E402
from rest_framework_simplejwt.tokens import RefreshToken  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--email", required=True, help="the browser-test account")
    args = parser.parse_args()

    # Both are E2E-only settings and neither can be true on a real deployment:
    # MOCK is False there, and AUTH_COOKIE_SECURE must be True over https.
    if os.getenv("MOCK") != "True" or os.getenv("AUTH_COOKIE_SECURE") != "False":
        sys.exit(
            "[e2e_mint_token] refusing to mint a token outside a browser-test "
            "environment (needs MOCK=True and AUTH_COOKIE_SECURE=False)."
        )

    User = get_user_model()
    user, created = User.objects.get_or_create(
        username=args.email,
        defaults={"email": args.email, "is_active": True},
    )
    if not user.is_active:
        user.is_active = True
        user.save(update_fields=["is_active"])

    print(
        json.dumps(
            {
                "email": user.email,
                "created": created,
                "access_token": str(RefreshToken.for_user(user).access_token),
            }
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
