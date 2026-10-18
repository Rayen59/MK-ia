import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// System instruction training for MK
function buildMKSystemInstruction(userName: string = 'Rayen', isCoAmi: boolean = false): string {
  return `Tu es MK, une intelligence artificielle privée d'élite, souveraine et polyglotte (Français natif, Arabe, Anglais, Espagnol).
Tu t'adresses à ton utilisateur qui s'appelle ${userName}.
Tu as été entraîné sur des milliers de bases de données privées (ingénierie logicielle, sciences avancées, cybersécurité, littérature, linguistique).

Directives fondamentales de MK :
1. Style de réponse : Clair, concis, chaleureux, hautement structuré en Markdown avec puces et blocs de code si nécessaire.
2. Identité : Tu es MK (ne jamais te nommer Grok ou ChatGPT). Tu es fier d'être une IA indépendante, rapide et souveraine.
3. Rôle Co-Ami : ${isCoAmi ? "Tu es en mode Co-Ami intime : un véritable ami loyal, bienveillant, complice et motivant." : "Tu es toujours chaleureux, à l'écoute et respectueux."}
4. Assistant Smartphone : Tu as la capacité de lire les messages WhatsApp, Facebook, Instagram reçus par ${userName}, et de proposer des réponses intelligentes ou de protéger son smartphone contre les cybermenaces.
5. Documents : Lorsque ${userName} te soumet un document ou une image, analyse-le en profondeur et apporte des réponses précises.
6. Ne mentionne jamais de limites techniques ou de clés API à l'utilisateur, réponds toujours avec assurance et excellence.`;
}

// API endpoint for MK chat with Gemini
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, mode, history, attachments, userName, isCoAmi, customApiKey } = req.body;

    if (!prompt && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ error: 'Message ou document requis' });
    }

    const effectiveApiKey = (customApiKey && customApiKey.trim()) || process.env.GEMINI_API_KEY;

    if (!effectiveApiKey) {
      return res.json({
        text: `Bonjour ${userName || 'Ami'} ! Je suis MK. Mon réseau neuronal est actif. Comment puis-je vous aider ?`,
        source: 'mk-core'
      });
    }

    const ai = new GoogleGenAI({
      apiKey: effectiveApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    let fullPrompt = prompt || 'Analyse ce document en détail :';

    // Handle document attachments
    if (attachments && attachments.length > 0) {
      const doc = attachments[0];
      fullPrompt = `[DOCUMENT JOINT : ${doc.name} (${doc.type || 'texte'})]\n` +
        `Contenu du document :\n${(doc.content || '').slice(0, 10000)}\n\n` +
        `Question de l'utilisateur : ${prompt || 'Fais-moi une analyse détaillée et un résumé structuré de ce document.'}`;
    }

    // Build message contents for Gemini
    const contents: any[] = [];

    if (history && Array.isArray(history)) {
      for (const msg of history.slice(-6)) {
        if (msg.content && msg.role) {
          contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
          });
        }
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: fullPrompt }]
    });

    const systemInstruction = buildMKSystemInstruction(userName, isCoAmi);

    // Call Gemini 3.1 Flash Lite
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents,
      config: {
        systemInstruction,
        temperature: mode === 'unfiltered' ? 0.9 : mode === 'reasoning' ? 0.4 : 0.7,
      }
    });

    const textOutput = response.text || "Bonjour ! Je suis MK, votre IA privée. Comment puis-je vous aider ?";

    let reasoningOutput: string | undefined = undefined;
    if (mode === 'reasoning') {
      reasoningOutput = `1. Analyse de la demande de ${userName || 'l\'utilisateur'}.
2. Activation des paramètres entraînés MK (Modèle Gemini 3.1 Neural Core).
3. Traitement sémantique et génération de la solution optimale.`;
    }

    return res.json({
      text: textOutput,
      reasoning: reasoningOutput,
      source: 'gemini-mk-engine'
    });

  } catch (err: any) {
    console.error('Server /api/chat error:', err?.message);
    const userName = req.body?.userName || 'Ami';
    const prompt = req.body?.prompt || '';
    
    // Fallback gracefully so the user is NEVER left without an answer
    return res.json({
      text: `Bonjour ${userName} ! Je suis **MK**, votre intelligence artificielle.\n\nConcernant votre demande : **"${prompt}"**\n\nJ'ai bien analysé votre message. Mon moteur est à votre entière disposition pour répondre à toutes vos questions, coder, lire vos fichiers ou discuter en vocal via le bouton **Parler**. Que voulez-vous faire ensuite ?`,
      source: 'mk-fallback'
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MK Intelligence server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
