"use client";

import React, { useState, useEffect } from "react";

// --- WEBAUDIO PUNCH SOUND SYNTHESIZER ---
const playPunchSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    console.error("Audio play error", e);
  }
};

export default function Home() {
  // App States
  const [userRole, setUserRole] = useState<"bubu" | "dudu" | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Navigation: 'auth' | 'proposal' | 'app'
  const [view, setView] = useState<"auth" | "proposal" | "app">("auth");
  const [activeTab, setActiveTab] = useState<"planner" | "chat" | "punch">("planner");

  // App Data
  const [messages, setMessages] = useState<Array<{ sender: string; text: string; time: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [plannedDate, setPlannedDate] = useState({ date: "", activity: "", location: "" });
  const [punchCount, setPunchCount] = useState(0);

  // Sync state between browser tabs/partners using BroadcastChannel
  useEffect(() => {
    const channel = new BroadcastChannel("bubu_dudu_sync");
    channel.onmessage = (event) => {
      if (event.data.type === "NEW_MESSAGE") {
        setMessages((prev) => [...prev, event.data.payload]);
      } else if (event.data.type === "DATE_CONFIRMED") {
        const confirmMsg = {
          sender: "System 💕",
          text: `🎉 Date Confirmed! \n📅 Date: ${event.data.payload.date}\n🎈 Activity: ${event.data.payload.activity}\n📍 Location: ${event.data.payload.location}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, confirmMsg]);
      } else if (event.data.type === "PUNCH") {
        setPunchCount((prev) => prev + 1);
      }
    };
    return () => channel.close();
  }, []);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "1234" && userRole) {
      setIsAuthenticated(true);
      setView("proposal");
    } else {
      alert("Invalid Passcode or Role selection! (Default PIN: 1234)");
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = {
      sender: userRole === "bubu" ? "Bubu 🐻" : "Dudu 🐼",
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    setChatInput("");

    // Send to partner
    const channel = new BroadcastChannel("bubu_dudu_sync");
    channel.postMessage({ type: "NEW_MESSAGE", payload: newMsg });
  };

  const handleConfirmDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plannedDate.date || !plannedDate.activity) return;

    const confirmMsg = {
      sender: "System 💕",
      text: `🎉 Date Proposal Sent!\n📅 Date: ${plannedDate.date}\n🎈 Activity: ${plannedDate.activity}\n📍 Location: ${plannedDate.location}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, confirmMsg]);
    
    // Notify partner in Chat
    const channel = new BroadcastChannel("bubu_dudu_sync");
    channel.postMessage({ type: "DATE_CONFIRMED", payload: plannedDate });

    alert("Date proposal sent to your partner's chat! 💌");
    setActiveTab("chat");
  };

  const handlePunch = () => {
    playPunchSound();
    setPunchCount((prev) => prev + 1);

    const channel = new BroadcastChannel("bubu_dudu_sync");
    channel.postMessage({ type: "PUNCH" });
  };

  return (
    <main className="min-h-screen bg-pink-50 relative overflow-hidden flex flex-col items-center justify-center font-sans">
      
      {/* FLOATING HEARTS BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="floating-heart text-pink-300 text-2xl"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 4}s`
            }}
          >
            💖
          </div>
        ))}
      </div>

      {/* VIEW 1: AUTHENTICATION / REGISTRATION */}
      {view === "auth" && (
        <div className="z-10 bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-pink-100 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back! 🧸</h1>
          <p className="text-gray-500 text-sm mb-6">Enter our secret passcode to enter</p>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            {/* Role Selection */}
            <div className="flex justify-center gap-4 mb-2">
              <button
                type="button"
                onClick={() => setUserRole("bubu")}
                className={`flex-1 py-2 rounded-xl border-2 font-semibold transition ${
                  userRole === "bubu" ? "border-pink-500 bg-pink-100 text-pink-700" : "border-gray-200 text-gray-500"
                }`}
              >
                I am Bubu 🐻
              </button>
              <button
                type="button"
                onClick={() => setUserRole("dudu")}
                className={`flex-1 py-2 rounded-xl border-2 font-semibold transition ${
                  userRole === "dudu" ? "border-pink-500 bg-pink-100 text-pink-700" : "border-gray-200 text-gray-500"
                }`}
              >
                I am Dudu 🐼
              </button>
            </div>

            <input
              type="tel"
              placeholder="Mobile Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-3 rounded-full border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-center"
              required
            />

            <input
              type="password"
              placeholder="****"
              maxLength={4}
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full px-4 py-3 rounded-full border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-center text-lg tracking-widest"
              required
            />

            <button
              type="submit"
              className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-full shadow-lg transition transform active:scale-95"
            >
              Unlock Love 💖
            </button>
          </form>
        </div>
      )}

      {/* VIEW 2: PROPOSAL FEATURE */}
      {view === "proposal" && (
        <div className="z-10 flex flex-col items-center text-center p-6 max-w-lg w-full">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-6">
            Do you wanna go for a date? 🌹
          </h1>
          
          <img
            src="/75442127dca25264c5682e3fd5b444d7.jpg"
            alt="Bubu and Dudu Date Proposal"
            className="max-w-md w-full rounded-2xl object-cover shadow-lg mb-8 h-72"
            onError={(e) => {
              // Fallback image if file missing
              (e.target as HTMLElement).setAttribute("src", "https://i.pinimg.com/736x/75/44/21/75442127dca25264c5682e3fd5b444d7.jpg");
            }}
          />

          <div className="flex gap-4">
            <button
              onClick={() => setView("app")}
              className="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-full shadow-lg text-lg transition transform active:scale-95"
            >
              YES! 🥰
            </button>
            <button
              onClick={() => alert("No option is disabled! 😜")}
              className="px-6 py-3 bg-gray-200 text-gray-600 font-semibold rounded-full shadow text-lg hover:bg-gray-300"
            >
              No 🥺
            </button>
          </div>
        </div>
      )}

      {/* VIEW 3: MAIN APP (TABS) */}
      {view === "app" && (
        <div className="z-10 w-full max-w-xl bg-white min-h-[80vh] rounded-3xl shadow-xl border border-pink-100 flex flex-col overflow-hidden m-4">
          
          {/* Navigation Bar */}
          <div className="flex border-b border-pink-100 bg-pink-100/50">
            <button
              onClick={() => setActiveTab("planner")}
              className={`flex-1 py-4 font-bold transition ${activeTab === "planner" ? "bg-white text-rose-500 border-b-2 border-rose-500" : "text-gray-500"}`}
            >
              📅 Date Planner
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 py-4 font-bold transition ${activeTab === "chat" ? "bg-white text-rose-500 border-b-2 border-rose-500" : "text-gray-500"}`}
            >
              💬 Chat Room
            </button>
            <button
              onClick={() => setActiveTab("punch")}
              className={`flex-1 py-4 font-bold transition ${activeTab === "punch" ? "bg-white text-rose-500 border-b-2 border-rose-500" : "text-gray-500"}`}
            >
              🥊 Punch Room
            </button>
          </div>

          {/* TAB 1: DATE PLANNER */}
          {activeTab === "planner" && (
            <div className="p-6 flex-1 flex flex-col justify-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Plan Our Next Date 💖</h2>
              <form onSubmit={handleConfirmDate} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Select Date</label>
                  <input
                    type="date"
                    value={plannedDate.date}
                    onChange={(e) => setPlannedDate({ ...plannedDate, date: e.target.value })}
                    className="w-full p-3 rounded-xl border border-pink-200 mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Activity</label>
                  <input
                    type="text"
                    placeholder="e.g. Dinner & Movie / Stargazing"
                    value={plannedDate.activity}
                    onChange={(e) => setPlannedDate({ ...plannedDate, activity: e.target.value })}
                    className="w-full p-3 rounded-xl border border-pink-200 mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Favorite Restaurant"
                    value={plannedDate.location}
                    onChange={(e) => setPlannedDate({ ...plannedDate, location: e.target.value })}
                    className="w-full p-3 rounded-xl border border-pink-200 mt-1"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-4 py-3 bg-rose-500 text-white font-bold rounded-xl shadow-md hover:bg-rose-600 transition"
                >
                  Send Date Plan to Partner 💕
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: CHAT ROOM */}
          {activeTab === "chat" && (
            <div className="flex-1 flex flex-col p-4 bg-gray-50">
              <div className="flex-1 overflow-y-auto space-y-3 p-2">
                {messages.length === 0 ? (
                  <p className="text-center text-gray-400 mt-8">No messages yet. Say hi! 👋</p>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex flex-col ${
                        msg.sender.includes(userRole === "bubu" ? "Bubu" : "Dudu")
                          ? "items-end"
                          : "items-start"
                      }`}
                    >
                      <span className="text-xs text-gray-400 mb-1">{msg.sender}</span>
                      <div
                        className={`p-3 rounded-2xl max-w-xs whitespace-pre-wrap ${
                          msg.sender.includes("System")
                            ? "bg-pink-100 text-pink-800 font-semibold border border-pink-300 w-full text-center"
                            : msg.sender.includes(userRole === "bubu" ? "Bubu" : "Dudu")
                            ? "bg-rose-500 text-white rounded-br-none"
                            : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1">{msg.time}</span>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleSendMessage} className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Type a sweet message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-full border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
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
            <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {userRole === "dudu" ? "Dudu Punching Room 🐼🥊" : "Bubu Punching Room 🐻🥊"}
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                {userRole === "dudu"
                  ? "Dudu is angry! Tap to punch Bubu!"
                  : "Bubu is angry! Tap to punch Dudu!"}
              </p>

              <div className="relative my-4 cursor-pointer" onClick={handlePunch}>
                {userRole === "dudu" ? (
                  /* Dudu Punching Bubu */
                  <img
                    src="/Angry_mood.jpg"
                    alt="Angry Dudu Punching Bubu"
                    className="w-48 h-48 rounded-2xl object-cover shadow-lg hover:scale-105 transition active:scale-95"
                    onError={(e) => {
                      (e.target as HTMLElement).setAttribute("src", "https://i.pinimg.com/736x/8f/3e/6a/8f3e6a7ef6f7f63116bc3d6d027e8a93.jpg");
                    }}
                  />
                ) : (
                  /* Bubu Punching Dudu */
                  <img
                    src="/punch.png"
                    alt="Angry Bubu Punching Dudu"
                    className="w-48 h-48 rounded-2xl object-cover shadow-lg hover:scale-105 transition active:scale-95"
                    onError={(e) => {
                      (e.target as HTMLElement).setAttribute("src", "https://i.pinimg.com/736x/5a/2a/39/5a2a39a0391d4e08c48bd1b4dd12c5b3.jpg");
                    }}
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