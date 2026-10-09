from datetime import date, timedelta

import pytest
from pages.trending import HISTORY_DAYS, MOVERS_COUNT, SPARK_POINTS, rank_movers

# Fixed clock: the ranking is date-sensitive, so every test pins "today".
TODAY = date(2026, 10, 8)
YESTERDAY = date(2026, 10, 7)


def _history(*closes, last_date=YESTERDAY):
    """Oldest -> newest, ending on last_date.

    Defaults to yesterday, i.e. the newest bar `prices/eod` can return while a
    session is still open.
    """
    start = last_date - timedelta(days=len(closes) - 1)
    return [
        {
            "date": (start + timedelta(days=index)).isoformat(),
            "close": close,
            "volume": 1000 + index,
        }
        for index, close in enumerate(closes)
    ]


def _quote(price, name="X Inc", market_cap=1.0):
    return {"name": name, "price": price, "marketCap": market_cap}


# --- which two prices the change is measured between ------------------------


def test_measures_the_live_price_against_the_last_close_while_the_session_is_open():
    # The bug this pins: with the last bar dated Oct 7 and today being Oct 8,
    # diffing the two newest *bars* reports Oct 6 -> Oct 7, i.e. yesterday's
    # move. Today's move is the live price against the Oct 7 close.
    quotes = {"AAA": _quote(110.0)}
    history = {"AAA": _history(90.0, 100.0)}  # last close 100

    movers = rank_movers(quotes, history, TODAY, count=4)

    # (110 - 100) / 100 -- NOT (100 - 90) / 90, which would read +11.11%.
    assert movers[0]["percentChange"] == pytest.approx(10.0)


def test_uses_the_last_two_closes_once_todays_bar_is_published():
    # After the close, eod has today's bar and the live price equals it. Using
    # the live price as "current" here would collapse the change to ~0%.
    quotes = {"AAA": _quote(100.0)}  # == today's close, post-close
    history = {"AAA": _history(90.0, 110.0, last_date=TODAY)}  # Oct 7 -> Oct 8

    movers = rank_movers(quotes, history, TODAY, count=4)

    # (110 - 90) / 90, from the bars -- not (100 - 110) / 110.
    assert movers[0]["percentChange"] == pytest.approx(22.2222, rel=1e-4)


def test_falls_back_to_the_bars_when_there_is_no_live_price():
    quotes = {"AAA": _quote(None)}
    history = {"AAA": _history(100.0, 110.0)}

    movers = rank_movers(quotes, history, TODAY, count=4)

    # No live price to compare against, so the newest bar becomes "current".
    assert movers[0]["percentChange"] == pytest.approx(10.0)
    assert movers[0]["price"] == 110.0


def test_the_live_price_is_what_gets_displayed():
    quotes = {"AAA": _quote(110.0)}
    history = {"AAA": _history(90.0, 100.0)}

    movers = rank_movers(quotes, history, TODAY, count=4)

    assert movers[0]["price"] == 110.0


# --- ordering and truncation ------------------------------------------------


def test_ranks_by_percent_change_descending():
    quotes = {"AAA": _quote(101.0), "BBB": _quote(110.0), "CCC": _quote(95.0)}
    history = {symbol: _history(100.0, 100.0) for symbol in ("AAA", "BBB", "CCC")}

    movers = rank_movers(quotes, history, TODAY, count=3)

    assert [mover["symbol"] for mover in movers] == ["BBB", "AAA", "CCC"]


def test_defaults_to_movers_count():
    # More candidates than MOVERS_COUNT, so the cap is what binds rather than
    # the size of the pool.
    pool = MOVERS_COUNT + 4
    quotes = {f"S{index}": _quote(100.0 + index) for index in range(pool)}
    history = {f"S{index}": _history(100.0, 100.0) for index in range(pool)}

    movers = rank_movers(quotes, history, TODAY)

    assert len(movers) == MOVERS_COUNT


def test_movers_count_is_twelve():
    # Asserted as a literal, as SPARK_POINTS is, so resizing the payload has to
    # be deliberate here too. 12 also divides cleanly at every breakpoint the
    # grid uses -- 12/4 = 3 pages, 12/2 = 6, 12/1 = 12 -- so no page is partial.
    assert MOVERS_COUNT == 12


def test_truncates_to_count():
    quotes = {f"S{index}": _quote(100.0 + index) for index in range(6)}
    history = {f"S{index}": _history(100.0, 100.0) for index in range(6)}

    movers = rank_movers(quotes, history, TODAY, count=4)

    assert len(movers) == 4


# --- degraded inputs --------------------------------------------------------


def test_excludes_a_symbol_with_no_bars():
    quotes = {"AAA": _quote(110.0), "BBB": _quote(110.0)}
    history = {"BBB": _history(100.0, 100.0)}

    movers = rank_movers(quotes, history, TODAY, count=4)

    assert [mover["symbol"] for mover in movers] == ["BBB"]


def test_excludes_a_lone_bar_when_todays_bar_is_also_published():
    # Post-close there is nothing to measure against unless a previous session
    # exists, so a single bar cannot produce a change.
    quotes = {"AAA": _quote(100.0)}
    history = {"AAA": _history(100.0, last_date=TODAY)}

    movers = rank_movers(quotes, history, TODAY, count=4)

    assert movers == []


