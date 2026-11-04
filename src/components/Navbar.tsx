import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { sound } from '../utils/soundEffects.ts';
import { ShoppingBag, Shield, Terminal, LogOut, Gift, Volume2, VolumeX, Compass } from 'lucide-react';

interface NavbarProps {
  currentView: 'products' | 'profile' | 'admin' | 'api-tester' | 'orders';
  setCurrentView: (view: 'products' | 'profile' | 'admin' | 'api-tester' | 'orders') => void;
  openAuthModal: (mode: 'login' | 'register') => void;
  openScratchCard: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  openAuthModal,
  openScratchCard,
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
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        
        {/* Zone 1: Brand Wordmark with periodic subtle glow & Mascot Avatar */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNav('products')}
            className="group flex items-center gap-2.5 text-lg sm:text-xl font-bold tracking-tight text-slate-950 hover:text-indigo-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-950 text-indigo-300 shadow-sm group-hover:bg-indigo-700 group-hover:text-white transition-colors">
              <Compass className="w-5 h-5" strokeWidth={2.2} />
            </div>
            <span className="font-display">Northstar Supply</span>
          </button>

        </div>

        {/* Zone 2: Single-Line Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => handleNav('products')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 border-b-2 ${
              currentView === 'products'
                ? 'text-indigo-700 border-indigo-600'
                : 'text-slate-600 border-transparent hover:text-slate-950'
            }`}
          >
            Shop
          </button>

          <button
            onClick={() => handleNav('profile')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 border-b-2 ${
              currentView === 'profile'
                ? 'text-indigo-700 border-indigo-600'
                : 'text-slate-600 border-transparent hover:text-slate-950'
            }`}
          >
            Account
          </button>

          <button
            onClick={() => handleNav('orders')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 border-b-2 ${
              currentView === 'orders'
                ? 'text-indigo-700 border-indigo-600'
                : 'text-slate-600 border-transparent hover:text-slate-950'
            }`}
          >
            Orders
          </button>

          <button
            onClick={() => handleNav('admin')}
            className={`utility-nav transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 pb-0.5 border-b-2 ${
              currentView === 'admin'
                ? 'text-amber-700 border-amber-600'
                : 'text-slate-600 border-transparent hover:text-amber-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin dashboard</span>
          </button>

          <button
            onClick={() => handleNav('api-tester')}
            className={`utility-nav transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 pb-0.5 border-b-2 ${
              currentView === 'api-tester'
                ? 'text-cyan-700 border-cyan-600'
                : 'text-slate-600 border-transparent hover:text-cyan-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>API console</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action & Interactive Widgets */}
        <div className="flex items-center gap-2.5 shrink-0">
          {!isAuthenticated ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => openAuthModal('login')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 rounded-xl border border-slate-300 bg-white hover:bg-slate-50"
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
              <span className="hidden sm:inline text-xs text-slate-700">{user?.username}</span>
              <button
                onClick={logout}
                className="p-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-950"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {/* Store offer */}
          <button
            onClick={() => {
              sound.playClick();
              openScratchCard();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 text-xs font-semibold shadow-sm transition-all cursor-pointer"
            title="Open the store offer"
          >
            <Gift className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Offers</span>
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={handleToggleSound}
            title={soundEnabled ? "Mute Sound Effects" : "Enable Sound Effects"}
            className="p-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-950 transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Cart Trigger */}
          <button
            onClick={() => {
              sound.playWhoosh();
              setIsCartOpen(true);
            }}
            className={`relative p-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950 transition-all cursor-pointer flex items-center gap-2 ${
              recentAddedId ? 'scale-105 border-indigo-500 bg-indigo-50 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : ''
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
