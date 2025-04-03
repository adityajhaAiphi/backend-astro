'use client'

import { useState, useEffect, useRef } from 'react';
import { Box, TextField, IconButton, Typography, Paper, Avatar, Badge } from '@mui/material';
import { Minimize2, Maximize2, Send, Image, Smile, X } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { FileUpload } from './chat/FileUpload';
import { useFileUpload } from '@/hooks/useFileUpload';
import styles from './Chat.module.css';
import { useRouter } from 'next/navigation';
import { useChatState } from '@/providers/ChatProvider';
import { MessageActions } from './chat/MessageActions';
import { toast } from 'react-hot-toast';
import { ChatMessage } from '@/types/chat';

interface ChatProps {
  astrologerId: string;
  astrologerName: string;
  onClose?: () => void;
  isAstrologer?: boolean;
  layout?: 'basic' | 'fullscreen' | 'floating';  // Add 'floating' as valid option
  isMinimized?: boolean;
  userId?: string;  // Add userId for astrologer dashboard
  userName?: string; // Add userName for astrologer dashboard
  roomId?: string; // Add roomId for direct chat initialization
}

export function Chat({ 
  astrologerId, 
  astrologerName, 
  onClose, 
  layout = 'basic',
  isMinimized: controlledMinimized,
  isAstrologer = false,
  userId,
  userName,
  roomId
}: ChatProps) {
  const [localMinimized, setLocalMinimized] = useState(false);
  const isMinimized = controlledMinimized ?? localMinimized;
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { 
    messages, 
    sendMessage, 
    isConnected, 
    isTyping, 
    consultation, 
    isLoading,
    deleteMessage,
    addReaction 
  } = useChat(
    // Ensure we never pass undefined or null values to useChat
    userId || astrologerId || '', 
    isAstrologer, 
    roomId || undefined
  );
  const { uploadFile } = useFileUpload();
  const [lastMessage, setLastMessage] = useState<string>('');
  const router = useRouter();
  const { minimizeChat, maximizeChat } = useChatState();
  const [quotedMessage, setQuotedMessage] = useState<ChatMessage | null>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await sendMessage(message, quotedMessage);
      setMessage('');
      setQuotedMessage(null);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleFileSelect = async (file: File) => {
    try {
      const url = await uploadFile(file, 'image');
      if (url) {
        await sendMessage(url);
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
    }
  };

  const handleContainerClick = () => {
    if (isMinimized) {
      setLocalMinimized(false);
    }
  };

  const handleMinimizeToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMinimized) {
      // When maximizing, first navigate to chat page
      router.push(`/chat/${astrologerId}`);
      // Add a small delay to allow navigation to complete before maximizing
      setTimeout(() => {
        maximizeChat();
      }, 100);
    } else {
      minimizeChat();
      if (window.location.pathname !== '/consult-astro') {
        router.push('/consult-astro');
      }
    }
  };

  const handleQuote = (message: ChatMessage) => {
    setQuotedMessage(message);
    // Focus the input
    const input = document.querySelector<HTMLInputElement>('input[type="text"]');
    if (input) {
      input.focus();
    }
  };

  if (isLoading) {
    return <div>Loading chat history...</div>;
  }

  return (
    <Box 
      className={`
        ${styles.chatContainer} 
        ${layout === 'fullscreen' ? styles.floatingLayout : styles.basicLayout}
        ${isMinimized ? styles.minimized : ''}
      `}
      onClick={handleContainerClick}
    >
      {/* Chat Header */}
      <Paper elevation={1} className={styles.chatHeader}>
        <Box className={styles.headerContent}>
          <Box className={styles.astrologerInfo}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              variant="dot"
              color={isConnected ? 'success' : 'error'}
            >
              <Avatar 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${astrologerId}`}
                alt={astrologerName}
                className={styles.avatar}
              />
            </Badge>
            <Box ml={2}>
              <Typography variant="subtitle1" className={styles.astrologerName}>
                {astrologerName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {isConnected ? 'Online' : 'Offline'}
              </Typography>
              {!isMinimized && consultation && (
                <Typography variant="caption" color="text.secondary">
                  Balance: ₹{consultation.remainingBalance} • Rate: ₹{consultation.ratePerMinute}/min
                </Typography>
              )}
            </Box>
          </Box>
          <IconButton 
            onClick={handleMinimizeToggle}
            className={styles.minimizeButton}
          >
            {isMinimized ? <Maximize2 size={20} /> : <Minimize2 size={20} />}
          </IconButton>
        </Box>
        <Typography className={styles.minimizedPreview}>
          {lastMessage || 'No messages yet'}
        </Typography>
      </Paper>

      {/* Chat Messages */}
      {!isMinimized && (
        <Box className={styles.messagesContainer}>
          {messages.map((msg, index) => (
            <Box
              key={msg.id || `${msg.sender.id}-${msg.timestamp}-${index}`}
              className={`${styles.messageWrapper} ${
                msg.sender.id === user?._id ? styles.userMessage : styles.astrologerMessage
              }`}
            >
              <Box className={styles.messageContent}>
                {msg.quotedMessage && (
                  <Box className={styles.quotedMessage}>
                    <Typography variant="caption" color="text.secondary">
                      {msg.quotedMessage.sender.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {msg.quotedMessage.content}
                    </Typography>
                  </Box>
                )}
                
                {msg.isDeleted ? (
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ fontStyle: 'italic' }}
                  >
                    This message was deleted
                  </Typography>
                ) : msg.content.startsWith('http') ? (
                  <img src={msg.content} alt="Shared" className={styles.sharedImage} />
                ) : (
                  <Typography>{msg.content}</Typography>
                )}

                {msg.reactions && msg.reactions.length > 0 && (
                  <Box className={styles.reactions}>
                    {msg.reactions.map((reaction, i) => (
                      <span key={i} className={styles.reaction}>{reaction}</span>
                    ))}
                  </Box>
                )}

                <Box className={styles.messageFooter}>
                  <Typography variant="caption" className={styles.timestamp}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Typography>
                  <MessageActions
                    message={msg}
                    onQuote={handleQuote}
                    onDelete={deleteMessage}
                    onReact={addReaction}
                    isOwnMessage={msg.sender.id === user?._id}
                  />
                </Box>
              </Box>
            </Box>
          ))}
          
          {isTyping && (
            <Box className={styles.typingIndicator}>
              <Typography variant="caption" color="text.secondary">
                {astrologerName} is typing...
              </Typography>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>
      )}

      {/* Chat Input */}
      {!isMinimized && (
        <Paper 
          component="form" 
          onSubmit={handleSend} 
          className={styles.inputContainer}
        >
          {quotedMessage && (
            <Box className={styles.quotePreview}>
              <Typography variant="caption">
                Replying to {quotedMessage.sender.name}
              </Typography>
              <Typography variant="body2" noWrap>
                {quotedMessage.content}
              </Typography>
              <IconButton 
                size="small" 
                onClick={() => setQuotedMessage(null)}
                className={styles.cancelQuote}
              >
                <X size={16} />
              </IconButton>
            </Box>
          )}
          <FileUpload onFileSelect={handleFileSelect}>
            <IconButton component="span" className={styles.attachButton}>
              <Image size={20} />
            </IconButton>
          </FileUpload>
          <IconButton className={styles.emojiButton}>
            <Smile size={20} />
          </IconButton>
          <TextField
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isConnected ? "Type your message..." : "Connecting..."}
            disabled={!isConnected}
            variant="standard"
            InputProps={{
              disableUnderline: true,
              className: styles.input
            }}
          />
          <IconButton 
            type="submit" 
            color="primary"
            disabled={!message.trim() || !isConnected}
            className={styles.sendButton}
          >
            <Send size={20} />
          </IconButton>
        </Paper>
      )}
    </Box>
  );
}

