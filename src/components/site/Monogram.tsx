import { Link } from "@tanstack/react-router";

export function Monogram({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group inline-flex items-center gap-2.5" aria-label="CandyInvito home">
      <span
        aria-hidden
        className="text-gold transition-transform duration-500 group-hover:rotate-90"
        style={{ transitionTimingFunction: "var(--ease-silk)" }}
      >
        ✦
      </span>
      <span className="font-display text-lg tracking-[0.32em] uppercase">
        {compact ? "CI" : "CandyInvito"}
      </span>
    </Link>
  );
}
