import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, ChevronDown, Scroll, ShieldAlert, Ban, X } from 'lucide-react';
import CouncilSession from './components/CouncilSession';
import { CouncilTable } from './components/CouncilTable';
import ImmersiveBackground from './components/ImmersiveBackground';
import { generateCouncilDebate, checkQueryWithGuard } from './services/geminiService';
import { CouncilMessage } from './types';
import { COUNCIL_MEMBERS } from './constants';

const App: React.FC = () => {
  const [messages, setMessages] = useState<CouncilMessage[]>([]);
  const [inputText, setInputText] = useState('');
  
  // States for animation and processing
  const [isThinking, setIsThinking] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [flightDistance, setFlightDistance] = useState(0);
  
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);
  const [currentStatement, setCurrentStatement] = useState<string | null>(null);

  // Guard & Ban State
  const [rejectionCount, setRejectionCount] = useState<number>(() => {
    const saved = localStorage.getItem('council_rejections');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [guardRejection, setGuardRejection] = useState<string | null>(null);
  
  const transcriptRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Check ban status on mount or change
  const isBanned = rejectionCount >= 3;
  
  // Determine if the UI should be in "Active/Conversation" mode vs "Idle/Hero" mode
  const isUIActive = inputText.length > 0 || messages.length > 0 || isThinking || isSending || guardRejection !== null;

  useEffect(() => {
    localStorage.setItem('council_rejections', rejectionCount.toString());
  }, [rejectionCount]);

  const handleSecretUnban = () => {
      setRejectionCount(0);
      localStorage.removeItem('council_rejections');
      window.location.reload();
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isThinking || isSending || isBanned) return;

    // Clear previous rejection message
    setGuardRejection(null);

    // 1. Calculate the distance to fly
    if (tableRef.current && formRef.current) {
        const tableRect = tableRef.current.getBoundingClientRect();
        const formRect = formRef.current.getBoundingClientRect();
        
        // Target is center of table relative to form
        const tableCenterY = tableRect.top + (tableRect.height / 2);
        const formCenterY = formRect.top + (formRect.height / 2);
        const distance = tableCenterY - formCenterY;
        
        setFlightDistance(distance);
    }

    // 2. Trigger "Sending" Animation (Morph & Fly)
    setIsSending(true);

    // Wait for animation to finish (matching duration-1000)
    await new Promise(r => setTimeout(r, 1000));

    // Reset UI state for processing
    setIsSending(false); 
    setIsThinking(true);
    setFlightDistance(0);
    const query = inputText;
    setInputText(''); 

    // Wait a brief moment for UI transition
    await new Promise(r => setTimeout(r, 500));

    // 3. GUARD CHECK
    try {
        const guardVerdict = await checkQueryWithGuard(query);

        if (!guardVerdict.allowed) {
            // REJECTED
            setRejectionCount(prev => prev + 1);
            setGuardRejection(guardVerdict.reason);
            setIsThinking(false);
            return;
        }

    } catch (e) {
        console.error("Guard failed, proceeding with caution...");
    }

    // 4. If Allowed: Process Debate
    // Clear previous session if starting new
    if (messages.length > 0) {
        setMessages([]);
        setActiveSpeakerId(null);
        setCurrentStatement(null);
    }

    const userMsg: CouncilMessage = {
      speakerId: 'user',
      content: query,
      timestamp: Date.now(),
      type: 'user_query'
    };
    
    try {
      // Add User Query to history immediately for context
      setMessages([userMsg]);

      // Generate the debate plan
      const debateResults = await generateCouncilDebate(query);
      
      setIsThinking(false);
      
      // 5. Play out the debate
      for (const item of debateResults) {
        // Set visual active speaker & content
        if (item.speakerId !== 'decree') {
            setActiveSpeakerId(item.speakerId);
            setCurrentStatement(item.content);
        } else {
            setActiveSpeakerId(null);
            setCurrentStatement(null);
        }

        // Calculate read time delay based on length, but cap it
        const delay = Math.min(Math.max(item.content.length * 40, 2500), 7000);
        await new Promise(r => setTimeout(r, delay));
        
        const councilMsg: CouncilMessage = {
          speakerId: item.speakerId === 'decree' ? 'system' : item.speakerId,
          content: item.content,
          timestamp: Date.now(),
          type: item.type === 'decree' ? 'decree' : 'debate'
        };
        
        setMessages(prev => [...prev, councilMsg]);
        
        // If it's a decree, scroll directly to it
        if (councilMsg.type === 'decree') {
             setTimeout(() => {
                if (transcriptRef.current) {
                    transcriptRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
             }, 100);
        }
      }
      setActiveSpeakerId(null);
      setCurrentStatement(null);

    } catch (error) {
      console.error(error);
      setIsThinking(false);
      alert("The Council is silent. Please check your connection or API Key.");
    }
  };

  // Filter messages to only show User Query (optional) and Decrees for the bottom section
  const transcriptMessages = messages.filter(m => m.type === 'decree');

  // --- BANNED SCREEN ---
  if (isBanned) {
      return (
        <div className="fixed inset-0 bg-stone-950 z-50 flex flex-col items-center justify-center p-8 text-center animate-fade-in relative">
             {/* SECRET UNBAN BUTTON: Invisible, Top-Left, Double Click */}
             <div 
                onDoubleClick={handleSecretUnban}
                className="absolute top-0 left-0 w-32 h-32 z-[100] cursor-default"
                title="" 
             ></div>

             <div className="text-red-900/20 absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden">
                <Ban className="w-[80vw] h-[80vw]" />
             </div>
             <div className="relative z-10 max-w-2xl bg-black/60 backdrop-blur-md p-12 rounded-lg border border-red-900/50 shadow-2xl">
                <h1 className="medieval-font text-6xl text-red-600 mb-6 tracking-widest">DISBANDED</h1>
                <p className="text-xl text-stone-400 font-serif mb-8">
                    You have repeatedly wasted the Council's time with trivialities. 
                    The Chamber is sealed. The candles are extinguished.
                </p>
                <div className="text-sm text-red-500/60 uppercase tracking-[0.3em]">Access Revoked Permanently</div>
             </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen text-stone-200 font-serif overflow-x-hidden selection:bg-amber-900/50 flex flex-col relative">
      
      {/* 3D Immersive Background Layer */}
      <ImmersiveBackground />

      {/* Main Stage: Center of Screen */}
      <div className="relative flex-1 flex flex-col items-center justify-center min-h-screen overflow-hidden">
        
        {/* CENTERPIECE: The Table (Centered in viewport) */}
        <div ref={tableRef} className="relative z-10 flex items-center justify-center transition-all duration-700">
            <CouncilTable 
                members={COUNCIL_MEMBERS} 
                activeSpeakerId={activeSpeakerId}
                currentStatement={currentStatement} 
                isThinking={isThinking}
            />

            {/* GUARD REJECTION SCROLL OVERLAY */}
            {guardRejection && (
                <div className="absolute inset-0 z-50 flex items-center justify-center animate-fade-in pointer-events-auto">
                    <div className="relative w-[400px] bg-[#e7e5e4] text-stone-900 p-8 rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-unroll origin-top">
                        {/* Scroll Ends */}
                        <div className="absolute -top-4 left-0 right-0 h-6 bg-[#d6d3d1] rounded-full shadow-md border-b border-stone-400"></div>
                        <div className="absolute -bottom-4 left-0 right-0 h-6 bg-[#d6d3d1] rounded-full shadow-md border-t border-stone-400"></div>
                        
                        <div className="flex flex-col items-center text-center">
                            <ShieldAlert className="w-12 h-12 text-red-800 mb-4" />
                            <h3 className="medieval-font text-2xl font-bold text-red-900 mb-2">ACCESS DENIED</h3>
                            <p className="font-serif italic text-lg leading-relaxed mb-6">
                                "{guardRejection}"
                            </p>
                            <div className="w-full h-[1px] bg-stone-400 mb-2"></div>
                            <div className="flex justify-between w-full text-xs font-bold uppercase tracking-widest text-red-800">
                                <span>Strike {rejectionCount}/3</span>
                                <button onClick={() => setGuardRejection(null)} className="hover:underline cursor-pointer">
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* HERO TEXT - SHARED CENTER with Table */}
        <header className={`
            absolute flex flex-col items-center justify-center text-center pointer-events-none w-full
            transition-all duration-1000 ease-in-out
            left-0
            ${isUIActive 
                ? 'top-12 translate-y-0 scale-75 opacity-60 z-0' 
                : 'top-1/2 -translate-y-1/2 scale-100 opacity-100 z-30'
            }
        `}>
          {/* Logo - Eye of Providence */}
          <div className="mb-2 opacity-90 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
             <svg width="64" height="64" viewBox="0 0 100 100" className="text-amber-500 overflow-visible mx-auto">
                 <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                 </defs>
                 <g filter="url(#glow)">
                    {/* Triangle */}
                    <path d="M50 5 L95 90 H5 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    {/* Eye Shape */}
                    <path d="M25 55 Q50 25 75 55 Q50 85 25 55 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    {/* Pupil */}
                    <circle cx="50" cy="55" r="7" fill="currentColor" />
                    {/* Capstone Line */}
                    <path d="M30 38 H70" stroke="currentColor" strokeWidth="1" opacity="0.6" strokeDasharray="2 2" />
                 </g>
             </svg>
          </div>

          {/* Title */}
          <h1 className="text-center medieval-font font-bold tracking-widest drop-shadow-2xl py-4">
            <span className="inline-block text-7xl md:text-9xl bg-gradient-to-b from-stone-100 to-stone-600 text-transparent bg-clip-text leading-none">I</span>
            <span className="inline-block text-5xl md:text-7xl bg-gradient-to-b from-stone-100 to-stone-600 text-transparent bg-clip-text px-1 leading-none">LLUMINAT</span>
            <span className="inline-block text-7xl md:text-9xl bg-gradient-to-b from-stone-100 to-stone-600 text-transparent bg-clip-text leading-none">I</span>
          </h1>
          
          <p className="text-amber-700/90 text-sm tracking-[0.5em] uppercase mt-4 font-bold bg-black/40 backdrop-blur-sm px-6 py-2 rounded-full border border-amber-900/30">
            Your access to the secret society
          </p>
        </header>

        {/* INPUT SECTION - Anchored to Bottom */}
        <div className="absolute bottom-12 w-full max-w-2xl z-20 h-[80px] flex items-center justify-center">
          <form 
            ref={formRef}
            onSubmit={handleSend} 
            className={`
                relative group transition-all duration-1000 ease-in-out
                flex items-center justify-center
                ${isSending 
                    ? 'w-[60px] h-[60px] bg-amber-200 border-4 border-amber-600 rounded-full cursor-default shadow-[0_0_50px_rgba(245,158,11,0.5)]' 
                    : 'w-full bg-stone-900/80 border border-stone-700 rounded-xl shadow-2xl hover:shadow-amber-900/10 backdrop-blur-md'
                }
                ${isThinking || guardRejection ? 'opacity-0 pointer-events-none' : 'opacity-100'}
            `}
            style={{
                transform: isSending ? `translateY(${flightDistance}px) scale(0.2) rotate(360deg)` : 'none'
            }}
          >
            {/* Input Field */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isThinking ? "The Council is deliberating..." : "Present your query..."}
              disabled={isThinking || isSending || activeSpeakerId !== null || !!guardRejection}
              className={`
                w-full bg-transparent text-center
                text-stone-200 placeholder-stone-500 
                py-6 px-12 
                focus:outline-none 
                transition-all duration-300 text-lg font-serif tracking-wide
                ${isSending ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}
              `}
            />
            
            {/* Action Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isThinking || isSending || activeSpeakerId !== null || !!guardRejection}
              className={`
                absolute transition-all duration-500
                ${isSending 
                    ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-100 scale-125' 
                    : 'right-3 top-1/2 -translate-y-1/2 p-3 opacity-100'
                }
                ${!isSending && inputText.trim() ? 'text-amber-500 hover:text-amber-400' : 'text-stone-600'}
              `}
            >
              {isSending ? (
                  <Scroll className="w-8 h-8 text-amber-800 fill-amber-800 animate-pulse" />
              ) : (
                  <Send className="w-5 h-5" />
              )}
            </button>
          </form>
          
          {/* Status Text below input - Updated for Multi-Model */}
          {!isSending && !guardRejection && (
              <div className={`absolute -bottom-8 left-0 right-0 text-center text-stone-600 text-xs tracking-widest uppercase opacity-60 transition-opacity duration-300 ${isThinking ? 'opacity-100' : 'opacity-0'}`}>
                 {isThinking ? "Consulting Multiple Models..." : ""}
              </div>
          )}
        </div>

      </div>

      {/* TRANSCRIPT AREA (Decree Only) */}
      {transcriptMessages.length > 0 && !guardRejection && (
        <div ref={transcriptRef} className="relative z-20 w-full bg-black/40 backdrop-blur-lg border-t border-stone-800 p-8 animate-fade-in-up shadow-2xl">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-center gap-4 mb-8 opacity-60">
                    <div className="h-[1px] flex-1 bg-stone-700"></div>
                    <ChevronDown className="text-stone-500 animate-bounce" />
                    <div className="h-[1px] flex-1 bg-stone-700"></div>
                </div>
                
                <CouncilSession messages={transcriptMessages} isThinking={false} />
            </div>
        </div>
      )}

    </div>
  );
};

export default App;