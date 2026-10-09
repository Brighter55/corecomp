import SectionHeader from "./SectionHeader.tsx";
import { render, screen } from "@testing-library/react";

describe("SectionHeader", () => {
  test("renders the title as a plain heading", () => {
    render(<SectionHeader title="Today's movers" />);

    expect(screen.getByRole("heading", { name: "Today's movers" })).toBeInTheDocument();
  });

  test("does not make the title a link", () => {
    render(<SectionHeader title="Today's movers" />);

    // The title was an <a href="#"> that went nowhere. A control that looks
    // interactive and is not is worse than plain text.
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  test("renders no chevron", () => {
    const { container } = render(<SectionHeader title="Today's movers" />);

    // The chevron existed only to signal the title was clickable.
    expect(container.querySelector("svg")).not.toBeInTheDocument();
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
    // Actions are still free to be a link -- only the *title* stopped being one.
    expect(screen.getByRole("link", { name: "View all news" })).toBeInTheDocument();
  });

  test("omits the actions container entirely when there are no actions", () => {
    const { container } = render(<SectionHeader title="Market News" />);

    // One child only: the left group. An empty flex wrapper would still consume
    // the justify-between gutter and shift the title.
    expect(container.firstElementChild?.children).toHaveLength(1);
  });
});
