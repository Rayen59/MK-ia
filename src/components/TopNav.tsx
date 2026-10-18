import React from 'react';
import { ArrowLeft, Edit3, Sun, Moon, Shield } from 'lucide-react';

export type ActiveTab = 'chat' | 'imagine' | 'co-ami' | 'servers';

interface TopNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenDrawer: () => void;
  onNewChat: () => void;
  canGoBack: boolean;
  onGoBack: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onTabChange,
  onOpenDrawer,
  onNewChat,
  canGoBack,
  onGoBack,
  theme,
  onToggleTheme
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-[#08080a]/95 backdrop-blur-md border-b border-neutral-100 dark:border-neutral-900/60 transition-colors">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between">
        
        {/* Left Slot: Drawer Menu Button + Always Accessible Back Arrow */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Back button (always visible and functional as requested by user) */}
          <button
            type="button"
            onClick={onGoBack}
            title="Revenir en arrière"
            aria-label="Revenir en arrière"
            className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Sliding Panel Trigger (exact 2 horizontal bars like the Grok screenshot) */}
          <button
            type="button"
            onClick={onOpenDrawer}
            title="Menu & Historique"
            aria-label="Ouvrir le menu"
            className="w-10 h-10 rounded-full flex flex-col items-center justify-center gap-1.5 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 active:scale-95 transition-all"
          >
            <span className="w-4 h-[2px] bg-neutral-800 dark:bg-neutral-200 rounded-full" />
            <span className="w-4 h-[2px] bg-neutral-800 dark:bg-neutral-200 rounded-full" />
          </button>
        </div>

        {/* Center Slot: Segmented Navigation (Chat, Imagine, Co-Ami, Serveurs) */}
        <div className="flex items-center gap-4 sm:gap-6 text-sm font-medium">
          <button
            type="button"
            onClick={() => onTabChange('chat')}
            className={`relative py-2.5 transition-colors ${
              activeTab === 'chat'
                ? 'text-neutral-900 dark:text-white font-semibold'
                : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            <span>Chat</span>
            {activeTab === 'chat' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2.5px] bg-neutral-900 dark:bg-white rounded-full transition-all" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onTabChange('imagine')}
            className={`relative py-2.5 transition-colors ${
              activeTab === 'imagine'
                ? 'text-neutral-900 dark:text-white font-semibold'
                : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            <span>Imagine</span>
            {activeTab === 'imagine' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2.5px] bg-neutral-900 dark:bg-white rounded-full transition-all" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onTabChange('co-ami')}
            className={`relative py-2.5 transition-colors flex items-center gap-1.5 ${
              activeTab === 'co-ami'
                ? 'text-neutral-900 dark:text-white font-semibold'
                : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            <span>Co-Ami</span>
            {activeTab === 'co-ami' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2.5px] bg-neutral-900 dark:bg-white rounded-full transition-all" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onTabChange('servers')}
            className={`relative py-2.5 hidden sm:flex items-center gap-1 transition-colors ${
              activeTab === 'servers'
                ? 'text-neutral-900 dark:text-white font-semibold'
                : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            <span>Serveurs MK</span>
            {activeTab === 'servers' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2.5px] bg-neutral-900 dark:bg-white rounded-full transition-all" />
            )}
          </button>
        </div>

        {/* Right Slot: Dark/Light Mode + New Chat (edit icon from screenshot) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Theme Toggle (dark & light mode switcher for easy reading) */}
          <button
            type="button"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Basculer en mode clair' : 'Basculer en mode sombre'}
            aria-label="Basculer le thème"
            className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 active:scale-95 transition-all"
          >
            {theme === 'dark' ? (
              <Sun className="w-4.5 h-4.5 text-amber-300" />
            ) : (
              <Moon className="w-4.5 h-4.5 text-neutral-700" />
            )}
          </button>

          {/* New Chat Button (Icon identical to top right in screenshot) */}
          <button
            type="button"
            onClick={onNewChat}
            title="Nouvelle discussion"
            aria-label="Nouvelle discussion"
            className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 active:scale-95 transition-all"
          >
            <Edit3 className="w-5 h-5" />
          </button>
        </div>

      </div>
    </header>
  );
};
