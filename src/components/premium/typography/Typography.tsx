import React from "react";
import { Reveal, RevealAnimation } from "../motion/Reveal";

export type TextVariant =
  "display" | "h1" | "h2" | "h3" | "body" | "caption" | "label" | "decorative";

export interface TypographyProps {
  children: React.ReactNode;
  variant?: TextVariant;
  as?: React.ElementType;
  className?: string;
  animation?: RevealAnimation | "none";
  delay?: number;
  align?: "left" | "center" | "right";
  theme?: "light" | "dark"; // for text colors
}

export const Typography: React.FC<TypographyProps> = ({
  children,
  variant = "body",
  as,
  className = "",
  animation = "fade-up",
  delay = 0,
  align,
  theme = "light",
}) => {
  // Determine default HTML element if not provided
  const Component =
    as ||
    ({
      display: "h1",
      h1: "h1",
      h2: "h2",
      h3: "h3",
      body: "p",
      caption: "p",
      label: "span",
      decorative: "span",
    }[variant] as React.ElementType);

  // Base styles mapping for luxury wedding feel
  const variantStyles = {
    display: "font-serif text-5xl sm:text-6xl md:text-8xl lg:text-9xl tracking-tight leading-[1.1]",
    h1: "font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-normal leading-[1.2]",
    h2: "font-serif text-3xl sm:text-4xl md:text-5xl tracking-normal leading-tight",
    h3: "font-serif text-2xl sm:text-3xl tracking-wide leading-snug",
    body: "font-sans text-base sm:text-lg md:text-xl font-light leading-relaxed tracking-wide",
    caption: "font-serif italic text-sm sm:text-base tracking-wider",
    label: "font-sans text-xs sm:text-sm font-bold uppercase tracking-[0.3em]",
    decorative: "font-serif italic text-2xl sm:text-4xl tracking-widest", // Assumes theme overrides this with a script font
  };

  const themeColors = {
    light: {
      display: "text-gray-900",
      h1: "text-gray-900",
      h2: "text-gray-800",
      h3: "text-gray-800",
      body: "text-gray-600",
      caption: "text-gray-500",
      label: "text-gray-400",
      decorative: "text-[#DCA963]",
    },
    dark: {
      display: "text-white",
      h1: "text-white",
      h2: "text-gray-100",
      h3: "text-gray-200",
      body: "text-gray-300",
      caption: "text-gray-400",
      label: "text-gray-400",
      decorative: "text-[#DCA963]", // Gold usually pops on dark too
    },
  };

  const alignClass = align ? `text-${align}` : "";
  const mergedClassName = `${variantStyles[variant]} ${themeColors[theme][variant]} ${alignClass} ${className}`;

  if (animation !== "none") {
    return (
      <Reveal animation={animation} delay={delay}>
        <Component className={mergedClassName}>{children}</Component>
      </Reveal>
    );
  }

  return <Component className={mergedClassName}>{children}</Component>;
};
