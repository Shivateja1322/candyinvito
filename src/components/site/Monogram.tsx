import { Link } from "@tanstack/react-router";

export function Monogram({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <Link to="/" className="group inline-flex items-center gap-2" aria-label="CandyInvito home">
        <svg
          width="24"
          height="24"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-foreground transition-transform duration-700 group-hover:scale-110"
        >
          <path
            d="M50 15C50 15 65 35 85 35C65 35 50 55 50 55C50 55 35 35 15 35C35 35 50 15 50 15Z"
            fill="currentColor"
          />
          <path d="M50 55V85" stroke="currentColor" strokeWidth="4" />
        </svg>
      </Link>
    );
  }

  return (
    <Link to="/" className="group inline-flex flex-col items-center" aria-label="CandyInvito home">
      <div className="relative flex items-center justify-center text-foreground transition-transform duration-700 group-hover:scale-105">
        <svg
          width="240"
          height="80"
          viewBox="0 0 350 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          {/* Botanical flourish over 'I' */}
          <path
            d="M170 45 C 180 30, 200 20, 220 40 C 230 50, 210 60, 190 45"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M185 30 C 175 20, 160 10, 170 45"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M200 40 C 210 30, 230 20, 215 50"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Main "Candy Invito" text */}
          <text
            x="20"
            y="80"
            fontFamily="Cormorant Garamond, serif"
            fontSize="64"
            fontWeight="300"
            fill="currentColor"
            letterSpacing="2"
          >
            Candy
          </text>
          <text
            x="200"
            y="80"
            fontFamily="Cormorant Garamond, serif"
            fontSize="64"
            fontWeight="300"
            fill="currentColor"
            letterSpacing="2"
          >
            Invito
          </text>

          {/* Subtext "invitation" */}
          <text
            x="175"
            y="110"
            fontFamily="Cormorant Garamond, serif"
            fontSize="14"
            fontWeight="400"
            fill="currentColor"
            letterSpacing="16"
            textAnchor="middle"
          >
            invitation
          </text>
        </svg>
      </div>
    </Link>
  );
}
