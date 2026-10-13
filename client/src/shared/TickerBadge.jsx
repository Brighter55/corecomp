import { useEffect, useState } from "react";
import { companyLogoUrl } from "./companyLogoUrl.js";

// A ticker's logo, falling back to a chip with the ticker on it. Lifted out of
// the dip watchlist sidebar so the earnings tiles get the same fallback instead
// of a second copy that can drift.
//
// `size` is the rendered diameter in pixels. The logo is requested at 2x so a
// retina display gets a crisp image, which is why the sidebar's 40px badge asks
// logo.dev for an 80px file.
function TickerBadge({ symbol, size = 40 }) {
    const [logoFailed, setLogoFailed] = useState(false);

    // Rows are keyed by symbol, so a recycled badge must clear a previous failure.
    useEffect(() => {
        setLogoFailed(false);
    }, [symbol]);

    const logoUrl = companyLogoUrl(symbol, size * 2);

    if (logoUrl && !logoFailed) {
        return (
            <img
                src={logoUrl}
                // The ticker is spelled out right next to this, so describing the
                // image would only make a screen reader say the symbol twice.
                alt=""
                onError={() => setLogoFailed(true)}
                style={{ width: size, height: size }}
                className="shrink-0 rounded-full bg-[rgba(218,215,205,0.15)] object-cover"
            />
        );
    }

    return (
        <span
            data-testid="ticker-chip"
            style={{
                width: size,
                height: size,
                fontSize: Math.max(8, Math.round(size * 0.26)),
            }}
            className="flex shrink-0 items-center justify-center rounded-full bg-[rgba(218,215,205,0.15)] font-semibold tracking-wide text-[var(--text-main)]"
        >
            {symbol}
        </span>
    );
}

export default TickerBadge;
