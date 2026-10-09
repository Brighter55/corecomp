import Sparkline from "./Sparkline.tsx";
import { render } from "@testing-library/react";

/** Parse the polyline's `points` attribute into [x, y] pairs. */
function vertices(container) {
  const points = container.querySelector("polyline")?.getAttribute("points") ?? "";
  return points
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((pair) => pair.split(",").map(Number));
}

describe("Sparkline", () => {
  const RISING = [126.1, 126.85, 126.6, 127.9, 127.55, 128.84];
  const FALLING = [252.8, 251.1, 252.3, 247.9, 249.2, 246.3];

  test("draws one vertex per supplied value, inside the 96x40 viewBox", () => {
    const { container } = render(<Sparkline points={RISING} positive />);

    const coords = vertices(container);
    expect(coords).toHaveLength(RISING.length);
    for (const [x, y] of coords) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(96);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(40);
    }
  });

  test("maps the first and last values to the horizontal edges, in order", () => {
    const { container } = render(<Sparkline points={RISING} positive />);

    const coords = vertices(container);
    // Evenly spaced: strictly increasing x, first at the left inset.
    expect(coords[0][0]).toBeLessThan(coords[1][0]);
    expect(coords[coords.length - 1][0]).toBeGreaterThan(coords[coords.length - 2][0]);
  });

  test("a rising series ends higher on screen than it starts (y is inverted)", () => {
    const { container } = render(<Sparkline points={RISING} positive />);

    const coords = vertices(container);
    // Screen y grows downward, so a rising price must end at a SMALLER y.
    expect(coords[coords.length - 1][1]).toBeLessThan(coords[0][1]);
  });

  test("strokes with the up token when positive and the down token when not", () => {
    const up = render(<Sparkline points={RISING} positive />);
    expect(up.container.querySelector("polyline").getAttribute("class")).toContain("--change-up");

    const down = render(<Sparkline points={FALLING} positive={false} />);
    expect(down.container.querySelector("polyline").getAttribute("class")).toContain("--change-down");
  });

  test("puts the end dot on the final vertex", () => {
    const { container } = render(<Sparkline points={RISING} positive />);

    const coords = vertices(container);
    const [lastX, lastY] = coords[coords.length - 1];
    const dot = container.querySelector("circle");

    expect(Number(dot.getAttribute("cx"))).toBeCloseTo(lastX, 5);
    expect(Number(dot.getAttribute("cy"))).toBeCloseTo(lastY, 5);
  });

  test("a flat series draws a level line with no NaN coordinates", () => {
    // max === min is the divide-by-zero case: span/0 would poison every y.
    const { container } = render(<Sparkline points={[100, 100, 100, 100]} positive />);

    const coords = vertices(container);
    expect(coords).toHaveLength(4);
    for (const [x, y] of coords) {
      expect(Number.isFinite(x)).toBe(true);
      expect(Number.isFinite(y)).toBe(true);
    }
    // Level: every point shares one y, and it sits mid-height.
    expect(new Set(coords.map(([, y]) => y)).size).toBe(1);
    expect(coords[0][1]).toBeCloseTo(20, 5);
  });

  test("renders nothing for fewer than two points", () => {
    const none = render(<Sparkline points={[]} positive />);
    expect(none.container).toBeEmptyDOMElement();

    const single = render(<Sparkline points={[42]} positive />);
    expect(single.container).toBeEmptyDOMElement();
  });

  test("is hidden from assistive tech — the price and chip already carry the data", () => {
    const { container } = render(<Sparkline points={RISING} positive />);

    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });
});
