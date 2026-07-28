import React, { useState } from "react";
import { X, Lock, Mail, User as UserIcon } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (
    email: string,
    name: string,
    role: "CUSTOMER" | "ADMIN",
    password: string,
    isLogin: boolean
  ) => Promise<void>;
}

export default function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"CUSTOMER" | "ADMIN">("CUSTOMER");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill out all required fields.");
      return;
    }
    setError("");
    try {
      await onLogin(email, name || email.split("@")[0], role, password, isLogin);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200" id="auth-modal-card">
        <button onClick={onClose} className="absolute top-4 right-4 rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-950 transition-colors">
          <X className="h-5 w-5" />
        </button>
        <div className="text-center">
          <h2 className="text-xl font-extrabold text-zinc-950">
            {isLogin ? "Sign In to AuraStore" : "Create Developer Account"}
          </h2>
          <p className="mt-1.5 text-xs text-zinc-500">
            {isLogin ? "Access catalog management and secure checkout" : "Sign up to explore the microservices pipeline"}
          </p>
        </div>
        {error && <div className="mb-4 text-xs font-semibold text-red-600 bg-red-50 p-2 rounded-lg">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-zinc-700">Full Name</label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                  <UserIcon className="h-4 w-4" />
                </span>
                <input type="text" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-zinc-200 py-2 pl-9 pr-4 text-sm text-zinc-900 focus:border-zinc-950 focus:outline-none" />
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-zinc-700">Email Address</label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                <Mail className="h-4 w-4" />
              </span>
              <input type="email" required placeholder="customer@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-zinc-200 py-2 pl-9 pr-4 text-sm text-zinc-900 focus:border-zinc-950 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-700">Password</label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                <Lock className="h-4 w-4" />
              </span>
              <input type="password" placeholder="password123" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-zinc-200 py-2 pl-9 pr-4 text-sm text-zinc-900 focus:border-zinc-950 focus:outline-none" />
            </div>
          </div>
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-zinc-700">Account Access Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value as "CUSTOMER" | "ADMIN")} className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-950 focus:outline-none bg-white">
                <option value="CUSTOMER">Customer (Browse/Order)</option>
                <option value="ADMIN">Administrator (Full DB Access)</option>
              </select>
            </div>
          )}
          <button type="submit" className="w-full rounded-lg bg-zinc-950 py-2.5 text-sm font-bold text-white hover:bg-zinc-800 transition-colors shadow-md">
            {isLogin ? "Sign In" : "Register Account"}
          </button>
        </form>
        <div className="mt-4 text-center text-xs">
          <button onClick={() => { setIsLogin(!isLogin); setError(""); }} className="font-semibold text-zinc-600 hover:text-zinc-950 hover:underline">
            {isLogin ? "Need an account? Register instead" : "Already registered? Sign in instead"}
          </button>
        </div>
          </div>
    </div>
  );
}
