from pages.utils import safe_float, safe_int


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
