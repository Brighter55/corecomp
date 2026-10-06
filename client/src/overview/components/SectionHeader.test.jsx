import SectionHeader from "./SectionHeader.tsx";
import { render, screen } from "@testing-library/react";

describe("SectionHeader", () => {
  test("renders the title as a heading wrapping a link", () => {
    render(<SectionHeader title="Trending Stocks" />);

    // The heading carries the accessible name; the chevron is decorative and
    // must stay aria-hidden or the name becomes "Trending Stocks ChevronRight".
    expect(screen.getByRole("heading", { name: "Trending Stocks" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Trending Stocks" })).toHaveAttribute("href", "#");
  });

  test("renders the filters and actions slots when supplied", () => {
    render(
      <SectionHeader
        title="Market News"
        filters={<button type="button">Macro</button>}
        actions={<a href="#all-news">View all news</a>}
      />
    );

    expect(screen.getByRole("button", { name: "Macro" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View all news" })).toBeInTheDocument();
  });

  test("omits the actions container entirely when there are no actions", () => {
    const { container } = render(<SectionHeader title="Market News" />);

    // Two children only: the left group and nothing else. An empty flex wrapper
    // would still consume the justify-between gutter and shift the title.
    expect(container.firstElementChild?.children).toHaveLength(1);
  });

  test("lets the caller override the title link target", () => {
    render(<SectionHeader title="Trending Stocks" href="/markets" />);

    expect(screen.getByRole("link", { name: "Trending Stocks" })).toHaveAttribute("href", "/markets");
  });
});
