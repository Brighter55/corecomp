"""Bring a local/CI database and Redis into a known state for the browser suite.

Idempotent and offline. Run by the Playwright `webServer` before `runserver`.

Deliberately a management command and NOT a data migration: `render.yaml`
deploys `server/`, so a migration would inject these tickers into production on
the next deploy. A migration also cannot flush Redis.
"""

import json
import os

from django.core.management import call_command
from django.core.management.base import BaseCommand, CommandError
from django_redis import get_redis_connection
from pages.models import Symbol
from pages.services import SAMPLES_DIR

# The statement fixtures are all IBM, so /overview/:symbol specs need it. The
# dip tickers are read from dip_rows.json below rather than listed again here,
# so the seed list cannot drift from the fixtures that serve them.
EXTRA_SYMBOLS = [("IBM", "INTERNATIONAL BUSINESS MACHINES CORP")]


class Command(BaseCommand):
    help = "Migrate, flush this Redis DB, and seed Symbol rows for the browser suite."

    def handle(self, *args, **options):
        # The guard that makes this a test helper rather than a footgun. This
        # command flushes a Redis DB and writes rows; both are unacceptable
        # against production, and MOCK is never True there.
        if os.getenv("MOCK") != "True":
            raise CommandError(
                "e2e_prepare refuses to run unless MOCK=True. It flushes Redis and "
                "seeds fake symbol rows, so it must never touch a real environment."
            )

        call_command("migrate", "--noinput", verbosity=0)

        redis = get_redis_connection("default")
        # flushdb(), not clear_cache (which is FLUSHALL across every DB). The
        # browser suite pins its own DB index (redis://.../2), so this cannot
        # disturb a developer's cache.
        #
        # This is also the anonymous-quota reset: `anon_quota:{session}` is
        # written on the raw connection, bypassing django-redis, so no app code
        # clears it and a second run of a spec would otherwise start already
        # spent.
        redis.flushdb()

        rows = self._seed_rows()
        created = 0
        for symbol, name in rows:
            # Symbol.symbol has no unique constraint, so a loaddata fixture would
            # insert duplicates on a second run. filter().first() is used rather
            # than get_or_create() because get_or_create raises
            # MultipleObjectsReturned if duplicates already exist.
            if Symbol.objects.filter(symbol=symbol).exists():
                continue
            Symbol.objects.create(symbol=symbol, name=name, type="Stock")
            created += 1

        db_index = redis.connection_pool.connection_kwargs.get("db")
        self.stdout.write(
            self.style.SUCCESS(
                f"e2e_prepare: flushed redis db {db_index}, "
                f"seeded {created} new symbol(s), {len(rows)} known"
            )
        )

    def _seed_rows(self):
        """Tickers the fixtures can actually serve, taken from the fixtures."""
        rows = []
        dip_path = SAMPLES_DIR / "dip_rows.json"
        if dip_path.is_file():
            payload = json.loads(dip_path.read_text(encoding="utf-8"))
            for entry in payload.values():
                rows.append((entry["symbol"], entry.get("name", entry["symbol"])))
        else:
            self.stdout.write(
                self.style.WARNING(f"e2e_prepare: {dip_path} not found, skipping dip tickers")
            )

        known = {symbol for symbol, _ in rows}
        rows.extend(extra for extra in EXTRA_SYMBOLS if extra[0] not in known)
        return rows
