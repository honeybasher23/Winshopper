import React from 'react';
import { motion } from 'framer-motion';

export default function WelcomeHook({ onNext }) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center px-6 overflow-hidden"
      // The whole screen fades in, and takes 0.8s to fade out when they click next
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
    >
      {/* ── AMBIENT BACKGROUND GLOW ── */}
      {/* This creates a massive, blurred orb of light behind the text that makes the pure black feel premium */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
            background: 'radial-gradient(circle, rgba(147,51,234,0.15) 0%, rgba(0,0,0,0) 70%)',
            filter: 'blur(60px)'
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />

      {/* ── CONTENT CONTAINER ── */}
      <div className="relative z-10 flex flex-col items-center text-center w-full">
        
        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          className="text-5xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 mb-4"
        >
          WINSHOPPER
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
          className="text-white/40 text-[0.65rem] tracking-[0.4em] uppercase mb-16"
        >
          A digital sanctuary for your desires
        </motion.p>

        {/* Call to Action Button */}
        <motion.button
          initial={{ scale: 0.9, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          whileTap={{ scale: 0.95 }}
          transition={{ delay: 1.0, duration: 0.5, ease: "easeOut" }}
          onClick={onNext}
          className="relative px-10 py-4 rounded-full bg-white text-black font-bold text-xs uppercase tracking-[0.2em] overflow-hidden group"
        >
          {/* Hover sheer effect */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-black/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
          Step Inside
        </motion.button>
      </div>
    </motion.div>
  );
}