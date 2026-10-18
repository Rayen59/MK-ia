import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Message, ChatMode, Attachment, UserAccount } from '../types';
import { MKLogo } from './MKLogo';
import { speechSynth } from '../services/mkEngine';
import { 
  Plus, 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  ChevronDown, 
  FileText, 
  Image as ImageIcon, 
  X, 
  Zap,
  Brain,
  Search,
  Flame,
  ArrowUp
} from 'lucide-react';

interface ChatViewProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (content: string, mode: ChatMode, attachments?: Attachment[]) => void;
  userAccount: UserAccount;
  onStartLiveVoice: () => void;
}

const MODE_OPTIONS: { id: ChatMode; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'fast', label: 'Rapide', icon: <Zap className="w-3.5 h-3.5 text-amber-500" />, desc: 'Réponses instantanées directes' },
  { id: 'reasoning', label: 'Réfléchi', icon: <Brain className="w-3.5 h-3.5 text-indigo-500" />, desc: 'Raisonnement logique avec étapes' },
  { id: 'deep', label: 'Recherche Profonde', icon: <Search className="w-3.5 h-3.5 text-sky-500" />, desc: 'Synthèse exhaustive & documentation' },
  { id: 'unfiltered', label: 'Non-Filtré', icon: <Flame className="w-3.5 h-3.5 text-rose-500" />, desc: 'Créativité maximale & liberté d\'expression' },
];

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  isLoading,
  onSendMessage,
  userAccount,
  onStartLiveVoice
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedMode, setSelectedMode] = useState<ChatMode>('fast');
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  // Voice dictation
  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("La reconnaissance vocale nécessite un navigateur compatible (Chrome, Safari, Edge).");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = userAccount.language === 'ar' ? 'ar-SA' : userAccount.language === 'en' ? 'en-US' : 'fr-FR';

      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  // Text-to-speech speaker
  const handleToggleSpeak = (msg: Message) => {
    if (speakingMessageId === msg.id) {
      speechSynth.stop();
      setSpeakingMessageId(null);
    } else {
      setSpeakingMessageId(msg.id);
      const voiceLang = userAccount.language === 'ar' ? 'ar-SA' : userAccount.language === 'en' ? 'en-US' : 'fr-FR';
      speechSynth.speak(
        msg.content,
        voiceLang,
        userAccount.voiceSpeed,
        userAccount.voicePitch,
        () => setSpeakingMessageId(msg.id),
        () => setSpeakingMessageId(null),
        () => setSpeakingMessageId(null)
      );
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // File upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();

      if (file.type.startsWith('image/')) {
        reader.onload = () => {
          setPendingAttachments((prev) => [
            ...prev,
            {
              id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              name: file.name,
              size: file.size,
              type: file.type,
              content: reader.result as string
            }
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        reader.onload = () => {
          setPendingAttachments((prev) => [
            ...prev,
            {
              id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              name: file.name,
              size: file.size,
              type: file.type || 'text/plain',
              content: (reader.result as string) || ''
            }
          ]);
        };
        reader.readAsText(file);
      }
    });

    setIsPlusMenuOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = () => {
    const trimmed = inputText.trim();
    if ((!trimmed && pendingAttachments.length === 0) || isLoading) return;

    onSendMessage(trimmed, selectedMode, pendingAttachments);
    setInputText('');
    setPendingAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentModeInfo = MODE_OPTIONS.find((m) => m.id === selectedMode) || MODE_OPTIONS[0];

  return (
    <div className="relative flex flex-col flex-1 h-[calc(100vh-3.5rem)] max-w-4xl w-full mx-auto overflow-hidden">
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
        accept=".txt,.md,.pdf,.json,.csv,.js,.ts,.tsx,.py,.html,.css,image/*"
        className="hidden"
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          /* Empty State - Central Watermark Logo exactly like Grok */
          <div className="h-full flex flex-col items-center justify-center text-center select-none py-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative my-auto"
            >
              <MKLogo variant="watermark" size={130} />
            </motion.div>

            {/* Quick suggested questions */}
            <div className="w-full max-w-md grid grid-cols-2 gap-2 mt-auto pb-2">
              {[
                { title: '👋 Bonjour MK', prompt: 'Bonjour MK, présente-toi et explique ce que tu peux faire pour moi.' },
                { title: '📄 Analyser un document', prompt: 'Peux-tu analyser un document et en faire le résumé ?' },
                { title: '🛡️ Sécurité Smartphone', prompt: 'Comment protèges-tu mon téléphone contre les virus et le phishing ?' },
                { title: '🤝 Co-Ami Vocal', prompt: 'Discute avec moi comme un véritable ami en vocal !' },
              ].map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onSendMessage(sug.prompt, selectedMode);
                  }}
                  className="p-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 dark:bg-[#141417] dark:hover:bg-[#1c1c22] border border-neutral-200/60 dark:border-neutral-800 text-left transition-all active:scale-[0.98]"
                >
                  <p className="font-semibold text-xs text-neutral-900 dark:text-white">{sug.title}</p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">{sug.prompt}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Conversation Message List */
          <div className="space-y-5 pb-28">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Attachments */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {msg.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-800 dark:text-neutral-200"
                      >
                        {att.type.startsWith('image/') ? (
                          <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                        ) : (
                          <FileText className="w-3.5 h-3.5 text-amber-500" />
                        )}
                        <span className="truncate max-w-[150px]">{att.name}</span>
                        <span className="text-[10px] text-neutral-400">
                          ({Math.round(att.size / 1024)} Ko)
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium'
                      : 'bg-neutral-100 dark:bg-[#141417] text-neutral-900 dark:text-neutral-100 border border-neutral-200/60 dark:border-neutral-800'
                  }`}
                >
                  {/* Reasoning block */}
                  {msg.reasoning && (
                    <details className="mb-3 p-2.5 rounded-xl bg-neutral-200/50 dark:bg-neutral-900/60 text-xs border border-neutral-300/40 dark:border-neutral-800">
                      <summary className="font-semibold text-neutral-600 dark:text-neutral-400 cursor-pointer select-none flex items-center gap-1.5">
                        <Brain className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Raisonnement logique MK</span>
                      </summary>
                      <pre className="mt-2 text-[11px] text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap font-mono leading-normal">
                        {msg.reasoning}
                      </pre>
                    </details>
                  )}

                  <div className="whitespace-pre-wrap select-text font-normal">{msg.content}</div>
                </div>

                {/* Assistant Action Bar */}
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mt-1.5 ml-1 text-xs text-neutral-400">
                    <button
                      type="button"
                      onClick={() => handleToggleSpeak(msg)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
                        speakingMessageId === msg.id ? 'text-amber-500 font-semibold' : 'text-neutral-500'
                      }`}
                    >
                      {speakingMessageId === msg.id ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                          <span>Arrêter</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Écouter</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500">Copié</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copier</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </motion.div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-neutral-400 text-xs py-2 px-3 rounded-2xl bg-neutral-100 dark:bg-neutral-900 w-fit">
                <span className="w-2 h-2 rounded-full bg-neutral-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-neutral-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-neutral-500 animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1 text-neutral-500 font-medium">MK génère la réponse...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Bottom Input Bar matching Grok screenshot */}
      <div className="sticky bottom-0 w-full p-3 sm:p-4 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-[#08080a] dark:via-[#08080a]/95 dark:to-transparent">
        
        {/* Pending attachments */}
        {pendingAttachments.length > 0 && (
          <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1">
            {pendingAttachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-1.5 px-3 py-1 bg-neutral-200 dark:bg-neutral-800 rounded-full text-xs text-neutral-800 dark:text-neutral-200 shrink-0"
              >
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                <span className="max-w-[120px] truncate">{att.name}</span>
                <button
                  type="button"
                  onClick={() => setPendingAttachments(prev => prev.filter(p => p.id !== att.id))}
                  className="hover:text-rose-500 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Card Container */}
        <div className="relative rounded-3xl bg-neutral-100/90 dark:bg-[#151518] border border-neutral-200/80 dark:border-neutral-800 shadow-lg p-2.5 sm:p-3 transition-colors">
          
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez une question"
            className="w-full bg-transparent px-2.5 pt-1 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none resize-none leading-relaxed"
          />

          {/* Controls Bar inside the card */}
          <div className="flex items-center justify-between mt-2 pt-1">
            
            {/* Left Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              
              {/* Plus Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
                  title="Ajouter un document"
                  className="w-8 h-8 rounded-full bg-neutral-200/80 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-300 active:scale-95 transition-all"
                >
                  <Plus className={`w-4 h-4 transition-transform ${isPlusMenuOpen ? 'rotate-45' : ''}`} />
                </button>

                <AnimatePresence>
                  {isPlusMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute bottom-11 left-0 z-50 w-56 rounded-2xl bg-white dark:bg-[#1a1a1f] border border-neutral-200 dark:border-neutral-800 shadow-xl p-2 space-y-1"
                    >
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors text-left"
                      >
                        <FileText className="w-4 h-4 text-amber-500" />
                        <div>
                          <p className="font-medium">Lire un document</p>
                          <p className="text-[10px] text-neutral-400">PDF, TXT, DOC, CSV, Code</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors text-left"
                      >
                        <ImageIcon className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="font-medium">Analyser une image</p>
                          <p className="text-[10px] text-neutral-400">OCR & compréhension</p>
                        </div>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mode Dropdown (e.g. ⚡ Rapide) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
                  className="h-8 px-2.5 rounded-full bg-neutral-200/80 hover:bg-neutral-300 dark:bg-neutral-800/90 dark:hover:bg-neutral-700 flex items-center gap-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 active:scale-95 transition-all"
                >
                  {currentModeInfo.icon}
                  <span className="text-xs">{currentModeInfo.label}</span>
                  <ChevronDown className="w-3 h-3 text-neutral-500" />
                </button>

                <AnimatePresence>
                  {isModeDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute bottom-11 left-0 z-50 w-64 rounded-2xl bg-white dark:bg-[#1a1a1f] border border-neutral-200 dark:border-neutral-800 shadow-xl p-2 space-y-1"
                    >
                      {MODE_OPTIONS.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setSelectedMode(m.id);
                            setIsModeDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl transition-colors text-left ${
                            selectedMode === m.id
                              ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold'
                              : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300'
                          }`}
                        >
                          <div className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-900">
                            {m.icon}
                          </div>
                          <div>
                            <p className="font-medium">{m.label}</p>
                            <p className="text-[10px] text-neutral-400">{m.desc}</p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

            {/* Right Controls: Microphone & Send / Parler */}
            <div className="flex items-center gap-2">
              
              <button
                type="button"
                onClick={toggleRecording}
                title={isRecording ? 'Arrêter la dictée' : 'Dicter vocalement'}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                }`}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Action Button: Send if typed, Parler if empty */}
              {inputText.trim().length > 0 || pendingAttachments.length > 0 ? (
                <button
                  type="button"
                  onClick={handleSend}
                  title="Envoyer la question à MK"
                  className="h-8 px-3 rounded-full bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 flex items-center justify-center gap-1 font-semibold text-xs active:scale-95 transition-all shadow-sm"
                >
                  <span>Envoyer</span>
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
              ) : (
                /* The exact "||| Parler" button matching screenshot */
                <button
                  type="button"
                  onClick={onStartLiveVoice}
                  title="Lancer la conversation vocale en direct"
                  className="h-8 px-3.5 rounded-full bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 flex items-center justify-center gap-1.5 font-semibold text-xs active:scale-95 transition-all shadow-md"
                >
                  <div className="flex items-center gap-[2px]">
                    <span className="w-[2px] h-3 bg-white dark:bg-neutral-900 rounded-full animate-pulse" />
                    <span className="w-[2px] h-4 bg-white dark:bg-neutral-900 rounded-full animate-pulse [animation-delay:0.15s]" />
                    <span className="w-[2px] h-2.5 bg-white dark:bg-neutral-900 rounded-full animate-pulse [animation-delay:0.3s]" />
                  </div>
                  <span>Parler</span>
                </button>
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
