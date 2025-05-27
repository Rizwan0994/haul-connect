import { Link } from "react-router-dom";
import { ThemeSwitch } from "@/components/theme-switch";

export function Navbar() {
  return (
    <header className="border-b border-border bg-background">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-semibold">
            Haul Connect BPO
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              to="/dashboard"
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/tasks"
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              Tasks
            </Link>
            <Link
              to="/reports"
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              Reports
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ThemeSwitch />
          <Link
            to="/profile"
            className="text-sm text-foreground/70 hover:text-foreground transition-colors"
          >
            Profile
          </Link>
        </div>
      </div>
    </header>
  );
}
