'use client';

import { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Avatar, List, ListItemButton, ListItemAvatar, ListItemText, Divider, TextField, IconButton, InputAdornment, CircularProgress, Alert } from '@mui/material';
import { Search, ChatBubble, Person } from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { Chat } from '@/components/Chat';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface ChatSession {
  _id: string;
  astrologerId: {
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

export default function UserChatDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    async function fetchChats() {
      try {
        setLoading(true);
        const response = await fetch('/api/user/chats');
        
        if (!response.ok) {
          throw new Error('Failed to fetch chats');
        }
        
        const data = await response.json();
        setChats(data);
        
        // Auto-select the first chat if available
        if (data.length > 0 && !selectedChat) {
          setSelectedChat(data[0]);
        }
      } catch (error) {
        console.error('Error fetching chats:', error);
        setError('Failed to load chat sessions. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchChats();
    
    // Set up polling for new messages every 30 seconds
    const intervalId = setInterval(fetchChats, 30000);
    
    return () => clearInterval(intervalId);
  }, [user, router, selectedChat]);

  const handleChatSelect = (chat: ChatSession) => {
    setSelectedChat(chat);
  };

  const filteredChats = chats.filter(chat => 
    chat.astrologerId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (chat.lastMessage && chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        My Chats
      </Typography>
      
      <Grid container spacing={3}>
        {/* Chat List */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ height: '70vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Box p={2}>
              <TextField
                fullWidth
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                size="small"
              />
            </Box>
            
            <Divider />
            
            <List sx={{ overflow: 'auto', flexGrow: 1 }}>
              {filteredChats.length > 0 ? (
                filteredChats.map((chat) => (
                  <div key={chat._id}>
                    <ListItemButton
                      selected={selectedChat?._id === chat._id}
                      onClick={() => handleChatSelect(chat)}
                    >
                      <ListItemAvatar>
                        <Avatar src={chat.astrologerId.profileImage}>
                          <Person />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="subtitle1" noWrap>
                              {chat.astrologerId.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {format(new Date(chat.startTime), 'MMM d')}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2" noWrap>
                              {chat.lastMessage || 'No messages yet'}
                            </Typography>
                            {chat.unreadCount ? (
                              <Box
                                sx={{
                                  bgcolor: 'primary.main',
                                  color: 'white',
                                  borderRadius: '50%',
                                  width: 20,
                                  height: 20,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.75rem',
                                }}
                              >
                                {chat.unreadCount}
                              </Box>
                            ) : null}
                          </Box>
                        }
                      />
                    </ListItemButton>
                    <Divider />
                  </div>
                ))
              ) : (
                <Box p={3} textAlign="center" color="text.secondary">
                  <ChatBubble sx={{ fontSize: 40, mb: 1, opacity: 0.3 }} />
                  <Typography>
                    No chat sessions found
                  </Typography>
                  <Typography variant="body2" mt={1}>
                    {searchQuery ? 'Try a different search term' : 'Start a new chat with an astrologer'}
                  </Typography>
                  <Box mt={3}>
                    <IconButton 
                      color="primary"
                      onClick={() => router.push('/dashboard/user/astrologers')}
                      sx={{ mb: 1 }}
                    >
                      <Person />
                    </IconButton>
                    <Typography variant="body2">
                      Go to Astrologers to start a chat
                    </Typography>
                  </Box>
                </Box>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Chat Interface */}
        <Grid item xs={12} md={8}>
          {selectedChat ? (
            <Paper 
              elevation={2} 
              sx={{ 
                height: '70vh', 
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <Chat
                astrologerId={selectedChat.astrologerId._id}
                astrologerName={selectedChat.astrologerId.name}
                userId={user?._id || ''}
                userName={user?.name || 'User'}
                isAstrologer={false}
                layout="fullscreen"
                roomId={selectedChat.roomId}
              />
            </Paper>
          ) : (
            <Paper 
              elevation={2} 
              sx={{ 
                height: '70vh', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                p: 3
              }}
            >
              <ChatBubble sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Select a chat to start messaging
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                Or find a new astrologer to chat with
              </Typography>
              <Box mt={3}>
                <IconButton 
                  color="primary"
                  onClick={() => router.push('/dashboard/user/astrologers')}
                >
                  <Person />
                </IconButton>
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
} 