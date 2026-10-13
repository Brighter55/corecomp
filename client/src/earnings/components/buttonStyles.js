// The round icon buttons that share the toolbar's row: the week arrows and the
// filter trigger. It lives here rather than in EarningsToolbar because the
// toolbar renders EarningsFilter, so exporting it from there made the two
// modules import each other.
export const NAV_BUTTON =
    "flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line-muted)] text-[var(--text-muted)] transition-colors hover:border-[var(--main-dry-sage)] hover:text-[var(--text-main)]";
