
"use client";
import { useState, useEffect, useRef } from "react";



const DEFAULT_MOUTH = "M33.47,12.79A16.735,16.735,0,0,1,0,12.79C0,8.215,33.47,8.122,33.47,12.79Z"
const DEFAULT_LEFT_EYE = "M16.735,9.324A8.368,8.368,0,1,1,0,9.324C0,4.7,16.735,4.7,16.735,9.324Z"
const DEFAULT_RIGHT_EYE = "M16.735,9.324A8.368,8.368,0,1,1,0,9.324C0,4.7,16.735,4.7,16.735,9.324Z"
const TRANSITION = 'transition-colors duration-500 ease-in-out';

const getRandomNumber = () => {
  const min = 0
  const max = 255
  return Math.floor(Math.random() * (max - min + 1) + min)
}


const Smiley = () => {

  const [mouth, setMouth] = useState({ x: 17.141, y: 25.951 })
  const [leftEye, setLeftEye] = useState({ x: 34.832, y: 15.275 })
  const [rightEye, setRightEye] = useState({ x: 32.919, y: 32.01 })
  const [bg, setBg] = useState({
    r: 125,
    g: 125,
    b: 125,
  })
  const [fill, setFill] = useState('black')
  const smileyRef = useRef<SVGSVGElement>(null)


  const handleClick = () => {
    const r = getRandomNumber()
    const g = getRandomNumber()
    const b = getRandomNumber()

    if (r + g + b < 300) {
      setFill('white')
    } else {
      setFill('black')
    }
    setBg({ r, g, b })
  }

  const currentFill = `rgb(${bg.r}, ${bg.g}, ${bg.b})`

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const offsets = {
        x: e.clientX - window.innerWidth / 2,
        y: e.clientY - window.innerHeight / 2,
      }
      setMouth({ x: 17.141 + offsets.x / 100, y: 25.951 + offsets.y / 100 })
      setLeftEye({ x: 34.832 + offsets.x / 100, y: 15.275 + offsets.y / 100 })
      setRightEye({ x: 32.919 + offsets.x / 100, y: 32.01 + offsets.y / 100 })
    }
    const handleTouchMove = (e: TouchEvent) => {
      const offsets = {
        x: e.touches[0].clientX - window.innerWidth / 2,
        y: e.touches[0].clientY - window.innerHeight / 2,
      }
      setMouth({ x: 17.141 + offsets.x / 100, y: 25.951 + offsets.y / 100 })
      setLeftEye({ x: 34.832 + offsets.x / 100, y: 15.275 + offsets.y / 100 })
      setRightEye({ x: 32.919 + offsets.x / 100, y: 32.01 + offsets.y / 100 })
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleTouchMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <>
      <svg className={'hover:scale-110 transition-all duration-500 shadow-black shadow-md rounded-full'} onTouchStart={handleClick} onClick={handleClick} ref={smileyRef} id='smiley' xmlns="http://www.w3.org/2000/svg" width={67.751} height="67.751" viewBox="0 0 67.751 67.751">
        <path className={TRANSITION} id="Path_14" data-name="Face" d="M33.876,0A33.876,33.876,0,1,1,0,33.876,33.876,33.876,0,0,1,33.876,0Z" fill={currentFill} />
        <path className={TRANSITION} id="Path_15" data-name="Mouth" d={DEFAULT_MOUTH} transform={`translate(${mouth.x} ${mouth.y})`} fill={fill} />
        <path className={TRANSITION} id="Path_16" data-name="Left Eye" d={DEFAULT_LEFT_EYE} transform={`translate(${leftEye.x} ${leftEye.y}) rotate(90)`} fill={fill} />
        <path className={TRANSITION} id="Path_17" data-name="Right Eye" d={DEFAULT_RIGHT_EYE} transform={`translate(${rightEye.x} ${rightEye.y || 32.01}) rotate(-90)`} fill={fill} />
      </svg>
    </>
  )
}

export default Smiley;
