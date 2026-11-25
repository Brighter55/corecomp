import { DownloadIcon, XIcon } from "./Common.jsx";
import Modal from "./Modal.jsx";

export default function DetailDrawer({ open, title, kicker, subtitle, columns, rows, onCsv, onClose }) {
  return (
    <Modal open={open} onClose={onClose} className="drawer" labelledBy="drawer-title">
      <div className="drawer-panel">
        <div className="drawer-head">
          <div>
            <p className="eyebrow" id="drawer-kicker">{kicker}</p>
            <h2 id="drawer-title">{title}</h2>
            <p className="drawer-sub">{subtitle}</p>
          </div>
          <button className="icon-btn drawer-close" type="button" onClick={onClose} aria-label="Close details">
            <XIcon />
          </button>
        </div>
        <div className="drawer-actions">
          <button className="btn btn-ghost" type="button" onClick={onCsv}>
            <DownloadIcon />
            Download CSV
          </button>
        </div>
        <div className="drawer-body">
          <table>
            <thead>
              <tr>
                {columns.map((column) => <th key={column.key}>{column.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  {columns.map((column) => (
                    <td key={column.key} className={column.strong ? "cell-strong" : undefined}>
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}
