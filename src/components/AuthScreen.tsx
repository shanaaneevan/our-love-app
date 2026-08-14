
"use client";
import { useState } from "react";
import { motion } from "framer-motion";

const SECRET_PIN = "1234"; // Replace with your anniversary or shared joke!

export default function AuthScreen({ onAuthenticate }: { onAuthenticate: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === SECRET_PIN) {
      onAuthenticate();
    } else {
      setError(true);
      setPin("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-pastel-soft p-4 relative overflow-hidden">
      {/* Sparkle/Heart background elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#FF4D6D_1px,transparent_1px)] [background-size:16px_16px]" />

      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full text-center border-2 border-pastel-pink z-10"
      >
        <h1 className="text-2xl font-bold text-pastel-chocolate mb-2">Welcome Back! 🧸</h1>
        <p className="text-sm text-gray-500 mb-6">Enter our secret date/PIN to enter</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            maxLength={4}
            value={pin}
            onChange={(e) => { setError(false); setPin(e.target.value); }}
            placeholder="****"
            className="w-full text-center text-2xl tracking-widest py-3 px-4 rounded-full border-2 border-pastel-pink focus:outline-none focus:border-pastel-accent bg-pastel-cream text-pastel-chocolate"
          />
          {error && <p className="text-xs text-pastel-red">Wrong secret code! Try again 🥺</p>}
          <button
            type="submit"
            className="w-full py-3 bg-pastel-accent text-white font-semibold rounded-full shadow-md hover:bg-pastel-red transition-colors"
          >
            Unlock Love 💖
          </button>
        </form>
      </motion.div>
    </div>
  );
}