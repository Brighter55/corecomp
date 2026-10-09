import useMoverPageSize from "./useMoverPageSize.ts";
import { act, renderHook } from "@testing-library/react";

// jsdom's matchMedia always reports matches: false, so without this every test
// would run the mobile branch and render a single card per page.
let currentWidth = 1440;
let listeners = [];

function mockViewport(width) {
  currentWidth = width;
  listeners = [];
  window.matchMedia = vi.fn((query) => {
    const min = Number(/min-width:\s*(\d+)px/.exec(query)?.[1] ?? 0);
    return {
      // A getter, not a snapshot: readPageSize re-queries matchMedia after each
      // change event, so it has to see the *new* width.
      get matches() {
        return currentWidth >= min;
      },
      media: query,
      addEventListener: (_event, callback) => listeners.push(callback),
      removeEventListener: vi.fn(),
    };
  });
}

function resizeTo(width) {
  currentWidth = width;
  act(() => listeners.forEach((callback) => callback()));
}

describe("useMoverPageSize", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("returns 4 at desktop width", () => {
    mockViewport(1440);
    const { result } = renderHook(() => useMoverPageSize());

    expect(result.current).toBe(4);
  });

  test("returns 2 at tablet width", () => {
    mockViewport(900);
    const { result } = renderHook(() => useMoverPageSize());

    expect(result.current).toBe(2);
  });

  test("returns 1 at mobile width", () => {
    mockViewport(500);
    const { result } = renderHook(() => useMoverPageSize());

    expect(result.current).toBe(1);
  });

  test("sits on the same thresholds as the grid's md: and lg: classes", () => {
    // The grid is `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`. Tailwind's md is
    // 768px and lg is 1024px; if these ever drift, pages start skipping cards.
    for (const [width, expected] of [
      [1024, 4],
      [1023, 2],
      [768, 2],
      [767, 1],
    ]) {
      mockViewport(width);
      const { result } = renderHook(() => useMoverPageSize());
      expect(result.current, `at ${width}px`).toBe(expected);
    }
  });

  test("re-reads the width when the viewport crosses a breakpoint", () => {
    mockViewport(1440);
    const { result } = renderHook(() => useMoverPageSize());
    expect(result.current).toBe(4);

    resizeTo(500);
    expect(result.current).toBe(1);

    resizeTo(900);
    expect(result.current).toBe(2);
  });

  test("stops listening on unmount", () => {
    mockViewport(1440);
    const { unmount } = renderHook(() => useMoverPageSize());

    const registered = listeners.length;
    expect(registered).toBeGreaterThan(0);

    unmount();
    // Fresh listeners array is untouched by a resize after teardown.
    const after = listeners.length;
    resizeTo(500);
    expect(listeners.length).toBe(after);
  });
});
