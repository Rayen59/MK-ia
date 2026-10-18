import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatSession, UserAccount } from '../types';
import { MKLogo } from './MKLogo';
import { 
  Search, 
  Plus, 
  MessageSquare, 
  Trash2, 
  Pin, 
  Settings, 
  Database, 
  X, 
  LogOut, 
  ShieldCheck, 
  Volume2, 
  Sparkles,
  ChevronRight,
  Server
} from 'lucide-react';

interface SlidingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onTogglePinSession: (id: string) => void;
  userAccount: UserAccount;
  onOpenSettings: () => void;
  onOpenServers: () => void;
  onLogout: () => void;
}

export const SlidingPanel: React.FC<SlidingPanelProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onTogglePinSession,
  userAccount,
  onOpenSettings,
  onOpenServers,
  onLogout
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pinnedSessions = filteredSessions.filter(s => s.isPinned);
  const regularSessions = filteredSessions.filter(s => !s.isPinned);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Panel */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="fixed top-0 left-0 bottom-0 z-50 w-80 sm:w-96 bg-white dark:bg-[#0c0c0e] border-r border-neutral-200 dark:border-neutral-800 flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header with MK Monogram & Close */}
            <div className="p-4 border-b border-neutral-100 dark:border-neutral-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MKLogo size={34} />
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight">
                    MK Intelligence
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Réseau privé actif</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions & Search */}
            <div className="p-4 space-y-3">
              <button
                type="button"
                onClick={() => {
                  onNewSession();
                  onClose();
                }}
                className="w-full h-11 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-xs flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Nouvelle discussion</span>
              </button>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher dans les discussions..."
                  className="w-full h-10 pl-9 pr-3 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-transparent focus:border-neutral-300 dark:focus:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Session History List */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
              {pinnedSessions.length > 0 && (
                <div>
                  <div className="px-2 pb-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                    <Pin className="w-3 h-3 text-amber-500" />
                    <span>Épinglés</span>
                  </div>
                  <div className="space-y-1">
                    {pinnedSessions.map((session) => (
                      <SessionRow
                        key={session.id}
                        session={session}
                        isActive={session.id === activeSessionId}
                        onSelect={() => {
                          onSelectSession(session.id);
                          onClose();
                        }}
                        onDelete={() => onDeleteSession(session.id)}
                        onTogglePin={() => onTogglePinSession(session.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="px-2 pb-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  <span>Historique</span>
                </div>
                {regularSessions.length === 0 && pinnedSessions.length === 0 ? (
                  <div className="py-8 text-center text-xs text-neutral-400">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>Aucune discussion trouvée</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {regularSessions.map((session) => (
                      <SessionRow
                        key={session.id}
                        session={session}
                        isActive={session.id === activeSessionId}
                        onSelect={() => {
                          onSelectSession(session.id);
                          onClose();
                        }}
                        onDelete={() => onDeleteSession(session.id)}
                        onTogglePin={() => onTogglePinSession(session.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* System Server Info Badge */}
            <div className="p-3 mx-3 mb-2 rounded-2xl bg-neutral-100 dark:bg-[#141418] border border-neutral-200/60 dark:border-neutral-800/80">
              <button
                type="button"
                onClick={() => {
                  onOpenServers();
                  onClose();
                }}
                className="w-full flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                    <Server className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-900 dark:text-white group-hover:underline">
                      Serveurs & Bases MK
                    </p>
                    <p className="text-[10px] text-neutral-500">12 800 clusters • Zéro API Key</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Footer with User Profile and Settings Trigger */}
            <div className="p-3 border-t border-neutral-100 dark:border-neutral-900 bg-neutral-50 dark:bg-[#0a0a0c] flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <span className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-base shrink-0">
                  {userAccount.avatar}
                </span>
                <div className="truncate">
                  <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                    {userAccount.displayName}
                  </p>
                  <p className="text-[10px] text-neutral-400 font-mono truncate">
                    @{userAccount.username}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    onOpenSettings();
                    onClose();
                  }}
                  title="Paramètres de l'IA"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  title="Changer de compte"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

interface SessionRowProps {
  session: ChatSession;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}

const SessionRow: React.FC<SessionRowProps> = ({
  session,
  isActive,
  onSelect,
  onDelete,
  onTogglePin
}) => {
  return (
    <div
      className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
        isActive
          ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium'
          : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900/60'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2 truncate pr-2">
        <MessageSquare className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        <span className="truncate">{session.title || 'Discussion sans titre'}</span>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          title={session.isPinned ? 'Détacher' : 'Épingler'}
          className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-amber-500 transition-colors"
        >
          <Pin className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Supprimer"
          className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-rose-500 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
