import React, { useEffect, useState } from 'react';

const InteractiveBackground: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black">
      {/* --- STUDIO ATMOSPHERE (Based on MultiTracks Reference) --- */}
      
      {/* 1. Deep Background Base - slightly lighter than pure black to allow glows to pop */}
      <div className="absolute inset-0 bg-[#050505]"></div>

      {/* 2. Left Spotlight (Warm/Orange/Red) - Mimicking the guitar/drums side */}
      <div className="absolute top-[10%] left-[-10%] w-[50vw] h-[80vh] bg-gradient-to-r from-orange-900/30 to-transparent opacity-60 blur-[120px] mix-blend-screen animate-pulse duration-[8000ms]"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[60vh] bg-red-600/10 rounded-full blur-[150px] mix-blend-screen"></div>

      {/* 3. Right Spotlight (Cool/Blue/Cyan) - Mimicking the keys/tech side */}
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[70vh] bg-blue-900/30 rounded-full blur-[130px] mix-blend-screen animate-pulse duration-[10000ms]"></div>
      <div className="absolute bottom-[10%] right-[-10%] w-[45vw] h-[60vh] bg-indigo-600/15 rounded-full blur-[140px] mix-blend-screen"></div>

      {/* 4. Center Vignette - Keeps the content area high contrast */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black opacity-80"></div>

      {/* --- INTERACTIVE MOUSE GLOW --- */}
      {/* Subtle white glow following mouse to act as a 'flashlight' in the dark studio */}
      <div 
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0.03), transparent 40%)`
        }}
      ></div>

      {/* --- FILM GRAIN TEXTURE --- */}
      {/* Adds that professional 'ISO' noise look */}
      <div className="absolute inset-0 opacity-[0.35] mix-blend-overlay pointer-events-none" 
           style={{ 
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
             backgroundRepeat: 'repeat',
           }}>
      </div>
    </div>
  );
};

export default InteractiveBackground;