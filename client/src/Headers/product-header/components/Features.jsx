import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from "lucide-react";
import { Button } from "../../../components/ui/button";

export default function Features() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen((current) => !current);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleItemClick = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <div className="relative flex flex-1 justify-center">
      <Button
        type="button"
        variant="ghost"
        className="hidden text-base capitalize text-[var(--text-muted)] hover:bg-transparent hover:text-[var(--text-main)] md:inline-flex"
        onClick={handleToggle}
      >
        features
        <ChevronDown className="ml-1 h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="text-[var(--text-muted)] hover:bg-transparent hover:text-[var(--text-main)] md:hidden"
        onClick={handleToggle}
      >
        <ChevronDown className="h-5 w-5" />
      </Button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="close features menu"
            className="fixed inset-0 z-20"
            onClick={handleClose}
          />
          <div className="absolute top-full z-30 mt-2 min-w-40 rounded-2xl border border-[var(--line-muted)] bg-[var(--surface-glass)] p-1 backdrop-blur-xl">
            <button
              type="button"
              className="block w-full rounded-xl px-4 py-2 text-left capitalize text-[var(--text-main)] transition hover:bg-[var(--surface-muted)]"
              onClick={() => handleItemClick("/overview")}
            >
              overview
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
