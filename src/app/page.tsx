"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

import DatePlanner from "@/components/DatePlanner";
import ChatRoom, { Message } from "@/components/ChatRoom";
import PunchDudu from "@/components/PunchDudu";
import { Heart, Calendar, MessageCircle, Flame } from "lucide-react";

const GUILT_NOTES = [
  "Are you sure? 🥺",
  "Think again... Bubu is getting sad! 💔",
  "You really gonna do this to me? 😭",
  "Look at this sad face! Say yes! 🧸",
  "Okay, now you are breaking my heart... 💔",
];

const SECRET_PIN = "1234"; // 🔑 Set your custom secret PIN here!

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const [noCount, setNoCount] = useState(0);
  const [isAccepted, setIsAccepted] = useState(false);

  // Active Tab State
  const [activeTab, setActiveTab] = useState<"proposal" | "planner" | "chat" | "punch">("proposal");

  // 💬 Shared Chat State
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { id: 1, text: "Hey sweetie! Can't wait for our date! 🧸", sender: "them", time: "10:00 AM" },
  ]);

  // Handler to add new messages from ChatRoom or DatePlanner
  const handleNewMessage = (text: string) => {
    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text,
        sender: "me",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  // Auth Handler
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === SECRET_PIN) {
      setIsAuthenticated(true);
    } else {
      setError(true);
      setPin("");
    }
  };

  // Proposal Handlers
  const handleNoClick = () => {
    setNoCount((prev) => prev + 1);
  };

  const handleYesClick = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });
    setIsAccepted(true);
  };

  const bubuScale = 1 + noCount * 0.15;
  const yesButtonScale = 1 + noCount * 0.2;
  const currentNote = GUILT_NOTES[Math.min(noCount, GUILT_NOTES.length - 1)];

  // 1. LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-4 relative overflow-hidden bg-pastel-soft">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full text-center border-2 border-pastel-pink z-10"
        >
          <h1 className="text-2xl font-bold text-pastel-chocolate mb-2">Welcome Back! 🧸</h1>
          <p className="text-sm text-gray-500 mb-6">Enter our secret passcode to enter</p>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                setError(false);
                setPin(e.target.value);
              }}
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
      </main>
    );
  }

  // MAIN APPLICATION LAYOUT (AFTER LOGIN)
  return (
    <div className="flex flex-col min-h-screen bg-pastel-soft pb-24">
      {/* Dynamic Main Content Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {/* TAB 1: PROPOSAL */}
        {activeTab === "proposal" && (
          <div className="flex flex-col items-center justify-center text-center">
            {isAccepted ? (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white p-8 rounded-3xl shadow-xl border-2 border-pastel-pink max-w-md"
              >
                <h1 className="text-3xl font-extrabold text-pastel-accent mb-4">YAYYY! 🎉💖</h1>
                <p className="text-lg text-pastel-chocolate mb-6">
                  I knew you would say yes! Can't wait for our date! 🧸✨
                </p>
                <img src="/happy.jpeg" alt="Happy Bubu" className="w-48 h-48 mx-auto object-contain mb-4" />
                <button
                  onClick={() => setActiveTab("planner")}
                  className="py-2.5 px-6 bg-pastel-accent text-white font-bold rounded-full text-sm shadow-md"
                >
                  Go to Planner 🗓️
                </button>
              </motion.div>
            ) : (
              <>
                <motion.h1
                  className="text-3xl md:text-5xl font-extrabold text-pastel-chocolate mb-6"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  Do you wanna go for a date? 🌹
                </motion.h1>

                <div className="h-64 flex items-center justify-center my-4 overflow-hidden">
                  <motion.img
                    src={noCount > 0 ? "/sad.jpg" : "/happy.jpeg"}
                    alt="Bubu Bear"
                    style={{ transform: `scale(${bubuScale})` }}
                    className="w-44 h-44 object-contain transition-transform duration-300"
                  />
                </div>

                {noCount > 0 && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-pastel-red font-bold text-lg mb-6 bg-white/80 px-4 py-2 rounded-full border border-pastel-pink shadow-sm"
                  >
                    {currentNote}
                  </motion.p>
                )}

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
              </>
            )}
          </div>
        )}

        {/* TAB 2: PLANNER - Prop added to receive date invitation messages */}
        {activeTab === "planner" && <DatePlanner onSendDateMessage={handleNewMessage} />}

        {/* TAB 3: CHAT - Props added to pass messages and receive user input */}
        {activeTab === "chat" && (
          <ChatRoom messages={chatMessages} onSendMessage={handleNewMessage} />
        )}

        {/* TAB 4: PUNCH DUDU */}
        {activeTab === "punch" && <PunchDudu />}
      </main>

      {/* BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-pastel-pink py-3 px-6 flex justify-around items-center shadow-lg z-50">
        <button
          onClick={() => setActiveTab("proposal")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === "proposal" ? "text-pastel-accent font-bold" : "text-gray-400"
          }`}
        >
          <Heart size={22} />
          <span className="text-xs">Proposal</span>
        </button>

        <button
          onClick={() => setActiveTab("planner")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === "planner" ? "text-pastel-accent font-bold" : "text-gray-400"
          }`}
        >
          <Calendar size={22} />
          <span className="text-xs">Planner</span>
        </button>

        <button
          onClick={() => setActiveTab("chat")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === "chat" ? "text-pastel-accent font-bold" : "text-gray-400"
          }`}
        >
          <MessageCircle size={22} />
          <span className="text-xs">Chat</span>
        </button>

        <button
          onClick={() => setActiveTab("punch")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === "punch" ? "text-pastel-accent font-bold" : "text-gray-400"
          }`}
        >
          <Flame size={22} />
          <span className="text-xs">Punch Dudu</span>
        </button>
      </nav>
    </div>
  );
}