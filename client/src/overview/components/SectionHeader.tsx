import { type ReactNode } from "react";

type SectionHeaderProps = {
  title: string;
  /** Inline controls rendered after the title, e.g. category filter chips. */
  filters?: ReactNode;
  /** Right-aligned controls, e.g. carousel arrows or a "view all" link. */
  actions?: ReactNode;
};

/**
 * Full-width section header: a headline, an optional inline filter row, and
 * optional right-aligned actions, sitting on a single hairline rule.
 *
 * The title is deliberately **not** a link. It used to be an `<a href="#">`
 * with a hover chevron that went nowhere, which reads as a control and is not
 * one -- neither section routes anywhere yet.
 *
 * The rule uses `--line-muted` rather than a fixed colour so it survives the
 * light/dark theme swap in index.css.
 */
function SectionHeader({ title, filters, actions }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-[var(--line-muted)] pb-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-6">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--text-main)] md:text-3xl">
          {title}
        </h2>
        {filters}
      </div>
      {actions ? <div className="flex items-center gap-4">{actions}</div> : null}
    </div>
  );
}

export default SectionHeader;
