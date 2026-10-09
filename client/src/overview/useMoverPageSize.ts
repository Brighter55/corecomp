import { useEffect, useState } from "react";

/**
 * The two thresholds MUST mirror the movers grid's responsive classes
 * (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`). Tailwind's `md` is 768px and
 * `lg` is 1024px.
 *
 * That duplication is the weak point of paginating in JS: change the grid
 * classes without changing these and the carousel starts skipping cards. The
 * pairing is pinned by a test in useMoverPageSize.test.jsx.
 */
const DESKTOP_QUERY = "(min-width: 1024px)";
const TABLET_QUERY = "(min-width: 768px)";

function readPageSize(): number {
  if (typeof window === "undefined" || !window.matchMedia) {
    return 1;
  }
  if (window.matchMedia(DESKTOP_QUERY).matches) {
    return 4;
  }
  if (window.matchMedia(TABLET_QUERY).matches) {
    return 2;
  }
  return 1;
}

/**
 * How many mover cards fit on one "page" at the current width.
 *
 * Required because the carousel advances a whole page at a time, and how many
 * that is depends on a CSS breakpoint -- which JS cannot read. There is no
 * breakpoint hook elsewhere in this repo; this is the first.
 */
function useMoverPageSize(): number {
  const [pageSize, setPageSize] = useState(readPageSize);

  useEffect(() => {
    const queries = [window.matchMedia(DESKTOP_QUERY), window.matchMedia(TABLET_QUERY)];
    const update = () => setPageSize(readPageSize());

    queries.forEach((query) => query.addEventListener("change", update));
    return () => {
      queries.forEach((query) => query.removeEventListener("change", update));
    };
  }, []);

  return pageSize;
}

export default useMoverPageSize;
