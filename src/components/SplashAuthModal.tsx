import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserAccount } from '../types';
import { MKLogo } from './MKLogo';
import { ArrowRight, Sparkles, ShieldCheck, Zap } from 'lucide-react';

interface SplashAuthModalProps {
  onAccountCreated: (account: UserAccount) => void;
  existingAccount: UserAccount | null;
}

const QUICK_AVATARS = ['⚡', '🧠', '🛡️', '💎', '🚀', '🔥'];

export const SplashAuthModal: React.FC<SplashAuthModalProps> = ({
  onAccountCreated,
  existingAccount
}) => {
  const [displayName, setDisplayName] = useState(existingAccount?.displayName || '');
  const [selectedAvatar, setSelectedAvatar] = useState(existingAccount?.avatar || '⚡');
  const [language, setLanguage] = useState(existingAccount?.language || 'fr');

  const handleStart = (nameToUse?: string) => {
    const finalName = (nameToUse || displayName).trim() || 'Rayen';
    const cleanUsername = finalName.toLowerCase().replace(/[^a-z0-9_]/g, '_');

    const account: UserAccount = {
      id: existingAccount?.id || `usr-${Date.now()}`,
      username: cleanUsername,
      displayName: finalName,
      avatar: selectedAvatar,
      createdAt: existingAccount?.createdAt || Date.now(),
      language,
      theme: existingAccount?.theme || 'dark',
      voiceSpeed: 1.0,
      voicePitch: 1.0
    };

    localStorage.setItem('mk_user_account', JSON.stringify(account));
    onAccountCreated(account);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md px-4 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm bg-white dark:bg-[#111114] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-7 shadow-2xl text-center"
      >
        {/* MK Logo */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute -inset-3 rounded-full bg-slate-900/10 dark:bg-white/10 blur-lg" />
            <MKLogo size={60} />
          </div>
        </div>

        <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Bienvenue sur MK
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 mb-5">
          Intelligence artificielle privée, autonome & souveraine
        </p>

        {/* Form */}
        <div className="space-y-4 text-left">
          {/* Avatar row */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5 text-center">
              Choisissez votre symbole
            </label>
            <div className="flex items-center justify-center gap-2">
              {QUICK_AVATARS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setSelectedAvatar(av)}
                  className={`w-9 h-9 rounded-xl text-base flex items-center justify-center transition-all ${
                    selectedAvatar === av
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 scale-110 shadow-sm'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:scale-105'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Name input */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Votre prénom ou pseudonyme
            </label>
            <input
              type="text"
              autoFocus
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleStart();
                }
              }}
              placeholder="Ex: Rayen"
              className="w-full h-11 px-4 text-sm rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-500"
            />
          </div>

          {/* Primary Start Button */}
          <button
            type="button"
            onClick={() => handleStart()}
            className="w-full h-12 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md mt-2"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Démarrer maintenant</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* 1-Click Fast Guest Access */}
          <button
            type="button"
            onClick={() => handleStart('Rayen')}
            className="w-full text-center py-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
          >
            Accès express 1-clic (Invité Rayen) →
          </button>
        </div>

        {/* Security footnote */}
        <div className="mt-5 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Stockage 100% local • Zéro clé API requise</span>
        </div>
      </motion.div>
    </div>
  );
};
