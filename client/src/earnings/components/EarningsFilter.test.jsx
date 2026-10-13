import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import EarningsFilter from "./EarningsFilter.jsx";

// The filter is controlled, so the harness owns the value the page would.
function Harness() {
    const [value, setValue] = useState("all");
    return <EarningsFilter value={value} onChange={setValue} />;
}

describe("EarningsFilter", () => {
    test("lists the five options with All stocks checked first", async () => {
        const user = userEvent.setup();
        render(<Harness />);

        await user.click(screen.getByRole("button", { name: "Filter stocks" }));

        expect(screen.getByRole("radio", { name: "All stocks" })).toHaveAttribute("aria-checked", "true");
        expect(screen.getByRole("radio", { name: "Popular stocks" })).toHaveAttribute("aria-checked", "false");
        expect(screen.getByRole("radio", { name: "Market cap 100B+" })).toBeInTheDocument();
        expect(screen.getByRole("radio", { name: "Market cap 10B+" })).toBeInTheDocument();
        expect(screen.getByRole("radio", { name: "Market cap 1B+" })).toBeInTheDocument();
    });

    test("closes on a choice and reopens with it checked", async () => {
        const user = userEvent.setup();
        render(<Harness />);

        await user.click(screen.getByRole("button", { name: "Filter stocks" }));
        await user.click(screen.getByRole("radio", { name: "Popular stocks" }));

        // Choosing dismisses the popup, so the option is gone until reopened.
        expect(screen.queryByRole("radio", { name: "Popular stocks" })).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Filter stocks" }));
        expect(screen.getByRole("radio", { name: "Popular stocks" })).toHaveAttribute("aria-checked", "true");
    });

    test("fills the trigger only while a filter is set", async () => {
        const user = userEvent.setup();
        render(<Harness />);
        const trigger = () => screen.getByRole("button", { name: "Filter stocks" });

        // The active styling, not the open state, is what survives the popup
        // closing, so it is the one thing the trigger has to carry.
        expect(trigger().className).not.toContain("bg-[var(--main-dry-sage)]");

        await user.click(trigger());
        await user.click(screen.getByRole("radio", { name: "Market cap 1B+" }));

        expect(trigger().className).toContain("bg-[var(--main-dry-sage)]");
    });
});
