"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  setDoc,
} from "firebase/firestore";

// Dynamically import AuthScreen to prevent SSR Firebase initialization issues
const AuthScreen = dynamic(() => import("@/components/AuthScreen"), {
  ssr: false,
});

// --- AUDIO PLAYER FOR PUBLIC SOUND FILE ---
const playPunchSound = () => {
  try {
    const audio = new Audio("/punch-sound.mp3");
    audio.currentTime = 0;
    audio.play().catch((err) => {
      console.error("Audio playback error:", err);
    });
  } catch (e) {
    console.error("Audio initialize error:", e);
  }
};

const ACTIVITIES = [
  { id: "shopping", label: "Shopping", icon: "🛍️" },
  { id: "long_ride", label: "Long Ride", icon: "🛵" },
  { id: "travel", label: "Trip / Travel", icon: "🧳" },
  { id: "movie", label: "Movie", icon: "🎬" },
  { id: "candlelight", label: "Candlelight Dinner", icon: "🕯️" },
  { id: "cafe", label: "Cafe Date", icon: "☕" },
  { id: "beach", label: "Beach Walk", icon: "🏝️" },
  { id: "stargazing", label: "Stargazing", icon: "🌌" },
  { id: "amusement", label: "Amusement Park", icon: "🎡" },
  { id: "picnic", label: "Picnic", icon: "🧺" },
  { id: "adventure", label: "Adventure", icon: "⛰️" },
  { id: "more", label: "More", icon: "💬" },
];

