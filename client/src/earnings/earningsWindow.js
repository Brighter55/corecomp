// Date math for the earnings calendar. Every value crossing this module is an
// ISO "YYYY-MM-DD" string and every Date is built in UTC, so a viewer's timezone
// can never shift a day across a boundary and land a company in the wrong column.
//
// The client owns the date axis: it decides which Monday the weekly board shows
// and which month the grid shows, then asks the server for exactly that window.

const DAY_MS = 24 * 60 * 60 * 1000;

const MONTH_DAY = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
});

const MONTH_YEAR = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
});

const WEEKDAY_SHORT = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "UTC",
});

// Monday is 0 through Sunday is 6, matching the board's left-to-right order.
const WEEKDAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

function parseIso(iso) {
    const [year, month, day] = iso.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}

function toIso(date) {
    return date.toISOString().slice(0, 10);
}

function weekdayIndex(iso) {
    return (parseIso(iso).getUTCDay() + 6) % 7;
}

export function addDays(iso, count) {
    const date = parseIso(iso);
    date.setUTCDate(date.getUTCDate() + count);
    return toIso(date);
}

// Today in the viewer's own calendar, pinned to UTC midnight so it compares
// cleanly against the ISO strings everywhere else.
export function todayIso() {
    const now = new Date();
    return toIso(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
}

export function mondayOf(iso) {
    return addDays(iso, -weekdayIndex(iso));
}

export function shiftMonths(iso, count) {
    const date = parseIso(iso);
    const day = date.getUTCDate();
    date.setUTCDate(1);
    date.setUTCMonth(date.getUTCMonth() + count);
    // Clamp to the target month's length so shifting Jan 31 back a month lands
    // on Feb 28 rather than overflowing into March.
    const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
    date.setUTCDate(Math.min(day, lastDay));
    return toIso(date);
}

// Monday through Friday of the week holding `anchorIso`.
export function weeklyWindow(anchorIso) {
    return { start: mondayOf(anchorIso), days: 5 };
}

// The whole Monday-to-Friday grid for `anchorIso`'s month, running from the
// Monday on or before the 1st to the Sunday after the last Friday the month
// spills into. 28 to 42 calendar days, inside the server's 1..42 bound.
export function monthlyWindow(anchorIso) {
    const date = parseIso(anchorIso);
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const firstOfMonth = toIso(new Date(Date.UTC(year, month, 1)));
    const lastOfMonth = toIso(new Date(Date.UTC(year, month + 1, 0)));

    const gridStart = mondayOf(firstOfMonth);
    const lastMonday = mondayOf(lastOfMonth);
    const weeks = (parseIso(lastMonday) - parseIso(gridStart)) / DAY_MS / 7 + 1;

    return { start: gridStart, days: weeks * 7 };
}

// Every weekday cell in the window, row by row. `days` five gives one board row;
// a monthly window gives one row per week.
export function weekdayCells(startIso, days) {
    const cells = [];
    const weekCount = Math.ceil(days / 7);

    for (let week = 0; week < weekCount; week += 1) {
        for (let offset = 0; offset < WEEKDAY_HEADERS.length; offset += 1) {
            cells.push(addDays(startIso, week * 7 + offset));
        }
    }

    return cells;
}

export function weekdayHeaders() {
    return WEEKDAY_HEADERS;
}

export function dayLabel(iso) {
    // Composed rather than asked of one formatter: ICU renders en-US
    // weekday-plus-day as "12 Mon", and the board reads "Mon 12".
    return `${WEEKDAY_SHORT.format(parseIso(iso))} ${dayOfMonth(iso)}`;
}

export function dayOfMonth(iso) {
    return parseIso(iso).getUTCDate();
}

export function isSameMonth(iso, anchorIso) {
    const a = parseIso(iso);
    const b = parseIso(anchorIso);
    return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth();
}

// The server returns only dates that have tiles, so absent dates are missing
// keys rather than empty days.
export function daysByDate(days) {
    const map = new Map();

    for (const day of days ?? []) {
        map.set(day.date, day);
    }

    return map;
}

// A month cell ignores the session grouping and shows the day's whole set, so
// the overflow count is the honest total rather than one group's.
export function flattenTiles(day) {
    if (!day || !Array.isArray(day.sessions)) {
        return [];
    }

    return day.sessions.flatMap((session) => (Array.isArray(session.tiles) ? session.tiles : []));
}

export function weeklyLabel(window) {
    const end = addDays(window.start, window.days - 1);
    const year = parseIso(end).getUTCFullYear();

    return `${MONTH_DAY.format(parseIso(window.start))} – ${MONTH_DAY.format(parseIso(end))}, ${year}`;
}

// Anchored on the displayed month itself, not the grid's start: the grid may
// begin in the previous month, and naming it that month would be a lie.
export function monthLabel(anchorIso) {
    return MONTH_YEAR.format(parseIso(anchorIso));
}
