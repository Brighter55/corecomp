
import { filterReports, formatToUnits, getEndIndex, getPercentChange } from './GraphsHelper.js';

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
});

const reports = [
  { fiscalDateEnding: "2024-12-31", totalRevenue: 98000 },
  { fiscalDateEnding: "2023-12-31", totalRevenue: 93000 },
  { fiscalDateEnding: "2022-12-31", totalRevenue: 88000 },
  { fiscalDateEnding: "2021-12-31", totalRevenue: 82000 },
  { fiscalDateEnding: "2020-12-31", totalRevenue: 76000 },
  { fiscalDateEnding: "2019-12-31", totalRevenue: 71000 },
  { fiscalDateEnding: "2018-12-31", totalRevenue: 66000 },
  { fiscalDateEnding: "2017-12-31", totalRevenue: 61000 },
  { fiscalDateEnding: "2016-12-31", totalRevenue: 56000 },
  { fiscalDateEnding: "2015-12-31", totalRevenue: 52000 },
  { fiscalDateEnding: "2014-12-31", totalRevenue: 48000 },
  { fiscalDateEnding: "2013-12-31", totalRevenue: 45000 },
  { fiscalDateEnding: "2012-12-31", totalRevenue: 42000 },
  { fiscalDateEnding: "2011-12-31", totalRevenue: 39000 },
  { fiscalDateEnding: "2010-12-31", totalRevenue: 36000 }
]

const limitedReports = [
    { fiscalDateEnding: "2024-12-31", totalRevenue: 98000 },
]

const filteredReports = [
  { fiscalDateEnding: '2010-12-31', totalRevenue: 36000 },
  { fiscalDateEnding: '2011-12-31', totalRevenue: 39000 },
  { fiscalDateEnding: '2012-12-31', totalRevenue: 42000 },
  { fiscalDateEnding: '2013-12-31', totalRevenue: 45000 },
  { fiscalDateEnding: '2014-12-31', totalRevenue: 48000 },
  { fiscalDateEnding: '2015-12-31', totalRevenue: 52000 },
  { fiscalDateEnding: '2016-12-31', totalRevenue: 56000 },
  { fiscalDateEnding: '2017-12-31', totalRevenue: 61000 },
  { fiscalDateEnding: '2018-12-31', totalRevenue: 66000 },
  { fiscalDateEnding: '2019-12-31', totalRevenue: 71000 },
  { fiscalDateEnding: '2020-12-31', totalRevenue: 76000 },
  { fiscalDateEnding: '2021-12-31', totalRevenue: 82000 },
  { fiscalDateEnding: '2022-12-31', totalRevenue: 88000 },
  { fiscalDateEnding: '2023-12-31', totalRevenue: 93000 },
  { fiscalDateEnding: '2024-12-31', totalRevenue: 98000 }
]

describe("getEndIndex", () => {
    test("get the ending index for 1Y", () => {
        expect(getEndIndex(reports, 1, "fiscalDateEnding")).toBe(1);
    });
    test("get the ending index for 5Y", () => {
        expect(getEndIndex(reports, 5, "fiscalDateEnding")).toBe(5);
    });
    test("get the ending index for 10Y", () => {
        expect(getEndIndex(reports, 10, "fiscalDateEnding")).toBe(10);
    });
    test("return -1 for limited reports", () => {
        expect(getEndIndex(limitedReports, 1, "fiscalDateEnding")).toBe(-1);
    });
});

describe("filterReports", () => {
    test("filter for YTD reports", () => {
        expect(filterReports(reports, "YTD", "fiscalDateEnding")).toEqual([{ fiscalDateEnding: "2024-12-31", totalRevenue: 98000 },])
    });
    test("filter for 1Y reports", () => {
        expect(filterReports(reports, "1Y", "fiscalDateEnding")).toEqual([
            { fiscalDateEnding: '2023-12-31', totalRevenue: 93000 },
            { fiscalDateEnding: '2024-12-31', totalRevenue: 98000 }
        ])
    });
    test("filter for 5Y reports", () => {
        expect(filterReports(reports, "5Y", "fiscalDateEnding")).toEqual([
            { fiscalDateEnding: '2019-12-31', totalRevenue: 71000 },
            { fiscalDateEnding: '2020-12-31', totalRevenue: 76000 },
            { fiscalDateEnding: '2021-12-31', totalRevenue: 82000 },
            { fiscalDateEnding: '2022-12-31', totalRevenue: 88000 },
            { fiscalDateEnding: '2023-12-31', totalRevenue: 93000 },
            { fiscalDateEnding: '2024-12-31', totalRevenue: 98000 }
        ])
    });
    test("filter for 10Y reports", () => {
        expect(filterReports(reports, "10Y", "fiscalDateEnding")).toEqual([
            { fiscalDateEnding: '2014-12-31', totalRevenue: 48000 },
            { fiscalDateEnding: '2015-12-31', totalRevenue: 52000 },
            { fiscalDateEnding: '2016-12-31', totalRevenue: 56000 },
            { fiscalDateEnding: '2017-12-31', totalRevenue: 61000 },
            { fiscalDateEnding: '2018-12-31', totalRevenue: 66000 },
            { fiscalDateEnding: '2019-12-31', totalRevenue: 71000 },
            { fiscalDateEnding: '2020-12-31', totalRevenue: 76000 },
            { fiscalDateEnding: '2021-12-31', totalRevenue: 82000 },
            { fiscalDateEnding: '2022-12-31', totalRevenue: 88000 },
            { fiscalDateEnding: '2023-12-31', totalRevenue: 93000 },
            { fiscalDateEnding: '2024-12-31', totalRevenue: 98000 }
        ])
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

describe("getPercentChange", () => {
    test("return correct percent change for YTD range", () => {
        expect(getPercentChange(filteredReports.slice(filteredReports.length - 1), "totalRevenue")).toBe(0.00);
    });
    test("return correct percent change for 1Y range", () => {
        expect(getPercentChange(filteredReports.slice(filteredReports.length - 2), "totalRevenue")).toBe(5.38);
    });
    test("return correct percent change for 5Y range", () => {
        expect(getPercentChange(filteredReports.slice(filteredReports.length - 6), "totalRevenue")).toBe(38.03);
    });
    test("return correct percent change for 10Y range", () => {
        expect(getPercentChange(filteredReports.slice(filteredReports.length - 11), "totalRevenue")).toBe(104.17);
    });
});