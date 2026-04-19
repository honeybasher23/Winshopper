import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const HoloCard = ({ product, onLike, onShare, onSave }) => {
  const ref = useRef(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Motion Values & Physics
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseY = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);
  const sheenX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
  const sheenY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);

  // Button Handlers
  const handleLike = (e) => {
    e.stopPropagation(); // Stop the card from dragging when clicking button
    setIsLiked(!isLiked);
    if (onLike) onLike(product);
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Winshopper Find',
          text: `Check out this ${product.name}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share canceled');
      }
    } else {
      alert("Link copied to clipboard!"); // Fallback for desktop
    }
    if (onShare) onShare(product);
  };

  const handleSave = (e) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    if (onSave) onSave(product);
  };

  return (
    <div style={{ perspective: 1000 }}>
      <motion.div
        ref={ref}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          width: "300px",
          height: "450px",
        }}
        className="relative rounded-xl cursor-grab active:cursor-grabbing bg-neutral-900 shadow-2xl"
      >
        {/* IMAGE LAYER */}
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            draggable="false" // Prevents ghost image when dragging
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
        </div>

        {/* METALLIC SHEEN */}
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none z-10"
          style={{
            background: "linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.4) 45%, rgba(255, 255, 255, 0.0) 50%)",
            backgroundSize: "200% 200%",
            backgroundPositionX: sheenX,
            backgroundPositionY: sheenY,
            mixBlendMode: "overlay",
          }}
        />

        {/* CONTENT LAYER */}
        <div 
            className="absolute bottom-0 left-0 right-0 p-6 z-20 flex justify-between items-end"
            style={{ transform: "translateZ(30px)" }} 
        >
          {/* Text Info */}
          <div className="flex-1 mr-4">
            <h3 className="text-xl font-bold text-white leading-tight">{product.name}</h3>
            <p className="text-neutral-400 font-medium mt-1">{product.price}</p>
          </div>

          {/* ACTION BUTTONS (Subtle) */}
          <div className="flex flex-col gap-3">
            {/* Like Button */}
            <button 
              onClick={handleLike}
              className={`p-2.5 rounded-full backdrop-blur-md transition-all duration-300 border border-white/10
                ${isLiked ? 'bg-white/20 text-red-500 scale-110' : 'bg-black/30 text-white/70 hover:bg-white/20 hover:text-white'}
              `}
            >
              <HeartIcon filled={isLiked} />
            </button>

             {/* Add/Save Button */}
             <button 
              onClick={handleSave}
              className={`p-2.5 rounded-full backdrop-blur-md transition-all duration-300 border border-white/10
                ${isSaved ? 'bg-white/20 text-green-400 scale-110' : 'bg-black/30 text-white/70 hover:bg-white/20 hover:text-white'}
              `}
            >
              {isSaved ? <CheckIcon /> : <PlusIcon />}
            </button>

            {/* Share Button */}
            <button 
              onClick={handleShare}
              className="p-2.5 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all duration-300"
            >
              <ShareIcon />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/* --- Icons --- */
const HeartIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const ShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <circle cx="18" cy="5" r="3"></circle>
    <circle cx="6" cy="12" r="3"></circle>
    <circle cx="18" cy="19" r="3"></circle>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);
const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );

export default HoloCard;