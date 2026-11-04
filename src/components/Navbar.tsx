import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { sound } from '../utils/soundEffects.ts';
import { ShoppingBag, User as UserIcon, Shield, Terminal, LogOut, Sparkles, Gift, Volume2, VolumeX, HelpCircle } from 'lucide-react';

interface NavbarProps {
  currentView: 'products' | 'profile' | 'admin' | 'api-tester' | 'orders';
  setCurrentView: (view: 'products' | 'profile' | 'admin' | 'api-tester' | 'orders') => void;
  openAuthModal: (mode: 'login' | 'register') => void;
  openScratchCard: () => void;
  openWelcomeModal: () => void;
  customCursorEnabled: boolean;
  setCustomCursorEnabled: (enabled: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  openAuthModal,
  openScratchCard,
  openWelcomeModal,
  customCursorEnabled,
  setCustomCursorEnabled,
  soundEnabled,
  setSoundEnabled,
}) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems, setIsCartOpen, recentAddedId } = useCart();

  const handleNav = (view: 'products' | 'profile' | 'admin' | 'api-tester' | 'orders') => {
    sound.playClick();
    setCurrentView(view);
  };

  const handleToggleSound = () => {
    const next = sound.toggleSound();
    setSoundEnabled(next);
    if (next) sound.playClick();
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/75 border-b border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        
        {/* Zone 1: Brand Wordmark with periodic subtle glow & Mascot Avatar */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNav('products')}
            className="group flex items-center gap-2.5 text-lg sm:text-xl font-bold tracking-tight text-white hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-white/20 shadow-md group-hover:shadow-[0_0_15px_#818cf8] transition-all">
              <img
                src="/src/assets/images/lumina_luxe_3d_logo_1793541903724.jpg"
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-display">Lumina Luxe</span>
          </button>

          {/* Welcome Mascot Trigger */}
          <button
            onClick={() => {
              sound.playSuccess();
              openWelcomeModal();
            }}
            title="Lumi Welcome Reception & Guide"
            className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 text-xs transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px]">Lumi Bot</span>
          </button>
        </div>

        {/* Zone 2: Single-Line Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => handleNav('products')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 border-b-2 ${
              currentView === 'products'
                ? 'text-white border-indigo-400'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            Catalog
          </button>

          <button
            onClick={() => handleNav('profile')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 border-b-2 ${
              currentView === 'profile'
                ? 'text-white border-indigo-400'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            User Profile (REST)
          </button>

          <button
            onClick={() => handleNav('orders')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 border-b-2 ${
              currentView === 'orders'
                ? 'text-white border-indigo-400'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            My Orders
          </button>

          <button
            onClick={() => handleNav('admin')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 pb-0.5 border-b-2 ${
              currentView === 'admin'
                ? 'text-amber-300 border-amber-400'
                : 'text-slate-400 border-transparent hover:text-amber-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
          </button>

          <button
            onClick={() => handleNav('api-tester')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 pb-0.5 border-b-2 ${
              currentView === 'api-tester'
                ? 'text-cyan-300 border-cyan-400'
                : 'text-slate-400 border-transparent hover:text-cyan-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>REST API Tester</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action & Interactive Widgets */}
        <div className="flex items-center gap-2.5 shrink-0">
          {!isAuthenticated ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => openAuthModal('login')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white rounded-xl border border-white/15 bg-white/5 hover:bg-white/10"
              >
                Sign in
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="px-3 py-1.5 text-xs font-semibold text-white rounded-xl bg-indigo-600 hover:bg-indigo-500"
              >
                Create account
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs text-slate-300">{user?.username}</span>
              <button
                onClick={logout}
                className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {/* Zepto Scratch & Win Rewards Button */}
          <button
            onClick={() => {
              sound.playClick();
              openScratchCard();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 hover:from-amber-500/30 hover:to-yellow-500/20 border border-amber-400/40 text-amber-300 text-xs font-semibold shadow-sm transition-all cursor-pointer animate-pulse"
            title="Zepto Scratch Card - Win Up to 50% Off!"
          >
            <Gift className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scratch Card</span>
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={handleToggleSound}
            title={soundEnabled ? "Mute Sound Effects" : "Enable Sound Effects"}
            className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Custom Cursor Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              setCustomCursorEnabled(!customCursorEnabled);
            }}
            title={customCursorEnabled ? "Holographic Kinetic Cursor Active" : "Default OS Cursor Active"}
            className="hidden lg:flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer font-mono"
          >
            <Sparkles className={`w-3.5 h-3.5 ${customCursorEnabled ? 'text-indigo-400' : 'text-slate-500'}`} />
            <span>{customCursorEnabled ? 'Kinetic' : 'OS'}</span>
          </button>

          {/* Cart Trigger */}
          <button
            onClick={() => {
              sound.playWhoosh();
              setIsCartOpen(true);
            }}
            className={`relative p-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white transition-all cursor-pointer flex items-center gap-2 ${
              recentAddedId ? 'scale-105 border-indigo-400 bg-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.5)]' : ''
            }`}
            title="Open Shopping Cart"
          >
            <ShoppingBag className="w-4.5 h-4.5" />
            <span className="text-xs font-semibold tabular-nums px-1.5 py-0.5 rounded-full bg-indigo-500 text-white min-w-5 text-center font-mono">
              {totalItems}
            </span>
          </button>

        </div>

      </div>
    </header>
  );
};
