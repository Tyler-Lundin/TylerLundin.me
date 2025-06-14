"use client";
import React, { useEffect } from "react";

const AnimatedBackground = ({ children }: { children?: React.ReactNode }) => {
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
    <div className="overflow-hidden relative w-full -z-10 h-full invert dark:invert-0">
      <div className="z-50">{children}</div>
      <div className="z-30 pointer-events-none" style={{ ...styles.layer, ...styles.layer1 }} />
      <div className="z-30 pointer-events-none" style={{ ...styles.layer, ...styles.layer2 }} />
      <div className="z-30 pointer-events-none" style={{ ...styles.layer, ...styles.layer3 }} />

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
    backgroundImage: "radial-gradient(white 1px, transparent 2px)",
    opacity: 1,
    animation: "rotateSlow 60s linear infinite ",
    backgroundSize: "100px 100px",
  },
  layer2: {
    backgroundImage: "radial-gradient(white 2px, transparent 2px)",
    opacity: 1,
    animation: "rotateMedium 150s linear infinite ",
    backgroundSize: "120px 120px",
  },
  layer3: {
    backgroundImage: "radial-gradient(white 1px, transparent 2px)",
    backgroundSize: "160px 160px",
    opacity: 1,
    animation: "rotateFast 120s linear infinite",
  },
};

export default AnimatedBackground;
