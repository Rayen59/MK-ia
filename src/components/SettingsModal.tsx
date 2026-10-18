import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserAccount } from '../types';
import { speechSynth } from '../services/mkEngine';
import { 
  X, 
  Settings as SettingsIcon, 
  Volume2, 
  Sun, 
  Moon, 
  Globe, 
  Trash2, 
  Check, 
  ShieldCheck,
  User,
  Sliders
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAccount: UserAccount;
  onUpdateAccount: (updated: UserAccount) => void;
  onClearAllChats: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userAccount,
  onUpdateAccount,
  onClearAllChats
}) => {
  const [speed, setSpeed] = useState(userAccount.voiceSpeed || 1.0);
  const [pitch, setPitch] = useState(userAccount.voicePitch || 1.0);
  const [lang, setLang] = useState(userAccount.language || 'fr');
  const [displayName, setDisplayName] = useState(userAccount.displayName);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleTestVoice = () => {
    setIsTestingVoice(true);
    const text = lang === 'ar'
      ? 'مرحباً بك! هذه تجربة لجودة ووضوح النطق الصوتي لمحرك إم كيه الخاص.'
      : lang === 'en'
      ? 'Hello! This is a real-time sample of MK fluid speech synthesis.'
      : 'Bonjour ! Ceci est un test de la synthèse vocale fluide et naturelle du moteur MK.';

    const voiceLang = lang === 'ar' ? 'ar-SA' : lang === 'en' ? 'en-US' : 'fr-FR';

    speechSynth.speak(
      text,
      voiceLang,
      speed,
      pitch,
      () => setIsTestingVoice(true),
      () => setIsTestingVoice(false),
      () => setIsTestingVoice(false)
    );
  };

  const handleSave = () => {
    const updated: UserAccount = {
      ...userAccount,
      displayName: displayName.trim() || userAccount.displayName,
      language: lang,
      voiceSpeed: speed,
      voicePitch: pitch
    };

    onUpdateAccount(updated);
    localStorage.setItem('mk_user_account', JSON.stringify(updated));
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white dark:bg-[#121215] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
                <SettingsIcon className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Paramètres MK
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-600 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto py-4 space-y-6">
            
            {/* User Profile */}
            <div>
              <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Profil Utilisateur</span>
              </h4>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{userAccount.avatar}</span>
                <div className="flex-1">
                  <label className="text-[11px] text-neutral-400">Nom d'affichage</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full h-9 px-3 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Vocal Synthesis Settings */}
            <div>
              <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                <span>Synthèse Vocale Fluide</span>
              </h4>

              <div className="space-y-4 p-4 rounded-2xl bg-neutral-50 dark:bg-[#16161b] border border-neutral-200/60 dark:border-neutral-800">
                {/* Language Picker */}
                <div>
                  <div className="flex items-center justify-between text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    <span>Langue de diction</span>
                    <Globe className="w-3.5 h-3.5 text-neutral-400" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'fr', label: 'Français' },
                      { id: 'ar', label: 'العربية' },
                      { id: 'en', label: 'English' }
                    ].map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => setLang(l.id)}
                        className={`py-1.5 rounded-xl text-xs font-medium border transition-all ${
                          lang === l.id
                            ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-transparent font-semibold shadow-xs'
                            : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Speed Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    <span>Vitesse de parole</span>
                    <span className="font-mono text-neutral-500">{speed.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.7"
                    max="1.4"
                    step="0.1"
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    className="w-full accent-neutral-900 dark:accent-white"
                  />
                </div>

                {/* Pitch Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    <span>Tonalité de la voix (Pitch)</span>
                    <span className="font-mono text-neutral-500">{pitch.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.3"
                    step="0.1"
                    value={pitch}
                    onChange={(e) => setPitch(parseFloat(e.target.value))}
                    className="w-full accent-neutral-900 dark:accent-white"
                  />
                </div>

                {/* Test Voice button */}
                <button
                  type="button"
                  onClick={handleTestVoice}
                  className="w-full h-9 rounded-xl bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isTestingVoice ? 'Lecture en cours...' : 'Tester la voix MK'}</span>
                </button>
              </div>
            </div>

            {/* Privacy & Storage */}
            <div>
              <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Confidentialité & Mémoire</span>
              </h4>
              <p className="text-[11px] text-neutral-400 mb-3">
                MK stocke tout en local sécurisé sur votre appareil. Zéro clé API externe, zéro profilage.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Voulez-vous supprimer toutes vos discussions enregistrées ?")) {
                    onClearAllChats();
                    onClose();
                  }
                }}
                className="w-full h-9 rounded-xl border border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Effacer tout l'historique des discussions</span>
              </button>
            </div>

          </div>

          {/* Footer Save */}
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            >
              Fermer
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Enregistré !</span>
                </>
              ) : (
                <span>Enregistrer</span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
