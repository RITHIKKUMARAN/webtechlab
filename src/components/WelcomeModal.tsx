import React, { useState, useEffect } from 'react';
import { sound } from '../utils/soundEffects.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { ShoppingBag, Shield, ArrowRight, X } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose, onComplete }) => {
  const { login } = useAuth();
  const [step, setStep] = useState<'welcome' | 'user-login' | 'admin-login'>('welcome');
  const [emailId, setEmailId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [welcomeTextIndex, setWelcomeTextIndex] = useState(0);

  const welcomeMessages = [
    "Welcome to Northstar Supply. Your considered shopping desk is ready.",
    "Experience fluid glassmorphism, instant drag-and-drop checkout, and live rewards!",
    "Select your preferred entry portal below to step inside."
  ];

  useEffect(() => {
    if (isOpen) {
      sound.playSuccess();
      const timer = setInterval(() => {
        setWelcomeTextIndex((prev) => (prev + 1) % welcomeMessages.length);
      }, 3500);
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  const selectUserFlow = () => {
    sound.playClick();
    setEmailId('');
    setPassword('');
    setStep('user-login');
  };

  const selectAdminFlow = () => {
    sound.playClick();
    setEmailId('');
    setPassword('');
    setStep('admin-login');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setErrorMsg(null);
    setLoading(true);

    const result = await login(emailId, password);
    setLoading(false);

    if (result.success) {
      sound.playSuccess();
      setTimeout(() => {
        onComplete();
        onClose();
      }, 500);
    } else {
      setErrorMsg(result.message || 'Authentication error.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl rounded-3xl glass-panel border border-white/20 p-6 sm:p-8 shadow-[0_0_60px_rgba(99,102,241,0.25)] overflow-hidden">
        
        {/* Periodic Glowing Background Orbs */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-cyan-500/25 rounded-full blur-3xl pointer-events-none animate-pulse" />

        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP 1: WELCOMING RECEPTION */}
        {step === 'welcome' && (
          <div className="space-y-6 text-center">
            
            {/* Restrained text-only brand lockup */}
            <div className="pt-2">
              <p className="text-[11px] font-bold tracking-[0.28em] uppercase text-indigo-300">
                Northstar Supply
              </p>
              <div className="w-16 h-px bg-indigo-400/70 mx-auto mt-3" />
            </div>

            {/* Welcoming Speech Bubble */}
            <div className="max-w-md mx-auto p-4 rounded-2xl bg-white/5 border border-white/15 backdrop-blur-md relative">
              <div className="flex items-center justify-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-1">
                <span>Personal Concierge</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display text-balance">
                Welcome to Northstar Supply
              </h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed transition-all duration-300">
                {welcomeMessages[welcomeTextIndex]}
              </p>
            </div>

            {/* Selection Options: User vs Admin */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto pt-2">
              
              {/* Option A: Customer / User Portal */}
              <div
                onClick={selectUserFlow}
                className="group relative p-5 rounded-2xl glass-panel-interactive border border-indigo-500/30 hover:border-indigo-400 cursor-pointer text-left transition-all hover:scale-[1.02]"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white flex items-center justify-between">
                  <span>Enter as User</span>
                  <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Explore the catalog, apply store rewards, and manage your profile.
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    selectUserFlow();
                  }}
                  className="mt-3 text-[10px] font-bold text-indigo-300 hover:text-white uppercase font-mono tracking-wider"
                >
                  Sign in with your account →
                </button>
              </div>

              {/* Option B: Administrator Portal */}
              <div
                onClick={selectAdminFlow}
                className="group relative p-5 rounded-2xl glass-panel-interactive border border-amber-500/30 hover:border-amber-400 cursor-pointer text-left transition-all hover:scale-[1.02]"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white flex items-center justify-between">
                  <span>Enter as Admin</span>
                  <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Manage inventory, add/edit products, inspect registered users, and track order telemetry.
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    selectAdminFlow();
                  }}
                  className="mt-3 text-[10px] font-bold text-amber-300 hover:text-white uppercase font-mono tracking-wider"
                >
                  Sign in with your administrator account →
                </button>
              </div>

            </div>

          </div>
        )}

        {/* STEP 2: USER LOGIN SCREEN */}
        {step === 'user-login' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <button
                onClick={() => {
                  sound.playClick();
                  setStep('welcome');
                }}
                className="text-xs text-slate-400 hover:text-white"
              >
                ← Back
              </button>
              <div className="flex-1 text-center">
                <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-indigo-400" />
                  <span>Customer Login (Page 2)</span>
                </h3>
                <p className="text-xs text-slate-400">Exercise-8 MERN Stack Login Validation</p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-3.5 max-w-md mx-auto">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email ID</label>
                <input
                  type="email"
                  value={emailId}
                  onChange={(e) => setEmailId(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-white glass-input rounded-xl focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-white glass-input rounded-xl focus:outline-none"
                  required
                />
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/30 transition-all cursor-pointer"
                >
                  {loading ? 'Authenticating...' : 'Sign In & Access Catalog'}
                </button>

              </div>
            </form>
          </div>
        )}

        {/* STEP 2: ADMIN LOGIN SCREEN */}
        {step === 'admin-login' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <button
                onClick={() => {
                  sound.playClick();
                  setStep('welcome');
                }}
                className="text-xs text-slate-400 hover:text-white"
              >
                ← Back
              </button>
              <div className="flex-1 text-center">
                <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
                  <Shield className="w-5 h-5 text-amber-400" />
                  <span>Administrator Authentication</span>
                </h3>
                <p className="text-xs text-slate-400">Elevated privileges for catalog and user control</p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-3.5 max-w-md mx-auto">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Admin Email ID</label>
                <input
                  type="email"
                  value={emailId}
                  onChange={(e) => setEmailId(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-white glass-input rounded-xl focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Master Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-white glass-input rounded-xl focus:outline-none"
                  required
                />
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg shadow-amber-500/30 transition-all cursor-pointer font-bold"
                >
                  {loading ? 'Verifying Admin...' : 'Unlock Admin Portal'}
                </button>

              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
