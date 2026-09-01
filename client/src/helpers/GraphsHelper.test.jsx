
import { filterReports, formatToUnits, getEndIndex, getPercentChange, hasAnyValue, hasStatementContent } from './GraphsHelper.js';

describe("formatValue", () => {
    // positive value
    test('value greater than or equal to billion is formatted', () => {
        expect(formatToUnits("1000000000")).toBe("$1.00B");
    });

    test('value greater than or equal to million is formatted', () => {
        expect(formatToUnits("1000000")).toBe("$1.00M");
    });

    test('value less than a million', () => {
        expect(formatToUnits("12345")).toBe("$12345");
    });


    // negative value
    test('value less than or equal to billion is formatted', () => {
        expect(formatToUnits("-1000000000")).toBe("$-1.00B");
    });

    test('value less than or equal to million is formatted', () => {
        expect(formatToUnits("-1000000")).toBe("$-1.00M");
    });

    test('value greater than a negative million', () => {
        expect(formatToUnits("-12345")).toBe("$-12345");
    });

    // missing / unparseable values
    test('"None" renders as "--"', () => {
        expect(formatToUnits("None")).toBe("--");
    });

    test('null renders as "--"', () => {
        expect(formatToUnits(null)).toBe("--");
    });

    test('undefined renders as "--"', () => {
        expect(formatToUnits(undefined)).toBe("--");
    });

    test('empty string renders as "--"', () => {
        expect(formatToUnits("")).toBe("--");
    });
});

const reports = [
  { fiscalDateEnding: "2024-12-31", totalRevenue: "98000" },
  { fiscalDateEnding: "2023-12-31", totalRevenue: "93000" },
  { fiscalDateEnding: "2022-12-31", totalRevenue: "88000" },
  { fiscalDateEnding: "2021-12-31", totalRevenue: "82000" },
  { fiscalDateEnding: "2020-12-31", totalRevenue: "76000" },
  { fiscalDateEnding: "2019-12-31", totalRevenue: "71000" },
  { fiscalDateEnding: "2018-12-31", totalRevenue: "66000" },
  { fiscalDateEnding: "2017-12-31", totalRevenue: "61000" },
  { fiscalDateEnding: "2016-12-31", totalRevenue: "56000" },
  { fiscalDateEnding: "2015-12-31", totalRevenue: "52000" },
  { fiscalDateEnding: "2014-12-31", totalRevenue: "48000" },
  { fiscalDateEnding: "2013-12-31", totalRevenue: "45000" },
  { fiscalDateEnding: "2012-12-31", totalRevenue: "42000" },
  { fiscalDateEnding: "2011-12-31", totalRevenue: "39000" },
  { fiscalDateEnding: "2010-12-31", totalRevenue: "36000" }
]

