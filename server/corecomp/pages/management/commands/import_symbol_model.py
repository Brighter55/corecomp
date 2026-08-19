from django.core.management.base import BaseCommand
from pages.models import Symbol
import requests
from django.db import transaction
from dotenv import load_dotenv
import os
import re


load_dotenv()

WISESHEETS_BASE = "https://api.wisesheets.io/v1"
SEC_COMPANY_TICKERS = "https://www.sec.gov/files/company_tickers.json"
PAGE_LIMIT = 100
MAX_PAGES = 1000

# WiseSheets has no asset-type field, so non-common-stock entities are filtered
# by a conservative name denylist. REITs/CEFs (names often containing "TRUST")
# are kept -- they are traded equities and belong in the universe.
NAME_DENYLIST = re.compile(r"\b(ETF|FUND|UNIT|PARTNERSHIP|NOTES|PREFERRED)\b", re.IGNORECASE)


class Command(BaseCommand):
    help = 'a command to update or create a Symbol model'

    def add_arguments(self, parser):
        parser.add_argument("--source", choices=["wisesheets", "sec"], default="wisesheets")
        parser.add_argument("--max-pages", type=int, default=MAX_PAGES)

    def handle(self, *args, **options):
        source = options["source"]
        max_pages = options["max_pages"]

        pages_fetched = 0
        companies = None

        if source == "wisesheets":
            companies, pages_fetched = self._fetch_wisesheets(max_pages)
            if companies is None:
                self.stdout.write("WiseSheets enumeration failed; falling back to SEC EDGAR")
                companies, pages_fetched = self._fetch_sec()
        else:
            companies, pages_fetched = self._fetch_sec()

        if not companies:
            self.stdout.write("no companies fetched; aborting without changes")
            return

        # A partial enumeration (safety cap hit) is not a reliable universe --
        # do not delete anything, only upsert.
        capped = source == "wisesheets" and pages_fetched >= max_pages
        if capped:
            self.stdout.write(f"WARNING: hit {max_pages}-page cap; skipping deletions")

        total_deletion = 0
        total_addition = 0

        # make sure to save only when every operations succeed and rollback if error occurs
        with transaction.atomic():
            if not capped:
                active_symbols = {c["symbol"] for c in companies}
                for record in Symbol.objects.exclude(symbol__in=active_symbols):
                    record.delete()
                    total_deletion += 1

            for company in companies:
                record, created = Symbol.objects.update_or_create(
                    symbol=company["symbol"],
                    defaults={"name": company["name"], "type": "Stock"},
                )
                if created:
                    total_addition += 1

        print(f"total deletion: {total_deletion}")
        print(f"total addition: {total_addition}")
        print(f"total pages: {pages_fetched}")

    def _fetch_wisesheets(self, max_pages):
        """Paginate /v1/companies/ (limit=100, follow meta.nextCursor).

        Returns (companies_or_None, pages_fetched). None on any error so the
        caller can fall back to the SEC EDGAR list.
        """
        api_key = os.getenv("WISESHEETS_API_KEY")
        if not api_key:
            self.stdout.write("WISESHEETS_API_KEY not set")
            return None, 0

        companies = {}
        cursor = None
        pages = 0
        while pages < max_pages:
            params = {"limit": PAGE_LIMIT}
            if cursor:
                params["cursor"] = cursor
            try:
                response = requests.get(
                    f"{WISESHEETS_BASE}/companies/",
                    params=params,
                    headers={"Authorization": f"Bearer {api_key}"},
                    timeout=30,
                )
            except requests.RequestException as exc:
                self.stdout.write(f"request error on page {pages + 1}: {exc}")
                return None, pages

            if response.status_code != 200:
                self.stdout.write(f"unexpected status {response.status_code} on page {pages + 1}")
                return None, pages

            data = response.json()
            meta = data.get("meta", {})
            for row in data.get("data", []):
                symbol = str(row.get("ticker", "")).strip().upper()
                name = str(row.get("name", "")).strip()
                if not symbol or not name:
                    continue
                if NAME_DENYLIST.search(name):
                    continue
                companies[symbol] = {"symbol": symbol, "name": name}

            pages += 1
            cursor = meta.get("nextCursor")
            if not cursor:
                break

        if pages >= max_pages:
            self.stdout.write(f"reached {max_pages}-page cap; enumeration may be incomplete")

        return list(companies.values()), pages

    def _fetch_sec(self):
        """SEC EDGAR company_tickers.json fallback (one free call, no key)."""
        try:
            response = requests.get(
                SEC_COMPANY_TICKERS,
                headers={"User-Agent": "CoreComp corecomp.cc"},
                timeout=30,
            )
            response.raise_for_status()
            data = response.json()
        except (requests.RequestException, ValueError) as exc:
            self.stdout.write(f"SEC EDGAR fetch failed: {exc}")
            return None, 0

        companies = {}
        for entry in data.values():
            symbol = str(entry.get("ticker", "")).strip().upper()
            name = str(entry.get("title", "")).strip()
            if not symbol or not name:
                continue
            # class-share / ETF conventions absent from the stock universe
            if "." in symbol or "^" in symbol:
                continue
            if NAME_DENYLIST.search(name):
                continue
            companies[symbol] = {"symbol": symbol, "name": name}

        return list(companies.values()), 1
