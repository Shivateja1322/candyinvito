import { Link } from "@tanstack/react-router";

export function Monogram({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <Link to="/" className="group inline-flex items-center gap-2" aria-label="CandyInvito home">
        <img
          src="/logo.png"
          alt="CandyInvito Logo"
          className="w-8 h-8 rounded-full object-cover transition-transform duration-500 group-hover:scale-110 shadow-xs"
        />
      </Link>
    );
  }

  return (
    <Link to="/" className="group inline-flex items-center gap-3.5" aria-label="CandyInvito home">
      <img
        src="/logo.png"
        alt="CandyInvito Logo"
        className="w-11 h-11 md:w-12 md:h-12 rounded-full object-cover shadow-sm transition-transform duration-500 group-hover:scale-105"
      />
      <div className="flex flex-col">
        <span className="font-serif text-2xl md:text-3xl font-medium tracking-wide text-[#201814] leading-tight">
          CandyInvito
        </span>
        <span className="text-[9px] uppercase tracking-[0.22em] text-[#201814]/60 font-semibold">
          Made with Love
        </span>
      </div>
    </Link>
  );
}
