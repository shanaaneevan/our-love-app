"use client";
import React, { useState, useEffect } from "react";
import FloatingHearts from "./FloatingHearts";

interface AuthProps {
  onLoginSuccess: (userRole: "dudu" | "bubu") => void;
}

export default function AuthScreen({ onLoginSuccess }: AuthProps) {
  // Navigation states: 'login' | 'register' | 'forgot'
  const [view, setView] = useState<"login" | "register">("login");

  // Registration form inputs
  const [regName, setRegName] = useState("");
  const [userMobile, setUserMobile] = useState("");
  const [partnerMobile, setPartnerMobile] = useState("");
  const [selectedRole, setSelectedRole] = useState<"dudu" | "bubu">("dudu");

  // Login form inputs
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPin, setLoginPin] = useState("");
  const [localPasscode, setLocalPasscode] = useState("");

  // Device-specific lock settings
  const [enableDeviceLock, setEnableDeviceLock] = useState(false);
  const [storedDevicePasscode, setStoredDevicePasscode] = useState<string | null>(null);

  // Status banners / popups
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check if user set a device-specific lock on this browser
    const savedLocalLock = localStorage.getItem("device_local_passcode");
    if (savedLocalLock) {
      setStoredDevicePasscode(savedLocalLock);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handle Registration
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userMobile || !partnerMobile || !regName) {
      alert("Please fill in all registration details!");
      return;
    }

    // Generate a 4-digit PIN shared between both users
    const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();
    const partnerRole = selectedRole === "dudu" ? "bubu" : "dudu";

    // Save couple session details locally (or to your backend database/Twilio API)
    const coupleData = {
      userMobile,
      partnerMobile,
      userName: regName,
      userRole: selectedRole,
      partnerRole,
      sharedPin: generatedPin,
    };
    localStorage.setItem("couple_session", JSON.stringify(coupleData));

    // Optional: Device-specific local passcode setup
    if (enableDeviceLock && localPasscode) {
      localStorage.setItem("device_local_passcode", localPasscode);
    }

    // Simulate SMS notification
    showToast(`Registration Successful! 4-digit PIN (${generatedPin}) sent to ${userMobile} and ${partnerMobile}.`);

    // Redirect to Welcome Page after 2 seconds
    setTimeout(() => {
      setLoginIdentifier(userMobile);
      setView("login");
    }, 2000);
  };

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Check device-specific lock if set on this device
    const deviceLock = localStorage.getItem("device_local_passcode");
    if (deviceLock && localPasscode !== deviceLock) {
      alert("Invalid Device Local Passcode! Please check your private device PIN.");
      return;
    }

    const savedCouple = localStorage.getItem("couple_session");
    if (savedCouple) {
      const data = JSON.parse(savedCouple);

      // Validate PIN against stored shared PIN or fallback "1234"
      if (loginPin === data.sharedPin || loginPin === "1234") {
        // Determine role based on which number logged in
        const isMainUser = loginIdentifier === data.userMobile;
        const activeRole = isMainUser ? data.userRole : data.partnerRole;
        
        localStorage.setItem("user_role", activeRole);
        onLoginSuccess(activeRole);
        return;
      }
    } else if (loginPin === "1234") {
      // Default fallback for initial testing
      localStorage.setItem("user_role", selectedRole);
      onLoginSuccess(selectedRole);
      return;
    }

    alert("Incorrect credentials or PIN! Try 1234 or your SMS PIN.");
  };

  // Handle Forgot PIN
  const handleForgotPin = () => {
    const savedCouple = localStorage.getItem("couple_session");
    if (savedCouple) {
      const data = JSON.parse(savedCouple);
      showToast(`A new PIN (${data.sharedPin}) has been re-sent to ${data.userMobile} and ${data.partnerMobile}.`);
    } else {
      showToast("A new PIN (1234) has been sent to your registered mobile number.");
    }
  };

  return (
    <div className="relative min-h-screen bg-pink-100 flex items-center justify-center p-4">
      <FloatingHearts />

      {/* Toast Alert Popup */}
      {toastMessage && (
        <div className="fixed top-6 z-50 bg-rose-500 text-white px-6 py-3 rounded-full shadow-2xl font-medium text-sm text-center max-w-xs transition animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Main Container Card */}
      <div className="relative z-10 bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl max-w-md w-full border border-pink-200">
        
        {/* ==================== VIEW 1: WELCOME / LOGIN SCREEN ==================== */}
        {view === "login" && (
          <div className="text-center">
            {/* Heart & Key Header Icon */}
            <div className="flex justify-center mb-2">
              <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center shadow-inner">
                <span className="text-4xl">🔑💖</span>
              </div>
            </div>

            <h1 className="text-3xl font-extrabold text-rose-500 mb-1">Welcome! 💖</h1>
            <p className="text-xs text-gray-500 mb-6">Login to continue your journey in the world of love 💕</p>

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-gray-400">👤</span>
                  <input
                    type="text"
                    placeholder="Enter your email or mobile number"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-rose-50/50 border border-pink-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-rose-400"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-gray-400">🔒</span>
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="Enter 4-digit Love PIN"
                    value={loginPin}
                    onChange={(e) => setLoginPin(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-rose-50/50 border border-pink-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-rose-400"
                    required
                  />
                </div>
              </div>

              {/* Device Specific Local Passcode Input if active */}
              {storedDevicePasscode && (
                <div>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-gray-400">📱</span>
                    <input
                      type="password"
                      placeholder="Device Local Passcode (Privacy)"
                      value={localPasscode}
                      onChange={(e) => setLocalPasscode(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-pink-50 border border-pink-300 rounded-full text-sm outline-none focus:ring-2 focus:ring-rose-400"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="text-right">
                <button
                  type="button"
                  onClick={handleForgotPin}
                  className="text-xs text-rose-500 hover:underline font-medium"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-full shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2"
              >
                <span>🔒</span> Unlock Love 💕
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-pink-100 text-xs text-gray-600">
              New here?{" "}
              <button
                onClick={() => setView("register")}
                className="text-rose-500 font-bold hover:underline"
              >
                Create an account
              </button>
            </div>

            {/* Bottom Bear Illustration Footer */}
            <div className="mt-4 flex justify-center gap-2 text-2xl">
              🐼🐻
            </div>
          </div>
        )}

        {/* ==================== VIEW 2: REGISTRATION SCREEN ==================== */}
        {view === "register" && (
          <div className="text-center">
            {/* Header Mascot Illustration */}
            <div className="flex justify-center mb-2">
              <span className="text-5xl">🐼🐻</span>
            </div>

            <h1 className="text-3xl font-bold text-rose-500 mb-1">Welcome! 💕</h1>
            <p className="text-xs text-gray-500 mb-4">
              Join the Dudu & Bubu world<br />
              <span className="font-semibold text-rose-400">Create your account</span>
            </p>

            <form onSubmit={handleRegister} className="space-y-3 text-left">
              <div className="bg-pink-50/60 p-4 rounded-2xl border border-pink-100 space-y-3">
                <h3 className="text-xs font-bold text-rose-500 text-center uppercase tracking-wider">
                  Registration Details
                </h3>

                {/* Name */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Enter your name</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-gray-400 text-sm">👤</span>
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-pink-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-rose-400"
                      required
                    />
                  </div>
                </div>

                {/* User Mobile */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Enter mobile number</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-gray-400 text-sm">📞</span>
                    <input
                      type="tel"
                      placeholder="Your Mobile Number"
                      value={userMobile}
                      onChange={(e) => setUserMobile(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-pink-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-rose-400"
                      required
                    />
                  </div>
                </div>

                {/* Partner Mobile */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Partner's mobile number</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-gray-400 text-sm">💖</span>
                    <input
                      type="tel"
                      placeholder="Partner Mobile Number"
                      value={partnerMobile}
                      onChange={(e) => setPartnerMobile(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-pink-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-rose-400"
                      required
                    />
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 text-center block mb-2">
                    Would you like to be Dudu or Bubu?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRole("dudu")}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition ${
                        selectedRole === "dudu"
                          ? "bg-rose-100 border-rose-500 ring-2 ring-rose-400"
                          : "bg-white border-pink-100 opacity-70"
                      }`}
                    >
                      <span className="text-2xl mb-1">🐻</span>
                      <span className="text-xs font-bold text-gray-700">Dudu</span>
                      <input
                        type="radio"
                        name="role"
                        checked={selectedRole === "dudu"}
                        readOnly
                        className="mt-1 accent-rose-500"
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedRole("bubu")}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition ${
                        selectedRole === "bubu"
                          ? "bg-rose-100 border-rose-500 ring-2 ring-rose-400"
                          : "bg-white border-pink-100 opacity-70"
                      }`}
                    >
                      <span className="text-2xl mb-1">🐼</span>
                      <span className="text-xs font-bold text-gray-700">Bubu</span>
                      <input
                        type="radio"
                        name="role"
                        checked={selectedRole === "bubu"}
                        readOnly
                        className="mt-1 accent-rose-500"
                      />
                    </button>
                  </div>
                </div>

                {/* Optional Privacy Device Lock Toggle */}
                <div className="pt-2 border-t border-pink-200">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 font-medium">
                    <input
                      type="checkbox"
                      checked={enableDeviceLock}
                      onChange={(e) => setEnableDeviceLock(e.target.checked)}
                      className="accent-rose-500 rounded"
                    />
                    Enable Device Local Passcode (Surprise Privacy)
                  </label>

                  {enableDeviceLock && (
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="Set 4-digit Local Passcode"
                      value={localPasscode}
                      onChange={(e) => setLocalPasscode(e.target.value)}
                      className="w-full mt-2 px-3 py-1.5 bg-white border border-pink-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-rose-400"
                    />
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-full shadow-lg transition transform active:scale-95 flex items-center justify-center gap-1"
              >
                <span>💗</span> Register
              </button>
            </form>

            <div className="mt-4 text-xs text-gray-600">
              Already registered?{" "}
              <button
                onClick={() => setView("login")}
                className="text-rose-500 font-bold hover:underline"
              >
                Unlock Love Directly
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}