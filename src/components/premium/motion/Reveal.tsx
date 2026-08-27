import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export type RevealAnimation = "fade" | "fade-up" | "fade-down" | "scale" | "blur";

interface RevealProps {
  children: React.ReactNode;
  animation?: RevealAnimation;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

const variants = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  "fade-up": {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  },
  "fade-down": {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  },
  blur: {
    hidden: { opacity: 0, filter: "blur(10px)" },
    visible: { opacity: 1, filter: "blur(0px)" },
  },
};

export const Reveal: React.FC<RevealProps> = ({
  children,
  animation = "fade-up",
  delay = 0,
  duration = 0.8,
  className = "",
  once = true,
}) => {
  const prefersReducedMotion = useReducedMotion();

  // If user prefers reduced motion, always just use a simple fade
  const activeAnimation = prefersReducedMotion ? "fade" : animation;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-10% 0px" }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      variants={variants[activeAnimation]}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface StaggerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
  once?: boolean;
}

export const StaggerContainer: React.FC<StaggerProps> = ({
  children,
  staggerDelay = 0.15,
  className = "",
  once = true,
}) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-10% 0px" }}
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem: React.FC<Omit<RevealProps, "delay">> = ({
  children,
  animation = "fade-up",
  duration = 0.8,
  className = "",
}) => {
  const prefersReducedMotion = useReducedMotion();
  const activeAnimation = prefersReducedMotion ? "fade" : animation;

  return (
    <motion.div
      variants={variants[activeAnimation]}
      transition={{ duration, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
