import { Link } from "@tanstack/react-router";
import { Monogram } from "./Monogram";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-14 md:flex-row md:items-end md:justify-between">
        <div className="max-w-sm">
          <Monogram />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Digital wedding invitations designed, customized and hosted for couples who care about
            every detail.
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
          <Link to="/templates" className="text-muted-foreground hover:text-foreground">
            Templates
          </Link>
          <Link to="/features" className="text-muted-foreground hover:text-foreground">
            Features
          </Link>
        </nav>
      </div>
      <div className="mx-auto max-w-6xl px-6 pb-10">
        <p className="text-xs tracking-wide text-muted-foreground">
          © {new Date().getFullYear()} CandyInvito. Made for the people you love.
        </p>
      </div>
    </footer>
  );
}
