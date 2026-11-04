import React, { useRef, useEffect, useState } from 'react';
import { sound } from '../utils/soundEffects.ts';
import { useCart } from '../context/CartContext.tsx';
import { Check, RefreshCw, X, ArrowRight } from 'lucide-react';

interface ZeptoScratchCardProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyReward?: (code: string) => void;
}

interface Reward {
  code: string;
  discountValue: string;
  headline: string;
  subtext: string;
}

const REWARDS_POOL: Reward[] = [
  {
    code: 'LUMINA50',
    discountValue: '50% OFF',
    headline: 'JACKPOT! Flat 50% Off Everything',
    subtext: 'Special VIP discount code unlocked for your entire shopping bag.'
  },
  {
    code: 'LUMINA20',
    discountValue: '20% OFF',
    headline: 'You Won 20% Instant Discount!',
    subtext: 'Valid on all audio hardware, keyboards, and premium accessories.'
  },
  {
    code: 'MERNSTACK',
    discountValue: '15% OFF',
    headline: 'Developer Exclusive: 15% Off',
    subtext: 'Applied straight to your checkout total.'
  }
];

export const ZeptoScratchCard: React.FC<ZeptoScratchCardProps> = ({ isOpen, onClose, onApplyReward }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isScratched, setIsScratched] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);
  const [copied, setCopied] = useState(false);
  const [reward, setReward] = useState<Reward>(REWARDS_POOL[0]);
  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const lastSoundTime = useRef(0);
  const { applyCoupon } = useCart();

  // Pick random reward on open
  useEffect(() => {
    if (isOpen) {
      const random = REWARDS_POOL[Math.floor(Math.random() * REWARDS_POOL.length)];
      setReward(random);
      setIsScratched(false);
      setScratchPercent(0);
      setCopied(false);
      setTimeout(() => initCanvas(), 50);
    }
  }, [isOpen]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = canvas.offsetWidth);
    const height = (canvas.height = canvas.offsetHeight);

    // Fill with metallic silver-indigo holographic gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#94a3b8');
    grad.addColorStop(0.3, '#cbd5e1');
    grad.addColorStop(0.6, '#64748b');
    grad.addColorStop(1, '#475569');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle foil grain
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    for (let i = 0; i < 70; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = Math.random() * 2 + 1;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Patterned text
    ctx.save();
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 15px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SCRATCH WITH MOUSE OR TOUCH', width / 2, height / 2 - 12);

    ctx.font = '12px JetBrains Mono, monospace';
    ctx.fillStyle = '#334155';
    ctx.fillText('Lumina Offer · Save on Your Order', width / 2, height / 2 + 14);
    ctx.restore();
  };

  const scratch = (clientX: number, clientY: number) => {
    if (isScratched) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    const point = { x, y };
    const previous = lastPoint.current ?? point;
    const distance = Math.hypot(point.x - previous.x, point.y - previous.y);
    const steps = Math.max(1, Math.ceil(distance / 12));
    const brushRadius = 36;

    // Fill the gaps between pointer events so each drag feels continuous.
    for (let step = 0; step <= steps; step += 1) {
      const progress = step / steps;
      const brushX = previous.x + (point.x - previous.x) * progress;
      const brushY = previous.y + (point.y - previous.y) * progress;
      ctx.beginPath();
      ctx.arc(brushX, brushY, brushRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    lastPoint.current = point;

    // Sound effect with throttle
    const now = performance.now();
    if (now - lastSoundTime.current > 70) {
      sound.playScratch();
      lastSoundTime.current = now;
    }

    checkScratchPercentage();
  };

  const checkScratchPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Sample pixels across grid for performance
    const width = canvas.width;
    const height = canvas.height;
    const step = 8;
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    let transparentPixels = 0;
    let totalSamples = 0;

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const index = (y * width + x) * 4;
        totalSamples++;
        if (data[index + 3] < 250) {
          transparentPixels++;
        }
      }
    }

    const percent = Math.round((transparentPixels / totalSamples) * 100);
    setScratchPercent(percent);

    if (percent >= 32 && !isScratched) {
      setIsScratched(true);
      sound.playTada();
      // Auto clear rest for clean reveal
      ctx.clearRect(0, 0, width, height);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDrawing.current = true;
    lastPoint.current = null;
    scratch(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing.current) return;
    scratch(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    lastPoint.current = null;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    isDrawing.current = true;
    lastPoint.current = null;
    if (e.touches[0]) {
      scratch(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDrawing.current) return;
    if (e.touches[0]) {
      scratch(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleApply = () => {
    sound.playSuccess();
    applyCoupon(reward.code);
    if (onApplyReward) onApplyReward(reward.code);
    setCopied(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl glass-panel border border-white/25 p-6 shadow-2xl text-center overflow-hidden">
        
        {/* Glow halo */}
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-4">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-indigo-500/20 border border-amber-400/30 text-amber-300 text-[10px] font-bold tracking-[0.16em] uppercase mb-2">
            <span>Northstar store offer</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Claim Your Surprise Gift</h3>
          <p className="text-xs text-slate-400 mt-0.5">Scratch the silver foil below to unveil your reward.</p>
        </div>

        {/* Scratch Card Interactive Box */}
        <div
          data-scratch-card="true"
          className="relative w-full h-56 rounded-2xl overflow-hidden border-2 border-amber-400/30 shadow-inner bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 cursor-crosshair select-none"
          style={{ touchAction: 'none' }}
        >
          {/* Revealed Reward Layer (Underneath Canvas) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 mb-2 shadow-[0_0_20px_rgba(251,191,36,0.4)]">
              <span className="text-[11px] font-black tracking-[0.16em]">SAVE</span>
            </div>

            <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 font-display">
              {reward.discountValue}
            </span>

            <p className="text-xs font-bold text-white mt-1">{reward.headline}</p>

            <div className="mt-3 px-3 py-1.5 rounded-xl bg-black/50 border border-amber-400/30 flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">CODE:</span>
              <span className="text-sm font-mono font-bold text-amber-300 tracking-wider">
                {reward.code}
              </span>
            </div>
          </div>

          {/* HTML5 Canvas Foil Mask (Top Layer that gets scratched) */}
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${
              isScratched ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          />
        </div>

        {/* Progress or Actions */}
        <div className="mt-4">
          {!isScratched ? (
            <div className="space-y-1.5">
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-amber-400 h-full transition-all duration-150"
                  style={{ width: `${Math.min(100, (scratchPercent / 32) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {scratchPercent < 32 ? `Scratched: ${scratchPercent}% (Reach 32% to reveal)` : 'Revealing reward...'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 animate-in zoom-in-95 duration-200">
              <button
                onClick={handleApply}
                className="w-full py-2.5 px-4 text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer font-bold"
              >
                {copied ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                <span>{copied ? 'Applied to Cart!' : `Apply ${reward.code} to Cart Now`}</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  const nextReward = REWARDS_POOL[Math.floor(Math.random() * REWARDS_POOL.length)];
                  setReward(nextReward);
                  setIsScratched(false);
                  setScratchPercent(0);
                  setTimeout(() => initCanvas(), 50);
                }}
                className="text-[11px] text-slate-400 hover:text-white flex items-center justify-center gap-1 mx-auto pt-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Scratch Another Card</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
