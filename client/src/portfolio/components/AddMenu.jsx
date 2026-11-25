import { useEffect, useRef, useState } from "react";

const ITEMS = [
  {
    action: "trade",
    title: "New trade",
    hint: "Record a buy or sell",
    tone: "ico-trade",
    icon: (
      <>
        <path d="M7 20V4" />
        <path d="m3 8 4-4 4 4" />
        <path d="M17 4v16" />
        <path d="m21 16-4 4-4-4" />
      </>
    ),
  },
  {
    action: "dividend",
    title: "New dividend",
    hint: "Log income you received",
    tone: "ico-div",
    icon: (
      <>
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <circle cx="12" cy="12" r="2.6" />
      </>
    ),
  },
  {
    action: "split",
    title: "New split",
    hint: "Record a stock split",
    tone: "ico-split",
    icon: (
      <>
        <path d="M12 3v7" />
        <path d="m12 10-6 6" />
        <path d="m12 10 6 6" />
        <path d="M6 16v4" />
        <path d="M18 16v4" />
      </>
    ),
  },
  {
    action: "import",
    title: "Import a spreadsheet",
    hint: "CSV or Excel file",
    tone: "ico-import",
    icon: (
      <>
        <path d="M12 3v10" />
        <path d="m8 9 4 4 4-4" />
        <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
      </>
    ),
  },
];

export default function AddMenu({ onSelect }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const toggleRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function closeOutside(event) {
      if (!rootRef.current || rootRef.current.contains(event.target)) return;
      setOpen(false);
    }
    function closeOnEscape(event) {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    }
    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  function focusItem(index) {
    const items = listRef.current?.querySelectorAll(".add-menu-item");
    if (!items || !items.length) return;
    items[(index + items.length) % items.length].focus();
  }

  function onListKey(event) {
    const items = Array.from(listRef.current?.querySelectorAll(".add-menu-item") || []);
    if (!items.length) return;
    const index = items.indexOf(document.activeElement);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusItem(index + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusItem(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusItem(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusItem(items.length - 1);
    }
  }

  function choose(action) {
    setOpen(false);
    toggleRef.current?.focus();
    onSelect(action);
  }

  return (
    <div className="add-menu" ref={rootRef}>
      <button
        className="btn btn-primary add-btn"
        type="button"
        ref={toggleRef}
        aria-label="Add to portfolio"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="add-menu-list"
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key !== "ArrowDown") return;
          event.preventDefault();
          setOpen(true);
          focusItem(0);
        }}
      >
        <svg className="od-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
        <span>Add</span>
        <svg className="od-icon add-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div
        className="add-menu-list"
        id="add-menu-list"
        role="menu"
        aria-label="Add to portfolio"
        ref={listRef}
        hidden={!open}
        onKeyDown={onListKey}
      >
        {ITEMS.map((item) => (
          <button
            key={item.action}
            className="add-menu-item"
            type="button"
            role="menuitem"
            onClick={() => choose(item.action)}
          >
            <span className={"add-menu-ico " + item.tone} aria-hidden="true">
              <svg className="od-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {item.icon}
              </svg>
            </span>
            <span className="add-menu-text">
              <strong>{item.title}</strong>
              <small>{item.hint}</small>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