const quarterlyReports = [
  { fiscalDateEnding: "2024-12-30", totalRevenue: "84000" },
  { fiscalDateEnding: "2024-09-30", totalRevenue: "88400" },
  { fiscalDateEnding: "2024-06-30", totalRevenue: "93100" },
  { fiscalDateEnding: "2024-03-30", totalRevenue: "98000" },
  { fiscalDateEnding: "2023-12-30", totalRevenue: "79700" },
  { fiscalDateEnding: "2023-09-30", totalRevenue: "83900" },
  { fiscalDateEnding: "2023-06-30", totalRevenue: "88300" },
  { fiscalDateEnding: "2023-03-30", totalRevenue: "93000" },
  { fiscalDateEnding: "2022-12-30", totalRevenue: "75400" },
  { fiscalDateEnding: "2022-09-30", totalRevenue: "79400" },
  { fiscalDateEnding: "2022-06-30", totalRevenue: "83600" },
  { fiscalDateEnding: "2022-03-30", totalRevenue: "88000" },
  { fiscalDateEnding: "2021-12-30", totalRevenue: "70300" },
  { fiscalDateEnding: "2021-09-30", totalRevenue: "74000" },
  { fiscalDateEnding: "2021-06-30", totalRevenue: "77900" },
  { fiscalDateEnding: "2021-03-30", totalRevenue: "82000" },
  { fiscalDateEnding: "2020-12-30", totalRevenue: "65100" },
  { fiscalDateEnding: "2020-09-30", totalRevenue: "68600" },
  { fiscalDateEnding: "2020-06-30", totalRevenue: "72200" },
  { fiscalDateEnding: "2020-03-30", totalRevenue: "76000" },
  { fiscalDateEnding: "2019-12-30", totalRevenue: "60900" },
  { fiscalDateEnding: "2019-09-30", totalRevenue: "64100" },
  { fiscalDateEnding: "2019-06-30", totalRevenue: "67500" },
  { fiscalDateEnding: "2019-03-30", totalRevenue: "71000" },
  { fiscalDateEnding: "2018-12-30", totalRevenue: "56500" },
  { fiscalDateEnding: "2018-09-30", totalRevenue: "59500" },
  { fiscalDateEnding: "2018-06-30", totalRevenue: "62700" },
  { fiscalDateEnding: "2018-03-30", totalRevenue: "66000" },
  { fiscalDateEnding: "2017-12-30", totalRevenue: "52300" },
  { fiscalDateEnding: "2017-09-30", totalRevenue: "55100" },
  { fiscalDateEnding: "2017-06-30", totalRevenue: "58000" },
  { fiscalDateEnding: "2017-03-30", totalRevenue: "61000" },
  { fiscalDateEnding: "2016-12-30", totalRevenue: "48000" },
  { fiscalDateEnding: "2016-09-30", totalRevenue: "50500" },
  { fiscalDateEnding: "2016-06-30", totalRevenue: "53200" },
  { fiscalDateEnding: "2016-03-30", totalRevenue: "56000" },
  { fiscalDateEnding: "2015-12-30", totalRevenue: "44500" },
  { fiscalDateEnding: "2015-09-30", totalRevenue: "46900" },
  { fiscalDateEnding: "2015-06-30", totalRevenue: "49400" },
  { fiscalDateEnding: "2015-03-30", totalRevenue: "52000" },
  { fiscalDateEnding: "2014-12-30", totalRevenue: "41100" },
  { fiscalDateEnding: "2014-09-30", totalRevenue: "43300" },
  { fiscalDateEnding: "2014-06-30", totalRevenue: "45600" },
  { fiscalDateEnding: "2014-03-30", totalRevenue: "48000" },
  { fiscalDateEnding: "2013-12-30", totalRevenue: "38700" },
  { fiscalDateEnding: "2013-09-30", totalRevenue: "40700" },
  { fiscalDateEnding: "2013-06-30", totalRevenue: "42800" },
  { fiscalDateEnding: "2013-03-30", totalRevenue: "45000" },
  { fiscalDateEnding: "2012-12-30", totalRevenue: "36000" },
  { fiscalDateEnding: "2012-09-30", totalRevenue: "37900" },
  { fiscalDateEnding: "2012-06-30", totalRevenue: "39900" },
  { fiscalDateEnding: "2012-03-30", totalRevenue: "42000" },
];

const limitedReports = [
    { fiscalDateEnding: "2024-12-31", totalRevenue: "98000" },
]

describe("getEndIndex", () => {
    // annualReports tests
    test("get the ending index for 1Y (annual reports)", () => {
        expect(getEndIndex(reports, 1, "fiscalDateEnding")).toBe(1);
    });
    test("get the ending index for 5Y (annual reports)", () => {
        expect(getEndIndex(reports, 5, "fiscalDateEnding")).toBe(5);
    });
    test("get the ending index for 10Y (annual reports)", () => {
        expect(getEndIndex(reports, 10, "fiscalDateEnding")).toBe(10);
    });
    test("return -1 for limited reports (annual reports)", () => {
        expect(getEndIndex(limitedReports, 1, "fiscalDateEnding")).toBe(-1);
    });

    // quarterlyReports tests
    test("get the ending index for 1Y (quarterly reports)", () => {
        expect(getEndIndex(quarterlyReports, 1, "fiscalDateEnding")).toBe(4);
    });
    test("get the ending index for 5Y (quarterly reports)", () => {
        expect(getEndIndex(quarterlyReports, 5, "fiscalDateEnding")).toBe(20);
    });
    test("get the ending index for 10Y (quarterly reports)", () => {
        expect(getEndIndex(quarterlyReports, 10, "fiscalDateEnding")).toBe(40);
    });
});

