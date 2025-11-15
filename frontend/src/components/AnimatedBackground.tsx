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
      {/* Colorful floating blobs with parallax - More vibrant and larger */}
      <Box sx={{
        position: 'absolute', top: '-25%', left: '-15%', width: { xs: 400, sm: 550 }, height: { xs: 400, sm: 550 },
        background: 'radial-gradient(closest-side, rgba(96,165,250,0.25), rgba(96,165,250,0))',
        filter: 'blur(40px)', opacity: 1, borderRadius: '50%',
        animation: 'drift1 20s ease-in-out infinite, pulse1 8s ease-in-out infinite',
        transform: `translate3d(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px, 0)`,
        transition: 'transform 0.3s ease-out',
      }} />

      <Box sx={{
        position: 'absolute', bottom: '-22%', right: '-18%', width: { xs: 450, sm: 600 }, height: { xs: 450, sm: 600 },
        background: 'radial-gradient(closest-side, rgba(251,133,0,0.28), rgba(251,133,0,0))',
        filter: 'blur(45px)', opacity: 1, borderRadius: '50%',
        animation: 'drift2 24s ease-in-out infinite, pulse2 10s ease-in-out infinite',
        transform: `translate3d(${mousePos.x * -0.4}px, ${mousePos.y * -0.4}px, 0)`,
        transition: 'transform 0.3s ease-out',
      }} />

      {/* Additional colorful blobs - More intense */}
      <Box sx={{
        position: 'absolute', top: '25%', right: '15%', width: { xs: 320, sm: 450 }, height: { xs: 320, sm: 450 },
        background: 'radial-gradient(closest-side, rgba(167,139,250,0.22), rgba(167,139,250,0))',
        filter: 'blur(38px)', opacity: 1, borderRadius: '50%',
        animation: 'drift3 28s ease-in-out infinite, pulse3 12s ease-in-out infinite',
        transform: `translate3d(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px, 0)`,
        transition: 'transform 0.3s ease-out',
      }} />

      <Box sx={{
        position: 'absolute', bottom: '20%', left: '10%', width: { xs: 350, sm: 500 }, height: { xs: 350, sm: 500 },
        background: 'radial-gradient(closest-side, rgba(252,211,77,0.24), rgba(252,211,77,0))',
        filter: 'blur(42px)', opacity: 1, borderRadius: '50%',
        animation: 'drift4 32s ease-in-out infinite, pulse4 14s ease-in-out infinite',
        transform: `translate3d(${mousePos.x * -0.3}px, ${mousePos.y * -0.3}px, 0)`,
        transition: 'transform 0.3s ease-out',
      }} />

      <Box sx={{
        position: 'absolute', top: '55%', left: '40%', width: { xs: 280, sm: 400 }, height: { xs: 280, sm: 400 },
        background: 'radial-gradient(closest-side, rgba(244,114,182,0.20), rgba(244,114,182,0))',
        filter: 'blur(35px)', opacity: 1, borderRadius: '50%',
        animation: 'drift5 26s ease-in-out infinite, pulse5 11s ease-in-out infinite',
        transform: `translate3d(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px, 0)`,
        transition: 'transform 0.3s ease-out',
      }} />

      {/* Additional small accent blobs for more color */}
      <Box sx={{
        position: 'absolute', top: '10%', left: '50%', width: { xs: 200, sm: 300 }, height: { xs: 200, sm: 300 },
        background: 'radial-gradient(closest-side, rgba(16,185,129,0.18), rgba(16,185,129,0))',
        filter: 'blur(30px)', opacity: 1, borderRadius: '50%',
        animation: 'drift1 22s ease-in-out infinite reverse, pulse3 9s ease-in-out infinite',
        transform: `translate3d(${mousePos.x * 0.35}px, ${mousePos.y * 0.35}px, 0)`,
        transition: 'transform 0.3s ease-out',
      }} />

      {/* Decorative stars with parallax - More visible */}
      <Box component="svg" viewBox="0 0 100 100" sx={{
        display: { xs: 'none', md: 'block' }, position: 'absolute', top: '16%', right: '12%',
        width: 80, opacity: 0.25, animation: 'bob 8s ease-in-out -1s infinite, rotate 20s linear infinite',
        transform: `translate3d(${mousePos.x * -0.6}px, ${mousePos.y * -0.6}px, 0)`,
        transition: 'transform 0.3s ease-out',
      }}>
        <path d="M50 8 L61 38 L93 38 L66 57 L76 88 L50 70 L24 88 L34 57 L7 38 L39 38 Z" fill="none" stroke="#34D399" strokeWidth="5" strokeLinejoin="round" />
      </Box>

      <Box component="svg" viewBox="0 0 100 100" sx={{
        display: { xs: 'none', md: 'block' }, position: 'absolute', bottom: '20%', left: '8%',
        width: 68, opacity: 0.22, animation: 'bob 10s ease-in-out -3s infinite, rotate 25s linear infinite reverse',
        transform: `translate3d(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px, 0)`,
        transition: 'transform 0.3s ease-out',
      }}>
        <path d="M50 8 L61 38 L93 38 L66 57 L76 88 L50 70 L24 88 L34 57 L7 38 L39 38 Z" fill="none" stroke="#FFB703" strokeWidth="5" strokeLinejoin="round" />
      </Box>

      {/* Additional decorative elements */}
      <Box component="svg" viewBox="0 0 100 100" sx={{
        display: { xs: 'none', md: 'block' }, position: 'absolute', top: '45%', right: '25%',
        width: 60, opacity: 0.18, animation: 'bob 12s ease-in-out -5s infinite, rotate 30s linear infinite',
        transform: `translate3d(${mousePos.x * -0.4}px, ${mousePos.y * -0.4}px, 0)`,
        transition: 'transform 0.3s ease-out',
      }}>
        <path d="M50 8 L61 38 L93 38 L66 57 L76 88 L50 70 L24 88 L34 57 L7 38 L39 38 Z" fill="none" stroke="#EF476F" strokeWidth="5" strokeLinejoin="round" />
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
