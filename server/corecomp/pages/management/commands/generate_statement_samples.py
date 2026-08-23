"""Fetch LIVE WiseSheets data and regenerate the AV-shaped mock fixtures.

Replaces the Alpha Vantage-derived sample data in pages/statement_samples/ with
real WiseSheets data by running it through the existing WiseSheets -> AV mapper
(pages/wisesheets.py). This is the "first fetch": after it, mock mode (MOCK=True)
serves fixtures that faithfully mirror what the live provider returns.

Run from server/:
    pipenv run python corecomp/manage.py generate_statement_samples --symbol IBM

Two-phase: fetches + validates all 8 results before writing anything, so an API
failure can never leave the fixture set half-overwritten. The fixture files under
pages/statement_samples/ are gitignored — commit only this command, not the files.
"""

import json
import os

from django.core.management.base import BaseCommand, CommandError
from rest_framework.response import Response

from pages.services import FinancialDataService, SAMPLES_DIR


class Command(BaseCommand):
    help = (
        "Fetch live WiseSheets data for --symbol, run it through the AV-shaped "
        "mapper, and overwrite the mock fixtures in pages/statement_samples/. "
        "Two-phase: fetches+validates all results before writing any file."
    )

    # FinancialDataService.get_* method -> fixture file MockFinancialDataService reads.
    FILES = {
        "get_current_price": "global_quote.json",
        "get_overview": "overview.json",
        "get_income_statement": "income_statement.json",
        "get_cash_flow": "cashflow.json",
        "get_balance_sheet": "balance_sheet.json",
        "get_earnings": "earnings.json",
        "get_dividends": "dividends.json",
        "get_pricing": "pricing.json",
    }

    # Read by zero code paths (verified). Left untouched on purpose.
    IGNORED = [
        "balance_sheet_no_data.json",
        "cashflow_no_data.json",
        "dividends_no_data.json",
        "earnings_no_data.json",
        "income_statement_no_data.json",
        "shares_outstanding.json",
        "shares_outstanding_no_data.json",
    ]

    def add_arguments(self, parser):
        parser.add_argument("--symbol", default="IBM", help="Ticker symbol (default: IBM)")
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Fetch + validate + print counts, but do not write files",
        )

    def handle(self, *args, **options):
        symbol = options["symbol"].strip().upper()
        dry_run = options["dry_run"]
        if not symbol:
            raise CommandError("--symbol cannot be empty")
        if not os.getenv("WISESHEETS_API_KEY"):
            raise CommandError(
                "WISESHEETS_API_KEY is not set. Run from server/ so load_dotenv() "
                "(invoked by pages.services at import) picks up .env."
            )

        self.stdout.write(self.style.NOTICE(
            f"Generating mock samples from LIVE WiseSheets data for {symbol} "
            "(FinancialDataService() bypasses MOCK=True)"
        ))

        service = FinancialDataService()  # always live, never the mock service

        # ---- Phase 1: fetch + validate ALL results, write nothing. ----
        results = {}
        for method_name, filename in self.FILES.items():
            self.stdout.write(f"  fetching {filename} ... ", ending="")
            result = getattr(service, method_name)(symbol)

            if isinstance(result, Response):
                self.stdout.write(self.style.ERROR("ERROR response"))
                raise CommandError(
                    f"{filename} ({method_name}) returned a DRF Response "
                    f"(status={result.status_code}, data={result.data!r}). "
                    "Aborting; no files were written."
                )

            issue = self._soft_issue(filename, result)
            self.stdout.write(self.style.SUCCESS("ok" if not issue else issue))
            results[filename] = result

        if dry_run:
            self.stdout.write(self.style.NOTICE("--dry-run: not writing any files"))
            for filename, data in results.items():
                self.stdout.write(f"  would write {filename}: {self._summary(filename, data)}")
            self._print_footer()
            return

        # ---- Phase 2: all fetches valid -> write all files atomically. ----
        for filename, data in results.items():
            path = SAMPLES_DIR / filename
            tmp = path.with_suffix(path.suffix + ".tmp")
            with open(tmp, "w", encoding="utf-8") as fh:
                json.dump(data, fh, indent=4)
                fh.write("\n")
            os.replace(tmp, path)  # atomic overwrite (works on Windows)
            self.stdout.write(self.style.SUCCESS(
                f"  wrote {filename}: {self._summary(filename, data)}"
            ))

        self._print_footer()

    def _soft_issue(self, filename, result):
        """Return a warning string for tolerable-empty results, or '' if fine.

        Raises CommandError (abort) for hard-empty results — called only from
        Phase 1, so no file has been touched yet.
        """
        if filename == "global_quote.json":
            return "" if result.get("Global Quote") else "WARNING: no price, written as-is"
        if filename == "dividends.json":
            return "" if result.get("data") else "WARNING: no dividend rows, written as-is"
        if not result:
            raise CommandError(
                f"{filename} came back empty {{}} - symbol likely has no data. "
                "Aborting; no files were written."
            )
        return ""

    def _summary(self, filename, data):
        if filename == "global_quote.json":
            quote = data["Global Quote"]
            return f"price={quote['05. price']}" if quote else "empty Global Quote"
        if filename == "overview.json":
            return f"{len(data)} keys"
        if filename in ("income_statement.json", "cashflow.json", "balance_sheet.json"):
            return (
                f"{len(data.get('annualReports', []))} annual, "
                f"{len(data.get('quarterlyReports', []))} quarterly"
            )
        if filename == "earnings.json":
            return (
                f"{len(data.get('annualEarnings', []))} annual, "
                f"{len(data.get('quarterlyEarnings', []))} quarterly"
            )
        if filename == "dividends.json":
            rows = data.get("data", [])
            if not rows:
                return "0 rows"
            return f"{len(rows)} rows, first ex-date {rows[0].get('ex_dividend_date')}"
        if filename == "pricing.json":
            series = data.get("Monthly Adjusted Time Series", {})
            dates = sorted(series)
            if not dates:
                return "0 monthly points"
            return f"{len(series)} monthly points, {dates[0]}..{dates[-1]}"
        return ""

    def _print_footer(self):
        self.stdout.write(self.style.NOTICE(
            "Skipped (read by no code): " + ", ".join(self.IGNORED)
        ))
        self.stdout.write(self.style.WARNING(
            "statement_samples/ is gitignored - do NOT commit the fixtures. "
            "Commit only this command file."
        ))
