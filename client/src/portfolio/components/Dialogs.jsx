import { useEffect, useState } from "react";

import { formatUnits } from "../analysisView.js";
import { importActivity } from "../portfolioApi.js";
import { XIcon } from "./Common.jsx";
import Modal from "./Modal.jsx";

export function BenchmarkDialog({ open, value, options, onApply, onClose }) {
  const [selected, setSelected] = useState(value);

  useEffect(() => {
    if (open) setSelected(value);
  }, [open, value]);

  return (
    <Modal open={open} onClose={onClose} labelledBy="bench-title">
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
    </Modal>
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

  return (
    <Modal open={open} onClose={onClose} labelledBy="custom-title">
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
    </Modal>
  );
}

export function InfoDialog({ open, title, body, onClose }) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="info-title">
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
    </Modal>
  );
}

const TODAY = () => new Date().toISOString().slice(0, 10);

const EMPTY = {
  symbol: "",
  trade_date: TODAY(),
  kind: "BUY",
  amount: "",
  shares: "",
  price: "",
};

const fieldStyle = { display: "grid", gap: 6 };
const labelStyle = { fontSize: 12, color: "var(--muted)" };

export function AddTransactionDialog({ open, onSave, onClose, error }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    if (open) setForm({ ...EMPTY, trade_date: TODAY() });
  }, [open]);

  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value });
  const isDividend = form.kind === "DIVIDEND";
  const total =
    form.shares !== "" && form.price !== ""
      ? (Number(form.shares) * Number(form.price)).toFixed(2)
      : "";

  const submit = (event) => {
    event.preventDefault();
    onSave({
      symbol: form.symbol.trim().toUpperCase(),
      trade_date: form.trade_date,
      kind: form.kind,
      amount: isDividend ? form.amount : total,
      shares: isDividend ? null : form.shares,
      price: isDividend ? null : form.price,
    });
  };

  return (
    <Modal open={open} onClose={onClose} labelledBy="add-title">
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
          <label style={fieldStyle}>
            <span style={labelStyle}>Symbol</span>
            <input value={form.symbol} onChange={update("symbol")} placeholder="AAPL" required autoFocus />
          </label>
          <label style={fieldStyle}>
            <span style={labelStyle}>Date</span>
            <input type="date" value={form.trade_date} onChange={update("trade_date")} required />
          </label>
          <label style={fieldStyle}>
            <span style={labelStyle}>Type</span>
            <select value={form.kind} onChange={update("kind")}>
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
              <option value="DIVIDEND">Dividend</option>
            </select>
          </label>

          {isDividend ? (
            <label style={fieldStyle}>
              <span style={labelStyle}>Amount in dollars</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={update("amount")}
                placeholder="120.00"
                required
              />
            </label>
          ) : (
            <>
              <div style={{ display: "flex", gap: 12 }}>
                <label style={{ ...fieldStyle, flex: 1 }}>
                  <span style={labelStyle}>Shares</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={form.shares}
                    onChange={update("shares")}
                    placeholder="10"
                    required
                  />
                </label>
                <label style={{ ...fieldStyle, flex: 1 }}>
                  <span style={labelStyle}>Price</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={update("price")}
                    placeholder="121.00"
                    required
                  />
                </label>
              </div>
              <label style={fieldStyle}>
                <span style={labelStyle}>Total in dollars (derived from shares × price)</span>
                <input value={total} readOnly aria-readonly="true" placeholder="0.00" />
              </label>
            </>
          )}
        </div>

        <p className="modal-note">
          A buy or sell stores the exact share count and price, and the total is
          derived from them. A dividend records the cash amount directly.
        </p>
        {error ? (
          <p style={{ marginTop: 10, fontSize: 12.5, color: "var(--loss)" }}>{error}</p>
        ) : null}
        <div className="modal-foot">
          <button className="btn btn-ghost" type="button" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" type="submit">Save</button>
        </div>
      </form>
    </Modal>
  );
}

const EMPTY_SPLIT = {
  symbol: "",
  effective_date: TODAY(),
  numerator: "",
  denominator: "",
};

