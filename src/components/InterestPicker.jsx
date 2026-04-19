import React from 'react';

const INTERESTS = ['Tech', 'Fashion', 'Living'];

export default function InterestPicker({ selected, onToggle }) {
  return (
    // Changed from 'fixed' to 'relative' so it respects the parent's centering
    <div className="relative z-50 flex gap-3 p-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 shadow-xl">
      {INTERESTS.map((interest) => {
        const isActive = selected.includes(interest.toLowerCase());
        return (
          <button
            key={interest}
            onClick={() => onToggle(interest.toLowerCase())}
            className={`
              px-5 py-2 rounded-full text-sm font-bold transition-all duration-300
              ${isActive 
                ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)] scale-105' 
                : 'text-neutral-400 hover:text-white hover:bg-white/10'
              }
            `}
          >
            {interest}
          </button>
        );
      })}
    </div>
  );
}