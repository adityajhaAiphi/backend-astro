import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';
import type { ChatMessage } from '@/types/chat';
import { toast } from 'react-hot-toast';

// Define quick prompts with icons and categories
const quickPrompts = [
  {
    id: 'love',
    icon: '💝',
    text: 'Love Life',
    questions: [
      "When will I find my true love?",
      "Is my current relationship heading towards marriage?",
      "What can I do to improve my love life?"
    ]
  },
  {
    id: 'career',
    icon: '💼',
    text: 'Career',
    questions: [
      "Should I switch my job this year?",
      "Which career path is best for me?",
      "When is the best time for a career move?"
    ]
  },
  {
    id: 'finance',
    icon: '💰',
    text: 'Finance',
    questions: [
      "How's my financial future looking?",
      "When can I expect financial growth?",
      "What investments would be lucky for me?"
    ]
  },
  {
    id: 'health',
    icon: '🌟',
    text: 'Health',
    questions: [
      "How can I improve my health?",
      "Which remedies will boost my wellbeing?",
      "What should I be careful about?"
    ]
  },
  {
    id: 'timing',
    icon: '⏰',
    text: 'Timing',
    questions: [
      "What's my lucky time today?",
      "When should I start new ventures?",
      "Which days are favorable this month?"
    ]
  },
  {
    id: 'remedies',
    icon: '💎',
    text: 'Remedies',
    questions: [
      "Which gemstone suits me best?",
      "What remedies can help my situation?",
      "How can I improve my luck?"
    ]
  }
];

