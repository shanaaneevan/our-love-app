"use client";

import React, { useState, useEffect } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { auth } from "@/lib/firebase";
import FloatingHearts from "./FloatingHearts";

// Declare custom window properties for TypeScript
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier | null;
  }
}

interface AuthProps {
  onLoginSuccess: (userRole: "dudu" | "bubu") => void;
}

export default function AuthScreen({ onLoginSuccess }: AuthProps) {
  // Screen views: 'login' | 'register' | 'otp'
  const [view, setView] = useState<"login" | "register" | "otp">("login");

  // Registration form inputs
  const [regName, setRegName] = useState("");
  const [userMobile, setUserMobile] = useState("");
  const [partnerMobile, setPartnerMobile] = useState("");
  const [customPin, setCustomPin] = useState("");
  const [selectedRole, setSelectedRole] = useState<"dudu" | "bubu">("dudu");

  // Firebase SMS / OTP state
  const [otpCode, setOtpCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Login form inputs
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPin, setLoginPin] = useState("");

  // Status popups
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // Cleanup reCAPTCHA instance on unmount
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // 1. Initialize or safely reuse Firebase Invisible ReCAPTCHA
  const setupRecaptcha = () => {
    if (window.recaptchaVerifier) {
      return window.recaptchaVerifier;
    }

    const verifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved automatically
        },
        "expired-callback": () => {
          alert("reCAPTCHA expired. Please resend the SMS.");
          if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = null;
          }
        },
      }
    );

    window.recaptchaVerifier = verifier;
    return verifier;
  };

  // 2. Handle Registration & Trigger Firebase SMS
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userMobile || !partnerMobile || !regName || !customPin) {
      alert("Please fill in all registration details, including your Love PIN!");
      return;
    }

    if (!userMobile.startsWith("+")) {
      alert("Please include your country code for Firebase SMS (e.g., +11234567890 or +919876543210).");
      return;
    }

    setLoading(true);
    try {
      const appVerifier = setupRecaptcha();
      const result = await signInWithPhoneNumber(auth, userMobile, appVerifier);

      setConfirmationResult(result);

      // Save registration data locally, including the custom Love PIN
      const partnerRole = selectedRole === "dudu" ? "bubu" : "dudu";
      const coupleData = {
        userMobile,
        partnerMobile,
        userName: regName,
        userRole: selectedRole,
        partnerRole,
        sharedPin: customPin,
      };
      localStorage.setItem("couple_session", JSON.stringify(coupleData));

      showToast(`SMS Verification Code sent to ${userMobile}!`);
      setView("otp");
    } catch (error: any) {
      console.error("Firebase SMS Error:", error);
      alert(error.message || "Failed to send SMS code. Make sure phone number includes country code.");

      // Reset reCAPTCHA verifier on failure so retries work
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  // 3. Verify SMS OTP Code
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult || !otpCode) return;

    setLoading(true);
    try {
      await confirmationResult.confirm(otpCode);

      const savedCouple = localStorage.getItem("couple_session");
      let activeRole = selectedRole;
      if (savedCouple) {
        const data = JSON.parse(savedCouple);
        activeRole = data.userRole;
      }

      localStorage.setItem("user_role", activeRole);
      showToast("Phone number verified successfully! 💕");
      onLoginSuccess(activeRole);
    } catch (error) {
      console.error("OTP Verification Error:", error);
      alert("Invalid OTP code. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const savedCouple = localStorage.getItem("couple_session");
    if (savedCouple) {
      const data = JSON.parse(savedCouple);
      if (loginPin === "1234" || loginPin === data.sharedPin) {
        const isMainUser = loginIdentifier === data.userMobile;
        const activeRole = isMainUser ? data.userRole : data.partnerRole;

        localStorage.setItem("user_role", activeRole);
        onLoginSuccess(activeRole);
        return;
      }
    } else if (loginPin === "1234") {
      localStorage.setItem("user_role", selectedRole);
      onLoginSuccess(selectedRole);
      return;
    }

    alert("Incorrect credentials or PIN! Try 1234 or your registered PIN.");
  };

  return (
    <div className="relative min-h-screen bg-pink-100 flex items-center justify-center p-4">
      <FloatingHearts />

      {/* Required Firebase reCAPTCHA Container */}
      <div id="recaptcha-container"></div>

      {toastMessage && (
        <div className="fixed top-6 z-50 bg-rose-500 text-white px-6 py-3 rounded-full shadow-2xl font-medium text-xs sm:text-sm text-center max-w-sm transition animate-bounce">
          {toastMessage}
        </div>
      )}

      <div className="relative z-10 bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl max-w-md w-full border border-pink-200">

        {/* VIEW 1: LOGIN SCREEN */}
        {view === "login" && (
          <div className="text-center">
            <div className="flex justify-center mb-3">
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
                    placeholder="Enter Love PIN"
                    value={loginPin}
                    onChange={(e) => setLoginPin(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-rose-50/50 border border-pink-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-rose-400"
                    required
                  />
                </div>
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
          </div>
        )}

        {/* VIEW 2: REGISTRATION SCREEN */}
        {view === "register" && (
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <span className="text-5xl">🐼🐻</span>
            </div>

            <h1 className="text-3xl font-bold text-rose-500 mb-1">Welcome! 💕</h1>
            <p className="text-xs text-gray-500 mb-4">Create your account</p>

            <form onSubmit={handleRegister} className="space-y-3 text-left">
              <div className="bg-pink-50/60 p-4 rounded-2xl border border-pink-100 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Your Name</label>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-pink-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-rose-400"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Your Mobile Number (with Country Code)</label>
                  <input
                    type="tel"
                    placeholder="+11234567890"
                    value={userMobile}
                    onChange={(e) => setUserMobile(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-pink-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-rose-400"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Partner Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="+10987654321"
                    value={partnerMobile}
                    onChange={(e) => setPartnerMobile(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-pink-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-rose-400"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Set Your Love PIN (4-6 Digits)</label>
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="e.g. 5678"
                    value={customPin}
                    onChange={(e) => setCustomPin(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-pink-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-rose-400"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 text-center block mb-2">
                    Select Your Character
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRole("dudu")}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition ${
                        selectedRole === "dudu" ? "bg-rose-100 border-rose-500 ring-2 ring-rose-400" : "bg-white border-pink-100 opacity-70"
                      }`}
                    >
                      <span className="text-2xl mb-1">🐻</span>
                      <span className="text-xs font-bold text-gray-700">Dudu</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedRole("bubu")}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition ${
                        selectedRole === "bubu" ? "bg-rose-100 border-rose-500 ring-2 ring-rose-400" : "bg-white border-pink-100 opacity-70"
                      }`}
                    >
                      <span className="text-2xl mb-1">🐼</span>
                      <span className="text-xs font-bold text-gray-700">Bubu</span>
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-full shadow-lg transition transform active:scale-95 flex items-center justify-center gap-1"
              >
                <span>💗</span> {loading ? "Sending SMS..." : "Send Verification SMS"}
              </button>
            </form>
          </div>
        )}

        {/* VIEW 3: OTP VERIFICATION SCREEN */}
        {view === "otp" && (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-rose-500 mb-1">Enter Verification Code 💬</h1>
            <p className="text-xs text-gray-500 mb-4">We sent an SMS OTP to {userMobile}</p>

            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <input
                type="text"
                placeholder="Enter 6-Digit Code"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full p-3 border border-pink-300 rounded-xl text-center text-xl tracking-widest text-gray-700 outline-none focus:ring-2 focus:ring-rose-400"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-full shadow-lg transition transform active:scale-95"
              >
                {loading ? "Verifying..." : "Verify OTP & Connect 💕"}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}