def test_zero_previous_close_is_skipped_not_divided_by():
    quotes = {"AAA": _quote(10.0), "BBB": _quote(110.0)}
    history = {"AAA": _history(0.0), "BBB": _history(100.0)}

    movers = rank_movers(quotes, history, TODAY, count=4)

    assert [mover["symbol"] for mover in movers] == ["BBB"]


def test_percent_change_is_not_rounded():
    # The client rounds for display; collapsing near-ties here would make the
    # order depend on float noise. Same reasoning as dip's variance.
    quotes = {"AAA": _quote(103.456)}
    history = {"AAA": _history(100.0)}

    movers = rank_movers(quotes, history, TODAY, count=4)

    assert movers[0]["percentChange"] == pytest.approx(3.456)


def test_spark_spans_about_a_week_not_a_month():
    # The card's percentage is TODAY's move, so a line spanning a month depicts a
    # different timescale than the number printed beside it. WiseSheets exposes
    # no intraday series (the period grammar is latest / lastNd / date / range),
    # so a week is the closest honest approximation available.
    #
    # Asserted as a literal, as DIP_TTL_SECONDS is, so that widening the window
    # back out has to be a deliberate edit here too.
    assert SPARK_POINTS == 6, "5 sessions + the live point"


def test_the_fetch_window_leaves_room_for_the_sparkline():
    # HISTORY_DAYS is calendar days and the spark needs SPARK_POINTS *trading*
    # sessions, which are fewer. A window too tight for its own line would
    # silently truncate it.
    assert HISTORY_DAYS >= SPARK_POINTS * 2


def test_spark_ends_on_the_live_price_while_the_session_is_open():
    # Otherwise the line stops at yesterday's close and the chart contradicts
    # the percentage printed beside it.
    quotes = {"AAA": _quote(110.0)}
    history = {"AAA": _history(90.0, 100.0)}

    movers = rank_movers(quotes, history, TODAY, count=4)

    assert movers[0]["spark"] == [90.0, 100.0, 110.0]


def test_spark_does_not_duplicate_the_close_once_todays_bar_is_published():
    # Post-close the live price IS the newest close, so appending it would just
    # repeat the final point.
    quotes = {"AAA": _quote(110.0)}
    history = {"AAA": _history(90.0, 110.0, last_date=TODAY)}

    movers = rank_movers(quotes, history, TODAY, count=4)

    assert movers[0]["spark"] == [90.0, 110.0]


def test_spark_does_not_append_when_there_is_no_live_price():
    quotes = {"AAA": _quote(None)}
    history = {"AAA": _history(100.0, 110.0)}

    movers = rank_movers(quotes, history, TODAY, count=4)

    assert movers[0]["spark"] == [100.0, 110.0]


def test_spark_is_capped_to_spark_points_including_the_live_point():
    quotes = {"AAA": _quote(999.0)}
    closes = [float(index) for index in range(1, SPARK_POINTS + 11)]  # 30 closes
    history = {"AAA": _history(*closes)}

    movers = rank_movers(quotes, history, TODAY, count=4)

    spark = movers[0]["spark"]
    assert len(spark) == SPARK_POINTS
    assert spark[-1] == 999.0  # the live price
    # The newest closes, oldest-first, with the live point taking one slot.
    assert spark[:-1] == closes[-(SPARK_POINTS - 1):]


def test_string_quote_fields_are_coerced_to_numbers():
    # prices/live returns every field as a string ('338.0529'), while the eod
    # series arrives already coerced. Passing the strings through would make the
    # payload's types depend on which endpoint filled the field, and the
    # client's number formatting throws on a string.
    quotes = {"AAA": {"name": "A Inc", "price": "110.5", "marketCap": "4965103289132"}}
    history = {"AAA": _history(100.0)}

    movers = rank_movers(quotes, history, TODAY, count=4)

    assert movers[0]["price"] == pytest.approx(110.5)
    assert movers[0]["marketCap"] == pytest.approx(4965103289132)


def test_unparseable_quote_fields_fall_back_rather_than_leaking_a_string():
    # The provider uses the literal string "None" for missing values elsewhere in
    # this codebase; it must not reach the payload as a price.
    quotes = {"AAA": {"name": "A Inc", "price": "None", "marketCap": "None"}}
    history = {"AAA": _history(100.0, 110.0)}

    movers = rank_movers(quotes, history, TODAY, count=4)

    assert movers[0]["price"] == 110.0  # latest close
    assert movers[0]["marketCap"] is None


def test_volume_comes_from_the_newest_bar():
    quotes = {"AAA": {"name": "A Inc", "price": 110.0, "marketCap": 999.0}}
    history = {"AAA": [{"date": "2026-10-06", "close": 100.0, "volume": 1},
                       {"date": "2026-10-07", "close": 105.0, "volume": 42}]}

    movers = rank_movers(quotes, history, TODAY, count=4)

    assert movers[0]["volume"] == 42
    assert movers[0]["marketCap"] == 999.0


def test_empty_inputs_return_an_empty_list():
    assert rank_movers({}, {}, TODAY, count=4) == []


def test_a_symbol_with_history_but_no_quote_is_still_ranked():
    # The quote call and the series call are independent, so one can miss while
    # the other lands. A missing quote must not drop a real mover.
    quotes = {"AAA": _quote(110.0)}
    history = {
        "AAA": _history(100.0),
        "BBB": _history(100.0, 120.0),  # bigger move, but no quote row
    }

    movers = rank_movers(quotes, history, TODAY, count=4)

    assert [mover["symbol"] for mover in movers] == ["BBB", "AAA"]