export function useChat(userId: string, isAstrologer: boolean = false, customRoomId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [consultation, setConsultation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuth();

  const fetchStoredMessages = useCallback(async () => {
    if (!user?._id || !userId) {
      console.log('Missing user IDs, skipping message fetch');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const roomId = customRoomId || [user._id.trim(), userId.trim()].sort().join('_');
      console.log('Fetching messages for room:', roomId, 'using user ID:', user._id, 'and target ID:', userId);
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3001';
      const url = `${baseUrl}/api/chat/get-messages/${roomId}`;
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('No messages found for this room ID');
          setMessages([]);
          setIsLoading(false);
          return;
        }
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      console.log('Received chat data:', data);
      
      const transformedMessages: ChatMessage[] = data.messages.map((msg: any) => ({
        id: msg._id?.toString(),
        content: msg.message,
        type: msg.messageType || 'text',
        sender: {
          id: msg.senderId.toString(),
          name: msg.senderId === user._id ? user.name : 'Astrologer',
          role: msg.senderId === user._id ? (isAstrologer ? 'astrologer' : 'user') : (isAstrologer ? 'user' : 'astrologer')
        },
        receiver: {
          id: msg.senderId === user._id ? userId : user._id,
          role: msg.senderId === user._id ? (isAstrologer ? 'user' : 'astrologer') : (isAstrologer ? 'astrologer' : 'user')
        },
        roomId,
        sessionId: data.sessionId || roomId,
        timestamp: new Date(msg.timestamp).toISOString(),
        reactions: msg.reactions || [],
        isDeleted: msg.isDeleted || false
      }));

      console.log('Transformed messages:', transformedMessages);
      setMessages(transformedMessages);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      setMessages([]);
      toast.error('Unable to load chat history');
    } finally {
      setIsLoading(false);
    }
  }, [user?._id, userId, isAstrologer, customRoomId]);

  useEffect(() => {
    fetchStoredMessages();
  }, [fetchStoredMessages]);

  const startConsultation = async () => {
    if (!user?._id || !userId) {
      throw new Error('Missing user information');
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3001';
      
      const balanceResponse = await fetch(`${baseUrl}/api/users/${user._id}/balance`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!balanceResponse.ok) {
        throw new Error('Unable to verify balance');
      }

      const response = await fetch(
        `${baseUrl}/api/consultations/start`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ 
            astrologerId: userId,
            type: 'chat'
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || 'Failed to start consultation');
      }

      const data = await response.json();
      setConsultation(data.consultation);
      return data.consultation;
    } catch (error: any) {
      console.error('Error starting consultation:', error);
      if (error.message.includes('balance')) {
        toast.error('Insufficient balance. Please recharge to continue.');
      } else {
        toast.error(error.message || 'Unable to start consultation');
      }
      throw error;
    }
  };

  const sendMessage = useCallback(async (content: string, quotedMessage?: ChatMessage | null) => {
    if (!socketRef.current || !user?._id) {
      toast.error('Not connected to chat server');
      return;
    }

    try {
      // Only users need to start consultations, astrologers don't
      if (!consultation && !isAstrologer) {
        try {
          await startConsultation();
        } catch (error) {
          console.error('Failed to start consultation but will try to send message anyway:', error);
          // Continue anyway, message sending might still work
        }
      }

      const roomId = customRoomId || [user._id.trim(), userId.trim()].sort().join('_');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3001';
      
      const url = `${baseUrl}/api/chat/save-message`;

      console.log('Sending message to roomId:', roomId);
      
      const messageData = {
        chatId: roomId,
        senderId: user._id,
        message: content,
        messageType: 'text',
        quotedMessage: quotedMessage ? {
          id: quotedMessage.id,
          content: quotedMessage.content,
          sender: {
            name: quotedMessage.sender.name
          }
        } : undefined
      };

      const saveResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(messageData)
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        console.error('Save message error:', errorData);
        throw new Error(errorData.error || 'Failed to save message');
      }

      const responseData = await saveResponse.json();
      console.log('Message saved successfully:', responseData);
      
      const message: ChatMessage = {
        id: responseData.messageId || `${user._id}-${Date.now()}`,
        content,
        type: 'text',
        sender: {
          id: user._id,
          name: user.name || 'User',
          role: isAstrologer ? 'astrologer' : 'user'
        },
        receiver: {
          id: userId,
          role: isAstrologer ? 'user' : 'astrologer'
        },
        roomId,
        sessionId: consultation?.id || responseData.chatId || roomId,
        timestamp: new Date().toISOString(),
        quotedMessage: quotedMessage ? {
          id: quotedMessage.id,
          content: quotedMessage.content,
          sender: {
            name: quotedMessage.sender.name
          }
        } : undefined
      };

      socketRef.current.emit('send_message', message);
      setMessages(prev => [...prev, message]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      if (error.message.includes('balance')) {
        toast.error('Insufficient balance. Please recharge to continue chatting.');
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    }
  }, [user, userId, consultation, isAstrologer, customRoomId]);

  useEffect(() => {
    const connectToSocket = () => {
      if (!user?._id || !userId) {
        console.log('Missing required user IDs for socket connection');
        return;
      }
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 
                     'https://astroalert-backend-m1hn.onrender.com';
      console.log('Connecting to Socket.IO server for chat at:', baseUrl);
      
      // Close any existing connection before creating a new one
      if (socketRef.current) {
        console.log('Closing existing socket connection');
        socketRef.current.close();
      }
      
      socketRef.current = io(baseUrl, {
        path: '/socket.io',
        transports: ['polling', 'websocket'],
        upgrade: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 20000,
        forceNew: true,
        auth: {
          userId: user?._id,
          token: localStorage.getItem('token')
        }
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        toast.error('Connection error - retrying...');
        
        // Attempt reconnection with increasing delay
        setTimeout(() => {
          if (socketRef.current) {
            console.log('Attempting to reconnect socket...');
            socketRef.current.connect();
          }
        }, 2000);
      });

      socketRef.current.on('connect', () => {
        console.log('Socket connected with ID:', socketRef.current?.id);
        setIsConnected(true);

        if (user?._id && userId) {
          const roomId = customRoomId || [user._id.trim(), userId.trim()].sort().join('_');
          console.log('Joining room:', roomId);
          socketRef.current?.emit('join_room', { roomId });
        }
      });

      socketRef.current.on('receive_message', (message: ChatMessage) => {
        console.log('Received message:', message);
        if (message.sender.id !== user?._id) {
          setMessages(prev => [...prev, message]);
        }
      });

      socketRef.current.on('typing', ({ userId }) => {
        setIsTyping(userId !== user?._id);
        setTimeout(() => setIsTyping(false), 3000);
      });

      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });
    };

    if (user?._id) {
      connectToSocket();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.close();
      }
    };
  }, [user?._id, userId, customRoomId]);

  const updateMessage = useCallback((messageId: string, updates: Partial<ChatMessage>) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, ...updates } : msg
    ));
  }, []);

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/api/chat/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete message');
      }

      updateMessage(messageId, { isDeleted: true });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Unable to delete message');
    }
  }, [updateMessage]);

  const addReaction = useCallback(async (messageId: string, reaction: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/api/chat/messages/${messageId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reaction })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add reaction');
      }

      updateMessage(messageId, { 
        reactions: [...(messages.find(m => m.id === messageId)?.reactions || []), reaction] 
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error('Unable to add reaction');
    }
  }, [messages, updateMessage]);

  return {
    messages,
    sendMessage,
    isConnected,
    isTyping,
    consultation,
    quickPrompts,
    isLoading,
    refreshMessages: fetchStoredMessages,
    deleteMessage,
    addReaction
  };
}
