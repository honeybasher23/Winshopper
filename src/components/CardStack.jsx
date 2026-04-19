import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import HoloCard from "./HoloCard/HoloCard";

/* ── 1. ISOLATED CARD COMPONENT ─────────────────────────────────────── */
// This guarantees every card has its own math, preventing snap-back glitches
const DraggableCard = ({ item, isTop, onSwipeRight, onSwipeLeft }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);

  const handleDragEnd = (event, info) => {
    const xOffset = info.offset.x;
    const yOffset = info.offset.y;
    const distance = Math.sqrt(xOffset * xOffset + yOffset * yOffset);

    // If thrown far enough
    if (distance > 100) {
      if (xOffset > 0) {
        onSwipeRight(item); // Thrown right -> Save
      } else {
        onSwipeLeft(item);  // Thrown left -> Pass
      }
    }
  };

  return (
    <motion.div
      className="absolute top-0"
      style={{
        zIndex: isTop ? 10 : 0,
        ...(isTop ? { x, rotate } : {}) // Only the top card tracks the mouse
      }}
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      
      initial={{ scale: 0.8, y: 30, opacity: 0 }}
      
      animate={{
        scale: isTop ? 1 : 0.95,
        y: isTop ? 0 : 15,
        opacity: 1,
        filter: isTop ? "brightness(1) grayscale(0)" : "brightness(0.4) grayscale(0.5)",
        pointerEvents: isTop ? "auto" : "none"
      }}
      
      exit={{
        // Smart Exit: Looks at its own X value to decide which way to fly!
        // If x is 0 (button clicked), default to flying right (1000)
        x: x.get() > 50 ? 1000 : (x.get() < -50 ? -1000 : 1000),
        opacity: 0,
        scale: 0.9,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <HoloCard
        product={{
          name: item.name,
          price: `$${item.price}`,
          image: item.image_url
        }}
        // If they click the save button, trigger the swipe right logic
        onSave={isTop ? () => onSwipeRight(item) : undefined}
      />
    </motion.div>
  );
};

/* ── 2. MAIN DECK MANAGER ───────────────────────────────────────────── */
const CardStack = ({ items, onSwipeRight }) => {
  const [deck, setDeck] = useState([]);

  useEffect(() => {
    if (items) setDeck(items);
  }, [items]);

  // Background caching
  useEffect(() => {
    if (deck.length > 2) {
      const img = new Image();
      img.src = deck[2].image_url;
    }
  }, [deck]);

  if (deck.length === 0) {
    return <div className="text-white mt-20 text-sm">Loading collection...</div>;
  }

  const handleSwipeRight = (item) => {
    if (onSwipeRight) onSwipeRight(item); // Save to DB
    shiftDeck();
  };

  const handleSwipeLeft = () => {
    shiftDeck(); // Just remove it
  };

  const shiftDeck = () => {
    setDeck((prev) => {
      const newDeck = [...prev];
      const thrownCard = newDeck.shift();
      newDeck.push(thrownCard); // Infinite loop
      return newDeck;
    });
  };

  return (
    <div className="relative w-[320px] h-[500px] flex justify-center items-center mt-6 perspective-[1000px]">
      <AnimatePresence mode="popLayout">
        
        {/* Render only the top 2 cards for performance */}
        {deck.slice(0, 2).reverse().map((item, index, arr) => {
          // arr.length - 1 guarantees we correctly target the top card
          const isTop = index === arr.length - 1; 

          return (
            <DraggableCard
              key={item.id} // The key is strictly tied to the product ID now
              item={item}
              isTop={isTop}
              onSwipeRight={handleSwipeRight}
              onSwipeLeft={handleSwipeLeft}
            />
          );
        })}

      </AnimatePresence>
    </div>
  );
};

export default CardStack;