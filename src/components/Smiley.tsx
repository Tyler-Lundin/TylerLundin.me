"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import SmallLoadingSpinner from "./SmallLoadingSpinner";

const TRANSITION = 'transition-colors duration-500 ease-in-out';

const Smiley = () => {
  const [count, setCount] = useState(0);
  const [blink, setBlink] = useState(false);
  const smileyRef = useRef<SVGSVGElement>(null);
  const [eyeRadius, setEyeRadius] = useState(6);


  const handleClick = () => {
    countThenAddDebounce(1);
    setCount((c) => c + 1);

  }

  const [eyePos, setEyePos] = useState({ x: 0, y: 0 });
  const [mouthPos, setMouthPos] = useState({ x: 0, y: 0 });
  const [mouthControl, setMouthControl] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      // get the bounding box of the smiley
      if (!smileyRef.current) return;
      const smileyRect = smileyRef.current.getBoundingClientRect();

      // get the position of the mouse cursor
      const mouseX = event.clientX;
      const mouseY = event.clientY;

      // calculate the new eye position
      let newEyeX = ((mouseX - smileyRect.left) / smileyRect.width) * 30; // 30 is the maximum movement in X direction
      let newEyeY = ((mouseY - smileyRect.top) / smileyRect.height) * 20; // 20 is the maximum movement in Y direction

      // clamp the new eye position to the maximum allowed
      newEyeX = Math.max(Math.min(newEyeX, 25), -25);
      newEyeY = Math.max(Math.min(newEyeY, 3), -15);

      const newMouthX = ((mouseX - smileyRect.left) / smileyRect.width) * 40 - 10; // 40 is the maximum movement in X direction, -10 for centering
      const newMouthY = ((mouseY - smileyRect.top) / smileyRect.height) * 20 + 40; // 20 is the maximum movement in Y direction, +40 for vertical offset

      const newMouthXClamped = Math.max(Math.min(newMouthX, 37), -40);
      const newMouthYClamped = Math.max(Math.min(newMouthY, 20), -20);

      let newControlX = ((mouseX - smileyRect.left) / smileyRect.width) * 20 + 30; // 20 is the maximum movement in X direction, +30 for centering
      let newControlY = ((mouseY - smileyRect.top) / smileyRect.height) * 20 + 60; // 20 is the maximum movement in Y direction, +60 for vertical offset

      // set these to state
      setMouthControl({ x: newControlX, y: newControlY });


      setEyePos({ x: newEyeX, y: newEyeY });
      setMouthPos({ x: newMouthXClamped, y: newMouthYClamped });
    }

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);


  useEffect(() => {
    getSmileyCount().then(setCount);
  }, []);

  useEffect(() => {
    const blink = () => {
      setEyeRadius(0);
      const blinkDuration = Math.random() * 300 + 100; // between 100-400ms
      setTimeout(() => setEyeRadius(5), blinkDuration);
    }

    const startBlinking = () => {
      const timeToNextBlink = Math.random() * 8000 + 2000; // between 2-10 seconds
      setTimeout(() => {
        blink();
        startBlinking();
      }, timeToNextBlink);
    }

    startBlinking();
  }, []);

  return (
    <>
      {count > 0 ? <div className={'absolute -top-1/4 h-fit left-1/2 -translate-x-1/2 p-2 text-black dark:text-white text-2xl font-bold'}>{count}</div>
        : (
          <div className={'absolute -top-1/2 h-fit left-1/2 -translate-x-1/2'}>
            <SmallLoadingSpinner />
          </div>
        )}
      <svg
        onClick={handleClick}
        ref={smileyRef}
        id="smiley"
        width="100"
        height="100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id="faceClip">
            <circle cx="50" cy="50" r="40" />
          </clipPath>
        </defs>
        <circle cx="50" cy="50" r="40" stroke="black" strokeWidth="3" fill="yellow" />
        <circle clipPath="url(#faceClip)" id="leftEye" cx={37 + eyePos.x} cy={44 + eyePos.y} r={eyeRadius} stroke="black" strokeWidth="2" fill="black" />
        <circle clipPath="url(#faceClip)" id="rightEye" cx={63 + eyePos.x} cy={44 + eyePos.y} r={eyeRadius} stroke="black" strokeWidth="2" fill="black" />
        <path
          id="mouth"
          d={`M${40 + mouthPos.x},60 Q50,${85 + mouthPos.y} ${70 + mouthPos.x},60`}
          stroke="black"
          strokeWidth="2"
          fill="black"
          clipPath="url(#faceClip)"
        />
      </svg>
    </>
  )
}

export default Smiley;



const addCount = async (addToCount: number) => {
  console.log('adding', addToCount);
  const res = await fetch('/api/smiley', { method: 'POST', body: JSON.stringify({ addToCount }) });
  const { count } = await res.json();
  return count;
}

const getSmileyCount = async () => {
  const res = await fetch('/api/smiley', { method: 'GET' });
  const { count } = await res.json();
  return count;
}

const countThenAddDebounce = (() => {
  let timeout: NodeJS.Timeout;
  let accumulatedCount = 0;
  return async (addToCount: number) => {
    accumulatedCount += addToCount;
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
      accumulatedCount = await addCount(accumulatedCount);
      accumulatedCount = 0;
    }, 1000);
  }
})();
