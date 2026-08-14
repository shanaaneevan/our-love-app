"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Film, Bike, Utensils, Calendar, Clock, HeartHandshake, CheckCircle2 } from "lucide-react";

const ACTIVITIES = [
  { id: "Shopping Spree 🛍️", label: "Shopping Spree", icon: ShoppingBag },
  { id: "Movie Night 🍿", label: "Movie Night", icon: Film },
  { id: "Long Ride 🛵", label: "Long Ride / Drive", icon: Bike },
  { id: "Food Date 🍕", label: "Food Date", icon: Utensils },
];

interface DatePlannerProps {
  onSendDateMessage?: (msg: string) => void;
}

export default function DatePlanner({ onSendDateMessage }: DatePlannerProps) {
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [sentMessage, setSentMessage] = useState("");

  const toggleActivity = (id: string) => {
    setSelectedActivities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSaveDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time || selectedActivities.length === 0) {
      alert("Please pick at least one activity and choose a date & time! 💖");
      return;
    }

    const formattedMessage = `🗓️ Date Confirmed! We are doing [${selectedActivities.join(
      ", "
    )}] on ${date} at ${time}! Can't wait! 💖✨`;

    setSentMessage(formattedMessage);
    setIsSaved(true);

    // 🚀 Automatically send to Chat Room
    if (onSendDateMessage) {
      onSendDateMessage(formattedMessage);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 max-w-md mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-3xl shadow-lg border-2 border-pastel-pink w-full"
      >
        <h2 className="text-2xl font-bold text-pastel-chocolate mb-1">🗓️ Date Planner</h2>
        <p className="text-xs text-gray-500 mb-6">Plan our perfect date together!</p>

        {isSaved ? (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="space-y-4 py-4">
            <div className="text-4xl">🎉</div>
            <h3 className="text-xl font-bold text-pastel-accent">It's a Date!</h3>
            
            <p className="text-sm text-pastel-chocolate">
              Mark your calendar for <strong>{date}</strong> at <strong>{time}</strong>!
            </p>

            <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-2xl text-xs flex items-center gap-2 justify-center shadow-sm">
              <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
              <span>Invitation message sent to chat! 💌</span>
            </div>

            <div className="bg-pastel-soft p-3 rounded-2xl border border-pastel-pink text-xs text-pastel-chocolate text-left">
              <strong>Sent Invitation Note:</strong>
              <p className="italic mt-1 text-gray-600">"{sentMessage}"</p>
            </div>

            <button
              onClick={() => setIsSaved(false)}
              className="text-xs text-pastel-accent underline pt-2 block mx-auto"
            >
              Edit Plans
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSaveDate} className="space-y-6 text-left">
            <div>
              <label className="block text-xs font-bold text-pastel-chocolate mb-2">
                1. Choose Activities
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ACTIVITIES.map((act) => {
                  const Icon = act.icon;
                  const isSelected = selectedActivities.includes(act.id);
                  return (
                    <button
                      type="button"
                      key={act.id}
                      onClick={() => toggleActivity(act.id)}
                      className={`flex items-center gap-2 p-3 rounded-2xl border transition-all text-xs font-semibold ${
                        isSelected
                          ? "bg-pastel-accent text-white border-pastel-accent shadow-md scale-95"
                          : "bg-pastel-cream text-pastel-chocolate border-pastel-pink hover:border-pastel-accent"
                      }`}
                    >
                      <Icon size={16} />
                      <span>{act.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-pastel-chocolate mb-2">
                2. Select Date & Time
              </label>
              <div className="space-y-2">
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 text-pastel-accent" size={18} />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pastel-pink bg-pastel-cream text-xs text-pastel-chocolate focus:outline-none focus:border-pastel-accent"
                  />
                </div>

                <div className="relative">
                  <Clock className="absolute left-3 top-3 text-pastel-accent" size={18} />
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pastel-pink bg-pastel-cream text-xs text-pastel-chocolate focus:outline-none focus:border-pastel-accent"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-pastel-accent text-white font-bold rounded-full shadow-md hover:bg-pastel-red transition-colors flex items-center justify-center gap-2"
            >
              <HeartHandshake size={18} />
              Confirm & Send Invitation 💌
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}