import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { GitHubIcon } from "@/components/shared/icons";

const REPO_URL = "https://github.com/Fouad-Smaoui/TinyML-Driven-Embedded-AI-Vision";

const NAV_LINKS = [
  { href: "/#architecture", label: "Architecture" },
  { href: "/#stack", label: "Stack" },
  { href: "/#use-cases", label: "Use cases" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-medium">
          <span className="inline-block size-2 rounded-full bg-primary shadow-[0_0_12px_var(--primary)]" />
          <span className="font-mono text-sm tracking-tight">EdgeVision AI</span>
        </Link>

        <nav className="hidden items-center gap-6 font-mono text-xs tracking-wide text-muted-foreground uppercase md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Button render={<Link href={REPO_URL} target="_blank" rel="noopener noreferrer" />} nativeButton={false} variant="ghost" size="icon-sm" aria-label="View source on GitHub">
            <GitHubIcon className="size-4" />
          </Button>
          <ThemeToggle />
          <Button render={<Link href="/demo" />} nativeButton={false} size="sm" className="ml-1">
            Live demo
          </Button>
        </div>
      </div>
    </header>
  );
}