describe("filterReports", () => {
    test("filter for YTD reports (annual reports)", () => {
        expect(filterReports(reports, "YTD", "fiscalDateEnding")).toEqual([{ fiscalDateEnding: "2024-12-31", totalRevenue: "98000" },])
    });
    test("filter for 1Y reports (annual reports)", () => {
        expect(filterReports(reports, "1Y", "fiscalDateEnding")).toEqual([
            { fiscalDateEnding: '2023-12-31', totalRevenue: "93000" },
            { fiscalDateEnding: '2024-12-31', totalRevenue: "98000" }
        ])
    });
    test("filter for 5Y reports (annual reports)", () => {
        expect(filterReports(reports, "5Y", "fiscalDateEnding")).toEqual([
            { fiscalDateEnding: '2019-12-31', totalRevenue: "71000" },
            { fiscalDateEnding: '2020-12-31', totalRevenue: "76000" },
            { fiscalDateEnding: '2021-12-31', totalRevenue: "82000" },
            { fiscalDateEnding: '2022-12-31', totalRevenue: "88000" },
            { fiscalDateEnding: '2023-12-31', totalRevenue: "93000" },
            { fiscalDateEnding: '2024-12-31', totalRevenue: "98000" }
        ])
    });
    test("filter for 10Y reports (annual reports)", () => {
        expect(filterReports(reports, "10Y", "fiscalDateEnding")).toEqual([
            { fiscalDateEnding: '2014-12-31', totalRevenue: "48000" },
            { fiscalDateEnding: '2015-12-31', totalRevenue: "52000" },
            { fiscalDateEnding: '2016-12-31', totalRevenue: "56000" },
            { fiscalDateEnding: '2017-12-31', totalRevenue: "61000" },
            { fiscalDateEnding: '2018-12-31', totalRevenue: "66000" },
            { fiscalDateEnding: '2019-12-31', totalRevenue: "71000" },
            { fiscalDateEnding: '2020-12-31', totalRevenue: "76000" },
            { fiscalDateEnding: '2021-12-31', totalRevenue: "82000" },
            { fiscalDateEnding: '2022-12-31', totalRevenue: "88000" },
            { fiscalDateEnding: '2023-12-31', totalRevenue: "93000" },
            { fiscalDateEnding: '2024-12-31', totalRevenue: "98000" }
        ])
    });

    test("filter for YTD reports (quarterly reports)", () => {
        expect(filterReports(quarterlyReports, "YTD", "fiscalDateEnding")).toEqual(quarterlyReports.slice(0, 4).reverse())
    });
    test("filter for 1Y reports (quarterly reports)", () => {
        expect(filterReports(quarterlyReports, "1Y", "fiscalDateEnding")).toEqual(quarterlyReports.slice(0, 5).reverse())
    });
    test("filter for 5Y reports (quarterly reports)", () => {
        expect(filterReports(quarterlyReports, "5Y", "fiscalDateEnding")).toEqual(quarterlyReports.slice(0, 21).reverse())
    });
    test("filter for 10Y reports (quarterly reports)", () => {
        expect(filterReports(quarterlyReports, "10Y", "fiscalDateEnding")).toEqual(quarterlyReports.slice(0, 41).reverse())
    });

    // limited Reports test
    test("filterReports return full range reports if not sufficient data", () => {
        expect(filterReports(limitedReports, "YTD", "fiscalDateEnding")).toEqual(limitedReports.reverse());
    })
    test("filterReports return full range reports if not sufficient data", () => {
        expect(filterReports(limitedReports, "1Y", "fiscalDateEnding")).toEqual(limitedReports.reverse());
    })
    test("filterReports return full range reports if not sufficient data", () => {
        expect(filterReports(limitedReports, "5Y", "fiscalDateEnding")).toEqual(limitedReports.reverse());
    })
    test("filterReports return full range reports if not sufficient data", () => {
        expect(filterReports(limitedReports, "10Y", "fiscalDateEnding")).toEqual(limitedReports.reverse());
    })
});

