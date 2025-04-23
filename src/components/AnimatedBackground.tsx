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
      <div className="z-50 relative">{children}</div>
      <div className="z-30" style={{ ...styles.layer, ...styles.layer1 }} />
      <div className="z-30" style={{ ...styles.layer, ...styles.layer2 }} />
      <div className="z-30" style={{ ...styles.layer, ...styles.layer3 }} />

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
    backgroundImage: "radial-gradient(pink 1px, transparent 2px)",
    opacity: 0.5,
    animation: "rotateSlow 560s linear infinite ",
    backgroundSize: "100px 100px",
  },
  layer2: {
    backgroundImage: "radial-gradient(white 1px, transparent 2px)",
    opacity: 0.5,
    animation: "rotateMedium 550s linear infinite ",
    backgroundSize: "100px 100px",
  },
  layer3: {
    backgroundImage: "radial-gradient(yellow 1px, transparent 2px)",
    backgroundSize: "100px 100px",
    opacity: 0.5,
    animation: "rotateFast 540s linear infinite",
  },
};

export default AnimatedBackground;
