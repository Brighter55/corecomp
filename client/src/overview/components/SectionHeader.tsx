import { type ReactNode } from "react";
import { ChevronRight } from "lucide-react";

type SectionHeaderProps = {
  title: string;
  /** Where the title links to. Placeholder until these sections are routed. */
  href?: string;
  /** Inline controls rendered after the title, e.g. category filter chips. */
  filters?: ReactNode;
  /** Right-aligned controls, e.g. carousel arrows or a "view all" link. */
  actions?: ReactNode;
};

/**
 * Full-width section header: a large headline link with a hover chevron, an
 * optional inline filter row, and optional right-aligned actions, sitting on a
 * single hairline rule.
 *
 * The rule uses `--line-muted` rather than a fixed colour so it survives the
 * light/dark theme swap in index.css.
 */
function SectionHeader({ title, href = "#", filters, actions }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-[var(--line-muted)] pb-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-6">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          <a
            href={href}
            className="group inline-flex items-center gap-1 text-[var(--text-main)] transition-colors hover:text-[var(--main-dry-sage)]"
          >
            {title}
            {/* aria-hidden keeps the accessible name just the title. */}
            <ChevronRight
              aria-hidden="true"
              className="h-6 w-6 transition-transform group-hover:translate-x-1"
            />
          </a>
        </h2>
        {filters}
      </div>
      {actions ? <div className="flex items-center gap-4">{actions}</div> : null}
    </div>
  );
}

export default SectionHeader;
