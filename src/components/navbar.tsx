"use client";

import Link from "next/link";
import { ThemeSwitch } from "@/components/theme-switch";

export function Navbar() {
  return (
    <header className="border-b border-border bg-background">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold">
            Haul Connect BPO
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/dashboard"
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/tasks"
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              Tasks
            </Link>
            <Link
              href="/reports"
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              Reports
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ThemeSwitch />
          <Link
            href="/profile"
            className="text-sm text-foreground/70 hover:text-foreground transition-colors"
          >
            Profile
          </Link>
        </div>
      </div>
    </header>
  );
}
