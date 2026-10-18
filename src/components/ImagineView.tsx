import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GeneratedImage } from '../types';
import { IMAGE_STYLE_PRESETS, generateArtImage } from '../services/imageGenerator';
import { 
  Sparkles, 
  Download, 
  Share2, 
  MessageSquare, 
  Layers, 
  Ratio, 
  ArrowRight,
  Maximize2,
  Check
} from 'lucide-react';

interface ImagineViewProps {
  onSendImageToChat: (image: GeneratedImage) => void;
}

export const ImagineView: React.FC<ImagineViewProps> = ({ onSendImageToChat }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('cinematic');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16'>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Initial demo images if empty
  React.useEffect(() => {
    if (images.length === 0) {
      generateArtImage("Cyberpunk neon metropolis with rainy reflections and futuristic skyline", "cyberpunk", "1:1")
        .then(img => setImages([img]));
    }
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const newImg = await generateArtImage(prompt.trim(), selectedStyle, aspectRatio);
      setImages(prev => [newImg, ...prev]);
      setSelectedImage(newImg);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (img: GeneratedImage) => {
    const a = document.createElement('a');
    a.href = img.url;
    a.download = `MK-Imagine-${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="flex flex-col flex-1 h-[calc(100vh-3.5rem)] max-w-4xl w-full mx-auto p-4 sm:p-6 overflow-y-auto">
      
      {/* Studio Header */}
      <div className="mb-6 text-center max-w-xl mx-auto">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          MK Imagine Studio
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Création visuelle autonome • Zéro clé API externe requise
        </p>
      </div>

      {/* Generator Prompt Box */}
      <form onSubmit={handleGenerate} className="bg-neutral-100/90 dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-4 sm:p-5 shadow-sm mb-8 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
            Décrivez ce que vous souhaitez imaginer
          </label>
          <div className="relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Cité futuriste aux anneaux cosmiques, nébuleuse violette et lumière volumétrique..."
              className="w-full h-12 pl-4 pr-12 text-sm rounded-2xl bg-white dark:bg-[#18181d] border border-neutral-200 dark:border-neutral-700/70 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600"
            />
            <button
              type="submit"
              disabled={!prompt.trim() || isGenerating}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center disabled:opacity-40 transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Style Selector */}
        <div>
          <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1.5">
            Style artistique
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {IMAGE_STYLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedStyle(preset.id)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedStyle === preset.id
                    ? 'bg-white dark:bg-neutral-800 border-neutral-400 dark:border-neutral-500 shadow-sm'
                    : 'bg-white/50 dark:bg-neutral-900/40 border-neutral-200 dark:border-neutral-800/80 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{preset.icon}</span>
                  <span className="text-xs font-semibold text-neutral-900 dark:text-white">{preset.label}</span>
                </div>
                <p className="text-[10px] text-neutral-400 truncate mt-0.5">{preset.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Aspect Ratio & Action */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/80">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-neutral-500 mr-1">Format :</span>
            {(['1:1', '16:9', '9:16'] as const).map((ratio) => (
              <button
                key={ratio}
                type="button"
                onClick={() => setAspectRatio(ratio)}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                  aspectRatio === ratio
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                    : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700'
                }`}
              >
                {ratio === '1:1' ? '1:1 Carré' : ratio === '16:9' ? '16:9 Paysage' : '9:16 Mobile'}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className="h-10 px-5 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-semibold flex items-center gap-2 active:scale-95 disabled:opacity-40 transition-all shadow-sm"
          >
            {isGenerating ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white dark:border-neutral-900 border-t-transparent animate-spin" />
                <span>Génération MK...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Générer l'image</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Gallery of Creations */}
      <div>
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-3">
          Galerie des créations récentes
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8">
          {images.map((img) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 shadow-sm"
            >
              <img
                src={img.url}
                alt={img.prompt}
                referrerPolicy="no-referrer"
                className="w-full h-64 object-cover transition-transform group-hover:scale-102 duration-300"
              />

              {/* Overlay with info and actions */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
                <p className="text-xs font-medium line-clamp-2 mb-2 text-neutral-200">
                  {img.prompt}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-white/20">
                  <span className="text-[10px] text-neutral-400 capitalize">
                    {img.style} • {img.aspectRatio}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDownload(img)}
                      title="Télécharger"
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onSendImageToChat(img)}
                      title="Discuter de cette image dans le Chat"
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-colors flex items-center gap-1 text-[11px]"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
};
