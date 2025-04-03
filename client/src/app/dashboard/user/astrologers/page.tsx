'use client';

import { useState, useEffect } from 'react';
import { Box, Grid, Typography, Avatar, TextField, InputAdornment, CircularProgress, Alert, Button, Card, CardContent, CardActions } from '@mui/material';
import { Search, Person, Chat as ChatIcon } from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface Astrologer {
  _id: string;
  name: string;
  email?: string;
  profileImage?: string;
  bio?: string;
  specialization?: string[];
  experience?: number;
  createdAt?: string;
}

export default function UserAstrologersList() {
  const { user } = useAuth();
  const router = useRouter();
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'user') {
      router.push('/dashboard');
      return;
    }

    async function fetchAstrologers() {
      try {
        setLoading(true);
        const response = await fetch('/api/astrologers');
        
        if (!response.ok) {
          throw new Error('Failed to fetch astrologers');
        }
        
        const data = await response.json();
        setAstrologers(data);
      } catch (error) {
        console.error('Error fetching astrologers:', error);
        setError('Failed to load astrologers. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchAstrologers();
  }, [user, router]);

  const initializeChat = async (astrologerId: string, astrologerName: string) => {
    try {
      // Create the roomId by sorting the IDs to ensure consistency
      const roomId = [user?._id, astrologerId].sort().join('_');
      
      // Redirect to chat page with this astrologer
      router.push(`/dashboard/user/chat?astrologerId=${astrologerId}&astrologerName=${encodeURIComponent(astrologerName)}&roomId=${roomId}`);
      
      toast.success(`Starting chat with ${astrologerName}`);
    } catch (error) {
      console.error('Error initializing chat:', error);
      toast.error('Failed to start chat');
    }
  };

  const filteredAstrologers = astrologers.filter(astrologer => 
    astrologer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (astrologer.specialization && astrologer.specialization.some(spec => 
      spec.toLowerCase().includes(searchQuery.toLowerCase())
    ))
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
      <Typography variant="h4" gutterBottom>
        Astrologers
      </Typography>
      
      <Box mb={4}>
        <TextField
          fullWidth
          placeholder="Search by name or specialization..."
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
        />
      </Box>

      {filteredAstrologers.length > 0 ? (
        <Grid container spacing={2}>
          {filteredAstrologers.map((astrologer) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={astrologer._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar 
                      src={astrologer.profileImage} 
                      sx={{ width: 60, height: 60, mr: 2 }}
                    >
                      <Person />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" noWrap>{astrologer.name}</Typography>
                      {astrologer.specialization && (
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {astrologer.specialization.join(', ')}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  
                  {astrologer.bio && (
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {astrologer.bio.substring(0, 100)}
                      {astrologer.bio.length > 100 ? '...' : ''}
                    </Typography>
                  )}
                  
                  {astrologer.experience && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Experience: {astrologer.experience} years
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button 
                    startIcon={<ChatIcon />}
                    fullWidth
                    variant="contained"
                    onClick={() => initializeChat(astrologer._id, astrologer.name)}
                  >
                    Chat with Astrologer
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box textAlign="center" py={5}>
          <Typography variant="h6" color="text.secondary">
            No astrologers found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery ? 'Try a different search term' : 'Check back later for available astrologers'}
          </Typography>
        </Box>
      )}
    </Box>
  );
} 