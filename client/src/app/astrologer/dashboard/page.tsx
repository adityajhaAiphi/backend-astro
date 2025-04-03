'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Grid, Card, CardContent, Divider } from '@mui/material';
import { MessageSquare, Clock, User } from 'lucide-react';
import { ChatList } from '@/components/astrologer/ChatList';
import { ChatBox } from '@/components/astrologer/ChatBox';
import { useAuth } from '@/hooks/useAuth';

interface ChatSession {
  _id: string;
  roomId: string;
  userId: {
    _id: string;
    name: string;
    profileImage: string | null;
  };
  lastMessage: string;
  startTime: string;
  status: string;
}

export default function AstrologerDashboard() {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchChatSessions = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/astrologer/chats');
        
        if (!response.ok) {
          throw new Error('Failed to fetch chat sessions');
        }

        const data = await response.json();
        console.log('Fetched chat sessions:', data);
        setChatSessions(data);
      } catch (error) {
        console.error('Error fetching chat sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatSessions();
    
    // Set up a refresh interval
    const interval = setInterval(fetchChatSessions, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const handleChatSelect = (chatSession: ChatSession) => {
    setSelectedChat(chatSession);
  };

  if (!user) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" mb={4}>
        Astrologer Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Chat Sessions Section */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ height: '75vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Box p={2} borderBottom="1px solid #eee">
              <Typography variant="h6" display="flex" alignItems="center" gap={1}>
                <MessageSquare size={20} />
                Chat Sessions
              </Typography>
            </Box>
            
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
                <CircularProgress size={30} />
              </Box>
            ) : chatSessions.length === 0 ? (
              <Box 
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                flex={1}
                p={3}
                textAlign="center"
              >
                <Box>
                  <MessageSquare size={40} strokeWidth={1} color="#aaa" style={{ margin: '0 auto 16px' }} />
                  <Typography color="textSecondary">
                    No chat sessions yet
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    When clients start conversations with you, they'll appear here.
                  </Typography>
                </Box>
              </Box>
            ) : (
              <ChatList 
                chatSessions={chatSessions}
                onSelectChat={handleChatSelect}
                selectedChatId={selectedChat?._id}
              />
            )}
          </Paper>
        </Grid>
        
        {/* Chat Box Section */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ height: '75vh', overflow: 'hidden' }}>
            {selectedChat ? (
              <ChatBox
                chatSession={selectedChat}
                astrologerId={user._id}
                astrologerName={user.name}
              />
            ) : (
              <Box 
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                height="100%"
                p={3}
                textAlign="center"
              >
                <Box>
                  <MessageSquare size={50} strokeWidth={1} color="#aaa" style={{ margin: '0 auto 16px' }} />
                  <Typography variant="h6" color="textSecondary">
                    Select a chat to view the conversation
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Choose a chat session from the list on the left to start messaging.
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 