import React from "react";
import { Typography } from "../typography/Typography";
import { Reveal } from "../motion/Reveal";

export interface SectionProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
  theme?: "light" | "dark" | "transparent";
  spacing?: "none" | "sm" | "md" | "lg" | "xl" | "hero";
}

export const Section: React.FC<SectionProps> = ({
  id,
  children,
  className = "",
  theme = "light",
  spacing = "lg",
}) => {
  const themeClasses = {
    light: "bg-[#FAF9F6] text-gray-900", // A warm off-white, standard luxury feel
    dark: "bg-[#1C1C1E] text-white",
    transparent: "bg-transparent",
  };

  const spacingClasses = {
    none: "",
    sm: "py-8 md:py-16",
    md: "py-16 md:py-24",
    lg: "py-24 md:py-32",
    xl: "py-32 md:py-48",
    hero: "min-h-screen flex items-center",
  };

  return (
    <section
      id={id}
      className={`relative w-full overflow-hidden ${themeClasses[theme]} ${spacingClasses[spacing]} ${className}`}
    >
      {children}
    </section>
  );
};

export interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  alignment?: "left" | "center" | "right";
  theme?: "light" | "dark";
  className?: string;
  withDivider?: boolean;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  subtitle,
  alignment = "center",
  theme = "light",
  className = "",
  withDivider = true,
}) => {
  const alignClass = {
    left: "items-start text-left",
    center: "items-center text-center",
    right: "items-end text-right",
  }[alignment];

  return (
    <div className={`flex flex-col mb-16 md:mb-24 px-4 ${alignClass} ${className}`}>
      {subtitle && (
        <Typography variant="label" theme={theme} className="mb-4" delay={0}>
          {subtitle}
        </Typography>
      )}

      <Typography variant="h2" theme={theme} className="mb-6 max-w-4xl" delay={0.1}>
        {title}
      </Typography>

      {withDivider && (
        <Reveal delay={0.2} animation="scale">
          <div className={`h-px w-24 mt-2 ${theme === "dark" ? "bg-white/20" : "bg-black/10"}`} />
        </Reveal>
      )}
    </div>
  );
};
