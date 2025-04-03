import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { useChat } from '@/hooks/useChat';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';
import { useAuth } from '@/hooks/useAuth';
import { format, isToday, isYesterday } from 'date-fns';
import { Minimize2, Maximize2, X } from 'lucide-react';
import styles from '../Chat.module.css';
import { Message, ChatSession, MessageGroup } from '@/types/chat';

interface ChatProps {
  astrologerId: string;
  astrologerName?: string;
  onClose?: () => void;
}

export function Chat({ astrologerId, astrologerName, onClose }: ChatProps) {
  const { user } = useAuth();
  const [isMinimized, setIsMinimized] = useState(false);
  const { 
    messages, 
    sendMessage, 
    // loading, 
    // error, 
    isConnected,
    isTyping,
    // disconnect,
    // setIsVisible,
    quickPrompts,
    // handleQuickPrompt
  } = useChat(astrologerId);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messageGroups, setMessageGroups] = useState<MessageGroup[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);

  const handleSendMessage = async (
    content: string, 
    type: 'text' | 'image' | 'document' = 'text',
    fileUrl?: string,
    fileName?: string
  ) => {
    // try {
    //   await sendMessage(content, type);
    // } catch (error) {
    //   console.error('Failed to send message:', error);
    // }
  };

  // Group messages by date and session
  const groupMessages = (messages: Message[]) => {
    const groups: MessageGroup[] = [];
    let currentGroup: MessageGroup | null = null;

    messages.forEach(message => {
      const messageDate = new Date(message.timestamp);
      const sessionId = message.sessionId;

      if (!currentGroup || 
          currentGroup.date.toDateString() !== messageDate.toDateString() ||
          currentGroup.sessionId !== sessionId) {
        currentGroup = {
          date: messageDate,
          messages: [],
          sessionId
        };
        groups.push(currentGroup);
      }
      currentGroup.messages.push(message);
    });

    return groups;
  };

  // Format date for display
  const formatDate = (date: Date) => {
    if (isToday(date)) {
      return 'Today';
    }
    if (isYesterday(date)) {
      return 'Yesterday';
    }
    return format(date, 'MMMM d, yyyy');
  };

  // Format session time
  const formatSessionTime = (session: ChatSession) => {
    const start = format(session.startTime, 'h:mm a');
    const end = session.endTime ? format(session.endTime, 'h:mm a') : 'Ongoing';
    return `${start} - ${end}`;
  };

  // Update message groups when messages change
  useEffect(() => {
    setMessageGroups(groupMessages(messages));
  }, [messages]);

  return (
    <Box className={`${styles['chat-container']} ${isMinimized ? styles.minimized : ''}`}>
      {/* Chat Header */}
      <div className={styles['chat-header']}>
        <div className={styles['chat-title']}>
          Chat with {astrologerName || 'Astrologer'}
        </div>
        <div className={styles['header-right']}>
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className={styles['header-button']}
          >
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          {onClose && (
            <button onClick={onClose} className={styles['header-button']}>
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Quick Prompts */}
      {/* {!isMinimized && (
        <div className={styles['quick-prompts-container']}>
          {quickPrompts.map((prompt) => (
            <button
              key={prompt.id}
              onClick={() => handleQuickPrompt(prompt.id)}
              className={styles['quick-prompt-button']}
            >
              <span className={styles['quick-prompt-icon']}>{prompt.icon}</span>
              {prompt.text}
            </button>
          ))}
        </div>
      )} */}

      {/* Chat Messages */}
      {!isMinimized && (
        <>
          <Box className={styles['chat-messages']}>
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`${styles['message-wrapper']} ${
                  message.sender.id === user?._id ? styles.user : styles.astrologer
                }`}
              >
                <div className={styles['message-bubble']}>
                  <div className={styles['message-content']}>
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className={styles['typing-indicator']}>
                <div className={styles['typing-dots']}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </Box>
        </>
      )}

      {/* Chat Input */}
      {!isMinimized && <ChatInput onSendMessage={handleSendMessage} />}
    </Box>
  );
} 