const filteredReports = [
  { fiscalDateEnding: '2023-12-31', totalRevenue: "93000" },
  { fiscalDateEnding: '2024-12-31', totalRevenue: "98000" },
]

const filteredReportsDecreasingTrend = [
  { fiscalDateEnding: '2023-12-31', totalRevenue: "39000" },
  { fiscalDateEnding: '2024-12-31', totalRevenue: "36000" },
]

const filteredReportsWithDecimals = [
{ fiscalDateEnding: '2023-12-31', eps: "9.88" },
{ fiscalDateEnding: '2024-12-31', eps: "10.42" }
]

const filteredReportsWithDecimalsDecreasingTrend = [
  { fiscalDateEnding: '2023-12-31', eps: "3.12" },
  { fiscalDateEnding: '2024-12-31', eps: "2.3" },
]

const filteredReportsNegativeOldValue = [
    { fiscalDateEnding: '2023-12-31', totalRevenue: "-93000" },
    { fiscalDateEnding: '2024-12-31', totalRevenue: "50000" },
];

const decimalFilteredReportsNegativeOldValue = [
    { fiscalDateEnding: '2023-12-31', totalRevenue: "-2.45" },
    { fiscalDateEnding: '2024-12-31', totalRevenue: "5" },
];

describe("getPercentChange", () => {
    test("return correct percent change for YTD range", () => {
        expect(getPercentChange(filteredReports.slice(filteredReports.length - 1), "totalRevenue")).toBe(0.00);
    });
    test("return correct percent change for 1Y range", () => {
        expect(getPercentChange(filteredReports.slice(filteredReports.length - 2), "totalRevenue")).toBe(5.38);
    });
    // decreasing trend
    test("return correct percent change for YTD range", () => {
        expect(getPercentChange(filteredReportsDecreasingTrend.slice(filteredReportsDecreasingTrend.length - 1), "totalRevenue")).toBe(0.00);
    });
    test("return correct percent change for 1Y range", () => {
        expect(getPercentChange(filteredReportsDecreasingTrend.slice(filteredReportsDecreasingTrend.length - 2), "totalRevenue")).toBe(-7.69);
    });
    // old value is negative
    test("return correct percent change when the old value is negative", () => {
        expect(getPercentChange(filteredReportsNegativeOldValue, "totalRevenue")).toBe(153.76);
    });
    test("return correct percent change when the old value is negative decimal number", () => {
        expect(getPercentChange(decimalFilteredReportsNegativeOldValue, "totalRevenue")).toBe(304.08);
    });

    // decimal case
    test("return correct percent change for YTD range", () => {
        expect(getPercentChange(filteredReportsWithDecimals.slice(filteredReportsWithDecimals.length - 1), "eps")).toBe(0.00);
    });
    test("return correct percent change for 1Y range", () => {
        expect(getPercentChange(filteredReportsWithDecimals.slice(filteredReportsWithDecimals.length - 2), "eps")).toBe(5.47);
    });
    // decreasing trend
    test("return correct percent change for YTD range", () => {
        expect(getPercentChange(filteredReportsWithDecimalsDecreasingTrend.slice(filteredReportsWithDecimalsDecreasingTrend.length - 1), "eps")).toBe(0.00);
    });
    test("return correct percent change for 1Y range", () => {
        expect(getPercentChange(filteredReportsWithDecimalsDecreasingTrend.slice(filteredReportsWithDecimalsDecreasingTrend.length - 2), "eps")).toBe(-26.28);
    });

    // base of zero must not produce Infinity
    test("return NaN when the base value is zero", () => {
        expect(getPercentChange([
            { fiscalDateEnding: '2023-12-31', totalRevenue: "0" },
            { fiscalDateEnding: '2024-12-31', totalRevenue: "100" },
        ], "totalRevenue")).toBe(NaN);
    });

    test("return NaN when a value is missing", () => {
        expect(getPercentChange([
            { fiscalDateEnding: '2023-12-31', totalRevenue: "None" },
            { fiscalDateEnding: '2024-12-31', totalRevenue: "100" },
        ], "totalRevenue")).toBe(NaN);
    });
});

