import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserAccount, SocialNotification, PhoneSecurityStatus } from '../types';
import { INITIAL_SOCIAL_NOTIFICATIONS, speechSynth } from '../services/mkEngine';
import { MKLogo } from './MKLogo';
import { 
  Heart, 
  MessageCircle, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  Send, 
  Mic, 
  CheckCircle2, 
  Smartphone, 
  Battery, 
  AlertTriangle, 
  RefreshCw, 
  Bell, 
  ArrowRight,
  Sparkles,
  Lock,
  Eye,
  Plus
} from 'lucide-react';

interface CoAmiViewProps {
  userAccount: UserAccount;
  onStartLiveVoice: () => void;
}

export const CoAmiView: React.FC<CoAmiViewProps> = ({
  userAccount,
  onStartLiveVoice
}) => {
  const [notifications, setNotifications] = useState<SocialNotification[]>(INITIAL_SOCIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<'missions' | 'security'>('missions');
  const [speakingNotifId, setSpeakingNotifId] = useState<string | null>(null);
  const [dictatingId, setDictatingId] = useState<string | null>(null);
  const [customReplyText, setCustomReplyText] = useState<{ [id: string]: string }>({});

  // Phone Security State
  const [securityStatus, setSecurityStatus] = useState<PhoneSecurityStatus>({
    protectionActive: true,
    threatLevel: 'safe',
    lastScanTime: 'Aujourd\'hui à 10:48',
    scannedApps: 142,
    batteryLevel: 94,
    batteryHealth: 'Excellente (34°C)',
    blockedTrackers: 67,
    phishingShield: true,
    networkEncrypted: true
  });
  const [isScanning, setIsScanning] = useState(false);

  // Play Notification Aloud (TTS in appropriate language)
  const handleReadAloud = (notif: SocialNotification) => {
    if (speakingNotifId === notif.id) {
      speechSynth.stop();
      setSpeakingNotifId(null);
      return;
    }

    setSpeakingNotifId(notif.id);

    const voiceLang = userAccount.language === 'ar' ? 'ar-SA' : userAccount.language === 'en' ? 'en-US' : 'fr-FR';
    
    let speechText = '';
    if (userAccount.language === 'ar') {
      speechText = `رسالة جديدة من ${notif.sender} على تطبيق ${notif.app}. الرسالة تقول: ${notif.message}`;
    } else if (userAccount.language === 'en') {
      speechText = `New message from ${notif.sender} on ${notif.app}. Message reads: ${notif.message}`;
    } else {
      speechText = `${notif.sender} t'a envoyé un message sur ${notif.app.toUpperCase()} : "${notif.message}". Veux-tu que je réponde pour toi ?`;
    }

    speechSynth.speak(
      speechText,
      voiceLang,
      userAccount.voiceSpeed,
      userAccount.voicePitch,
      () => setSpeakingNotifId(notif.id),
      () => setSpeakingNotifId(null),
      () => setSpeakingNotifId(null)
    );
  };

  // Reply to Notification
  const handleSendReply = (notifId: string, replyText: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notifId
          ? { ...n, status: 'replied', replySent: replyText }
          : n
      )
    );

    // Vocal confirmation
    const voiceLang = userAccount.language === 'ar' ? 'ar-SA' : userAccount.language === 'en' ? 'en-US' : 'fr-FR';
    const confirmMessage = userAccount.language === 'ar'
      ? `تم إرسال ردك الذكي بنجاح!`
      : `Message envoyé avec succès : "${replyText}". Mission smartphone accomplie !`;

    speechSynth.speak(confirmMessage, voiceLang, userAccount.voiceSpeed, userAccount.voicePitch);
  };

  // Simulate new incoming notification
  const handleSimulateNewNotification = () => {
    const apps: ('whatsapp' | 'instagram' | 'facebook')[] = ['whatsapp', 'instagram', 'facebook'];
    const chosenApp = apps[Math.floor(Math.random() * apps.length)];

    const sampleSenders = [
      { name: 'Lucas Martin', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', msg: 'Hey, tu as vu la dernière mise à jour de MK ? C\'est bluffant !' },
      { name: 'Nadia K.', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', msg: 'Est-ce qu\'on s\'appelle dans 10 minutes pour finaliser la présentation ?' },
      { name: 'Équipe Projet', avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150', msg: 'Validation reçue pour les serveurs et le déploiement local !' }
    ];

    const pick = sampleSenders[Math.floor(Math.random() * sampleSenders.length)];

    const newNotif: SocialNotification = {
      id: `notif-${Date.now()}`,
      app: chosenApp,
      sender: pick.name,
      avatar: pick.avatar,
      message: pick.msg,
      timestamp: 'À l\'instant',
      suggestedReplies: [
        'Parfait, je regarde ça de suite !',
        'Oui bien sûr, appelons-nous maintenant.',
        'Super nouvelle, merci pour le partage !'
      ],
      status: 'unread'
    };

    setNotifications(prev => [newNotif, ...prev]);

    // Automatically notify user vocally as requested in the prompt!
    handleReadAloud(newNotif);
  };

  // Run Antivirus & Protection Scan
  const handleRunSecurityScan = () => {
    if (isScanning) return;
    setIsScanning(true);

    const voiceLang = userAccount.language === 'ar' ? 'ar-SA' : userAccount.language === 'en' ? 'en-US' : 'fr-FR';
    speechSynth.speak("Lancement de l'inspection complète de sécurité de votre smartphone par MK...", voiceLang);

    setTimeout(() => {
      setIsScanning(false);
      setSecurityStatus((prev) => ({
        ...prev,
        lastScanTime: 'À l\'instant',
        scannedApps: prev.scannedApps + 3,
        blockedTrackers: prev.blockedTrackers + 12
      }));

      speechSynth.speak(
        "Analyse de sécurité terminée. Aucune menace détectée. Votre téléphone est 100% protégé.",
        voiceLang
      );
    }, 2500);
  };

  return (
    <div className="flex flex-col flex-1 h-[calc(100vh-3.5rem)] max-w-4xl w-full mx-auto p-4 sm:p-6 overflow-y-auto">
      
      {/* Co-Ami Hero Banner */}
      <div className="relative rounded-3xl bg-neutral-100/90 dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800 p-5 sm:p-6 shadow-sm mb-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center text-3xl shadow-md">
                🤝
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#121215] flex items-center justify-center text-[10px] text-white">
                ✓
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  MK Co-Ami & Assistant Mobile
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold">
                  En ligne
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Votre compagnon d'écoute, lecteur de notifications WhatsApp / Instagram et gardien de smartphone.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onStartLiveVoice}
            className="w-full sm:w-auto h-11 px-5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm shrink-0"
          >
            <Volume2 className="w-4 h-4 text-amber-400 dark:text-amber-600" />
            <span>Parler avec Co-Ami</span>
          </button>
        </div>

        {/* Tab switch inside Co-Ami */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-neutral-200/60 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => setActiveTab('missions')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'missions'
                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Missions Téléphone & Messages ({notifications.filter(n => n.status === 'unread').length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'security'
                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Bouclier & Protection Smartphone</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Missions Téléphone & Messages */}
      {activeTab === 'missions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-500" />
              <span>Lecteur de messages (WhatsApp, Instagram, Facebook)</span>
            </h3>

            <button
              type="button"
              onClick={handleSimulateNewNotification}
              className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Simuler un message entrant</span>
            </button>
          </div>

          <div className="space-y-3 pb-8">
            {notifications.map((notif) => {
              const isUnread = notif.status === 'unread';
              const isReplied = notif.status === 'replied';

              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl p-4 sm:p-5 border transition-all ${
                    isUnread
                      ? 'bg-white dark:bg-[#151518] border-neutral-300 dark:border-neutral-700 shadow-sm'
                      : 'bg-neutral-50 dark:bg-[#101013] border-neutral-200/60 dark:border-neutral-800/60 opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <img
                          src={notif.avatar}
                          alt={notif.sender}
                          className="w-10 h-10 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                        />
                        <span
                          className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase text-white shadow-xs ${
                            notif.app === 'whatsapp'
                              ? 'bg-emerald-600'
                              : notif.app === 'instagram'
                              ? 'bg-pink-600'
                              : 'bg-blue-600'
                          }`}
                        >
                          {notif.app.slice(0, 2)}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                            {notif.sender}
                          </h4>
                          <span className="text-[11px] text-neutral-400 capitalize">
                            sur {notif.app} • {notif.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-1 leading-relaxed font-medium">
                          “{notif.message}”
                        </p>
                      </div>
                    </div>

                    {/* Audio read button */}
                    <button
                      type="button"
                      onClick={() => handleReadAloud(notif)}
                      title="Lire à haute voix avec la voix MK"
                      className={`p-2 rounded-xl transition-all ${
                        speakingNotifId === notif.id
                          ? 'bg-amber-500 text-white animate-pulse'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
                      }`}
                    >
                      {speakingNotifId === notif.id ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Replied state or Smart suggestions */}
                  {isReplied ? (
                    <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800/80 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Réponse envoyée : « {notif.replySent} »</span>
                    </div>
                  ) : (
                    <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-neutral-400 font-semibold">
                        <span>💡 Réponses vocales & contextuelles suggérées par MK :</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {notif.suggestedReplies.map((reply, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleSendReply(notif.id, reply)}
                            className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800/80 dark:hover:bg-neutral-700 text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-all active:scale-95 flex items-center gap-1.5 text-left"
                          >
                            <Send className="w-3 h-3 text-neutral-400" />
                            <span>{reply}</span>
                          </button>
                        ))}
                      </div>

                      {/* Custom write or dictation */}
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="text"
                          placeholder="Ou écrivez / dictez votre propre réponse..."
                          value={customReplyText[notif.id] || ''}
                          onChange={(e) =>
                            setCustomReplyText({ ...customReplyText, [notif.id]: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && customReplyText[notif.id]?.trim()) {
                              handleSendReply(notif.id, customReplyText[notif.id]);
                            }
                          }}
                          className="flex-1 h-9 px-3 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (customReplyText[notif.id]?.trim()) {
                              handleSendReply(notif.id, customReplyText[notif.id]);
                            }
                          }}
                          className="h-9 px-3 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold flex items-center gap-1"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Envoyer</span>
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Bouclier & Protection Smartphone */}
      {activeTab === 'security' && (
        <div className="space-y-5 pb-8">
          {/* Main Shield Card */}
          <div className="p-5 rounded-3xl bg-neutral-100/90 dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    Bouclier Cyber-Protection MK
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Surveillance temps réel active • Dernier scan : {securityStatus.lastScanTime}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunSecurityScan}
                disabled={isScanning}
                className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 active:scale-95 disabled:opacity-50 transition-all shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'Analyse en cours...' : 'Lancer un scan complet'}</span>
              </button>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-neutral-100/70 dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800">
              <div className="flex items-center justify-between text-neutral-500 mb-2">
                <span className="text-xs font-semibold">Applications scannées</span>
                <Smartphone className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white tabular-nums">
                {securityStatus.scannedApps}
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                ✓ 0 virus ou malware détecté
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-100/70 dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800">
              <div className="flex items-center justify-between text-neutral-500 mb-2">
                <span className="text-xs font-semibold">Traqueurs neutralisés</span>
                <Eye className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white tabular-nums">
                {securityStatus.blockedTrackers}
              </p>
              <p className="text-[11px] text-neutral-500 mt-1">
                Protection vie privée maximale
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-100/70 dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800">
              <div className="flex items-center justify-between text-neutral-500 mb-2">
                <span className="text-xs font-semibold">Batterie & Intégrité</span>
                <Battery className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white tabular-nums">
                {securityStatus.batteryLevel}%
              </p>
              <p className="text-[11px] text-neutral-500 mt-1">
                {securityStatus.batteryHealth}
              </p>
            </div>
          </div>

          {/* Protection modules list */}
          <div className="p-5 rounded-3xl bg-neutral-100/70 dark:bg-[#121215] border border-neutral-200/80 dark:border-neutral-800 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Modules de garde mobile actifs
            </h4>

            <div className="divide-y divide-neutral-200/60 dark:divide-neutral-800/80">
              {[
                { title: 'Anti-hameçonnage WhatsApp & Instagram', desc: 'Analyse automatique des liens reçus dans les messages pour bloquer les fraudes' },
                { title: 'Garde des autorisations sensibles', desc: 'Surveillance des accès au microphone, caméra et géolocalisation en arrière-plan' },
                { title: 'Chiffrement local des données MK', desc: 'Vos conversations et fichiers restent strictement sur votre appareil sans clé API externe' }
              ].map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div className="pr-4">
                    <p className="text-xs font-semibold text-neutral-900 dark:text-white">{item.title}</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">{item.desc}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold shrink-0">
                    Actif
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
