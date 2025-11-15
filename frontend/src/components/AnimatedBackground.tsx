import React from 'react';
import { Box } from '@mui/material';

// Enhanced kid-friendly background with more colorful blobs and subtle parallax
export const AnimatedBackground: React.FC = () => {
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <Box aria-hidden sx={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {/* Colorful floating blobs with parallax */}
      <Box sx={{
        position: 'absolute', top: '-20%', left: '-10%', width: { xs: 260, sm: 380 }, height: { xs: 260, sm: 380 },
        background: 'radial-gradient(closest-side, rgba(96,165,250,0.12), rgba(96,165,250,0))',
        filter: 'blur(14px)', opacity: 1, borderRadius: '50%',
        animation: 'drift1 20s ease-in-out infinite, pulse1 8s ease-in-out infinite',
        transform: `translate3d(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px, 0)`,
        transition: 'transform 0.3s ease-out',
      }} />

      <Box sx={{
        position: 'absolute', bottom: '-18%', right: '-12%', width: { xs: 300, sm: 420 }, height: { xs: 300, sm: 420 },
        background: 'radial-gradient(closest-side, rgba(251,133,0,0.14), rgba(251,133,0,0))',
        filter: 'blur(18px)', opacity: 1, borderRadius: '50%',
        animation: 'drift2 24s ease-in-out infinite, pulse2 10s ease-in-out infinite',
        transform: `translate3d(${mousePos.x * -0.4}px, ${mousePos.y * -0.4}px, 0)`,
        transition: 'transform 0.3s ease-out',
      }} />

      {/* Additional colorful blobs */}
      <Box sx={{
        position: 'absolute', top: '30%', right: '20%', width: { xs: 180, sm: 280 }, height: { xs: 180, sm: 280 },
        background: 'radial-gradient(closest-side, rgba(167,139,250,0.10), rgba(167,139,250,0))',
        filter: 'blur(16px)', opacity: 1, borderRadius: '50%',
        animation: 'drift3 28s ease-in-out infinite, pulse3 12s ease-in-out infinite',
        transform: `translate3d(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px, 0)`,
        transition: 'transform 0.3s ease-out',
      }} />

      <Box sx={{
        position: 'absolute', bottom: '25%', left: '15%', width: { xs: 220, sm: 340 }, height: { xs: 220, sm: 340 },
        background: 'radial-gradient(closest-side, rgba(252,211,77,0.11), rgba(252,211,77,0))',
        filter: 'blur(20px)', opacity: 1, borderRadius: '50%',
        animation: 'drift4 32s ease-in-out infinite, pulse4 14s ease-in-out infinite',
        transform: `translate3d(${mousePos.x * -0.3}px, ${mousePos.y * -0.3}px, 0)`,
        transition: 'transform 0.3s ease-out',
      }} />

      <Box sx={{
        position: 'absolute', top: '60%', left: '45%', width: { xs: 160, sm: 240 }, height: { xs: 160, sm: 240 },
        background: 'radial-gradient(closest-side, rgba(244,114,182,0.09), rgba(244,114,182,0))',
        filter: 'blur(15px)', opacity: 1, borderRadius: '50%',
        animation: 'drift5 26s ease-in-out infinite, pulse5 11s ease-in-out infinite',
        transform: `translate3d(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px, 0)`,
        transition: 'transform 0.3s ease-out',
      }} />

      {/* Decorative stars with parallax */}
      <Box component="svg" viewBox="0 0 100 100" sx={{
        display: { xs: 'none', md: 'block' }, position: 'absolute', top: '16%', right: '12%',
        width: 64, opacity: 0.12, animation: 'bob 8s ease-in-out -1s infinite, rotate 20s linear infinite',
        transform: `translate3d(${mousePos.x * -0.6}px, ${mousePos.y * -0.6}px, 0)`,
        transition: 'transform 0.3s ease-out',
      }}>
        <path d="M50 8 L61 38 L93 38 L66 57 L76 88 L50 70 L24 88 L34 57 L7 38 L39 38 Z" fill="none" stroke="#34D399" strokeWidth="4" strokeLinejoin="round" />
      </Box>

      <Box component="svg" viewBox="0 0 100 100" sx={{
        display: { xs: 'none', md: 'block' }, position: 'absolute', bottom: '20%', left: '8%',
        width: 52, opacity: 0.10, animation: 'bob 10s ease-in-out -3s infinite, rotate 25s linear infinite reverse',
        transform: `translate3d(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px, 0)`,
        transition: 'transform 0.3s ease-out',
      }}>
        <path d="M50 8 L61 38 L93 38 L66 57 L76 88 L50 70 L24 88 L34 57 L7 38 L39 38 Z" fill="none" stroke="#FFB703" strokeWidth="4" strokeLinejoin="round" />
      </Box>

      <style>{`
        @keyframes drift1 { 0% { transform: translate3d(0,0,0); } 50% { transform: translate3d(12px,15px,0); } 100% { transform: translate3d(0,0,0); } }
        @keyframes drift2 { 0% { transform: translate3d(0,0,0); } 50% { transform: translate3d(-15px,-12px,0); } 100% { transform: translate3d(0,0,0); } }
        @keyframes drift3 { 0% { transform: translate3d(0,0,0); } 50% { transform: translate3d(-10px,14px,0); } 100% { transform: translate3d(0,0,0); } }
        @keyframes drift4 { 0% { transform: translate3d(0,0,0); } 50% { transform: translate3d(14px,-10px,0); } 100% { transform: translate3d(0,0,0); } }
        @keyframes drift5 { 0% { transform: translate3d(0,0,0); } 50% { transform: translate3d(8px,-12px,0); } 100% { transform: translate3d(0,0,0); } }
        @keyframes pulse1 { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        @keyframes pulse2 { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        @keyframes pulse3 { 0%, 100% { opacity: 1; } 50% { opacity: 0.75; } }
        @keyframes pulse4 { 0%, 100% { opacity: 1; } 50% { opacity: 0.65; } }
        @keyframes pulse5 { 0%, 100% { opacity: 1; } 50% { opacity: 0.8; } }
        @keyframes bob { 0% { transform: translateY(0); } 50% { transform: translateY(-6px); } 100% { transform: translateY(0); } }
        @keyframes rotate { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>
    </Box>
  );
};
