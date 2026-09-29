import pytest
from pages.utils import compute_variance, safe_float, safe_int


def test_safe_int_accepts_integer_strings():
    assert safe_int("400") == 400


def test_safe_int_accepts_decimal_strings():
    # statement values arrive as decimal strings like "57383000000.0"
    assert safe_int("800.0") == 800
    assert safe_int("57383000000.0") == 57383000000


def test_safe_int_accepts_numeric_types():
    assert safe_int(400) == 400
    assert safe_int(400.0) == 400


def test_safe_int_returns_none_for_missing_values():
    assert safe_int(None) is None
    assert safe_int("None") is None
    assert safe_int("") is None


def test_safe_int_returns_none_for_unparseable_values():
    assert safe_int("abc") is None


def test_safe_float_accepts_strings_and_numerics():
    assert safe_float("800.0") == 800.0
    assert safe_float("800") == 800.0
    assert safe_float(800) == 800.0


def test_safe_float_returns_none_for_missing_values():
    assert safe_float(None) is None
    assert safe_float("None") is None
    assert safe_float("") is None


def test_safe_float_returns_none_for_unparseable_values():
    assert safe_float("abc") is None


def test_compute_variance_is_percent_deviation_from_the_average():
    assert compute_variance(100.0, 80.0) == pytest.approx(25.0)
    assert compute_variance(80.0, 100.0) == pytest.approx(-20.0)


def test_compute_variance_is_left_unrounded():
    # The client sorts on this value and rounds only for display, so rounding
    # here would collapse near-ties into source order.
    assert compute_variance(88.6, 100.0) == pytest.approx(-11.4)
    assert compute_variance(88.6, 100.0) != -11


def test_compute_variance_accepts_strings_like_the_rest_of_utils():
    assert compute_variance("100.0", "80.0") == pytest.approx(25.0)


def test_compute_variance_returns_none_for_missing_or_zero_inputs():
    # None, not 0: the client plots these as "--", and a 0 would read as "flat".
    assert compute_variance(None, 80.0) is None
    assert compute_variance(100.0, None) is None
    assert compute_variance(100.0, "None") is None
    assert compute_variance(100.0, 0) is None
