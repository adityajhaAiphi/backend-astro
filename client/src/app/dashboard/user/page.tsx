'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Box, Grid, Paper, Typography, Button, Card, CardContent, CardActions, Chip, Avatar } from '@mui/material';
import { Chat as ChatIcon, Person, CreditCard, History } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function UserDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [walletBalance, setWalletBalance] = useState(0);
  const [recentChats, setRecentChats] = useState([]);
  
  useEffect(() => {
    // Fetch user wallet balance
    const fetchWalletBalance = async () => {
      try {
        const response = await fetch(`/api/user/wallet`);
        if (response.ok) {
          const data = await response.json();
          setWalletBalance(data.balance || 0);
        }
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
      }
    };
    
    // Fetch recent chats 
    const fetchRecentChats = async () => {
      try {
        const response = await fetch(`/api/user/chats/recent`);
        if (response.ok) {
          const data = await response.json();
          setRecentChats(data || []);
        }
      } catch (error) {
        console.error('Error fetching recent chats:', error);
      }
    };
    
    fetchWalletBalance();
    fetchRecentChats();
  }, []);
  
  if (!user) {
    return null;
  }
  
  return (
    <Box p={3}>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user.name || 'User'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This is your personal dashboard. Explore our services below.
        </Typography>
      </Box>
      
      <Grid container spacing={3} mb={4}>
        {/* Wallet Card */}
        <Grid item xs={12} sm={6} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                height: '100%', 
                backgroundColor: 'primary.light',
                color: 'primary.contrastText',
                borderRadius: 2
              }}
            >
              <Box display="flex" alignItems="center" mb={2}>
                <CreditCard sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h6">My Wallet</Typography>
              </Box>
              <Typography variant="h4" gutterBottom>₹{walletBalance}</Typography>
              <Typography variant="body2" mb={2}>
                Available balance for consultations
              </Typography>
              <Button 
                variant="contained" 
                fullWidth
                onClick={() => router.push('/dashboard/user/wallet')}
                sx={{ backgroundColor: 'primary.dark' }}
              >
                Recharge Wallet
              </Button>
            </Paper>
          </motion.div>
        </Grid>
        
        {/* Chat with Astrologers Card */}
        <Grid item xs={12} sm={6} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                height: '100%',
                borderRadius: 2
              }}
            >
              <Box display="flex" alignItems="center" mb={2}>
                <ChatIcon sx={{ fontSize: 40, mr: 2, color: 'secondary.main' }} />
                <Typography variant="h6">Chat with Astrologers</Typography>
              </Box>
              <Typography variant="body1" mb={3}>
                Connect with experienced astrologers for personalized guidance.
              </Typography>
              <Button 
                variant="contained" 
                fullWidth
                color="secondary"
                onClick={() => router.push('/dashboard/user/astrologers')}
                startIcon={<ChatIcon />}
              >
                Start Chatting
              </Button>
            </Paper>
          </motion.div>
        </Grid>
        
        {/* Consultation History Card */}
        <Grid item xs={12} sm={6} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                height: '100%',
                borderRadius: 2
              }}
            >
              <Box display="flex" alignItems="center" mb={2}>
                <History sx={{ fontSize: 40, mr: 2, color: 'info.main' }} />
                <Typography variant="h6">My History</Typography>
              </Box>
              <Typography variant="body1" mb={3}>
                View your past consultations and chat history.
              </Typography>
              <Button 
                variant="outlined" 
                fullWidth
                color="info"
                onClick={() => router.push('/dashboard/user/history')}
                startIcon={<History />}
              >
                View History
              </Button>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
      
      <Box mb={4}>
        <Typography variant="h5" gutterBottom>
          Recent Activity
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Your recent chats and consultations
        </Typography>
        
        <Grid container spacing={2}>
          {recentChats.length > 0 ? (
            recentChats.map((chat: any) => (
              <Grid item xs={12} sm={6} md={4} key={chat._id}>
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Avatar alt={chat.astrologerName} src={chat.astrologerImage} sx={{ mr: 2 }}>
                        <Person />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{chat.astrologerName}</Typography>
                        <Chip 
                          size="small" 
                          label={chat.status} 
                          color={chat.status === 'active' ? 'success' : 'default'} 
                          sx={{ fontSize: '0.7rem' }}
                        />
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {chat.lastMessage || 'No messages yet'}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      onClick={() => router.push(`/dashboard/user/chat?astrologerId=${chat.astrologerId}&astrologerName=${chat.astrologerName}&roomId=${chat.roomId}`)}
                      startIcon={<ChatIcon />}
                    >
                      Continue Chat
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                <Typography variant="body1" color="text.secondary">
                  No recent activity. Start a chat with an astrologer to see it here.
                </Typography>
                <Button 
                  variant="text" 
                  color="primary"
                  onClick={() => router.push('/dashboard/user/astrologers')}
                  sx={{ mt: 2 }}
                >
                  Find Astrologers
                </Button>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
} 