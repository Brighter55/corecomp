// logo.dev serves company logos by ticker. Kept in one place so the overview and
// dip features cannot drift apart on the template or the token param.
export function companyLogoUrl(symbol, size = 80) {
    if (!symbol) {
        return "";
    }

    // fallback=404 makes logo.dev 404 on a ticker it has no mark for, instead of
    // serving its own white monogram tile. That keeps callers' onError chips in
    // play -- otherwise the image always "succeeds" and the fallback never fires.
    return `https://img.logo.dev/ticker/${encodeURIComponent(symbol)}?token=${import.meta.env.VITE_LOGO_DEV_PUBLISHABLE_KEY}&size=${size}&fallback=404`;
}
