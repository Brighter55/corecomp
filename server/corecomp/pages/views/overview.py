import os
from datetime import date

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from pages.utils import (
    annotate_profit_margin,
    annotate_free_cash_flow,
    annotate_current_ratio,
    annotate_quick_ratio,
    annotate_debt_equity_ratio,
    transform_pricing,
    compute_roe,
    compute_roa,
    compute_pe,
    compute_pb,
    compute_market_cap,
    compute_ps,
    compute_pfcf,
    compute_variance,
)
from django.core.cache import cache
from django_redis import get_redis_connection
# permission
from accounts.permissions import AllowAnonymousWithQuota, AllowAnonymousWithQuotaList
# serializer
from pages.serializers import SymbolSerializer
from pages.serializers import CompositeGraphSerializer
from pages.serializers import DipSymbolsSerializer
# model
from django.db.models import Q
from pages.models import Symbol
# services
from services import financial_data_service

User = get_user_model() # Get model listed in settings.py: AUTH_USER_MODEL = 'api.CustomUser'

# The dip cache is keyed by mode. Every other key in this module predates this
# convention and is NOT namespaced, which is why flipping MOCK requires a flush;
# dip opts out of that problem rather than adding a tenth instance of it.
MODE = "mock" if os.getenv("MOCK") == "True" else "live"

# Matches current_price_{symbol}. The variance moves with price intraday, so
# this is the freshness/cost dial for /dip -- safe to raise to 1800 or 3600 to
# cut upstream spend, and it is independent of every other key here.
DIP_TTL_SECONDS = 600


