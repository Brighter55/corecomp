import { useEffect, useState } from "react";

import { XIcon } from "./Common.jsx";

function onBackdropClose(event, onClose) {
  if (event.target === event.currentTarget) onClose();
}

export function BenchmarkDialog({ open, value, options, onApply, onClose }) {
  const [selected, setSelected] = useState(value);

  useEffect(() => {
    if (open) setSelected(value);
  }, [open, value]);

  if (!open) return null;

  return (
    <dialog open aria-labelledby="bench-title" onClick={(event) => onBackdropClose(event, onClose)}>
      <form
        className="modal"
        onSubmit={(event) => {
          event.preventDefault();
          onApply(selected);
        }}
      >
        <div className="modal-head">
          <div>
            <p className="eyebrow">Compare against</p>
            <h2 id="bench-title">Choose a benchmark</h2>
          </div>
          <button className="icon-btn" type="button" onClick={onClose} aria-label="Close benchmark picker">
            <XIcon />
          </button>
        </div>
        <div className="check-list">
          {options.map((option) => (
            <label className="check" key={option.symbol}>
              <input
                type="radio"
                name="bench"
                value={option.symbol}
                checked={selected === option.symbol}
                onChange={() => setSelected(option.symbol)}
              />
              <span>
                <strong>{option.label}</strong>
                <small>{option.description}</small>
              </span>
            </label>
          ))}
        </div>
        <p className="modal-note">
          The benchmark applies to every chart on this page. These are index funds,
          not the index level itself, because the data provider serves funds.
        </p>
        <div className="modal-foot">
          <button className="btn btn-ghost" type="button" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" type="submit">Apply</button>
        </div>
      </form>
    </dialog>
  );
}

export function CustomRangeDialog({ open, value, onApply, onClose }) {
  const [from, setFrom] = useState(value?.from || "");
  const [to, setTo] = useState(value?.to || "");

  useEffect(() => {
    if (open) {
      setFrom(value?.from || "");
      setTo(value?.to || "");
    }
  }, [open, value]);

  if (!open) return null;

  return (
    <dialog open aria-labelledby="custom-title" onClick={(event) => onBackdropClose(event, onClose)}>
      <form
        className="modal"
        onSubmit={(event) => {
          event.preventDefault();
          if (from && to) onApply({ from, to });
        }}
      >
        <div className="modal-head">
          <div>
            <p className="eyebrow">Date window</p>
            <h2 id="custom-title">Custom date range</h2>
          </div>
          <button className="icon-btn" type="button" onClick={onClose} aria-label="Close date range">
            <XIcon />
          </button>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <label style={{ display: "grid", gap: 6, flex: 1 }}>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>From</span>
            <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} required />
          </label>
          <label style={{ display: "grid", gap: 6, flex: 1 }}>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>To</span>
            <input type="date" value={to} onChange={(event) => setTo(event.target.value)} required />
          </label>
        </div>
        <p className="modal-note">
          The provider keeps five calendar years of prices. An earlier start is
          clamped to the oldest available session.
        </p>
        <div className="modal-foot">
          <button className="btn btn-ghost" type="button" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" type="submit">Apply</button>
        </div>
      </form>
    </dialog>
  );
}

export function InfoDialog({ open, title, body, onClose }) {
  if (!open) return null;
  return (
    <dialog open aria-labelledby="info-title" onClick={(event) => onBackdropClose(event, onClose)}>
      <div className="modal">
        <div className="modal-head">
          <div>
            <p className="eyebrow">About this chart</p>
            <h2 id="info-title">{title}</h2>
          </div>
          <button className="icon-btn" type="button" onClick={onClose} aria-label="Close help">
            <XIcon />
          </button>
        </div>
        <p style={{ marginTop: 16, fontSize: 13.5, lineHeight: 1.6, color: "var(--ink-soft)" }}>
          {body}
        </p>
        <div className="modal-foot">
          <button className="btn btn-primary" type="button" onClick={onClose}>Close</button>
        </div>
      </div>
    </dialog>
  );
}

const EMPTY = {
  symbol: "",
  trade_date: new Date().toISOString().slice(0, 10),
  kind: "BUY",
  amount: "",
  shares: "",
  price: "",
};

export function AddTransactionDialog({ open, onSave, onClose, error }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (open) setForm(EMPTY);
  }, [open]);

  if (!open) return null;

  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value });

  const submit = (event) => {
    event.preventDefault();
    const payload = {
      symbol: form.symbol.trim().toUpperCase(),
      trade_date: form.trade_date,
      kind: form.kind,
      amount: form.amount,
      shares: form.shares === "" ? null : form.shares,
      price: form.price === "" ? null : form.price,
    };
    onSave(payload);
  };

  return (
    <dialog open aria-labelledby="add-title" onClick={(event) => onBackdropClose(event, onClose)}>
      <form className="modal" onSubmit={submit}>
        <div className="modal-head">
          <div>
            <p className="eyebrow">Manual entry</p>
            <h2 id="add-title">Add a transaction</h2>
          </div>
          <button className="icon-btn" type="button" onClick={onClose} aria-label="Close transaction form">
            <XIcon />
          </button>
        </div>

        <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>Symbol</span>
            <input value={form.symbol} onChange={update("symbol")} placeholder="AAPL" required autoFocus />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>Date</span>
            <input type="date" value={form.trade_date} onChange={update("trade_date")} required />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>Type</span>
            <select value={form.kind} onChange={update("kind")}>
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
              <option value="DIVIDEND">Dividend</option>
            </select>
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>Amount in dollars</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={update("amount")}
              placeholder="12100.00"
              required
            />
          </label>
          <div style={{ display: "flex", gap: 12 }}>
            <label style={{ display: "grid", gap: 6, flex: 1 }}>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>Shares (optional)</span>
              <input type="number" min="0" step="any" value={form.shares} onChange={update("shares")} />
            </label>
            <label style={{ display: "grid", gap: 6, flex: 1 }}>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>Price (optional)</span>
              <input type="number" min="0" step="0.01" value={form.price} onChange={update("price")} />
            </label>
          </div>
        </div>

        <p className="modal-note">
          Dollars are what the calculations use. Shares and price are kept for the
          share-count display and a split hint, and are never the basis of a value.
        </p>
        {error ? (
          <p style={{ marginTop: 10, fontSize: 12.5, color: "var(--loss)" }}>{error}</p>
        ) : null}
        <div className="modal-foot">
          <button className="btn btn-ghost" type="button" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" type="submit">Save</button>
        </div>
      </form>
    </dialog>
  );
}
