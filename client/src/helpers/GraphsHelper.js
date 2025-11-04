
function getStartIndex(reports, year) {
    /*get targetMonth and targetYear from the last element in reports*/
    const lastDate = reports[reports.length - 1].date;
    const lastDateObject = new Date(lastDate);
    const targetMonth = lastDateObject.getMonth();
    const targetYear = lastDateObject.getFullYear() - year;
    // get the startIndex to filter the reports
    const startIndex = reports.findIndex((report) => {
        const currentReportDateObject = new Date(report.date);
        const currentReportDateMonth = currentReportDateObject.getMonth();
        const currentReportDateYear = currentReportDateObject.getFullYear();
        return (currentReportDateMonth === targetMonth && currentReportDateYear === targetYear);
    });
    return startIndex;
}


export function filterReports(reports, timeRange) {
    let filteredReports;
    switch (timeRange) {
        case "YTD": {
            /*get targetMonth and targetYear from the last element in reports*/
            const lastDate = reports[reports.length - 1].date;
            const lastDateObject = new Date(lastDate);
            const targetMonth = 0;
            const targetYear = lastDateObject.getFullYear();
            console.log(targetMonth, targetYear);
            // get the startIndex to filter the reports
            const startIndex = reports.findIndex((report) => {
                const currentReportDateObject = new Date(report.date);
                const currentReportDateMonth = currentReportDateObject.getMonth();
                const currentReportDateYear = currentReportDateObject.getFullYear();
                return (currentReportDateMonth === targetMonth && currentReportDateYear === targetYear);
            });
            filteredReports = reports.slice(startIndex);
            break;
        }
        case "1Y": {
            const startIndex = getStartIndex(reports, 1);
            filteredReports = reports.slice(startIndex);
            break;
        }
        case "5Y": {
            const startIndex = getStartIndex(reports, 5);
            filteredReports = reports.slice(startIndex);
            break;
        }
        case "10Y": {
            const startIndex = getStartIndex(reports, 10);
            filteredReports = reports.slice(startIndex);
            break;
        }
        default:
            console.log("return all (default)");
            return reports;
    }
    console.log("return", filteredReports, timeRange);
    return filteredReports;
}
