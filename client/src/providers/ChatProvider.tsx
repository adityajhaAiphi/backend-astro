'use client'

import React, { createContext, useContext, useState } from 'react';
import { Chat } from '@/components/Chat';

type ChatLayout = 'basic' | 'fullscreen' | 'floating';

interface ChatState {
  isOpen: boolean;
  isMinimized: boolean;
  astrologerId?: string;
  astrologerName?: string;
  isFloatingVisible: boolean;
  layout: ChatLayout;
}

interface ChatContextType {
  chatState: ChatState;
  openChat: (astrologerId: string, astrologerName: string) => void;
  minimizeChat: () => void;
  maximizeChat: () => void;
  closeChat: () => void;
  showFloatingChat: () => void;
  hideFloatingChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chatState, setChatState] = useState<ChatState>({
    isOpen: false,
    isMinimized: false,
    isFloatingVisible: false,
    layout: 'basic',
  });

  const openChat = (astrologerId: string, astrologerName: string) => {
    setChatState({
      isOpen: true,
      isMinimized: false,
      astrologerId,
      astrologerName,
      isFloatingVisible: false,
      layout: 'basic',
    });
  };

  const minimizeChat = () => {
    setChatState(prev => ({ 
      ...prev, 
      isMinimized: true,
      isFloatingVisible: true
    }));
  };

  const maximizeChat = () => {
    setChatState(prev => ({ 
      ...prev, 
      isMinimized: false,
      isFloatingVisible: false
    }));
  };

  const closeChat = () => {
    setChatState({
      isOpen: false,
      isMinimized: false,
      isFloatingVisible: false,
      layout: 'basic',
    });
  };

  const showFloatingChat = () => {
    setChatState(prev => ({ ...prev, isFloatingVisible: true }));
  };

  const hideFloatingChat = () => {
    setChatState(prev => ({ ...prev, isFloatingVisible: false }));
  };

  return (
    <ChatContext.Provider 
      value={{ 
        chatState, 
        openChat, 
        minimizeChat, 
        maximizeChat, 
        closeChat,
        showFloatingChat,
        hideFloatingChat
      }}
    >
      {children}
      {chatState.isOpen && chatState.astrologerId && chatState.isFloatingVisible && (
        <Chat
          astrologerId={chatState.astrologerId}
          astrologerName={chatState.astrologerName || 'Astrologer'}
          layout="floating"
          isMinimized={chatState.isMinimized}
        />
      )}
    </ChatContext.Provider>
  );
}

export const useChatState = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatState must be used within a ChatProvider');
  }
  return context;
};