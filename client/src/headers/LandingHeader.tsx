import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Moon, Sun, X } from "lucide-react";
import Brand from "../shared/Brand.tsx";
import { Button } from "../components/ui/button";
import { useTheme } from "../theme/ThemeContext.jsx";

function LandingHeader() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleNavigate(path: string) {
    navigate(path);
    setMobileOpen(false);
  }

  return (
    <header
      className="mb-12 border-b border-[var(--line-muted)] bg-[var(--bg-main)] px-4 backdrop-blur-sm"
    >
      <nav className="mx-auto flex h-20 max-w-6xl items-center gap-4">
        <Brand variant="landing" />

        <div className="hidden flex-1 items-center justify-center gap-2 md:flex">
          <a className="rounded-md px-3 py-2 text-[var(--text-muted)] hover:text-[var(--text-main)]" href="/#features">
            Features
          </a>
          <a className="rounded-md px-3 py-2 text-[var(--text-muted)] hover:text-[var(--text-main)]" href="/#pricing">
            Pricing
          </a>
          <a className="rounded-md px-3 py-2 text-[var(--text-muted)] hover:text-[var(--text-main)]" href="/upcoming">
            Upcoming
          </a>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" onClick={toggleTheme} aria-label="Toggle theme" size="icon">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" onClick={() => handleNavigate("/login")}>
            Sign in
          </Button>
          <Button onClick={() => handleNavigate("/login")}>Sign Up</Button>
        </div>

        <div className="ml-auto flex items-center gap-2 md:hidden">
          <Button variant="ghost" onClick={toggleTheme} aria-label="Toggle theme" size="icon">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setMobileOpen((current) => !current);
            }}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {mobileOpen ? (
        <div className="space-y-2 border-t border-[var(--line-muted)] py-3 md:hidden">
          <a
            className="block rounded-md px-3 py-2 text-[var(--text-main)] hover:bg-[var(--surface-soft)]"
            href="/#features"
            onClick={() => {
              setMobileOpen(false);
            }}
          >
            Features
          </a>
          <a
            className="block rounded-md px-3 py-2 text-[var(--text-main)] hover:bg-[var(--surface-soft)]"
            href="/#pricing"
            onClick={() => {
              setMobileOpen(false);
            }}
          >
            Pricing
          </a>
          <a
            className="block rounded-md px-3 py-2 text-[var(--text-main)] hover:bg-[var(--surface-soft)]"
            href="/upcoming"
            onClick={() => {
              setMobileOpen(false);
            }}
          >
            Upcoming
          </a>
          <Button className="w-full" variant="ghost" onClick={() => handleNavigate("/login")}>
            Sign in
          </Button>
          <Button className="w-full" onClick={() => handleNavigate("/login")}>
            Sign Up
          </Button>
        </div>
      ) : null}
    </header>
  );
}

export default LandingHeader;
