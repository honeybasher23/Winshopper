import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// The baseline aesthetic seeds for our future AI recommendation engine
const VIBES = [
  { id: 'tech', label: 'Tech & Setup', color: 'from-blue-900 to-cyan-800' },
  { id: 'streetwear', label: 'Streetwear', color: 'from-stone-800 to-neutral-600' },
  { id: 'minimalist', label: 'Minimalist Living', color: 'from-gray-700 to-gray-500' },
  { id: 'cyberpunk', label: 'Cyberpunk', color: 'from-purple-900 to-fuchsia-800' },
  { id: 'opulence', label: 'Dark Opulence', color: 'from-amber-900 to-yellow-700' },
  { id: 'active', label: 'Active & Outdoor', color: 'from-emerald-900 to-teal-800' },
  { id: 'zen', label: 'Zen Workspace', color: 'from-slate-800 to-gray-700' },
  { id: 'vintage', label: 'Vintage Archive', color: 'from-orange-900 to-red-800' },
];

export default function VibeCheck({ onComplete }) {
  const [selected, setSelected] = useState([]);

  const toggleVibe = (id) => {
    setSelected((prev) => 
      prev.includes(id) 
        ? prev.filter(v => v !== id) 
        : [...prev, id]
    );
  };

  const isReady = selected.length >= 3;

  // Animation Choreography
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      className="fixed inset-0 z-[100] bg-black flex flex-col px-6 pt-20 pb-10 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.5 } }}
    >
      {/* ── HEADER ── */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Curate your space.</h2>
        <p className="text-white/50 text-sm">Select at least 3 aesthetics to tune your feed.</p>
      </motion.div>

      {/* ── GRID ── */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto pb-24"
      >
        {VIBES.map((vibe) => {
          const isSelected = selected.includes(vibe.id);
          return (
            <motion.button
              key={vibe.id}
              variants={item}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleVibe(vibe.id)}
              className={`relative h-32 rounded-2xl overflow-hidden text-left flex items-end p-4 transition-all duration-300 border-2
                ${isSelected ? 'border-white' : 'border-white/5 opacity-60 grayscale-[0.5]'}
              `}
            >
              {/* Abstract Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${vibe.color} opacity-80`} />
              
              {/* Vignette for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              
              {/* Checkmark indicator */}
              <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border border-white/30 flex items-center justify-center transition-all duration-300
                ${isSelected ? 'bg-white border-white scale-100' : 'bg-transparent scale-0'}
              `}>
                <svg viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" className="w-3 h-3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>

              <span className={`relative z-10 font-bold tracking-wide transition-colors
                ${isSelected ? 'text-white' : 'text-white/70'}
              `}>
                {vibe.label}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* ── ACTION BUTTON ── */}
      <div className="absolute bottom-10 left-6 right-6">
        <AnimatePresence>
          {isReady && (
            <motion.button
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onComplete(selected)} // Pass the data up!
              className="w-full py-4 rounded-2xl bg-white text-black font-bold text-sm uppercase tracking-widest shadow-[0_0_40px_rgba(255,255,255,0.3)]"
            >
              Enter the Deck
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}