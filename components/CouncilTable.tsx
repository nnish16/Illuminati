import React from 'react';
import { CouncilMember } from '../types';
import * as Icons from 'lucide-react';

interface CouncilTableProps {
  members: CouncilMember[];
  activeSpeakerId: string | null;
  currentStatement: string | null;
  isThinking: boolean;
}

const getMemberColorHex = (colorClass: string) => {
    switch (colorClass) {
        case 'text-cyan-400': return '#22d3ee';
        case 'text-purple-400': return '#c084fc';
        case 'text-amber-400': return '#fbbf24';
        case 'text-emerald-400': return '#34d399';
        case 'text-red-400': return '#f87171';
        default: return '#fbbf24';
    }
};

export const CouncilTable: React.FC<CouncilTableProps> = ({ members, activeSpeakerId, currentStatement, isThinking }) => {
  // Configuration for the 3D -> 2D projection
  // Increased size to accommodate the title text
  const TABLE_SIZE = 950; 
  const TABLE_RADIUS = TABLE_SIZE / 2;
  const MEMBER_OFFSET = 80; // How far outside the table they sit
  const ORBIT_RADIUS_X = TABLE_RADIUS + MEMBER_OFFSET;
  const TILT_DEG = 60;
  const TILT_RAD = TILT_DEG * (Math.PI / 180);
  const Y_SCALE = Math.cos(TILT_RAD); // Squashes the Y axis to simulate the tilt
  const ORBIT_RADIUS_Y = ORBIT_RADIUS_X * Y_SCALE;

  // Helper to calculate z-index: Members "lower" on screen (higher Y) are closer
  const getDepthIndex = (y: number) => {
      return Math.round(y) + 1000;
  };

  // Determine active color for table glow
  const activeMember = members.find(m => m.id === activeSpeakerId);
  const activeColor = activeMember ? getMemberColorHex(activeMember.color) : null;

  return (
    // Increased container size to prevent clipping with the larger table
    <div className="relative w-[1400px] h-[900px] flex items-center justify-center select-none pointer-events-none">
      
      {/* 
          LAYER 1: THE 3D TABLE SURFACE 
          This uses CSS 3D transforms to create the floor plane.
      */}
      <div className="absolute inset-0 flex items-center justify-center perspective-[1000px] z-0">
        <div 
            className="relative transition-all duration-700 ease-in-out transform-style-3d"
            style={{ 
                width: `${TABLE_SIZE}px`, 
                height: `${TABLE_SIZE}px`,
                transform: `rotateX(${TILT_DEG}deg)` 
            }}
        >
            {/* The Stone Slab */}
            <div 
                className={`
                    absolute inset-0 rounded-full 
                    bg-[#1c1917] 
                    border-[4px]
                    flex items-center justify-center
                    overflow-hidden
                    transition-all duration-700 ease-in-out
                `}
                style={{
                    // Dynamic Border Color
                    borderColor: activeColor || (isThinking ? 'rgba(245, 158, 11, 0.5)' : '#292524'),
                    
                    // Enhanced Glow Logic
                    boxShadow: activeColor 
                        ? `0 0 100px ${activeColor}80, inset 0 0 120px ${activeColor}40, inset 0 0 100px rgba(0,0,0,0.8)`
                        : (isThinking ? 'inset 0 0 150px rgba(245,158,11,0.25), 0 0 30px rgba(245, 158, 11, 0.2)' : 'inset 0 0 100px rgba(0,0,0,1)')
                }}
            >
                {/* Texture Overlay */}
                <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>
                
                {/* Glowing Runes - Color also reacts */}
                <div 
                    className="absolute inset-10 rounded-full border opacity-40 transition-colors duration-700"
                    style={{ borderColor: activeColor || '#292524' }}
                ></div>
                <div 
                    className="absolute inset-32 rounded-full border border-dashed opacity-30 animate-[spin_120s_linear_infinite] transition-colors duration-700"
                    style={{ borderColor: activeColor || '#44403c' }}
                ></div>
                
                {/* Center Hole / Scribe */}
                <div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-stone-800 bg-stone-950/80 flex items-center justify-center shadow-inner transition-all duration-500"
                    style={{ 
                        transform: `translate(-50%, -50%)`,
                        boxShadow: activeColor ? `0 0 40px ${activeColor}30` : 'none',
                        borderColor: activeColor ? activeColor : '#292524'
                    }} 
                >
                     <Icons.Scroll className={`w-12 h-12 transition-colors duration-500 ${isThinking ? 'text-amber-500 animate-pulse' : 'text-stone-700'}`} style={{ color: activeColor || undefined }} />
                </div>
            </div>
        </div>
      </div>

      {/* 
          LAYER 2: THE MEMBERS (2D OVERLAY)
          These are positioned mathematically to match the rim of the 3D table, 
          but they are standard 2D elements. This ensures NO skewing, perfect legibility, 
          and they stand "upright".
      */}
      <div className="absolute inset-0 z-10 pointer-events-none">
          {members.map((member, index) => {
              const total = members.length;
              // Start angle at -90 (top)
              const angleDeg = (index * (360 / total)) - 90; 
              const angleRad = angleDeg * (Math.PI / 180);

              // Center of container 
              const cx = 700; // Half of w-[1400px]
              const cy = 450; // Half of h-[900px]

              const x = cx + Math.cos(angleRad) * ORBIT_RADIUS_X;
              const y = cy + Math.sin(angleRad) * ORBIT_RADIUS_Y;

              const isActive = activeSpeakerId === member.id;
              const memberColor = getMemberColorHex(member.color);
              const Icon = (Icons as any)[member.icon] || Icons.User;
              
              // Scale based on "depth" (Y position). 
              // Top of ellipse (y < cy) is back -> smaller
              // Bottom of ellipse (y > cy) is front -> larger
              // Normalize Y from -1 to 1 roughly
              const yNorm = (y - cy) / ORBIT_RADIUS_Y; // -1 (back) to 1 (front)
              const scale = isActive ? 1.2 : 0.85 + (yNorm * 0.15); 
              
              const zIndex = isActive ? 2000 : getDepthIndex(y);

              // Determine if on left or right side for tooltip direction
              const isLeft = Math.cos(angleRad) < 0;

              return (
                  <div
                    key={member.id}
                    className="absolute top-0 left-0 flex flex-col items-center justify-center transition-all duration-700 ease-out"
                    style={{
                        transform: `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale})`,
                        zIndex: zIndex,
                        pointerEvents: 'auto' // Re-enable clicks/hovers
                    }}
                  >
                        {/* THE CARD */}
                        <div className={`
                            relative
                            w-32 h-40
                            rounded-xl
                            flex flex-col items-center justify-start pt-6
                            transition-all duration-500
                            ${isActive 
                                ? 'bg-stone-900 border-2 shadow-[0_0_40px_rgba(0,0,0,0.8)]' 
                                : 'bg-stone-950 border border-stone-800 shadow-xl'
                            }
                        `}
                        style={{
                            borderColor: isActive ? memberColor : undefined,
                            boxShadow: isActive ? `0 0 30px ${memberColor}40` : undefined,
                            filter: isActive ? 'none' : 'grayscale(0.8) brightness(0.7)' // Dim inactive
                        }}
                        >
                            {/* Icon Container */}
                            <div className={`
                                mb-3 p-3 rounded-full bg-stone-900/50 border border-stone-800
                                ${isActive ? 'animate-pulse-glow' : ''}
                            `}>
                                <Icon 
                                    className="w-8 h-8" 
                                    style={{ color: isActive ? memberColor : '#78716c' }} 
                                />
                            </div>

                            {/* Title ONLY - Name removed */}
                            <div className="text-center px-2 w-full mt-2">
                                <div className="text-[10px] text-stone-400 uppercase tracking-wider leading-tight px-1 font-bold">
                                    {member.title}
                                </div>
                            </div>
                            
                            {/* Active Indicator Bar */}
                            {isActive && (
                                <div 
                                    className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl"
                                    style={{ background: memberColor }}
                                ></div>
                            )}
                        </div>

                        {/* SPEECH BUBBLE */}
                        {isActive && currentStatement && (
                            <div className={`
                                absolute top-1/2
                                ${isLeft ? 'right-[110%]' : 'left-[110%]'}
                                -translate-y-1/2
                                w-[280px]
                                bg-black/90 border border-stone-700 
                                p-4 rounded-lg shadow-2xl
                                animate-pop-in
                                z-[3000]
                                backdrop-blur-sm
                            `}
                            style={{ minWidth: '200px' }}
                            >
                                {/* Connector Arrow */}
                                <div className={`
                                    absolute top-1/2 -translate-y-1/2
                                    w-0 h-0 border-[8px] border-transparent
                                    ${isLeft 
                                        ? 'right-[-16px] border-l-stone-700' 
                                        : 'left-[-16px] border-r-stone-700'
                                    }
                                `}></div>
                                
                                <p className="text-sm font-serif text-stone-200 leading-relaxed italic">
                                    "{currentStatement}"
                                </p>
                            </div>
                        )}
                  </div>
              );
          })}
      </div>

    </div>
  );
};