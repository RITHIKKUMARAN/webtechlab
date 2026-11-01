import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { X, Lock, Mail, User as UserIcon, Calendar, CheckCircle2, AlertCircle, Shield } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccessRedirect?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccessRedirect,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const { login, register } = useAuth();

  // Form states
  const [username, setUsername] = useState('');
  const [emailId, setEmailId] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [password, setPassword] = useState('');
  const [isAdminRole, setIsAdminRole] = useState(false);

  // Status & feedback
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setUsername('');
    setEmailId('');
    setAge('');
    setPassword('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!emailId || !password) {
      setErrorMessage('Please provide both email ID and password.');
      return;
    }

    setLoading(true);
    const result = await login(emailId, password);
    setLoading(false);

    if (result.success) {
      setSuccessMessage(result.message);
      setTimeout(() => {
        onClose();
        resetForm();
        if (onSuccessRedirect) onSuccessRedirect();
      }, 1000);
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!username || !emailId || age === '' || !password) {
      setErrorMessage('All fields (username, email ID, age, and password) are required.');
      return;
    }

    setLoading(true);
    const result = await register({
      username: username.trim(),
      emailId: emailId.trim(),
      age: Number(age),
      password,
      role: isAdminRole ? 'admin' : 'user',
    });
    setLoading(false);

    if (result.success) {
      setSuccessMessage(result.message);
      // As per PDF: After successful registration, display a message containing the registered username
      // e.g. "Successfully registered! Welcome, Raghavendra."
      setTimeout(() => {
        onClose();
        resetForm();
        if (onSuccessRedirect) onSuccessRedirect();
      }, 1600);
    } else {
      setErrorMessage(result.message);
    }
  };

  // Quick fill helper for evaluation & testing
  const quickFill = (role: 'user' | 'admin') => {
    if (role === 'user') {
      setEmailId('user@example.com');
      setPassword('user123');
      setUsername('Raghavendra');
      setAge(24);
      setIsAdminRole(false);
    } else {
      setEmailId('admin@shop.com');
      setPassword('admin123');
      setUsername('Administrator');
      setAge(32);
      setIsAdminRole(true);
    }
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md p-6 rounded-2xl glass-panel border border-white/20 shadow-2xl transition-all">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header & Mode Switcher */}
        <div className="mb-6">
          <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/10 mb-4">
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In (Page 2)
            </button>
            <button
              onClick={() => switchMode('register')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register (Page 1)
            </button>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white">
            {mode === 'login' ? 'User Login' : 'User Registration'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login'
              ? 'Validate credentials against the Users MongoDB collection.'
              : 'Register details into the Users collection with REST validation.'}
          </p>
        </div>

        {/* Feedback Notifications */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="font-medium">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <div className="font-medium">{successMessage}</div>
          </div>
        )}

        {/* PAGE 1: User Registration Form */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Raghavendra"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm text-white glass-input rounded-xl focus:outline-none placeholder:text-slate-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email ID (Unique)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={emailId}
                  onChange={(e) => setEmailId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm text-white glass-input rounded-xl focus:outline-none placeholder:text-slate-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Age</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    min="1"
                    max="120"
                    placeholder="24"
                    value={age}
                    onChange={(e) => setAge(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    className="w-full pl-9 pr-3 py-2 text-sm text-white glass-input rounded-xl focus:outline-none placeholder:text-slate-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm text-white glass-input rounded-xl focus:outline-none placeholder:text-slate-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Optional Role Assignment */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="adminRoleCheck"
                checked={isAdminRole}
                onChange={(e) => setIsAdminRole(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="adminRoleCheck" className="text-xs text-slate-300 flex items-center gap-1 cursor-pointer">
                <Shield className="w-3 h-3 text-amber-400" />
                <span>Register with Administrator privileges</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register Account (POST /api/users)'}
            </button>
          </form>
        )}

        {/* PAGE 2: User Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email ID</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={emailId}
                  onChange={(e) => setEmailId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm text-white glass-input rounded-xl focus:outline-none placeholder:text-slate-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm text-white glass-input rounded-xl focus:outline-none placeholder:text-slate-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In (POST /api/login)'}
            </button>
          </form>
        )}

        {/* Quick Testing helper buttons for Lab evaluation */}
        <div className="mt-5 pt-4 border-t border-white/10">
          <p className="text-[11px] text-slate-400 mb-2">Quick credentials for instant testing:</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => quickFill('user')}
              className="flex-1 text-xs py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer text-center"
            >
              Raghavendra (User)
            </button>
            <button
              type="button"
              onClick={() => quickFill('admin')}
              className="flex-1 text-xs py-1.5 px-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-200 hover:text-amber-100 transition-colors cursor-pointer text-center"
            >
              Admin Account
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
