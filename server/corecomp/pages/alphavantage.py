"""Alpha Vantage client for the market-wide earnings calendar.

Only EARNINGS_CALENDAR lives here. Two things make it unlike the WiseSheets
client in pages/wisesheets.py.

First, this provider answers in CSV, not JSON -- the columns are
`symbol,name,reportDate,fiscalDateEnding,estimate,currency,timeOfTheDay`.

Second, and the reason this module exists at all: Alpha Vantage reports rate
limiting and errors with HTTP **200**, in the same 200 body, as JSON
`Note`/`Information` or as a mangled body. The observed failure was the normal
CSV header followed by a second line reading `I,n,f,o,r,m,a` -- seven characters
of the word "Information" written one field per character. A client that trusts
the status code and hands that to csv.DictReader turns a quota exhaustion into a
calendar with one garbage tile, which the view then caches for six hours. So
fetch_earnings_calendar refuses anything that is not a real calendar instead.

One public function: fetch_earnings_calendar returns the CSV text on success, or
a DRF Response for every failure, so the service branches with
isinstance(data, Response) exactly as the WiseSheets callers do. The key is read
here and never logged.
"""

import csv
import io
import json
import os
from datetime import date

import requests
from dotenv import load_dotenv
from rest_framework import status
from rest_framework.response import Response

load_dotenv()

BASE_URL = "https://www.alphavantage.co/query"
REQUEST_TIMEOUT = 10

# Fixed by the frozen contract and the design decision behind it: 3 months costs
# the same single request as any other horizon, and rows past ~30 days carry no
# session data anyway (session coverage is ~2% beyond 30 days).
HORIZON = "3month"

# The exact EARNINGS_CALENDAR columns, measured live. The header guard compares
# against this set rather than its order: csv.DictReader (and earnings_calendar
# .build_payload) resolve fields by name, so a reordered header is still a valid
# calendar, while a missing or extra column means the body is not one.
EXPECTED_COLUMNS = frozenset({
    "symbol", "name", "reportDate", "fiscalDateEnding",
    "estimate", "currency", "timeOfTheDay",
})


def _rate_limited():
    """503 + Retry-After, for the failures that are worth retrying.

    Covers the HTTP-level rate limit/timeout and the 200-body ways this provider
    reports quota exhaustion (a JSON Note/Information, or a mangled body with no
    real rows). Retry-After is the same back-off signal the frontend already
    honors for /pages/trending.
    """
    return Response(
        {"error": "rate limit issue"},
        status=status.HTTP_503_SERVICE_UNAVAILABLE,
        headers={"Retry-After": "60000"},
    )


def _invalid_call():
    """500, for failures a retry will not fix."""
    return Response(
        {"error": "invalid api call issue"},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )


def _is_json_body(text):
    """True when the body is JSON, which is how AV carries Note/Information.

    A CSV body starts with a letter, so requiring a JSON container first keeps
    this from misfiring on the calendar itself. The container check alone is not
    enough -- `{"Note": x}` and a truncated `{` both start with `{` -- so the
    body must also parse.
    """
    stripped = text.lstrip()
    if not stripped.startswith(("{", "[")):
        return False
    try:
        json.loads(stripped)
    except ValueError:
        return False
    return True


def _header_columns(text):
    """The first non-empty line as a set of stripped field names."""
    for line in text.lstrip("﻿").splitlines():
        line = line.strip()
        if line:
            return {field.strip() for field in line.split(",")}
    return set()


def _has_parseable_report_date(text):
    """True when at least one row carries a real reportDate.

    A header alone is not a calendar, and a real calendar always has rows, so
    this is also what catches the observed mangled body -- its first line is the
    correct header, so only the rows give it away.
    """
    for row in csv.DictReader(io.StringIO(text)):
        value = (row.get("reportDate") or "").strip()
        if not value:
            continue
        try:
            date.fromisoformat(value)
        except ValueError:
            continue
        return True
    return False


def fetch_earnings_calendar():
    """GET EARNINGS_CALENDAR, returning its CSV text or a DRF Response.

    Never returns a body that is not a real calendar: a JSON Note/Information, a
    header that is not the calendar's, or rows with no parseable reportDate all
    become a Response, so nothing downstream can cache a false-empty calendar.
    """
    api_key = os.getenv("ALPHAVANTAGE_API_KEY")
    if not api_key:
        return _invalid_call()

    try:
        response = requests.get(
            BASE_URL,
            params={
                "function": "EARNINGS_CALENDAR",
                "horizon": HORIZON,
                "apikey": api_key,
            },
            timeout=REQUEST_TIMEOUT,
        )
    except (requests.Timeout, requests.ConnectionError):
        return _rate_limited()

    if response.status_code == 429:
        return _rate_limited()
    if response.status_code in (401, 403):
        return _invalid_call()
    if response.status_code >= 500:
        return _invalid_call()

    text = response.text
    if _is_json_body(text):
        return _rate_limited()
    if _header_columns(text) != EXPECTED_COLUMNS:
        return _invalid_call()
    if not _has_parseable_report_date(text):
        return _rate_limited()

    return text
