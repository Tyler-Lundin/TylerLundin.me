"use client";
import React, { useEffect } from "react";

const AnimatedBackground = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Inject keyframes manually in the browser
    const stylesString = `
      @keyframes rotateSlow {
        from { transform: rotate(45deg); }
        to { transform: rotate(405deg); }
      }
      @keyframes rotateMedium {
        from { transform: rotate(90deg); }
        to { transform: rotate(450deg); }
      }
      @keyframes rotateFast {
        from { transform: rotate(120deg); }
        to { transform: rotate(480deg); }
      }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.innerText = stylesString;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet); // Cleanup when component unmounts
    };
  }, []);

  return (
    <div className="overflow-hidden relative w-[200vw] h-[200vh]">
      <div className="z-50 absolute top-0 left-0 w-full h-full">{children}</div>
      <div
        className="invert group-hover:scale-125 dark:invert-0 -z-10 transition-all duration-200"
        style={{ ...styles.layer, ...styles.layer1 }}
      />
      <div className="-z-20 group-hover:scale-125 dark:invert-0 transition-all duration-200" style={{ ...styles.layer, ...styles.layer2 }} />
      <div className="z-30 group-hover:scale-125 dark:invert-0 transition-all duration-200" style={{ ...styles.layer, ...styles.layer3 }} />

    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  layer: {
    position: "absolute",
    top: "-50%", // Expand beyond the viewport for smooth cropping
    left: "-50%",
    width: "200%",
    height: "200%",
    backgroundRepeat: "repeat",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
  },
  layer1: {
    backgroundImage: "radial-gradient(black 1px, transparent 1px)",
    opacity: 0.25,
    animation: "rotateSlow 60s linear infinite reverse",
    backgroundSize: "90px 90px",
  },
  layer2: {
    backgroundImage: "radial-gradient(black 1px, transparent 1px)",
    opacity: 0.35,
    animation: "rotateMedium 50s linear infinite reverse",
    backgroundSize: "70px 70px",
  },
  layer3: {
    backgroundImage: "radial-gradient(black 2px, transparent 2px)",
    backgroundSize: "50px 50px",
    opacity: 0.15,
    animation: "rotateFast 40s linear infinite",
  },
};

export default AnimatedBackground;
