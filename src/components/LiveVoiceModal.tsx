import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserAccount } from '../types';
import { speechSynth, generateMKResponse, detectLanguage } from '../services/mkEngine';
import { MKLogo } from './MKLogo';
import { Mic, MicOff, X, Volume2, ArrowLeft, Sparkles } from 'lucide-react';

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAccount: UserAccount;
  onNewUserVoiceMessage: (text: string, reply: string) => void;
}

export const LiveVoiceModal: React.FC<LiveVoiceModalProps> = ({
  isOpen,
  onClose,
  userAccount,
  onNewUserVoiceMessage
}) => {
  const [voiceState, setVoiceState] = useState<'listening' | 'thinking' | 'speaking' | 'idle'>('listening');
  const [transcript, setTranscript] = useState('');
  const [lastResponse, setLastResponse] = useState("Bonjour ! Je suis MK. Je vous écoute à voix haute, que souhaitez-vous savoir ou accomplir ?");
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition when modal opens
  useEffect(() => {
    if (!isOpen) {
      speechSynth.stop();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      return;
    }

    // Speak introductory welcome
    const intro = userAccount.language === 'ar'
      ? `أهلاً بك يا ${userAccount.displayName}! أنا إم كيه، أتحدث معك مباشرة. كيف أساعدك؟`
      : userAccount.language === 'en'
      ? `Hello ${userAccount.displayName}! I am MK. I'm listening to your voice, what would you like to explore?`
      : `Bonjour ${userAccount.displayName} ! Je suis MK. Je vous écoute, dites-moi tout ce que vous désirez savoir ou accomplir.`;

    setLastResponse(intro);
    setVoiceState('speaking');

    const voiceLang = userAccount.language === 'ar' ? 'ar-SA' : userAccount.language === 'en' ? 'en-US' : 'fr-FR';

    speechSynth.speak(
      intro,
      voiceLang,
      userAccount.voiceSpeed,
      userAccount.voicePitch,
      () => setVoiceState('speaking'),
      () => {
        setVoiceState('listening');
        startListening();
      },
      () => {
        setVoiceState('listening');
        startListening();
      }
    );

    return () => {
      speechSynth.stop();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isOpen]);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = userAccount.language === 'ar' ? 'ar-SA' : userAccount.language === 'en' ? 'en-US' : 'fr-FR';

      recognition.onresult = (event: any) => {
        const text = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join('');
        setTranscript(text);
      };

      recognition.onend = () => {
        if (transcript.trim()) {
          processVoiceQuery(transcript.trim());
        } else {
          setVoiceState('idle');
        }
      };

      recognition.onerror = () => {
        setVoiceState('idle');
      };

      recognitionRef.current = recognition;
      recognition.start();
      setVoiceState('listening');
    } catch (e) {
      setVoiceState('idle');
    }
  };

  const processVoiceQuery = async (query: string) => {
    setVoiceState('thinking');
    const result = await generateMKResponse(
      query,
      'fast',
      [],
      undefined,
      userAccount.displayName,
      true
    );

    setLastResponse(result.text);
    onNewUserVoiceMessage(query, result.text);
    setTranscript('');

    const voiceLang = userAccount.language === 'ar' ? 'ar-SA' : userAccount.language === 'en' ? 'en-US' : 'fr-FR';

    speechSynth.speak(
      result.text,
      voiceLang,
      userAccount.voiceSpeed,
      userAccount.voicePitch,
      () => setVoiceState('speaking'),
      () => {
        setVoiceState('listening');
        startListening();
      },
      () => setVoiceState('idle')
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-[#08080a] text-white flex flex-col justify-between p-6 sm:p-8"
      >
        {/* Top bar with back arrow and close */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour au chat</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>MK Synthèse Vocale Live</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Central Audio Orb & Status */}
        <div className="flex flex-col items-center justify-center my-auto text-center max-w-lg mx-auto">
          {/* Animated Pulsing Voice Orb */}
          <div className="relative mb-8 flex items-center justify-center">
            {/* Outer ripples */}
            <motion.div
              animate={{
                scale: voiceState === 'speaking' ? [1, 1.4, 1] : voiceState === 'listening' ? [1, 1.2, 1] : 1,
                opacity: voiceState === 'speaking' ? [0.4, 0.1, 0.4] : [0.2, 0.05, 0.2]
              }}
              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              className="absolute w-64 h-64 rounded-full bg-indigo-500/30 blur-2xl"
            />
            <motion.div
              animate={{
                scale: voiceState === 'speaking' ? [1.1, 1.3, 1.1] : [1, 1.15, 1],
                opacity: [0.5, 0.2, 0.5]
              }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
              className="absolute w-44 h-44 rounded-full bg-sky-500/40 blur-xl"
            />

            {/* Core Orb */}
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-tr from-neutral-900 via-neutral-800 to-white/30 border border-white/20 flex items-center justify-center shadow-2xl overflow-hidden">
              <MKLogo size={58} />
            </div>
          </div>

          {/* Voice State Indicator */}
          <div className="mb-4">
            <span className="text-xs uppercase font-mono tracking-widest text-neutral-400">
              {voiceState === 'listening' && '🎙️ À votre écoute... (Parlez maintenant)'}
              {voiceState === 'thinking' && '🧠 MK réfléchit...'}
              {voiceState === 'speaking' && '🔊 MK vous parle...'}
              {voiceState === 'idle' && 'En pause • Touchez le micro pour parler'}
            </span>
          </div>

          {/* Transcribed User Speech */}
          {transcript && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-base text-neutral-300 font-medium italic mb-4 max-h-20 overflow-y-auto px-4"
            >
              “{transcript}”
            </motion.p>
          )}

          {/* Assistant's Response display */}
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800/90 text-sm text-neutral-200 leading-relaxed max-h-40 overflow-y-auto w-full text-left">
            {lastResponse}
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="flex items-center justify-center gap-4 max-w-sm mx-auto w-full">
          {voiceState === 'speaking' ? (
            <button
              type="button"
              onClick={() => {
                speechSynth.stop();
                setVoiceState('listening');
                startListening();
              }}
              className="h-12 px-6 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <Volume2 className="w-4 h-4" />
              <span>Interrompre et parler</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (voiceState === 'listening') {
                  if (recognitionRef.current) recognitionRef.current.stop();
                  setVoiceState('idle');
                } else {
                  startListening();
                }
              }}
              className={`h-14 px-8 rounded-full flex items-center justify-center gap-2 text-sm font-semibold transition-all active:scale-95 shadow-xl ${
                voiceState === 'listening'
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-white hover:bg-neutral-200 text-neutral-900'
              }`}
            >
              {voiceState === 'listening' ? (
                <>
                  <MicOff className="w-5 h-5" />
                  <span>Pause écoute</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  <span>Démarrer l'écoute</span>
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
