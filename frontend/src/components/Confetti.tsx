import React, { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';

type Piece = {
  id: number;
  left: number;
  delay: number;
  color: string;
  rotation: number;
  spin: number;
  size: number;
  duration: number;
  drift: number;
  scale: number;
  shape: 'rect' | 'diamond' | 'circle';
  gradient?: string;
};

type Burst = { id: number; left: number; top: number; delay: number; color: string; size: number };
type Sparkle = { id: number; left: number; top: number; delay: number; size: number; color: string; duration: number };
type Cannon = { id: number; side: 'left' | 'right'; delay: number; color: string; spread: number; duration: number };

const palette = ['#FF6D00', '#FB8500', '#FFB703', '#F72585', '#E63946', '#7209B7', '#4361EE', '#4CC9F0', '#06D6A0', '#80ED99'];

export const Confetti: React.FC<{ triggerKey: number | string | null }> = ({ triggerKey }) => {
  const [active, setActive] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setMotionEnabled(!query.matches);
    update();
    const handler = (event: MediaQueryListEvent) => setMotionEnabled(!event.matches);
    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', handler);
      return () => query.removeEventListener('change', handler);
    }
    query.addListener(handler);
    return () => query.removeListener(handler);
  }, []);

  const pieces = useMemo<Piece[]>(() => {
    if (triggerKey == null) return [];
    return Array.from({ length: 140 }).map((_, i) => {
      const color = palette[Math.floor(Math.random() * palette.length)];
      const shapeSeed = Math.random();
      const shape: Piece['shape'] = shapeSeed > 0.8 ? 'circle' : shapeSeed > 0.5 ? 'diamond' : 'rect';
      return {
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        color,
        rotation: Math.random() * 360,
        spin: 360 + Math.random() * 720,
        size: 8 + Math.random() * 22,
        duration: 2.1 + Math.random() * 1.4,
        drift: (Math.random() - 0.5) * 160,
        scale: 0.8 + Math.random() * 0.9,
        shape,
        gradient: shape === 'diamond' ? `linear-gradient(135deg, ${color}, ${palette[(i + 3) % palette.length]})` : undefined,
      };
    });
  }, [triggerKey]);

  const bursts = useMemo<Burst[]>(() => {
    if (triggerKey == null) return [];
    return Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      left: 8 + Math.random() * 84,
      top: 18 + Math.random() * 30,
      delay: Math.random() * 0.4,
      color: palette[(i * 2) % palette.length],
      size: 140 + Math.random() * 120,
    }));
  }, [triggerKey]);

  const sparkles = useMemo<Sparkle[]>(() => {
    if (triggerKey == null) return [];
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 0.5,
      size: 8 + Math.random() * 12,
      color: palette[(i + 5) % palette.length],
      duration: 0.8 + Math.random() * 0.6,
    }));
  }, [triggerKey]);

  const cannons = useMemo<Cannon[]>(() => {
    if (triggerKey == null) return [];
    return Array.from({ length: 4 }).map((_, i) => ({
      id: i,
      side: i % 2 === 0 ? 'left' : 'right',
      delay: Math.random() * 0.3,
      color: palette[(i + 2) % palette.length],
      spread: 18 + Math.random() * 18,
      duration: 1.2 + Math.random() * 0.3,
    }));
  }, [triggerKey]);

  useEffect(() => {
    if (triggerKey == null || !motionEnabled) return;
    setActive(true);
    const t = setTimeout(() => setActive(false), 3600);
    return () => clearTimeout(t);
  }, [triggerKey, motionEnabled]);

  if (!active || !motionEnabled) return null;

  return (
    <Box aria-hidden sx={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
      <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top, rgba(255,255,255,0.18), transparent 55%)' }} />

      {bursts.map(burst => (
        <Box
          key={`burst-${burst.id}`}
          sx={{
            position: 'absolute',
            width: burst.size,
            height: burst.size,
            left: `${burst.left}%`,
            top: `${burst.top}%`,
            marginLeft: `-${burst.size / 2}px`,
            marginTop: `-${burst.size / 2}px`,
            borderRadius: '50%',
            border: `2px solid ${burst.color}`,
            boxShadow: `0 0 25px ${burst.color}`,
            opacity: 0.85,
            animation: `burst 1.4s ease-out ${burst.delay}s both`,
            mixBlendMode: 'screen',
          }}
        />
      ))}

      {pieces.map(piece => (
        <Box
          key={piece.id}
          sx={{
            position: 'absolute',
            top: -60,
            left: `${piece.left}%`,
            width: piece.shape === 'circle' ? piece.size : piece.size * 0.5,
            height: piece.shape === 'circle' ? piece.size : piece.size * 0.9,
            borderRadius: piece.shape === 'circle' ? '999px' : piece.shape === 'rect' ? '6px' : '2px',
            clipPath: piece.shape === 'diamond' ? 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)' : undefined,
            backgroundImage: piece.gradient,
            backgroundColor: piece.gradient ? 'transparent' : piece.color,
            boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
            mixBlendMode: 'screen',
            opacity: 0.95,
            animation: `megaFall ${piece.duration}s cubic-bezier(.11,.65,.26,1) ${piece.delay}s both, shimmer 1.4s ease-in-out ${piece.delay}s 3 alternate`,
            '--drift': `${piece.drift}px`,
            '--spin-start': `${piece.rotation}deg`,
            '--spin-range': `${piece.spin}deg`,
            '--scale': `${piece.scale}`,
          }}
        />
      ))}

      {sparkles.map(sparkle => (
        <Box
          key={`spark-${sparkle.id}`}
          sx={{
            position: 'absolute',
            left: `${sparkle.left}%`,
            top: `${sparkle.top}%`,
            width: sparkle.size,
            height: sparkle.size,
            borderRadius: '50%',
            border: `1px solid rgba(255,255,255,0.7)`,
            boxShadow: `0 0 14px ${sparkle.color}`,
            animation: `spark ${sparkle.duration}s ease-out ${sparkle.delay}s both`,
          }}
        />
      ))}

      {cannons.map(cannon => (
        <Box
          key={`cannon-${cannon.id}`}
          sx={{
            position: 'absolute',
            bottom: -10,
            [cannon.side]: '4%',
            width: 22,
            height: 180,
            backgroundImage: `linear-gradient(${cannon.side === 'left' ? 60 : 120}deg, ${cannon.color}, transparent 70%)`,
            borderRadius: cannon.side === 'left' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
            filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.25))',
            animation: `cannon ${cannon.duration}s ease-out ${cannon.delay}s both`,
            '--cannon-tilt': `${(cannon.side === 'left' ? -1 : 1) * cannon.spread}deg`,
          }}
        />
      ))}

      <style>{`
        @keyframes megaFall {
          0% { transform: translate3d(0, -40px, 0) rotate(var(--spin-start, 0deg)) scale(var(--scale, 1)); opacity: 0; }
          15% { opacity: 1; }
          55% { transform: translate3d(calc(var(--drift, 0px) * 0.5), 55vh, 0) rotate(calc(var(--spin-start, 0deg) + var(--spin-range, 720deg) * 0.5)) scale(var(--scale, 1)); }
          100% { transform: translate3d(var(--drift, 0px), 115vh, 0) rotate(calc(var(--spin-start, 0deg) + var(--spin-range, 720deg))) scale(var(--scale, 1)); opacity: 0; }
        }
        @keyframes shimmer {
          0% { filter: drop-shadow(0 0 0 rgba(255, 255, 255, 0.2)); }
          100% { filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.7)); }
        }
        @keyframes burst {
          0% { transform: scale(0.4); opacity: 0.9; }
          60% { opacity: 1; }
          100% { transform: scale(1.25); opacity: 0; }
        }
        @keyframes spark {
          0% { transform: scale(0.4); opacity: 0; }
          40% { opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes cannon {
          0% { transform: rotate(var(--cannon-tilt, 0deg)) translateY(40px) scaleY(0.2); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: rotate(var(--cannon-tilt, 0deg)) translateY(-160px) scaleY(1); opacity: 0; }
        }
      `}</style>
    </Box>
  );
};