export default function Home() {
  // App States
  const [userRole, setUserRole] = useState<"bubu" | "dudu" | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Proposal State
  const [noCount, setNoCount] = useState(0);

  // Navigation: 'auth' | 'proposal' | 'success' | 'app'
  const [view, setView] = useState<"auth" | "proposal" | "success" | "app">("auth");
  const [activeTab, setActiveTab] = useState<"planner" | "chat" | "punch">("planner");

  // Confirmation Modal State
  const [showConfirmation, setShowConfirmation] = useState(false);

  // App Data
  const [messages, setMessages] = useState<Array<{ sender: string; text: string; time: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [plannedDate, setPlannedDate] = useState({ date: "", time: "", activity: "Shopping", location: "" });
  const [punchCount, setPunchCount] = useState(0);

  // Current logged in user name
  const currentUserName = userRole === "bubu" ? "Bubu 🐻" : "Dudu 🐼";

  // Sync Messages in Real-time using Firebase Firestore
  useEffect(() => {
    if (!isAuthenticated) return;

    const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMsgs = snapshot.docs.map((doc) => doc.data() as any);
      setMessages(fetchedMsgs);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  // Sync Punch Count in Real-time using Firestore
  useEffect(() => {
    if (!isAuthenticated) return;

    const punchDocRef = doc(db, "game_data", "punch_counter");
    const unsubscribe = onSnapshot(punchDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setPunchCount(docSnap.data().count || 0);
      }
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  const handleAuthSuccess = (role: "dudu" | "bubu") => {
    setUserRole(role);
    setIsAuthenticated(true);
    setView("proposal");
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = {
      sender: currentUserName,
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      createdAt: new Date(),
    };

    setChatInput("");
    await addDoc(collection(db, "messages"), newMsg);
  };

  const handleConfirmDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plannedDate.date || !plannedDate.activity) return;

    const confirmMsg = {
      sender: "System 💕",
      text: `🎉 Date Proposal Sent!\n🎈 Activity: ${plannedDate.activity}\n📅 Date: ${plannedDate.date}\n⏰ Time: ${plannedDate.time || "Not specified"}\n📍 Location: ${plannedDate.location || "Not specified"}`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      createdAt: new Date(),
    };

    await addDoc(collection(db, "messages"), confirmMsg);
    setShowConfirmation(true);
  };

  const handleGoToChat = () => {
    setShowConfirmation(false);
    setActiveTab("chat");
  };

  const handlePunch = async () => {
    playPunchSound();
    const nextCount = punchCount + 1;
    setPunchCount(nextCount);

    await setDoc(doc(db, "game_data", "punch_counter"), { count: nextCount }, { merge: true });
  };

  const handleNoClick = () => {
    setNoCount((prev) => prev + 1);
  };

  // Scale multiplier for YES button expansion
  const yesButtonScale = 1 + noCount * 0.25;

  // IMAGE CONFIGURATION:
  const defaultImage = "/75442127dca25264c5682e3fd5b444d7.jpg"; 
  const cryingDuduImage = "/dudu_crying.png"; 
  const cryingBubuImage = "/bubu_crying.png"; 

  const isPartnerDudu = userRole === "bubu";

  const currentProposalImage = noCount === 0
    ? defaultImage
    : isPartnerDudu
      ? cryingDuduImage
      : cryingBubuImage;

  const getSadNote = () => {
    const partnerName = isPartnerDudu ? "Dudu 🐼" : "Bubu 🐻";
    const notes = [
      `Think again... ${partnerName} is getting sad! 💔`,
      `Are you really sure? ${partnerName} is crying now... 😭`,
      `Don't do this to ${partnerName}! 🥺`,
      `${partnerName}'s little heart can’t take this… 🥺💔`,
      `Waiting for you… 😢💕`,
      `Are you really going to leave ${partnerName} like this? 😭`,
      `Just press YES already! 💕`
    ];
    return notes[Math.min(noCount - 1, notes.length - 1)];
  };

  return (
    <main 
      className={`min-h-screen relative overflow-x-hidden flex flex-col items-center justify-center font-sans p-4 bg-cover bg-center`}
      style={{
        backgroundImage: "url('/dudu_bubu_sitting_backgrnd.png')",
      }}
    >
      
      {/* VIEW 1: AUTHENTICATION / REGISTRATION */}
      {view === "auth" && (
        <AuthScreen onLoginSuccess={handleAuthSuccess} />
      )}

      {/* VIEW 2: PROPOSAL FEATURE */}
      {view === "proposal" && (
        <div className="z-10 flex flex-col items-center text-center max-w-md w-full bg-white/70 backdrop-blur-md p-8 rounded-[2.5rem] shadow-2xl border border-white/80">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-6 drop-shadow-sm flex items-center justify-center gap-2">
            Do you wanna go for a date? <span className="text-3xl">🌹</span>
          </h1>
          
          <div className="relative w-full rounded-2xl overflow-hidden shadow-md mb-6 bg-white/50 p-2 border border-pink-100">
            <img
              key={currentProposalImage}
              src={currentProposalImage}
              alt="Proposal"
              className="w-full h-72 object-cover rounded-xl transition-all duration-300"
            />
          </div>

          {noCount > 0 && (
            <div className="mb-6 px-6 py-2 bg-white/90 rounded-full shadow-md border border-rose-200 text-rose-600 font-bold text-sm animate-bounce">
              {getSadNote()}
            </div>
          )}

          <div className="flex gap-4 items-center justify-center w-full mt-2">
            <button
              onClick={() => setView("success")}
              style={{ transform: `scale(${yesButtonScale})` }}
              className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-extrabold rounded-full shadow-lg text-lg transition-transform duration-200 active:scale-95 z-20"
            >
              YES! 🥰
            </button>
            <button
              onClick={handleNoClick}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-full shadow text-lg transition"
            >
              No 🥺
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2.5: SUCCESS CELEBRATION CARD MATCHING DESIGN */}
      {view === "success" && (
        <div className="z-10 w-full max-w-lg bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-white/90 overflow-hidden flex flex-col items-center pt-8 pb-0 animate-in fade-in zoom-in duration-300">
          
          {/* Title Header */}
          <div className="flex items-center justify-center gap-2 text-rose-500 mb-2">
            <h1 className="text-5xl font-black tracking-wide drop-shadow-sm">YAYYY!</h1>
            <span className="text-3xl">🎉</span>
            <span className="text-3xl">💖</span>
          </div>

          {/* Dotted Heart Divider */}
          <div className="flex items-center justify-center gap-2 text-rose-300 w-full px-12 my-2">
            <span className="border-b border-dashed border-rose-300 flex-1"></span>
            <span className="text-xs">💖</span>
            <span className="border-b border-dashed border-rose-300 flex-1"></span>
          </div>

          {/* Celebration Text */}
          <div className="text-center my-3 space-y-1">
            <p className="text-slate-700 font-bold text-lg">
              I knew you would say <span className="text-rose-500 font-extrabold">yes!</span>
            </p>
            <p className="text-slate-600 font-semibold text-base flex items-center justify-center gap-1.5">
              Can't wait for our date! <span className="text-lg">🧸</span> <span className="text-amber-400 text-sm">✨</span>
            </p>
          </div>

          {/* Hugging Illustration */}
          <div className="relative w-64 h-56 my-2 flex items-center justify-center">
            <img
              src="/75442127dca25264c5682e3fd5b444d7.jpg"
              alt="Bubu and Dudu Hugging"
              className="w-full h-full object-contain filter drop-shadow-md"
            />
          </div>

          {/* Go to Planner Pill Button */}
          <div className="w-full px-8 mb-8 mt-2">
            <button
              onClick={() => {
                setActiveTab("planner");
                setView("app");
              }}
              className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-extrabold rounded-full shadow-lg ring-4 ring-rose-200/50 transition active:scale-95 text-base flex items-center justify-center gap-2"
            >
              <span>Go to Planner</span>
              <span className="text-lg">📅</span>
            </button>
          </div>

          {/* Embedded Bottom Navigation Bar */}
          <div className="w-full bg-white/80 border-t border-pink-100 py-3 px-4 flex justify-around items-center text-xs font-semibold text-slate-400">
            <button
              onClick={() => setView("proposal")}
              className="flex flex-col items-center gap-1 text-rose-500 font-bold relative"
            >
              <span className="text-xl">💖</span>
              <span>Proposal</span>
              <div className="absolute -bottom-3 left-0 right-0 h-1 bg-rose-500 rounded-full" />
            </button>
            <button
              onClick={() => {
                setActiveTab("planner");
                setView("app");
              }}
              className="flex flex-col items-center gap-1 hover:text-slate-600 transition"
            >
              <span className="text-xl">📅</span>
              <span>Planner</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("chat");
                setView("app");
              }}
              className="flex flex-col items-center gap-1 hover:text-slate-600 transition"
            >
              <span className="text-xl">💬</span>
              <span>Chat</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("punch");
                setView("app");
              }}
              className="flex flex-col items-center gap-1 hover:text-slate-600 transition"
            >
              <span className="text-xl">🥊</span>
              <span>Punch {userRole === "bubu" ? "Dudu" : "Bubu"}</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 3: MAIN APP (TABS) */}
      {view === "app" && (
        <div className="z-10 w-full max-w-[540px] bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-white/80 flex flex-col overflow-hidden my-auto relative">
          
          {/* TOP BAR: BACK TO PROPOSAL YES CONFIRM PAGE */}
          <div className="w-full bg-pink-50/70 border-b border-pink-100 px-6 py-2.5 flex items-center justify-between">
            <button
              onClick={() => setView("success")}
              className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-pink-100/70 px-3 py-1.5 rounded-full transition"
            >
              <span>←</span>
              <span>Back to Proposal Confirm Page</span>
              <span className="text-sm">💖</span>
            </button>
          </div>

          {/* DATE PLAN CONFIRMATION MODAL */}
          {showConfirmation && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
              <div className="bg-white rounded-3xl p-6 text-center max-w-sm w-full shadow-2xl border border-pink-200 animate-in fade-in zoom-in duration-200 flex flex-col items-center">
                <div className="text-5xl mb-3">💖</div>
                <h3 className="text-2xl font-bold text-rose-600 mb-2">Date Plan Sent!</h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  Your romantic date plan has been sent with love! 💌<br/>
                  Get ready for a wonderful time together! ✨
                </p>
                <div className="w-full bg-pink-50 rounded-2xl p-3 mb-5 text-left text-xs text-rose-800 space-y-1 border border-pink-100">
                  <p><strong>Activity:</strong> {plannedDate.activity}</p>
                  <p><strong>Date:</strong> {plannedDate.date}</p>
                  <p><strong>Time:</strong> {plannedDate.time || "Not specified"}</p>
                  <p><strong>Location:</strong> {plannedDate.location || "Not specified"}</p>
                </div>
                <button
                  onClick={handleGoToChat}
                  className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-full shadow-md transition active:scale-95"
                >
                  View in Chat Room 💬
                </button>
              </div>
            </div>
          )}

          {/* Navigation Bar */}
          <div className="flex border-b border-pink-100 bg-white/60">
            <button
              onClick={() => setActiveTab("planner")}
              className={`flex-1 py-4 px-2 font-bold transition flex items-center justify-center gap-2 text-sm relative ${
                activeTab === "planner" ? "text-rose-500 bg-pink-50/40" : "text-gray-700 hover:text-gray-900"
              }`}
            >
              <span>📅</span> Date Planner
              {activeTab === "planner" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-400 rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 py-4 px-2 font-bold transition flex items-center justify-center gap-2 text-sm relative ${
                activeTab === "chat" ? "text-rose-500 bg-pink-50/40" : "text-gray-700 hover:text-gray-900"
              }`}
            >
              <span>💬</span> Chat Room
              {activeTab === "chat" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-400 rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("punch")}
              className={`flex-1 py-4 px-2 font-bold transition flex items-center justify-center gap-2 text-sm relative ${
                activeTab === "punch" ? "text-rose-500 bg-pink-50/40" : "text-gray-700 hover:text-gray-900"
              }`}
            >
              <span>🥊</span> Punch Room
              {activeTab === "punch" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-400 rounded-t-full" />
              )}
            </button>
          </div>

          {/* TAB 1: DATE PLANNER */}
          {activeTab === "planner" && (
            <div className="p-6 md:p-8 flex-1 flex flex-col">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-extrabold text-purple-950 flex items-center justify-center gap-2">
                  Plan Our Next Date <span className="text-rose-500">💕</span>
                </h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="h-[1px] w-12 bg-pink-200"></span>
                  <span className="text-rose-400 text-xs">💖</span>
                  <span className="h-[1px] w-12 bg-pink-200"></span>
                </div>
              </div>

              <form onSubmit={handleConfirmDate} className="flex flex-col gap-5">
                <div>
                  <label className="text-sm font-bold text-purple-950 flex items-center gap-1.5 mb-3">
                    1. Choose Activity <span className="text-rose-400">💕</span> <span className="text-amber-300 text-xs">✨</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2.5">
                    {ACTIVITIES.map((act) => {
                      const isSelected = plannedDate.activity === act.label;
                      return (
                        <button
                          key={act.id}
                          type="button"
                          onClick={() => setPlannedDate({ ...plannedDate, activity: act.label })}
                          className={`flex flex-col items-center justify-center p-2.5 h-20 rounded-2xl border transition-all ${
                            isSelected
                              ? "border-rose-300 bg-pink-50/80 ring-2 ring-rose-200 text-rose-600 shadow-sm"
                              : "border-pink-100 bg-white hover:border-pink-200 text-slate-700"
                          }`}
                        >
                          <span className="text-2xl mb-1">{act.icon}</span>
                          <span className="text-[11px] font-semibold text-center leading-tight">
                            {act.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-purple-950 flex items-center gap-1.5 mb-2">
                    2. Select Date & Time <span className="text-rose-400">💕</span> <span className="text-amber-300 text-xs">✨</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-rose-400 mb-1">Date</span>
                      <input
                        type="date"
                        value={plannedDate.date}
                        onChange={(e) => setPlannedDate({ ...plannedDate, date: e.target.value })}
                        className="w-full p-3 rounded-2xl border border-pink-100 bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                        required
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-rose-400 mb-1">Time</span>
                      <input
                        type="time"
                        value={plannedDate.time}
                        onChange={(e) => setPlannedDate({ ...plannedDate, time: e.target.value })}
                        className="w-full p-3 rounded-2xl border border-pink-100 bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-purple-950 flex items-center gap-1.5 mb-2">
                    3. Choose Location <span className="text-rose-400">💕</span> <span className="text-amber-300 text-xs">✨</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-rose-400 text-sm">📍</span>
                    <input
                      type="text"
                      placeholder="e.g. Favorite Restaurant, Cafe, Park..."
                      value={plannedDate.location}
                      onChange={(e) => setPlannedDate({ ...plannedDate, location: e.target.value })}
                      className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-pink-100 bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-3 py-4 bg-gradient-to-r from-rose-400 via-pink-500 to-rose-400 hover:from-rose-500 hover:to-pink-600 text-white font-extrabold rounded-full shadow-lg transition active:scale-98 flex items-center justify-center gap-2 text-base"
                >
                  <span className="text-xl">💌</span> Send Date Plan to Partner <span className="text-sm">💕</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: CHAT ROOM */}
          {activeTab === "chat" && (
            <div className="flex-1 flex flex-col p-4 bg-gray-50/50 min-h-[450px]">
              <div className="flex-1 overflow-y-auto space-y-3 p-2">
                {messages.length === 0 ? (
                  <p className="text-center text-gray-400 mt-8">No messages yet. Say hi! 👋</p>
                ) : (
                  messages.map((msg, index) => {
                    const isSelf = msg.sender === currentUserName;
                    return (
                      <div
                        key={index}
                        className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}
                      >
                        <span className="text-xs text-gray-600 mb-1 font-semibold">{msg.sender}</span>
                        <div
                          className={`p-3 rounded-2xl max-w-xs whitespace-pre-wrap ${
                            msg.sender.includes("System")
                              ? "bg-pink-100/90 text-pink-800 font-semibold border border-pink-300 w-full text-center"
                              : isSelf
                              ? "bg-rose-500 text-white rounded-br-none"
                              : "bg-white/90 text-gray-800 border border-gray-200 rounded-bl-none"
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[10px] text-gray-500 mt-1">{msg.time}</span>
                      </div>
                    );
                  })
                )}
              </div>
              <form onSubmit={handleSendMessage} className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Type a sweet message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-full border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white/90 text-gray-700"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-rose-500 text-white font-bold rounded-full shadow hover:bg-rose-600 transition"
                >
                  Send
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: PUNCH ROOM */}
          {activeTab === "punch" && (
            <div className="p-6 flex-1 flex flex-col items-center justify-center text-center min-h-[450px]">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {userRole === "bubu" ? "Bubu Punching Room 🐻🥊" : "Dudu Punching Room 🐼🥊"}
              </h2>
              <p className="text-gray-700 font-medium text-sm mb-4">
                {userRole === "bubu"
                  ? "Bubu is angry! Tap to punch Dudu!"
                  : "Dudu is angry! Tap to punch Bubu!"}
              </p>

              <div className="relative my-4 cursor-pointer" onClick={handlePunch}>
                {userRole === "bubu" ? (
                  <img
                    src="/bubu_punch_dudu.png"
                    alt="Angry Bubu Punching Dudu"
                    className="w-48 h-48 rounded-2xl object-cover shadow-lg hover:scale-105 transition active:scale-95"
                  />
                ) : (
                  <img
                    src="/dudu_punch_bubu.png"
                    alt="Angry Dudu Punching Bubu"
                    className="w-48 h-48 rounded-2xl object-cover shadow-lg hover:scale-105 transition active:scale-95"
                  />
                )}
              </div>

              <div className="mt-4 bg-pink-100 text-rose-700 px-6 py-2 rounded-full font-bold">
                Total Punches: {punchCount} 💥
              </div>

              <button
                onClick={handlePunch}
                className="mt-6 px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-full shadow-lg transition active:scale-90"
              >
                PUNCH! 💥
              </button>
            </div>
          )}

        </div>
      )}
    </main>
  );
}