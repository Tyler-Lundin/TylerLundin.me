'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import '../styles/animations.css';
import AnimatedBackground from './AnimatedBackground';

interface HeroCardProps {
  src: string;
  alt: string;
  className?: string;
}

export function HeroCard({ src, alt, className = '' }: HeroCardProps) {
  const [{ rotateX, rotateY, translateZ }, setRotate] = useState({ rotateX: 0, rotateY: 0, translateZ: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number>(Date.now());

  // Automatic rotation effect
  useEffect(() => {
    const animate = () => {
      if (isHovered) return;

      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      const period = 10000; // 10 seconds for a full rotation
      
      // Calculate smooth circular motion
      const angle = (elapsed % period) / period * Math.PI * 2;
      const newRotateX = Math.sin(angle) * 5; // 5 degrees max rotation
      const newRotateY = Math.cos(angle) * 5; // 5 degrees max rotation
      
      setRotate(prev => ({
        rotateX: isHovered ? prev.rotateX : newRotateX,
        rotateY: isHovered ? prev.rotateY : newRotateY,
        translateZ: prev.translateZ
      }));

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isHovered]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate distance from center as a percentage (-1 to 1)
      const percentX = (e.clientX - centerX) / (rect.width / 2);
      const percentY = (e.clientY - centerY) / (rect.height / 2);

      // Calculate rotation (max 10 degrees)
      const rotateX = -percentY * 10;
      const rotateY = percentX * 10;
      const translateZ = 50; // Gives a "lift" effect

      setRotate({ rotateX, rotateY, translateZ });
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      // Don't reset rotation immediately - let the automatic animation take over smoothly
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div 
      ref={cardRef}
      className="relative group w-full h-full perspective-1000 cursor-pointer"
      style={{
        perspective: '1000px'
      }}
    >
      <AnimatedBackground>
        <div
          className={`relative w-full h-full transition-transform duration-200 ease-out transform-gpu ${className}`}
          style={{
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px)`,
            transformStyle: 'preserve-3d'
          }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover group-hover:scale-105 group-hover:brightness-125 transition-all duration-200 w-full h-full"
            priority
          />
          {/* Add a subtle gradient overlay that moves with the rotation */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent pointer-events-none"
            style={{
              transform: `translateZ(20px)`,
              transformStyle: 'preserve-3d'
            }}
          />
        </div>
      </AnimatedBackground>
    </div>
  );
} 