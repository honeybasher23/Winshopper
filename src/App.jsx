import React, { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import WelcomeHook from './components/WelcomeHook';
import VibeCheck from './components/VibeCheck';
import CardStack from './components/CardStack';
import InterestPicker from './components/InterestPicker';
import { supabase } from './supabaseClient';

/* ── Loading skeleton ───────────────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3 w-full px-6">
      <div className="w-full max-w-sm h-[440px] rounded-[2rem] bg-white/[0.04] animate-pulse" />
      <p className="text-white/20 text-[0.7rem] tracking-[0.25em] uppercase font-medium">
        Curating your deck
      </p>
    </div>
  );
}

/* ── App ────────────────────────────────────────────────────────────── */
export default function App() {
  // 1. Data State
  const [products, setProducts] = useState([]);
  const [savedItems, setSavedItems] = useState([]); 
  const [loading, setLoading]   = useState(true);
  
  // 2. Navigation State
  const [currentTab, setCurrentTab] = useState('discover'); 
  
  // 3. Onboarding & Filter State (MAKE SURE THERE IS ONLY ONE OF THESE!)
  const [onboardingStep, setOnboardingStep] = useState('welcome'); 
  const [selectedInterests, setSelectedInterests] = useState([]);
  

  // 1. Fetch Personalized Feed (Triggered when Vibe Check is complete)
  useEffect(() => {
    // Only fetch once they finish onboarding and have picked their vibes
    if (onboardingStep === 'complete' && selectedInterests.length > 0) {
      const fetchSmartDeck = async () => {
        setLoading(true);
        console.log("🧠 Asking the Brain for products matching:", selectedInterests);

        // Call our new Gemini-powered Edge Function!
        const { data, error } = await supabase.functions.invoke('match-vibes', {
          body: { vibes: selectedInterests }
        });

        if (error) {
          console.error("❌ Brain malfunction:", error);
          
          // Fallback to random products if the AI fails
          const { data: fallback } = await supabase.from('products').select('*').limit(10);
          setProducts(fallback || []);
        } else {
          console.log("✨ Brain found perfect matches:", data);
          setProducts(data);
        }
        
        setLoading(false);
      };

      fetchSmartDeck();
    }
  }, [onboardingStep, selectedInterests]);

  // 2. Fetch Saved Items (When user clicks 'Saved' tab)
  useEffect(() => {
    if (currentTab === 'saved') {
      const fetchSavedDeck = async () => {
        const { data, error } = await supabase
          .from('saved_items')
          .select(`
            id,
            products (
              id,
              name,
              price,
              image_url
            )
          `)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Supabase Error:", error.message);
          return;
        }

        if (data) {
          // Flatten the nested JSON structure so our UI can read it easily
          const formatted = data
            .filter(item => item.products !== null)
            .map(item => ({
              save_id: item.id,
              ...item.products
            }));
          setSavedItems(formatted);
        }
      };

      fetchSavedDeck();
    }
  }, [currentTab]);

  // Add this right below your useEffect blocks!
  const handleSave = async (product) => {
    console.log("Attempting to save:", product.name);
    
    const { error } = await supabase
      .from('saved_items')
      .insert([{ product_id: product.id }]);
      
    if (error) {
      console.error("Failed to save:", error.message);
    } else {
      console.log("Successfully saved!");
    }
  };

  const filteredProducts = products.filter(
    p => !p.category || selectedInterests.includes(p.category),
  );

  const toggleInterest = interest =>
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest],
    );

  return (
    <>
      {/* ── ONBOARDING OVERLAY ── */}
      <AnimatePresence mode="wait">
        {onboardingStep === 'welcome' && (
          <WelcomeHook key="welcome" onNext={() => setOnboardingStep('vibe')} />
        )}
        
        {onboardingStep === 'vibe' && (
          <VibeCheck 
            key="vibe" 
            onComplete={(vibes) => {
              // The user picked their aesthetics! 
              // 1. Save them to our app state
              setSelectedInterests(vibes);
              // 2. Unlock the main app
              setOnboardingStep('complete');
              // (Future: We will also save these to Supabase pgvector here)
            }} 
          />
        )}
      </AnimatePresence>

      {/* ── MAIN APP SHELL ── */}
      <div className="relative min-h-screen flex flex-col items-center overflow-hidden bg-black font-sans">

        {/* ── Header ── */}
        <header className="w-full flex flex-col items-start px-6 pt-14 pb-2 z-10">
          <p className="text-white/30 text-[0.65rem] tracking-[0.3em] uppercase font-semibold mb-1">
            {currentTab === 'saved' ? 'Library' : 'Discover'}
          </p>
          <h1 className="text-[2rem] font-bold tracking-tight text-white leading-none">
            {currentTab === 'saved' ? 'Your Collection' : 'Winshopper'}
          </h1>
        </header>

        {/* ── VIEW: DISCOVER ── */}
        {currentTab === 'discover' && (
          <>
            <nav className="w-full mt-4 mb-1 px-6 z-10">
              <InterestPicker selected={selectedInterests} onToggle={toggleInterest} />
            </nav>
            
            {/* thin divider */}
            <div className="w-full h-px bg-white/[0.07] mt-3" />

            <main className="flex-1 flex flex-col justify-center items-center pb-28 pt-6 w-full">
              {loading ? <LoadingSkeleton /> : <CardStack items={filteredProducts} onSwipeRight={handleSave} />}
            </main>
          </>
        )}

        {/* ── VIEW: SAVED ── */}
        {currentTab === 'saved' && (
          <main className="flex-1 w-full px-6 pt-6 pb-28 overflow-y-auto">
              {savedItems.length === 0 ? (
                  <div className="text-white/40 text-center mt-20 text-sm">
                    No items saved yet.<br/>Click the + button on a card to collect it.
                  </div>
              ) : (
                  <div className="grid grid-cols-2 gap-4">
                      {savedItems.map(item => (
                          <div key={item.save_id} className="bg-neutral-900 rounded-xl overflow-hidden border border-white/10">
                              <img src={item.image_url} alt={item.name} className="w-full h-40 object-cover" />
                              <div className="p-3">
                                  <p className="text-white text-sm font-bold truncate">{item.name}</p>
                                  <p className="text-white/50 text-xs mt-0.5">${item.price}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </main>
        )}

        {/* ── VIEW: PROFILE (Placeholder) ── */}
        {currentTab === 'profile' && (
          <main className="flex-1 w-full flex items-center justify-center pb-28 text-white/50">
            Profile settings coming soon.
          </main>
        )}

        {/* ── Tab bar ── */}
        <footer
          className="fixed bottom-0 inset-x-0 h-20 flex items-center justify-around px-8
                     bg-black/80 backdrop-blur-2xl border-t border-white/[0.08] z-50"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          {[
            { id: 'discover', icon: <GridIcon />,   label: 'Discover' },
            { id: 'saved',    icon: <HeartIcon />,  label: 'Saved' },
            { id: 'profile',  icon: <PersonIcon />, label: 'Profile' },
          ].map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)} // Click to switch views
                className={`flex flex-col items-center gap-1 transition-all duration-300
                            ${isActive ? 'opacity-100 scale-105' : 'opacity-30 hover:opacity-50'}`}
              >
                <span className={`w-6 h-6 ${isActive ? 'text-white' : 'text-white'}`}>
                  {tab.icon}
                </span>
                <span className={`text-[0.6rem] tracking-wide font-medium
                                  ${isActive ? 'text-white' : 'text-white'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </footer>
      </div>
    </>
  );
}

/* ── SF-style SVG icons (Unchanged) ── */
function GridIcon() { return <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>; }
function HeartIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>; }
function PersonIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>; }