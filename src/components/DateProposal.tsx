// src/components/DateProposal.tsx
"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

const GUILT_NOTES = [
  "Are you sure? 🥺",
  "Think again... Bubu is getting sad! 💔",
  "You really gonna do this to me? 😭",
  "Look at this sad face! Say yes! 🧸",
  "Okay, now you are breaking my heart... 💔"
];

export default function DateProposal({ onAccepted }: { onAccepted: () => void }) {
  const [noCount, setNoCount] = useState(0);

  const handleNoClick = () => {
    setNoCount((prev) => prev + 1);
  };

  const handleYesClick = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    onAccepted();
  };

  // Image scaling increases with 'No' clicks
  const bubuScale = 1 + noCount * 0.15;
  // Yes button grows bigger every time 'No' is clicked
  const yesButtonScale = 1 + noCount * 0.2;
  // Guilt message cycles through list
  const currentNote = GUILT_NOTES[Math.min(noCount, GUILT_NOTES.length - 1)];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-pastel-soft p-6 text-center">
      <motion.h1 
        className="text-3xl md:text-5xl font-extrabold text-pastel-chocolate mb-6"
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        Do you wanna go for a date? 🌹
      </motion.h1>

      {/* Dynamic Sad Bubu Display */}
      <div className="h-64 flex items-center justify-center my-4 overflow-hidden">
        <motion.img
          src={noCount > 0 ? "/bubu-sad.png" : "/bubu-happy.png"} // Add images to /public folder
          alt="Bubu Bear"
          style={{ transform: `scale(${bubuScale})` }}
          className="w-44 h-44 object-contain transition-transform duration-300"
        />
      </div>

      {/* Guilt-trip banner */}
      {noCount > 0 && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-pastel-red font-bold text-lg mb-6 bg-white/80 px-4 py-2 rounded-full border border-pastel-pink shadow-sm"
        >
          {currentNote}
        </motion.p>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-6 mt-4 z-20">
        <motion.button
          style={{ transform: `scale(${yesButtonScale})` }}
          onClick={handleYesClick}
          className="bg-pastel-accent hover:bg-pastel-red text-white font-bold py-3 px-8 rounded-full shadow-lg transition-colors"
        >
          YES! 🥰
        </motion.button>

        <button
          onClick={handleNoClick}
          className="bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-full hover:bg-gray-300 transition-colors"
        >
          No 😢
        </button>
      </div>
    </div>
  );
}