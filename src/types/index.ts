export type ChatMode = 'fast' | 'reasoning' | 'deep' | 'unfiltered';

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string; // extracted text or dataUrl
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  reasoning?: string;
  attachments?: Attachment[];
  mode?: ChatMode;
  audioPlaying?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  isPinned?: boolean;
}

export interface UserAccount {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  createdAt: number;
  language: string;
  theme: 'dark' | 'light';
  voiceSpeed: number; // 0.8 to 1.4
  voicePitch: number; // 0.8 to 1.2
}

export interface GeneratedImage {
  id: string;
  prompt: string;
  style: string;
  aspectRatio: '1:1' | '16:9' | '9:16';
  url: string;
  createdAt: number;
}

export interface SocialNotification {
  id: string;
  app: 'whatsapp' | 'facebook' | 'instagram' | 'sms';
  sender: string;
  avatar: string;
  message: string;
  timestamp: string;
  suggestedReplies: string[];
  status: 'unread' | 'read' | 'replied';
  replySent?: string;
}

export interface PhoneSecurityStatus {
  protectionActive: boolean;
  threatLevel: 'safe' | 'warning' | 'alert';
  lastScanTime: string;
  scannedApps: number;
  batteryLevel: number;
  batteryHealth: string;
  blockedTrackers: number;
  phishingShield: boolean;
  networkEncrypted: boolean;
}
