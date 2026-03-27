from pages.utils import compute_pb


def test_compute_pb():
	balance_sheet = {
		"annualReports": [
			{
				"fiscalDateEnding": "2024-12-31",
				"totalAssets": "1000",
				"totalLiabilities": "600",
				"commonStockSharesOutstanding": "100",
			},
			{
				"fiscalDateEnding": "2023-12-31",
				"totalAssets": "900",
				"totalLiabilities": "500",
				"commonStockSharesOutstanding": "100",
			},
		],
		"quarterlyReports": [
			{
				"fiscalDateEnding": "2024-09-30",
				"totalAssets": "800",
				"totalLiabilities": "600",
				"commonStockSharesOutstanding": "100",
			},
			{
				"fiscalDateEnding": "2024-06-30",
				"totalAssets": "750",
				"totalLiabilities": "550",
				"commonStockSharesOutstanding": "100",
			},
		],
	}

	pricing = [
		{"date": "2024-12-20", "adjustedClose": "245.58"},
		{"date": "2024-09-30", "adjustedClose": "230.00"},
		{"date": "2024-06-15", "adjustedClose": "220.00"},
		{"date": "2023-12-15", "adjustedClose": "200.00"},
	]

	result = {
		"annualReports": [
			{
				"fiscalDateEnding": "2024-12-31",
				"PBRatio": "61.4",
			},
			{
				"fiscalDateEnding": "2023-12-31",
				"PBRatio": "50.0",
			},
		],
		"quarterlyReports": [
			{
				"fiscalDateEnding": "2024-09-30",
				"PBRatio": "115.0",
			},
			{
				"fiscalDateEnding": "2024-06-30",
				"PBRatio": "110.0",
			},
		],
	}

	data = compute_pb(pricing, balance_sheet)
	assert data == result


def test_missing_data():
	pricing = [{"date": "2024-12-31", "adjustedClose": "245.58"}]

	# Case 1: totalAssets is missing
	balance_sheet_missing_total_assets = {
		"annualReports": [
			{
				"fiscalDateEnding": "2024-12-31",
				"totalAssets": "None",
				"totalLiabilities": "600",
				"commonStockSharesOutstanding": "100",
			}
		],
		"quarterlyReports": [
			{
				"fiscalDateEnding": "2024-12-31",
				"totalAssets": "None",
				"totalLiabilities": "600",
				"commonStockSharesOutstanding": "100",
			}
		],
	}
	result_missing_total_assets = {
		"annualReports": [{"fiscalDateEnding": "2024-12-31", "PBRatio": None}],
		"quarterlyReports": [{"fiscalDateEnding": "2024-12-31", "PBRatio": None}],
	}
	assert compute_pb(pricing, balance_sheet_missing_total_assets) == result_missing_total_assets

	# Case 2: totalLiabilities is missing
	balance_sheet_missing_total_liabilities = {
		"annualReports": [
			{
				"fiscalDateEnding": "2024-12-31",
				"totalAssets": "1000",
				"totalLiabilities": "None",
				"commonStockSharesOutstanding": "100",
			}
		],
		"quarterlyReports": [
			{
				"fiscalDateEnding": "2024-12-31",
				"totalAssets": "800",
				"totalLiabilities": "None",
				"commonStockSharesOutstanding": "100",
			}
		],
	}
	result_missing_total_liabilities = {
		"annualReports": [{"fiscalDateEnding": "2024-12-31", "PBRatio": None}],
		"quarterlyReports": [{"fiscalDateEnding": "2024-12-31", "PBRatio": None}],
	}
	assert compute_pb(pricing, balance_sheet_missing_total_liabilities) == result_missing_total_liabilities

	# Case 3: commonStockSharesOutstanding is missing
	balance_sheet_missing_shares = {
		"annualReports": [
			{
				"fiscalDateEnding": "2024-12-31",
				"totalAssets": "1000",
				"totalLiabilities": "600",
				"commonStockSharesOutstanding": "None",
			}
		],
		"quarterlyReports": [
			{
				"fiscalDateEnding": "2024-12-31",
				"totalAssets": "800",
				"totalLiabilities": "600",
				"commonStockSharesOutstanding": "None",
			}
		],
	}
	result_missing_shares = {
		"annualReports": [{"fiscalDateEnding": "2024-12-31", "PBRatio": None}],
		"quarterlyReports": [{"fiscalDateEnding": "2024-12-31", "PBRatio": None}],
	}
	assert compute_pb(pricing, balance_sheet_missing_shares) == result_missing_shares

	# Case 4: all required fields are missing
	balance_sheet_all_missing = {
		"annualReports": [
			{
				"fiscalDateEnding": "2024-12-31",
				"totalAssets": "None",
				"totalLiabilities": "None",
				"commonStockSharesOutstanding": "None",
			}
		],
		"quarterlyReports": [
			{
				"fiscalDateEnding": "2024-12-31",
				"totalAssets": "None",
				"totalLiabilities": "None",
				"commonStockSharesOutstanding": "None",
			}
		],
	}
	result_all_missing = {
		"annualReports": [{"fiscalDateEnding": "2024-12-31", "PBRatio": None}],
		"quarterlyReports": [{"fiscalDateEnding": "2024-12-31", "PBRatio": None}],
	}
	assert compute_pb(pricing, balance_sheet_all_missing) == result_all_missing


def test_alignment():
	# balance_sheet records are older than pricing months, so all records should be skipped.
	balance_sheet = {
		"annualReports": [
			{
				"fiscalDateEnding": "2024-12-31",
				"totalAssets": "1000",
				"totalLiabilities": "600",
				"commonStockSharesOutstanding": "100",
			},
		],
		"quarterlyReports": [
			{
				"fiscalDateEnding": "2024-09-30",
				"totalAssets": "800",
				"totalLiabilities": "600",
				"commonStockSharesOutstanding": "100",
			},
		],
	}

	pricing = [
		{"date": "2026-01-16", "adjustedClose": "300.00"},
		{"date": "2025-12-31", "adjustedClose": "280.00"},
	]

	result = {
		"annualReports": [],
		"quarterlyReports": [],
	}

	data = compute_pb(pricing, balance_sheet)
	assert data == result


def test_empty_data():
	pricing = []
	balance_sheet = {}

	result = {
		"annualReports": [],
		"quarterlyReports": [],
	}

	data = compute_pb(pricing, balance_sheet)
	assert data == result
