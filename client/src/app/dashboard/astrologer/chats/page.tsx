'use client';

import { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Avatar, List, ListItemButton, ListItemAvatar, ListItemText, Divider, TextField, IconButton, InputAdornment, CircularProgress, Alert } from '@mui/material';
import { Search, Send, ChatBubble, Person } from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { Chat } from '@/components/Chat';
import { toast } from 'react-hot-toast';
import styles from './ChatDashboard.module.css';
import { useRouter } from 'next/navigation';

interface ChatSession {
  _id: string;
  userId: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  lastMessage: string;
  startTime: string;
  status: 'active' | 'completed' | 'cancelled';
  unreadCount?: number;
  roomId: string;
}

export default function AstrologerChatDashboard() {
  const { user } = useAuth();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchChatSessions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching chat sessions...');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        const response = await fetch('/api/astrologer/chats', {
          signal: controller.signal,
          cache: 'no-store',
          headers: {
            'X-Request-Time': new Date().toISOString()
          }
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Error response:', response.status, errorData);
          throw new Error(`Failed to fetch chat sessions: ${response.status}`);
        }

        const data = await response.json();
        console.log('Chat sessions data:', data);
        
        // Check if data is an array
        if (!Array.isArray(data)) {
          console.error('Expected array but got:', typeof data, data);
          setChatSessions([]);
          throw new Error('Invalid response format');
        }
        
        // Map and validate data
        const validSessions = data.filter(session => 
          session && 
          session._id && 
          session.userId && 
          typeof session.userId === 'object' && 
          session.userId?._id
        ).map(session => ({
          ...session,
          // Ensure userId.name is always defined
          userId: {
            ...session.userId,
            name: session.userId?.name || 'Unknown User'
          },
          // Ensure roomId is always defined
          roomId: session.roomId || `${user?._id}_${session.userId?._id}`,
          // Format startTime if available
          startTime: session.startTime || new Date().toISOString()
        }));
        
        console.log('Valid sessions:', validSessions.length);
        setChatSessions(validSessions);
      } catch (error) {
        console.error('Error fetching chat sessions:', error);
        setError('Failed to load chat sessions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'astrologer') {
      fetchChatSessions();
      // Set up polling for new messages
      const interval = setInterval(fetchChatSessions, 60000); // Poll every minute
      return () => clearInterval(interval);
    }
  }, [user, retryCount]);

  const handleChatSelect = (chat: ChatSession) => {
    setSelectedChat(chat);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const filteredChats = chatSessions.filter(chat => 
    chat.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className={styles.container}>
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <IconButton 
              color="inherit" 
              size="small" 
              onClick={handleRetry}
            >
              Retry
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}
      
      <Grid container spacing={2} className={styles.grid}>
        {/* Chat List Sidebar */}
        <Grid item xs={12} md={4} className={styles.sidebar}>
          <Paper className={styles.sidebarPaper}>
            <Box p={2}>
              <Typography variant="h6" gutterBottom>
                Chat Sessions
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Divider />
            <List className={styles.chatList}>
              {filteredChats.length > 0 ? (
                filteredChats.map((chat) => (
                  <ListItemButton
                    key={chat._id}
                    selected={selectedChat?._id === chat._id}
                    onClick={() => handleChatSelect(chat)}
                    className={styles.chatItem}
                  >
                    <ListItemAvatar>
                      <Avatar src={chat.userId.profileImage}>
                        <Person />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={chat.userId.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" noWrap>
                            {chat.lastMessage || 'No messages yet'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {format(new Date(chat.startTime), 'MMM d, h:mm a')}
                          </Typography>
                        </Box>
                      }
                    />
                    {chat.unreadCount && chat.unreadCount > 0 && (
                      <Box className={styles.unreadBadge}>
                        {chat.unreadCount}
                      </Box>
                    )}
                  </ListItemButton>
                ))
              ) : (
                <Box p={3} textAlign="center" color="text.secondary">
                  <ChatBubble sx={{ fontSize: 40, mb: 1, opacity: 0.3 }} />
                  <Typography>
                    No chat sessions found
                  </Typography>
                  <Typography variant="body2" mt={1}>
                    {searchQuery ? 'Try a different search term' : 'Start a new chat with a user'}
                  </Typography>
                  <Box mt={3}>
                    <IconButton 
                      color="primary"
                      onClick={() => router.push('/dashboard/astrologer/users')}
                      sx={{ mb: 1 }}
                    >
                      <Person />
                    </IconButton>
                    <Typography variant="body2">
                      Go to Users to start a chat
                    </Typography>
                  </Box>
                </Box>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Chat Interface */}
        <Grid item xs={12} md={8} className={styles.chatArea}>
          {selectedChat ? (
            <Paper className={styles.chatPaper}>
              <Chat
                astrologerId={user?._id || ''}
                astrologerName={user?.name || 'Astrologer'}
                userId={selectedChat.userId._id}
                userName={selectedChat.userId.name}
                isAstrologer={true}
                layout="fullscreen"
                roomId={selectedChat.roomId}
              />
            </Paper>
          ) : (
            <Box className={styles.noChatSelected}>
              <ChatBubble sx={{ fontSize: 48, color: 'text.secondary' }} />
              <Typography variant="h6" color="text.secondary">
                Select a chat to start messaging
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
} 