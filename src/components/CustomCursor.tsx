import React, { useEffect, useState, useRef } from 'react';
import { useCart } from '../context/CartContext.tsx';

export type CursorContext = 'default' | 'pointer' | 'drag-source' | 'dragging' | 'drop-zone' | 'scratch';

interface CustomCursorProps {
  enabled: boolean;
  theme?: 'indigo' | 'cyan' | 'emerald' | 'gold';
}

export const CustomCursor: React.FC<CustomCursorProps> = ({ enabled, theme = 'indigo' }) => {
  const [coords, setCoords] = useState({ x: -100, y: -100 });
  const [trail, setTrail] = useState({ x: -100, y: -100, scaleX: 1, scaleY: 1, angle: 0 });
  const [cursorMode, setCursorMode] = useState<CursorContext>('default');
  const [isVisible, setIsVisible] = useState(false);
  const { isDraggingProduct } = useCart();

  const posRef = useRef({ x: -100, y: -100, vx: 0, vy: 0 });
  const trailRef = useRef({ x: -100, y: -100 });

  useEffect(() => {
    if (!enabled) return;

    let animId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const prevX = posRef.current.x;
      const prevY = posRef.current.y;
      posRef.current.x = e.clientX;
      posRef.current.y = e.clientY;
      posRef.current.vx = e.clientX - prevX;
      posRef.current.vy = e.clientY - prevY;

      setCoords({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (!target) return;

      if (isDraggingProduct) {
        if (target.closest('[data-drop-zone="true"]')) {
          setCursorMode('drop-zone');
        } else {
          setCursorMode('dragging');
        }
        return;
      }

      // Check context
      if (target.closest('[data-scratch-card="true"]') || target.closest('canvas')) {
        setCursorMode('scratch');
      } else if (target.closest('[data-drop-zone="true"]')) {
        setCursorMode('drop-zone');
      } else if (target.closest('[data-drag-handle="true"]') || target.closest('[draggable="true"]')) {
        setCursorMode('drag-source');
      } else if (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('select') ||
        target.closest('[role="button"]') ||
        target.closest('.cursor-pointer')
      ) {
        setCursorMode('pointer');
      } else {
        setCursorMode('default');
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    // Physics render loop: Velocity stretching and smooth lerp
    const tick = () => {
      const targetX = posRef.current.x;
      const targetY = posRef.current.y;

      trailRef.current.x += (targetX - trailRef.current.x) * 0.24;
      trailRef.current.y += (targetY - trailRef.current.y) * 0.24;

      const vx = targetX - trailRef.current.x;
      const vy = targetY - trailRef.current.y;
      const speed = Math.sqrt(vx * vx + vy * vy);
      const angle = Math.atan2(vy, vx) * (180 / Math.PI);
      const stretch = Math.min(1.4, 1 + speed * 0.015);
      const squeeze = Math.max(0.7, 1 - speed * 0.008);

      setTrail({
        x: trailRef.current.x,
        y: trailRef.current.y,
        scaleX: stretch,
        scaleY: squeeze,
        angle
      });

      animId = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    animId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(animId);
    };
  }, [enabled, isDraggingProduct, isVisible]);

  if (!enabled || !isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden hidden md:block">
      
      {/* 1. Precision Concentric Core Laser Dot */}
      <div
        className="fixed top-0 left-0 w-2 h-2 -ml-1 -mt-1 rounded-full bg-white shadow-[0_0_12px_#38bdf8] transition-transform duration-75"
        style={{
          transform: `translate3d(${coords.x}px, ${coords.y}px, 0) scale(${
            cursorMode === 'pointer' ? 0.6 : cursorMode === 'scratch' ? 1.4 : cursorMode === 'drop-zone' ? 1.8 : 1
          })`,
        }}
      />

      {/* 2. Kinetic Velocity-Stretching Outer Aura Ring */}
      <div
        className="fixed top-0 left-0 -ml-6 -mt-6 rounded-full transition-colors duration-200"
        style={{
          transform: `translate3d(${trail.x}px, ${trail.y}px, 0) rotate(${trail.angle}deg) scale(${trail.scaleX}, ${trail.scaleY})`,
          width: cursorMode === 'pointer' ? '54px' : cursorMode === 'scratch' ? '64px' : cursorMode === 'drop-zone' ? '76px' : '48px',
          height: cursorMode === 'pointer' ? '54px' : cursorMode === 'scratch' ? '64px' : cursorMode === 'drop-zone' ? '76px' : '48px',
        }}
      >
        <div
          className={`w-full h-full rounded-full border transition-all duration-200 backdrop-blur-[1px] flex items-center justify-center ${
            cursorMode === 'default'
              ? 'border-indigo-400/40 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.25)]'
              : cursorMode === 'pointer'
              ? 'border-cyan-400/80 bg-cyan-400/15 shadow-[0_0_25px_rgba(34,211,238,0.45)]'
              : cursorMode === 'scratch'
              ? 'border-amber-400/90 bg-amber-400/20 shadow-[0_0_30px_rgba(251,191,36,0.55)] animate-pulse'
              : cursorMode === 'drag-source'
              ? 'border-indigo-400/70 bg-indigo-500/20 shadow-[0_0_25px_rgba(99,102,241,0.4)]'
              : cursorMode === 'dragging'
              ? 'border-2 border-indigo-400 bg-indigo-600/30 shadow-[0_0_35px_rgba(99,102,241,0.6)]'
              : 'border-2 border-emerald-400 bg-emerald-500/30 shadow-[0_0_40px_rgba(52,211,153,0.7)]'
          }`}
        >
          {/* Subtle Corner Reticle Crosshairs */}
          {cursorMode === 'default' && (
            <div className="absolute inset-1 border border-dashed border-white/20 rounded-full" />
          )}

          {/* Interactive Mode Labels */}
          {cursorMode === 'scratch' && (
            <span className="text-[9px] font-mono font-bold text-amber-200 uppercase tracking-wider bg-slate-950/90 px-1.5 py-0.5 rounded border border-amber-400/40 shadow">
              Scratch
            </span>
          )}

          {cursorMode === 'dragging' && (
            <span className="text-[9px] font-mono font-bold text-indigo-100 uppercase tracking-wider bg-indigo-950/90 px-2 py-0.5 rounded-full border border-indigo-400/40 shadow">
              Drop Target
            </span>
          )}

          {cursorMode === 'drop-zone' && (
            <span className="text-[9px] font-mono font-bold text-emerald-100 uppercase tracking-wider bg-emerald-950/90 px-2 py-0.5 rounded-full border border-emerald-400 shadow">
              Release!
            </span>
          )}
        </div>
      </div>

    </div>
  );
};
