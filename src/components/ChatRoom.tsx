"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export interface Message {
  id: number;
  text: string;
  sender: "me" | "them";
  time: string;
}

interface ChatRoomProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
}

export default function ChatRoom({ messages, onSendMessage }: ChatRoomProps) {
  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[75vh] max-w-md mx-auto w-full p-4">
      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto bg-white rounded-3xl p-4 shadow-md border-2 border-pastel-pink space-y-3 mb-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "me" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                msg.sender === "me"
                  ? "bg-pastel-accent text-white rounded-br-none"
                  : "bg-pastel-soft text-pastel-chocolate border border-pastel-pink rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
            <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.time}</span>
          </div>
        ))}
      </div>

      {/* Quick Stickers */}
      <div className="flex gap-2 mb-2 overflow-x-auto py-1">
        {["💖", "🧸", "🌹", "💋", "🍿", "🍕"].map((sticker) => (
          <button
            key={sticker}
            type="button"
            onClick={() => onSendMessage(sticker)}
            className="bg-white border border-pastel-pink rounded-full p-2 text-lg shadow-sm hover:scale-110 transition-transform"
          >
            {sticker}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Send a love note..."
          className="flex-1 px-4 py-3 rounded-full border border-pastel-pink bg-white text-sm focus:outline-none focus:border-pastel-accent text-pastel-chocolate shadow-sm"
        />
        <button
          type="submit"
          className="p-3 bg-pastel-accent text-white rounded-full shadow-md hover:bg-pastel-red transition-colors"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}