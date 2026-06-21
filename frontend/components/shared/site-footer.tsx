import Link from "next/link";

const REPO_URL = "https://github.com/Fouad-Smaoui/TinyML-Driven-Embedded-AI-Vision";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground sm:flex-row">
        <p>MIT licensed. Built with Next.js, FastAPI, MediaPipe, and a real ESP32.</p>
        <Link href={REPO_URL} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
          View source on GitHub
        </Link>
      </div>
    </footer>
  );
}
