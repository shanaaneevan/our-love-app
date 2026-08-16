"use client";

import React, { useEffect, useState } from "react";

interface Heart {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
}

export default function FloatingHearts() {
  const [hearts, setHearts] = useState<Heart[]>([]);

  useEffect(() => {
    // Generate a fixed set of floating hearts with randomized positions/animations
    const generatedHearts: Heart[] = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // horizontal percentage position
      size: Math.floor(Math.random() * 20) + 14, // 14px to 34px
      duration: Math.random() * 5 + 5, // 5s to 10s float duration
      delay: Math.random() * 5, // 0s to 5s initial delay
    }));

    setHearts(generatedHearts);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute bottom-[-10%] text-pink-300 opacity-60 animate-float"
          style={{
            left: `${heart.left}%`,
            fontSize: `${heart.size}px`,
            animationDuration: `${heart.duration}s`,
            animationDelay: `${heart.delay}s`,
            animationIterationCount: "infinite",
            animationTimingFunction: "ease-in-out",
          }}
        >
          💖
        </div>
      ))}

      {/* Embedded CSS animation for floating effect */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.2;
          }
          50% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(-110vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-float {
          animation-name: float;
        }
      `}</style>
    </div>
  );
}