@api_view(["POST"])
@permission_classes([AllowAnonymousWithQuota])
def current_price(request):
    serializer = SymbolSerializer(data=request.data)
    if serializer.is_valid():
        symbol = serializer.validated_data["symbol"]

        key = f"current_price_{symbol}"
        cached_data = cache.get(key)
        if cached_data:
            return Response(cached_data, status=status.HTTP_200_OK)

        data = financial_data_service.get_current_price(symbol)

        if isinstance(data, Response):
            return data

        # check if the data is empty
        if not data["Global Quote"]:
            return Response({"error": "invalid symbol"}, status=status.HTTP_400_BAD_REQUEST)

        price = str(round(float(data["Global Quote"]["05. price"]), 2))
        company = Symbol.objects.get(symbol=symbol)
        name = company.name

        report = {"price": price, "name": name}

        cache.set(key, report, timeout=600)
        return Response(report, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(["POST"])
@permission_classes([AllowAnonymousWithQuota])
def info(request):
    serializer = SymbolSerializer(data=request.data)
    if serializer.is_valid():
        symbol = serializer.validated_data["symbol"]

        key = f"info_{symbol}"
        cached_data = cache.get(key)
        if cached_data:
            return Response(cached_data, status=status.HTTP_200_OK)
        
        data = financial_data_service.get_overview(symbol)

        # if "data" is a Response object, then return the error
        if isinstance(data, Response):
            return data

        # check if the data provider returns {} for invalid symbol or symbol with no data
        if not data:
            return Response({"error": "invalid symbol"}, status=status.HTTP_400_BAD_REQUEST)

        report = {
            "sector": data["Sector"],
            "industry": data["Industry"],
            "country": data["Country"],
            "exchange": data["Exchange"],
            "fiscalYearEnd": data["FiscalYearEnd"],
            "marketCapitalization": data["MarketCapitalization"],
            "peRatio": data["PERatio"],
            "priceToSalesRatioTtm": data["PriceToSalesRatioTTM"],
            "priceToBookRatio": data["PriceToBookRatio"],
            "evToRevenue": data["EVToRevenue"],
            "evToEbitda": data["EVToEBITDA"],
            "sharesOutstanding": data["SharesOutstanding"],
            "ebitda": data["EBITDA"],
            "eps": data["EPS"],
            "dilutedEpsTtm": data["DilutedEPSTTM"],
            "profitMargin": data["ProfitMargin"],
            "operatingMarginTtm": data["OperatingMarginTTM"],
            "returnOnAssetsTtm": data["ReturnOnAssetsTTM"],
            "returnOnEquityTtm": data["ReturnOnEquityTTM"],
            "quarterlyEarningsGrowthYoy": data["QuarterlyEarningsGrowthYOY"],
            "quarterlyRevenueGrowthYoy": data["QuarterlyRevenueGrowthYOY"],
            "revenueTtm": data["RevenueTTM"],
            "grossProfitTtm": data["GrossProfitTTM"],
            "revenuePerShareTtm": data["RevenuePerShareTTM"],
            "fiftyTwoWeekHigh": data["52WeekHigh"],
            "fiftyTwoWeekLow": data["52WeekLow"],
            "fiftyDayMovingAverage": data["50DayMovingAverage"],
            "twoHundredDayMovingAverage": data["200DayMovingAverage"],
            "dividendPerShare": data["DividendPerShare"],
            "dividendYield": data["DividendYield"],
            "dividendDate": data["DividendDate"],
            "exDividendDate": data["ExDividendDate"],
        }
        cache.set(key, report, timeout=604800)
        return Response(report, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
@permission_classes([AllowAnonymousWithQuota])
def income_statement(request):
    serializer = SymbolSerializer(data=request.data)
    if serializer.is_valid():
        symbol = serializer.validated_data["symbol"]
        redis = get_redis_connection("default")

        key = f"income_statement_{symbol}"
        cached_data = cache.get(key)
        if cached_data:
            return Response(cached_data, status=status.HTTP_200_OK)
        
        lock = redis.lock(f"lock:{key}", timeout=10)
        with lock:
            cached_data = cache.get(key)
            if cached_data:
                return Response(cached_data, status=status.HTTP_200_OK)
            
            data = financial_data_service.get_income_statement(symbol)

            if isinstance(data, Response):
                return data
            
            if not data:
                return Response(status=status.HTTP_204_NO_CONTENT)
            
            data = annotate_profit_margin(data)
            
            cache.set(key, data, timeout=604800)

        return Response(data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
@permission_classes([AllowAnonymousWithQuota])
def cash_flow(request):
    serializer = SymbolSerializer(data=request.data)
    if serializer.is_valid():
        symbol = serializer.validated_data["symbol"]
        redis = get_redis_connection("default")

        key = f"cash_flow_{symbol}"
        cached_data = cache.get(key)
        if cached_data:
            return Response(cached_data, status=status.HTTP_200_OK)
        
        lock = redis.lock(f"lock:{key}", timeout=10)
        with lock:
            cached_data = cache.get(key)
            if cached_data:
                return Response(cached_data, status=status.HTTP_200_OK)
            
            data = financial_data_service.get_cash_flow(symbol)

            if isinstance(data, Response):
                return data
            
            if not data:
                return Response(status=status.HTTP_204_NO_CONTENT)

            data = annotate_free_cash_flow(data)
            
            cache.set(key, data, timeout=604800)

        return Response(data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAnonymousWithQuota])
def balance_sheet(request):
    serializer = SymbolSerializer(data=request.data)
    if serializer.is_valid():
        symbol = serializer.validated_data["symbol"]
        redis = get_redis_connection("default")

        key = f"balance_sheet_{symbol}"
        cached_data = cache.get(key)
        if cached_data:
            return Response(cached_data, status=status.HTTP_200_OK)
        
        lock = redis.lock(f"lock:{key}", timeout=10)
        with lock:
            cached_data = cache.get(key)
            if cached_data:
                return Response(cached_data, status=status.HTTP_200_OK)
            
            data = financial_data_service.get_balance_sheet(symbol)

            if isinstance(data, Response):
                return data
            
            if not data:
                return Response(status=status.HTTP_204_NO_CONTENT)

            data = annotate_current_ratio(data)
            data = annotate_quick_ratio(data)
            data = annotate_debt_equity_ratio(data)

            cache.set(key, data, timeout=604800)

        return Response(data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
@permission_classes([AllowAnonymousWithQuota])
def earnings(request):
    serializer = SymbolSerializer(data=request.data)
    if serializer.is_valid():
        symbol = serializer.validated_data["symbol"]
        redis = get_redis_connection("default")

        key = f"earnings_{symbol}"
        cached_data = cache.get(key)
        if cached_data:
            return Response(cached_data, status=status.HTTP_200_OK)
        
        lock = redis.lock(f"lock:{key}", timeout=10)
        with lock:
            cached_data = cache.get(key)
            if cached_data:
                return Response(cached_data, status=status.HTTP_200_OK)
            
            data = financial_data_service.get_earnings(symbol)

            if isinstance(data, Response):
                return data
            
            if not data:
                return Response(status=status.HTTP_204_NO_CONTENT)
            
            cache.set(key, data, timeout=604800)

        return Response(data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
@permission_classes([AllowAnonymousWithQuota])
def dividends(request):
    serializer = SymbolSerializer(data=request.data)
    if serializer.is_valid():
        symbol = serializer.validated_data["symbol"]
        redis = get_redis_connection("default")

        key = f"dividends_{symbol}"
        cached_data = cache.get(key)
        if cached_data:
            return Response(cached_data, status=status.HTTP_200_OK)
        
        lock = redis.lock(f"lock:{key}", timeout=10)
        with lock:
            cached_data = cache.get(key)
            if cached_data:
                return Response(cached_data, status=status.HTTP_200_OK)
            
            data = financial_data_service.get_dividends(symbol)

            if isinstance(data, Response):
                return data
            
            if not data["data"]:
                return Response(status=status.HTTP_204_NO_CONTENT)
            
            cache.set(key, data, timeout=604800)

        return Response(data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
@permission_classes([AllowAnonymousWithQuota])
def pricing(request):
    serializer = SymbolSerializer(data=request.data)
    if serializer.is_valid():
        symbol = serializer.validated_data["symbol"]
        redis = get_redis_connection("default")

        key = f"pricing_{symbol}"
        cached_data = cache.get(key)
        if cached_data:
            return Response(cached_data, status=status.HTTP_200_OK)
        
        lock = redis.lock(f"lock:{key}", timeout=10)
        with lock:
            cached_data = cache.get(key)
            if cached_data:
                return Response(cached_data, status=status.HTTP_200_OK)

            data = financial_data_service.get_pricing(symbol)

            if isinstance(data, Response):
                return data

            if not data:
                return Response(status=status.HTTP_204_NO_CONTENT)

            data = transform_pricing(data)

            cache.set(key, data, timeout=86400)

        return Response(data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
@permission_classes([AllowAnonymousWithQuotaList])
def dip(request):
    """Price vs 50/200-day moving average variance for a batch of symbols.

    Deliberately self-contained: it reads and writes only its own
    `{mode}:dip_{symbol}` keys. /pages/info and /pages/current-price are
    untouched, and nothing is shared at the Redis layer. The one thing it does
    share is the 60s `live:{symbol}` upstream memo behind
    financial_data_service.get_dip_row, which is keyed by upstream resource
    rather than by feature -- so opening /dip and /overview for the same symbol
    costs one upstream call, not two.
    """
    serializer = DipSymbolsSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    symbols = serializer.validated_data["symbols"]

    # Names come from the Symbol table rather than the API, so a ticker that has
    # dropped out of it degrades to one "unknown" row instead of a 400.
    names = dict(
        Symbol.objects.filter(symbol__in=symbols).values_list("symbol", "name")
    )

    results = []
    for symbol in symbols:
        if symbol not in names:
            results.append({
                "symbol": symbol,
                "name": None,
                "price": None,
                "variance": {"50": None, "200": None},
                "status": "unknown",
            })
            continue

        key = f"{MODE}:dip_{symbol}"
        report = cache.get(key)

        if report is None:
            row = financial_data_service.get_dip_row(symbol)

            # Upload/provider errors (503 rate limit, 500 invalid call) abort the
            # whole request rather than reporting a per-symbol failure.
            if isinstance(row, Response):
                return row

            if not row:
                report = {
                    "symbol": symbol,
                    "name": names[symbol],
                    "price": None,
                    "variance": {"50": None, "200": None},
                    "status": "unavailable",
                }
            else:
                price = row.get("price")
                report = {
                    "symbol": symbol,
                    "name": names[symbol] or row.get("name"),
                    "price": price,
                    "variance": {
                        "50": compute_variance(price, row.get("sma50")),
                        "200": compute_variance(price, row.get("sma200")),
                    },
                    "status": "ok",
                }

            # Degraded rows are cached too. A symbol whose upstream flaps would
            # otherwise re-fetch on every request, and quota -- not staleness --
            # is the binding constraint on the free plan.
            cache.set(key, report, timeout=DIP_TTL_SECONDS)

        results.append(report)

    return Response(
        {"asOf": date.today().isoformat(), "results": results},
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([AllowAnonymousWithQuota])
def composite(request):
    symbol_serializer = SymbolSerializer(data=request.data)
    composite_graph_serializer = CompositeGraphSerializer(data=request.data)

    if not symbol_serializer.is_valid():
        return Response(symbol_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if not composite_graph_serializer.is_valid():
        return Response(composite_graph_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    symbol = symbol_serializer.validated_data["symbol"]
    graph = composite_graph_serializer.validated_data["graph"]

    composite_key = f"{graph}_{symbol}"
    cached_composite = cache.get(composite_key)
    if cached_composite:
        return Response(cached_composite, status=status.HTTP_200_OK)

    redis = get_redis_connection("default")
    composite_lock = redis.lock(f"lock:{composite_key}", timeout=10)
    with composite_lock:
        cached_composite = cache.get(composite_key)
        if cached_composite:
            return Response(cached_composite, status=status.HTTP_200_OK)

        GRAPH_STATEMENTS = {
            "ROEPercentage": ["income_statement", "balance_sheet"],
            "ROAPercentage": ["income_statement", "balance_sheet"],
            "PERatio": ["pricing", "earnings"],
            "PBRatio": ["pricing", "balance_sheet"],
            "MarketCap": ["pricing", "balance_sheet"],
            "PSRatio": ["pricing", "income_statement", "balance_sheet"],
            "PFCFRatio": ["pricing", "cash_flow", "balance_sheet"],
        }

        statements_needed = GRAPH_STATEMENTS.get(graph)

        statements = {}

        for statement in statements_needed:
            statement_key = f"{statement}_{symbol}"
            cached_statement = cache.get(statement_key)
            if cached_statement is None:
                statement_lock = redis.lock(f"lock:{statement_key}", timeout=10)
                with statement_lock:
                    cached_statement = cache.get(statement_key)
                    if cached_statement is None:
                        fetcher = getattr(financial_data_service, f"get_{statement}", None)

                        fetched = fetcher(symbol)
                        if isinstance(fetched, Response):
                            return fetched

                        if not fetched:
                            return Response(status=status.HTTP_204_NO_CONTENT)

                        if statement == "income_statement":
                            fetched = annotate_profit_margin(fetched)
                        elif statement == "cash_flow":
                            fetched = annotate_free_cash_flow(fetched)
                        elif statement == "pricing":
                            fetched = transform_pricing(fetched)
                        elif statement == "balance_sheet":
                            fetched = annotate_current_ratio(fetched)
                            fetched = annotate_quick_ratio(fetched)
                            fetched = annotate_debt_equity_ratio(fetched)
                        
                        if statement == "pricing":
                            cache.set(statement_key, fetched, timeout=86400)
                        else:
                            cache.set(statement_key, fetched, timeout=604800)

                        cached_statement = fetched

            statements[statement] = cached_statement

        if graph == "ROEPercentage":
            data = compute_roe(income_statement=statements["income_statement"], balance_sheet=statements["balance_sheet"])
        elif graph == "ROAPercentage":
            data = compute_roa(income_statement=statements["income_statement"], balance_sheet=statements["balance_sheet"])
        elif graph == "PERatio":
            data = compute_pe(statements["pricing"], statements["earnings"])
        elif graph == "PBRatio":
            data = compute_pb(statements["pricing"], statements["balance_sheet"])
        elif graph == "MarketCap":
            data = compute_market_cap(statements["pricing"], statements["balance_sheet"])
        elif graph == "PSRatio":
            data = compute_ps(statements["pricing"], statements["income_statement"], statements["balance_sheet"])
        elif graph == "PFCFRatio":
            data = compute_pfcf(statements["pricing"], statements["cash_flow"], statements["balance_sheet"])

        if not data.get("annualReports") or not data.get("quarterlyReports"):
            return Response(status=status.HTTP_204_NO_CONTENT)

        cache.set(composite_key, data, timeout=604800)
        return Response(data, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([AllowAny])
def symbol_search(request):
    identifier = request.data["symbol"]
    include_identifier = Q(name__icontains=identifier) | Q(symbol__icontains=identifier)
    symbols_queryset = Symbol.objects.filter(include_identifier)[:20]
    symbols = list(symbols_queryset.values("name", "symbol"))
    return Response(symbols, status=status.HTTP_200_OK)
