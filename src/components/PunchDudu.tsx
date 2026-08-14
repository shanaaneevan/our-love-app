"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function PunchDudu() {
  const [punchCount, setPunchCount] = useState(0);
  const [isPunched, setIsPunched] = useState(false);

  const handlePunch = () => {
    setPunchCount((prev) => prev + 1);
    setIsPunched(true);

    // Audio trigger
    const audio = new Audio("/punch-sound.mp3");
    audio.play().catch(() => {}); // catch browser autoplay blocks gracefully

    setTimeout(() => setIsPunched(false), 150);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-pastel-chocolate mb-1">🥊 Punch Dudu Rage Room</h2>
      <p className="text-xs text-gray-500 mb-6">Need to vent? Tap Dudu to deliver a punch!</p>

      {/* Animated Punchable Meme Target */}
      <motion.div
        animate={isPunched ? { x: [-15, 15, -10, 10, 0], scale: 0.9 } : { scale: 1 }}
        transition={{ duration: 0.15 }}
        onClick={handlePunch}
        className="cursor-pointer select-none my-4 active:scale-90"
      >
        <img
          src={isPunched ? "/punch.png" : "/Angry_mood.jpg"}
          alt="Dudu Meme"
          className="w-48 h-48 object-contain pointer-events-none drop-shadow-md"
        />
      </motion.div>

      {/* Punch Counter */}
      <div className="bg-white px-6 py-2.5 rounded-full shadow-md border-2 border-pastel-pink">
        <span className="text-sm font-bold text-pastel-chocolate">
          Total Punches Delivered: <span className="text-pastel-accent text-base">{punchCount}</span>
        </span>
      </div>
    </div>
  );
}