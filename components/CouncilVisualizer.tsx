import React, { useState } from 'react';
import { ImageGenerationSettings } from '../types';
import { generateCouncilChamberImage } from '../services/geminiService';
import { Image, Wand2, Loader2, Download, X } from 'lucide-react';

const CouncilVisualizer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [settings, setSettings] = useState<ImageGenerationSettings>({
    size: '1K',
    aspectRatio: '16:9'
  });

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const prompt = `
        A cinematic, hyper-realistic wide shot of a medieval stone council chamber. 
        A round stone table with glowing runes. 
        Five mysterious figures in hooded robes sitting around it. 
        Atmospheric lighting, shafts of light, dust motes, illuminati aesthetic, dark fantasy.
        Detailed textures, 8k resolution.
      `;
      const result = await generateCouncilChamberImage(prompt, settings);
      setGeneratedImage(result);
    } catch (e) {
      alert("Failed to summon the vision.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center w-10 h-10 bg-stone-900 hover:bg-stone-800 text-stone-500 hover:text-amber-500 border border-stone-800 rounded-full transition-all duration-300 shadow-xl"
        title="Summon Visual"
      >
        <Image className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-stone-900 border border-stone-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
        
        {/* Header */}
        <div className="p-4 border-b border-stone-800 flex justify-between items-center bg-stone-950">
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-amber-500" />
            <h2 className="medieval-font text-xl text-stone-200">Council Chamber Visualization</h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-stone-500 hover:text-stone-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 flex flex-col items-center">
          
          {/* Controls */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
               <label className="text-xs text-stone-400 uppercase tracking-wider">Resolution</label>
               <select 
                value={settings.size}
                onChange={(e) => setSettings({...settings, size: e.target.value as any})}
                className="w-full bg-stone-800 border border-stone-600 rounded p-2 text-stone-300 focus:border-amber-500 outline-none"
               >
                 <option value="1K">1K (Standard)</option>
                 <option value="2K">2K (High)</option>
                 <option value="4K">4K (Ultra)</option>
               </select>
            </div>
            <div className="space-y-2">
               <label className="text-xs text-stone-400 uppercase tracking-wider">Aspect Ratio</label>
               <select 
                value={settings.aspectRatio}
                onChange={(e) => setSettings({...settings, aspectRatio: e.target.value as any})}
                className="w-full bg-stone-800 border border-stone-600 rounded p-2 text-stone-300 focus:border-amber-500 outline-none"
               >
                 <option value="16:9">Landscape (16:9)</option>
                 <option value="1:1">Square (1:1)</option>
                 <option value="9:16">Portrait (9:16)</option>
               </select>
            </div>
            <div className="flex items-end">
               <button 
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-2 bg-amber-700 hover:bg-amber-600 text-amber-100 font-bold rounded shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
               >
                 {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Wand2 className="w-4 h-4" />}
                 {loading ? "Conjuring..." : "Generate Scene"}
               </button>
            </div>
          </div>

          {/* Image Display */}
          <div className="w-full bg-black rounded-lg border border-stone-800 min-h-[300px] flex items-center justify-center relative group overflow-hidden">
            {loading && (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10">
                 <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
                 <p className="text-amber-200 animate-pulse">Weaving reality...</p>
               </div>
            )}
            
            {generatedImage ? (
              <>
                <img src={generatedImage} alt="Council Chamber" className="w-full h-auto object-contain max-h-[60vh]" />
                <a 
                  href={generatedImage} 
                  download="council_chamber.png"
                  className="absolute bottom-4 right-4 bg-stone-900/80 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-amber-600"
                >
                  <Download className="w-5 h-5" />
                </a>
              </>
            ) : (
              <div className="text-center text-stone-600">
                <Image className="w-16 h-16 mx-auto mb-2 opacity-20" />
                <p>No visualization summoned yet.</p>
                <p className="text-xs mt-2">Uses Gemini 3 Pro Image (Nano Banana Pro)</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouncilVisualizer;