describe("hasAnyValue", () => {
    const withData = [
        { fiscalDateEnding: "2023-12-31", eps: "None" },
        { fiscalDateEnding: "2024-12-31", eps: "10.42" },
    ];
    const allMissing = [
        { fiscalDateEnding: "2023-12-31", eps: "None" },
        { fiscalDateEnding: "2024-12-31", eps: null },
    ];

    test("true when at least one report has a numeric value", () => {
        expect(hasAnyValue(withData, "eps")).toBe(true);
    });

    test("false when every report value is missing/None", () => {
        expect(hasAnyValue(allMissing, "eps")).toBe(false);
    });

    test("false for an empty array", () => {
        expect(hasAnyValue([], "eps")).toBe(false);
    });
});

describe("hasStatementContent", () => {
    const statement = {
        annualReports: [{ fiscalDateEnding: "2023-12-31", totalRevenue: "100" }],
        quarterlyReports: [],
    };
    const dividendsStatement = {
        data: [{ ex_dividend_date: "2024-01-01", amount: "1.2" }],
    };
    const dividendsEmpty = {
        data: [{ ex_dividend_date: "2024-01-01", amount: "None" }],
    };
    const earningsStatement = {
        annualEarnings: [{ fiscalDateEnding: "2023-12-31", reportedEPS: "5" }],
        quarterlyEarnings: [],
    };

    test("true while the statement is still loading (null)", () => {
        expect(hasStatementContent(null, "annually", "totalRevenue")).toBe(true);
    });

    test("false for an empty statement (204 response)", () => {
        expect(hasStatementContent([], "annually", "totalRevenue")).toBe(false);
    });

    test("true for a plain array with data (pricing shape)", () => {
        expect(hasStatementContent([{ date: "2024-01-01", adjustedClose: "100" }], "annually", null)).toBe(true);
    });

    test("true when the selected period has a usable value", () => {
        expect(hasStatementContent(statement, "annually", "totalRevenue")).toBe(true);
    });

    test("false when the selected period has no usable value", () => {
        expect(hasStatementContent(statement, "quarterly", "totalRevenue")).toBe(false);
    });

    test("false when every value for the metric is missing", () => {
        expect(hasStatementContent({ annualReports: [{ fiscalDateEnding: "2023-12-31", totalRevenue: "None" }], quarterlyReports: [] }, "annually", "totalRevenue")).toBe(false);
    });

    test("dividends source reads statement.data.amount", () => {
        expect(hasStatementContent(dividendsStatement, "annually", "amount", "dividends")).toBe(true);
        expect(hasStatementContent(dividendsEmpty, "annually", "amount", "dividends")).toBe(false);
    });

    test("earnings source reads annualEarnings/quarterlyEarnings", () => {
        expect(hasStatementContent(earningsStatement, "annually", "reportedEPS", "earnings")).toBe(true);
        expect(hasStatementContent(earningsStatement, "quarterly", "reportedEPS", "earnings")).toBe(false);
    });

    test("statement source counts any non-empty object as content", () => {
        expect(hasStatementContent({ annualReports: [], quarterlyReports: [] }, "annually", null, "statement")).toBe(true);
        expect(hasStatementContent([], "annually", null, "statement")).toBe(false);
    });
});