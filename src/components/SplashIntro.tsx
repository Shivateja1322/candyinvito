import React, { useState, useEffect } from "react";
import { Monogram } from "./site/Monogram";

export const SplashIntro = ({ children }: { children: React.ReactNode }) => {
  const [stage, setStage] = useState<"hidden" | "entering" | "holding" | "exiting" | "done">(
    "hidden",
  );

  useEffect(() => {
    // Only show once per session
    if (sessionStorage.getItem("candyinvito_intro_played_v3")) {
      setStage("done");
      return;
    }

    // Start animation sequence
    setStage("entering");

    const holdTimer = setTimeout(() => {
      setStage("holding");
    }, 200);

    const exitTimer = setTimeout(() => {
      setStage("exiting");
      sessionStorage.setItem("candyinvito_intro_played_v3", "true");
    }, 3200); // Hold longer to read text clearly

    const doneTimer = setTimeout(() => {
      setStage("done");
    }, 4200); // Wait for exit animation

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  return (
    <>
      {stage !== "done" && (
        <div
          className={`fixed inset-0 z-[9999] bg-[#0A0A0A] flex flex-col items-center justify-center transition-all duration-1000 ease-[cubic-bezier(0.7,0,0.1,1)] origin-center ${
            stage === "exiting"
              ? "opacity-0 scale-125 pointer-events-none blur-sm"
              : "opacity-100 scale-100"
          }`}
        >
          <div
            className={`flex flex-col items-center transition-all duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
              stage === "entering" || stage === "hidden"
                ? "opacity-0 translate-y-4 blur-sm scale-95"
                : stage === "holding"
                  ? "opacity-100 translate-y-0 blur-0 scale-100"
                  : "opacity-0 -translate-y-4 blur-sm scale-105"
            } text-white`}
          >
            <div className="pointer-events-none scale-150 mb-8 transition-transform duration-[2000ms] ease-out">
              <Monogram />
            </div>
            <div className="h-[1px] bg-gradient-to-r from-transparent via-[#DCA963] to-transparent animate-[expand_1.5s_ease-out_forwards_0.2s]" style={{ width: '0%', opacity: 0 }} />
          </div>

          <style>{`
            @keyframes expand {
              0% { width: 0%; opacity: 0; }
              50% { opacity: 1; }
              100% { width: 150%; opacity: 0.3; }
            }
          `}</style>
        </div>
      )}

      <div
        className={`min-h-screen transition-all duration-1200 delay-100 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          stage === "entering" || stage === "holding" || stage === "hidden"
            ? "opacity-0 scale-[0.98] blur-sm pointer-events-none"
            : "opacity-100 scale-100 blur-0"
        }`}
      >
        {children}
      </div>
    </>
  );
};