export function SplitDialog({ open, onSave, onClose, error }) {
  const [form, setForm] = useState(EMPTY_SPLIT);

  useEffect(() => {
    if (open) setForm({ ...EMPTY_SPLIT, effective_date: TODAY() });
  }, [open]);

  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value });

  const submit = (event) => {
    event.preventDefault();
    onSave({
      symbol: form.symbol.trim().toUpperCase(),
      effective_date: form.effective_date,
      numerator: Number(form.numerator),
      denominator: Number(form.denominator),
    });
  };

  return (
    <Modal open={open} onClose={onClose} labelledBy="split-title">
      <form className="modal" onSubmit={submit}>
        <div className="modal-head">
          <div>
            <p className="eyebrow">Corporate action</p>
            <h2 id="split-title">Add a split</h2>
          </div>
          <button className="icon-btn" type="button" onClick={onClose} aria-label="Close split form">
            <XIcon />
          </button>
        </div>

        <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
          <label style={fieldStyle}>
            <span style={labelStyle}>Symbol</span>
            <input value={form.symbol} onChange={update("symbol")} placeholder="AAPL" required autoFocus />
          </label>
          <label style={fieldStyle}>
            <span style={labelStyle}>Effective date</span>
            <input type="date" value={form.effective_date} onChange={update("effective_date")} required />
          </label>
          <div style={{ display: "flex", gap: 12 }}>
            <label style={{ ...fieldStyle, flex: 1 }}>
              <span style={labelStyle}>New shares</span>
              <input
                type="number"
                min="1"
                step="1"
                value={form.numerator}
                onChange={update("numerator")}
                placeholder="10"
                required
              />
            </label>
            <label style={{ ...fieldStyle, flex: 1 }}>
              <span style={labelStyle}>Old shares</span>
              <input
                type="number"
                min="1"
                step="1"
                value={form.denominator}
                onChange={update("denominator")}
                placeholder="1"
                required
              />
            </label>
          </div>
        </div>

        <p className="modal-note">
          A 10-for-1 split is 10 new shares for 1 old share. The ratio applies to
          every lot you held on the effective date.
        </p>
        {error ? (
          <p style={{ marginTop: 10, fontSize: 12.5, color: "var(--loss)" }}>{error}</p>
        ) : null}
        <div className="modal-foot">
          <button className="btn btn-ghost" type="button" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" type="submit">Save split</button>
        </div>
      </form>
    </Modal>
  );
}

export function ImportDialog({ open, onClose, onImported }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setFile(null);
      setPreview(null);
      setError("");
      setBusy(false);
    }
  }, [open]);

  async function choose(event) {
    const chosen = event.target.files?.[0];
    if (!chosen) return;
    setFile(chosen);
    setPreview(null);
    setError("");
    setBusy(true);
    try {
      setPreview(await importActivity(chosen, { dryRun: true }));
    } catch (err) {
      setError(err.message || "Could not read that file.");
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      await importActivity(file, { dryRun: false });
      onImported();
    } catch (err) {
      setError(err.message || "Could not import that file.");
    } finally {
      setBusy(false);
    }
  }

  const counts = preview
    ? Object.entries(preview.counts || {}).filter(([, count]) => count > 0)
    : [];
  const unresolved = preview?.unresolved_splits || [];
  const positions = Object.entries(preview?.positions || {});

  return (
    <Modal open={open} onClose={onClose} labelledBy="import-title">
      <div className="modal">
        <div className="modal-head">
          <div>
            <p className="eyebrow">Broker activity</p>
            <h2 id="import-title">Import activity</h2>
          </div>
          <button className="icon-btn" type="button" onClick={onClose} aria-label="Close import">
            <XIcon />
          </button>
        </div>

        <label style={{ ...fieldStyle, marginTop: 16 }}>
          <span style={labelStyle}>Activity CSV</span>
          <input type="file" accept=".csv" onChange={choose} />
        </label>

        {busy && !preview ? (
          <p className="modal-note">Reading the file…</p>
        ) : null}

        {preview ? (
          <div style={{ marginTop: 14, fontSize: 12.5, lineHeight: 1.65, color: "var(--ink-soft)" }}>
            <p>{preview.rows.length} ledger rows.</p>
            {counts.length ? (
              <p>{counts.map(([kind, count]) => `${kind} ${count}`).join(" · ")}</p>
            ) : null}
            <p>{preview.skipped} skipped.</p>
            {unresolved.length ? (
              <>
                <p style={{ marginTop: 8, color: "var(--loss)" }}>Unresolved splits</p>
                <ul style={{ margin: "2px 0 0", paddingLeft: 18 }}>
                  {unresolved.map((split) => (
                    <li key={`${split.symbol}-${split.trade_date}`}>
                      {split.symbol} on {split.trade_date}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
            {positions.length ? (
              <>
                <p style={{ marginTop: 8 }}>Resulting positions</p>
                <ul style={{ margin: "2px 0 0", paddingLeft: 18 }}>
                  {positions.map(([symbol, units]) => (
                    <li key={symbol}>
                      {symbol} {formatUnits(units)} units
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        ) : null}

        {error ? (
          <p style={{ marginTop: 10, fontSize: 12.5, color: "var(--loss)" }}>{error}</p>
        ) : null}
        <div className="modal-foot">
          <button className="btn btn-ghost" type="button" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            type="button"
            onClick={confirm}
            disabled={!file || !preview || busy}
          >
            {busy && preview ? "Importing…" : "Confirm import"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
