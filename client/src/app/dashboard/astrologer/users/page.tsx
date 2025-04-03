'use client';

import { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Avatar, List, ListItemButton, ListItemAvatar, ListItemText, Divider, TextField, InputAdornment, CircularProgress, Alert, Button, Card, CardContent, CardActions } from '@mui/material';
import { Search, Send, Person, Chat as ChatIcon } from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  email?: string;
  profileImage?: string;
  createdAt?: string;
}

export default function AstrologerUsersList() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching users...');
        const response = await fetch('/api/astrologer/users');

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Error response:', response.status, errorData);
          throw new Error(`Failed to fetch users: ${response.status}`);
        }

        const data = await response.json();
        console.log('Users data:', data);
        
        // Check if data is an array
        if (!Array.isArray(data)) {
          console.error('Expected array but got:', typeof data, data);
          setUsers([]);
          throw new Error('Invalid response format');
        }
        
        // Map and validate data
        const validUsers = data.filter(user => 
          user && user._id && user.name
        );
        
        console.log('Valid users:', validUsers.length);
        setUsers(validUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'astrologer') {
      fetchUsers();
    }
  }, [user, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const initializeChat = async (userId: string, userName: string) => {
    try {
      // Create the roomId by sorting the IDs to ensure consistency
      const roomId = [user?._id, userId].sort().join('_');
      
      // Redirect to chat page with this user
      router.push(`/dashboard/astrologer/chat?userId=${userId}&userName=${encodeURIComponent(userName)}&roomId=${roomId}`);
      
      toast.success(`Starting chat with ${userName}`);
    } catch (error) {
      console.error('Error initializing chat:', error);
      toast.error('Failed to start chat');
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">All Users</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<ChatIcon />}
          onClick={() => router.push('/dashboard/astrologer/chats')}
        >
          View Active Chats
        </Button>
      </Box>
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleRetry}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search users by name or email..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />
      
      {filteredUsers.length > 0 ? (
        <Grid container spacing={2}>
          {filteredUsers.map((user) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={user._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar 
                      src={user.profileImage} 
                      sx={{ width: 60, height: 60, mr: 2 }}
                    >
                      <Person />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" noWrap>{user.name}</Typography>
                      {user.email && (
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {user.email}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  
                  {user.createdAt && (
                    <Typography variant="caption" color="text.secondary">
                      Joined: {new Date(user.createdAt).toLocaleDateString()}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button 
                    startIcon={<ChatIcon />}
                    fullWidth
                    variant="contained"
                    onClick={() => initializeChat(user._id, user.name)}
                  >
                    Chat with User
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Person sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No users found
          </Typography>
          <Typography color="text.secondary">
            {searchQuery 
              ? 'Try a different search term' 
              : 'There are no users available to chat with'}
          </Typography>
        </Paper>
      )}
    </Box>
  );
} 