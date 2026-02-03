
export function getEndIndex(reports, year, dateField) {
    // get targetMonth and targetYear
    const startDate = reports[0][dateField];
    const startDateObject = new Date(startDate);
    const targetMonth = startDateObject.getMonth();
    const targetYear = startDateObject.getFullYear() - year;
    // get the endIndex to filter the reports
    const endIndex = reports.findIndex((report) => {
        const currentReportDateObject = new Date(report[dateField]);
        const currentReportDateMonth = currentReportDateObject.getMonth();
        const currentReportDateYear = currentReportDateObject.getFullYear();
        return (currentReportDateMonth === targetMonth && currentReportDateYear === targetYear);
    });

    return endIndex;
}


export function filterReports(reports, timeRange, dateField) {
    let filteredReports = reports.slice(0);
    switch (timeRange) {
        case "YTD": {
            // get targetYear from the current date
            const startDate = reports[0][dateField];
            const startDateObject = new Date(startDate);
            const targetYear = startDateObject.getFullYear();
            console.log(targetYear);
            // get the endIndex to filter the reports
            const endIndex = reports.findIndex((report) => {
                const currentReportDateObject = new Date(report[dateField]);
                const currentReportDateYear = currentReportDateObject.getFullYear();
                return (currentReportDateYear != targetYear);
            });

            if (endIndex === -1) {
                break;
            }

            filteredReports = reports.slice(0, endIndex);
            break;
        }
        case "1Y": {
            const endIndex = getEndIndex(reports, 1, dateField);

            if (endIndex === -1) {
                break;
            }

            filteredReports = reports.slice(0, endIndex + 1);
            break;
        }
        case "5Y": {
            const endIndex = getEndIndex(reports, 5, dateField);

            if (endIndex === -1) {
                break;
            }

            filteredReports = reports.slice(0, endIndex + 1);
            break;
        }
        case "10Y": {
            const endIndex = getEndIndex(reports, 10, dateField);

            if (endIndex === -1) {
                break;
            }

            filteredReports = reports.slice(0, endIndex + 1);
            break;
        }
        default:
            console.log("return all (default)");
    }
    return filteredReports.reverse();
}

export function getPercentChange(reports, value) {
    // ((newValue - oldValue) / oldValue) * 100
    if (!reports.length) {
        return 0;
    }

    const newValue = parseFloat(reports[reports.length - 1][value]);
    const oldValue = parseFloat(reports[0][value]);
    const percentChange = ((newValue - oldValue) / oldValue) * 100;
    return parseFloat(percentChange.toFixed(2));
}
// receive string integer
export function formatToUnits(value) {
    const integerValue = parseInt(value);
    if (integerValue >= 1_000_000_000 || integerValue <= -1_000_000_000) {
        return `$${(integerValue / 1_000_000_000).toFixed(2)}B`;
    }
    if (integerValue >= 1_000_000 || integerValue <= -1_000_000) {
        return `$${(integerValue / 1_000_000).toFixed(2)}M`;
    }
    
    return `$${value}`;
}