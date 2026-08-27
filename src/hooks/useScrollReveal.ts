import { useEffect } from "react";

export function useScrollReveal() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            // Optionally unobserve if you only want it to reveal once:
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px",
        threshold: 0.15,
      },
    );

    const elements = document.querySelectorAll(".reveal:not(.is-revealed)");
    elements.forEach((el) => observer.observe(el));

    // Support for dynamically added elements:
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            // Element node
            const el = node as HTMLElement;
            if (el.classList.contains("reveal") && !el.classList.contains("is-revealed")) {
              observer.observe(el);
            }
            // Check children
            const childReveals = el.querySelectorAll(".reveal:not(.is-revealed)");
            childReveals.forEach((child) => observer.observe(child));
          }
        });
      });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);
}
