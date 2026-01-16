
function getEndIndex(reports, year, dateField) {
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
    if (endIndex === -1) {
        return  0
    }
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
            filteredReports = reports.slice(0, endIndex + 1);
            break;
        }
        case "5Y": {
            const endIndex = getEndIndex(reports, 5, dateField);
            filteredReports = reports.slice(0, endIndex + 1);
            break;
        }
        case "10Y": {
            const endIndex = getEndIndex(reports, 10, dateField);
            filteredReports = reports.slice(0, endIndex + 1);
            break;
        }
        default:
            console.log("return all (default)");
    }
    return filteredReports.reverse();
}

export function getPercentChange(reports, value) {
    // ((today’s price - years ago price) / years ago price) * 100
    if (!reports.length) {
        return 0;
    }
    console.log("percentChangeReports:", reports);
    const newValue = reports[reports.length - 1][value];
    const oldValue = reports[0][value];
    const percentChange = ((newValue - oldValue) / oldValue) * 100;
    console.log(`percentChange is ${percentChange} old value = ${oldValue} new value = ${newValue} `);
    return percentChange.toFixed(2);
}


export function countDigits(value) {
    if (value === 0) {
        return 1;
    }
    return Math.floor(Math.log10(Math.abs(value))) + 1;
}