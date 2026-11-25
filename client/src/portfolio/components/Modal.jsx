import { useEffect, useRef } from "react";

/**
 * A native modal dialog.
 *
 * The `open` attribute is not enough: a dialog rendered that way stays in the
 * normal flow, which is why the cards did not dim and the panel appeared under
 * them. `showModal()` promotes it to the top layer, centers it and adds the
 * ::backdrop the design's CSS expects.
 */
export default function Modal({ open, onClose, className, labelledBy, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    } else if (!open && dialog.open) {
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
    }
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return undefined;
    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      className={className}
      aria-labelledby={labelledBy}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {children}
    </dialog>
  );
}
