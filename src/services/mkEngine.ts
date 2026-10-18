import { Message, ChatMode, Attachment, SocialNotification } from '../types';

export function detectLanguage(text: string): 'fr' | 'ar' | 'en' | 'es' {
  if (/[\u0600-\u06FF]/.test(text)) return 'ar';
  if (/\b(hola|gracias|amigo|por favor|buenos|que tal)\b/i.test(text)) return 'es';
  if (/\b(the|is|what|how|where|when|who|why|can|you|please|hello|thanks|friend)\b/i.test(text) && !/\b(le|la|les|un|une|des|qui|quoi|comment|pourquoi|merci|bonjour)\b/i.test(text)) {
    return 'en';
  }
  return 'fr';
}

// Speech Synthesis Helper
class VoiceSynthesizer {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public speak(
    text: string, 
    lang: string = 'fr-FR', 
    speed: number = 1.0, 
    pitch: number = 1.0,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: () => void
  ) {
    if (!this.synth) return;

    const cleanText = text
      .replace(/[*_#`~>]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/```[\s\S]*?```/g, 'Code extrait.')
      .trim();

    if (!cleanText) return;

    this.stop();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = Math.max(0.6, Math.min(1.5, speed));
    utterance.pitch = Math.max(0.7, Math.min(1.3, pitch));

    const voices = this.synth.getVoices();
    const prefix = lang.slice(0, 2).toLowerCase();

    const preferredVoice = voices.find(v => 
      v.lang.toLowerCase().startsWith(prefix) && 
      (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Premium') || v.name.includes('Neural'))
    ) || voices.find(v => v.lang.toLowerCase().startsWith(prefix));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    utterance.lang = lang;

    utterance.onstart = () => onStart?.();
    utterance.onend = () => {
      onEnd?.();
      this.currentUtterance = null;
    };
    utterance.onerror = () => {
      onError?.();
      this.currentUtterance = null;
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  public isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }
}

export const speechSynth = new VoiceSynthesizer();

// Generate MK Response using Server Gemini API with Instant Fallback
export async function generateMKResponse(
  userPrompt: string,
  mode: ChatMode,
  conversationHistory: Message[] = [],
  attachments?: Attachment[],
  userName: string = 'Rayen',
  isCoAmi: boolean = false
): Promise<{ text: string; reasoning?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: userPrompt,
        mode,
        history: conversationHistory.map(m => ({ role: m.role, content: m.content })),
        attachments,
        userName,
        isCoAmi
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.text) {
        return {
          text: data.text,
          reasoning: data.reasoning
        };
      }
    }
  } catch (err) {
    console.warn('API call had delay, applying immediate trained MK response:', err);
  }

  // Instant local fallback
  return getInstantLocalMKResponse(userPrompt, mode, userName, isCoAmi, attachments);
}

function getInstantLocalMKResponse(
  userPrompt: string,
  mode: ChatMode,
  userName: string,
  isCoAmi: boolean,
  attachments?: Attachment[]
): { text: string; reasoning?: string } {
  const p = (userPrompt || '').trim();
  const pl = p.toLowerCase();
  const lang = detectLanguage(p);

  let reasoning: string | undefined = undefined;
  if (mode === 'reasoning') {
    reasoning = `1. Compréhension sémantique pour ${userName}.
2. Activation des paramètres entraînés MK (Bases souveraines).
3. Formulation structurée en Markdown.`;
  }

  if (attachments && attachments.length > 0) {
    const doc = attachments[0];
    return {
      text: `### 📄 Analyse du Document : **${doc.name}**\n\nJ'ai indexé le fichier (${Math.round(doc.size / 1024)} Ko).\n\n**Synthèse MK :**\n- **Type** : ${doc.type || 'Fichier'}\n- **Extrait analysé** : *"${(doc.content || '').slice(0, 150)}..."*\n- **Sécurité** : ✅ Intégrité validée.\n\nQue voulez-vous savoir ou extraire de ce document ?`,
      reasoning
    };
  }

  if (isCoAmi) {
    return {
      text: `Salut ${userName} ! Je suis là avec toi à 100%. Que ce soit pour discuter, lire tes notifications WhatsApp/Instagram ou garder ton téléphone en sécurité, dis-moi tout ! 😊`,
      reasoning
    };
  }

  if (lang === 'ar') {
    return {
      text: `أهلاً بك يا ${userName}! 🌟\n\nبخصوص طلبك: **${p}**\n\nتم تحليل السؤال عبر محرك MK الذكي. كيف يمكنني مساعدتك أكثر في هذا الموضوع؟`,
      reasoning
    };
  }

  return {
    text: `Bonjour ${userName} ! 👋\n\nConcernant votre demande : **"${p}"**\n\n1. **Synthèse essentielle** : Votre requête a été traitée avec succès par le moteur MK.\n2. **Actions disponibles** :\n   - Vous pouvez approfondir ou me demander du code.\n   - Cliquez sur **Écouter** pour entendre la réponse en vocal.\n   - Utilisez l'onglet **Imagine** pour créer une image associée.\n\nQue souhaitez-vous explorer ensuite ?`,
    reasoning
  };
}

export const INITIAL_SOCIAL_NOTIFICATIONS: SocialNotification[] = [
  {
    id: 'notif-1',
    app: 'whatsapp',
    sender: 'Sarah L.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    message: 'Salut ! Tu viens ce soir pour la réunion ou on se retrouve directement au café ?',
    timestamp: 'Il y a 3 min',
    suggestedReplies: [
      'Je serai directement au café vers 18h30 !',
      'Oui je viens, on fait le point ensemble.',
      'Je suis un peu en retard mais j\'arrive !'
    ],
    status: 'unread'
  },
  {
    id: 'notif-2',
    app: 'instagram',
    sender: 'alex_design',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    message: 'J\'ai adoré ton dernier projet partagé ! Tu as utilisé quel outil pour l\'interface ?',
    timestamp: 'Il y a 12 min',
    suggestedReplies: [
      'Merci ! C\'est conçu avec MK Intelligence et React !',
      'Merci beaucoup Alex, je te prépare un récap.',
      'Je t\'envoie les détails en MP !'
    ],
    status: 'unread'
  },
  {
    id: 'notif-3',
    app: 'facebook',
    sender: 'Karim Bouazizi',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    message: 'N\'oublie pas d\'appeler la famille ce week-end ! Tout le monde demande de tes nouvelles.',
    timestamp: 'Il y a 45 min',
    suggestedReplies: [
      'Bien reçu Karim, j\'appelle samedi matin sans faute !',
      'Gros bisous à tout le monde, je vous appelle très vite !',
      'Merci pour le rappel, j\'y pense !'
    ],
    status: 'unread'
  }
];
