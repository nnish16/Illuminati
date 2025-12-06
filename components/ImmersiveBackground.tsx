import React from 'react';

const ImmersiveBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-[#0c0a09] -z-50 select-none pointer-events-none">
      
      {/* LAYER 1: The Stone Deep (Generated Texture) 
          Uses SVG noise to create a rough stone wall texture dynamically.
      */}
      <div className="absolute inset-0 z-0">
         {/* Base Gradient */}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1c1917_0%,_#000000_100%)]"></div>
         
         {/* SVG Noise Texture - robust replacement for external image */}
         <svg className="absolute inset-0 w-full h-full opacity-20 mix-blend-overlay">
            <filter id="noiseFilter">
                <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
                <feColorMatrix type="saturate" values="0"/>
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)"/>
         </svg>
      </div>

      {/* LAYER 2: The Arcane Machinery (Rotating Geometry) 
          Increased opacity to 0.1 so it is clearly visible as a background element.
      */}
      <div className="absolute top-1/2 left-1/2 w-[140vmax] h-[140vmax] -translate-x-1/2 -translate-y-1/2 z-0 opacity-[0.08]">
        <svg viewBox="0 0 100 100" className="w-full h-full text-stone-300 fill-none stroke-currentColor stroke-[0.15] animate-spin-slow origin-center">
           <circle cx="50" cy="50" r="48" strokeDasharray="0.5 2" />
           <circle cx="50" cy="50" r="38" strokeDasharray="4 4" />
           <circle cx="50" cy="50" r="28" strokeDasharray="1 3" />
           
           {/* Geometric Runes */}
           <path d="M50 2 L50 15 M50 98 L50 85 M2 50 L15 50 M98 50 L85 50" strokeWidth="0.3" />
           <rect x="19" y="19" width="62" height="62" transform="rotate(45 50 50)" strokeWidth="0.1" />
        </svg>
      </div>

      <div className="absolute top-1/2 left-1/2 w-[110vmax] h-[110vmax] -translate-x-1/2 -translate-y-1/2 z-0 opacity-[0.1]">
        <svg viewBox="0 0 100 100" className="w-full h-full text-amber-500 fill-none stroke-currentColor stroke-[0.1] animate-spin-reverse origin-center">
           <circle cx="50" cy="50" r="42" strokeDasharray="10 10" />
           <path d="M50 10 L85 80 L15 80 Z" transform="rotate(180 50 50)" opacity="0.3" />
        </svg>
      </div>

      {/* LAYER 3: The Mists of Time (Drifting Fog) 
          Horizontal moving gradients.
      */}
      <div className="absolute inset-0 z-0 mix-blend-screen opacity-40">
        <div className="absolute top-[20%] left-[-50%] w-[200%] h-[60%] bg-gradient-to-r from-transparent via-amber-900/20 to-transparent blur-[80px] animate-fog"></div>
        <div className="absolute bottom-[10%] right-[-50%] w-[200%] h-[40%] bg-gradient-to-l from-transparent via-stone-800/30 to-transparent blur-[60px] animate-fog" style={{ animationDelay: '-10s' }}></div>
      </div>

      {/* LAYER 4: The Ether (Floating Particles) 
          Small motes floating upward.
      */}
      <div className="absolute inset-0 z-0">
        {[...Array(20)].map((_, i) => {
            const size = Math.random() * 3 + 1;
            return (
                <div
                    key={i}
                    className="absolute bg-amber-100/40 rounded-full blur-[0.5px] animate-float"
                    style={{
                        left: `${Math.random() * 100}%`,
                        width: `${size}px`,
                        height: `${size}px`,
                        '--opacity': Math.random() * 0.6 + 0.1,
                        animationDuration: `${Math.random() * 15 + 20}s`,
                        animationDelay: `${Math.random() * -30}s`
                    } as React.CSSProperties}
                />
            );
        })}
      </div>

      {/* Vignette Overlay for focus */}
      <div className="absolute inset-0 bg-[radial-gradient(transparent_30%,_#000000_100%)] opacity-90 z-0"></div>
    </div>
  );
};

export default ImmersiveBackground;