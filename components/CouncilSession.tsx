import React from 'react';
import { CouncilMessage } from '../types';
import * as Icons from 'lucide-react';

interface CouncilSessionProps {
  messages: CouncilMessage[];
  isThinking: boolean;
}

const CouncilSession: React.FC<CouncilSessionProps> = ({ messages }) => {
  // Only render decrees
  return (
    <div className="space-y-16">
      {messages.map((msg, idx) => {
        if (msg.type !== 'decree') return null;

        return (
            <div key={idx} className="relative animate-fade-in">
              <div className="absolute inset-0 bg-amber-900/10 blur-[80px] rounded-full pointer-events-none"></div>
              
              <div className="relative bg-stone-900/60 border border-amber-800/40 p-12 rounded-lg text-center shadow-2xl mx-auto max-w-3xl backdrop-blur-sm">
                
                {/* Decorative Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-stone-950 border border-amber-900/50 mb-8 shadow-lg">
                     <Icons.Scale className="w-10 h-10 text-amber-500" />
                </div>
                
                <h3 className="medieval-font text-4xl text-amber-500 mb-8 tracking-[0.2em] uppercase border-b border-amber-900/30 pb-6 inline-block">
                    The Final Decree
                </h3>
                
                <div className="text-2xl leading-relaxed text-amber-100/90 font-serif italic relative px-8">
                  <span className="absolute top-0 left-0 text-6xl text-amber-900/40 font-serif">“</span>
                  {msg.content}
                  <span className="absolute bottom-0 right-0 text-6xl text-amber-900/40 font-serif">”</span>
                </div>
                
                <div className="mt-12 flex justify-center gap-4 opacity-40">
                     <Icons.Feather className="w-6 h-6 text-stone-500" />
                     <div className="h-[1px] w-24 bg-stone-700 self-center"></div>
                     <Icons.Scroll className="w-6 h-6 text-stone-500" />
                </div>
              </div>
            </div>
        );
      })}
    </div>
  );
};

export default CouncilSession;