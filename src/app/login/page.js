"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  function handleSubmit(e) {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Both fields are required.");
      return;
    }

    setError("");
    setLoading(true);

    // Mock auth — any non-empty credentials succeed after a brief delay
    setTimeout(() => {
      login();
      router.push("/");
    }, 600);
  }

  const inputCls =
    "w-full border border-[#E3E5EA] rounded-lg px-3.5 py-2.5 text-sm text-[#171A21] bg-white " +
    "placeholder:text-[#6B7280] focus:outline-none focus:border-[#0E7C66] transition-colors";

  return (
    <div className="min-h-screen bg-[#F5F6F8] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[400px] bg-white border border-[#E3E5EA] rounded-xl px-8 py-9 flex flex-col gap-6"
      >
        {/* Wordmark */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[#171A21] font-semibold text-xl tracking-tight">
            CVFrame<span className="text-[#0E7C66]">IQ</span>
          </span>
          <p className="text-sm text-[#6B7280]">Sign in to continue</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#6B7280]">Work email</label>
            <input
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              className={inputCls}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#6B7280]">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                className={`${inputCls} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#171A21] transition-colors"
                tabIndex={-1}
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff size={15} strokeWidth={1.8} /> : <Eye size={15} strokeWidth={1.8} />}
              </button>
            </div>
          </div>

          {/* Inline error */}
          {error && (
            <p className="text-xs text-[#B3413A]">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-1 py-2.5 rounded-lg text-sm font-medium text-white transition-colors
              ${loading
                ? "bg-[#0E7C66]/60 cursor-not-allowed"
                : "bg-[#0E7C66] hover:bg-[#0a6354] active:bg-[#085a4a]"
              }`}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {/* Footer note */}
        <p className="text-center text-xs text-[#6B7280]">
          Contact your admin if you don't have access.
        </p>
      </motion.div>
    </div>
  );
}
