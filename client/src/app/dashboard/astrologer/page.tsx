'use client'
import dotenv from "dotenv";
dotenv.config();
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Avatar,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Autocomplete,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Tab,
  Tabs,
  IconButton,
} from '@mui/material';
import {
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  Chat as ChatIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import React from 'react';
import { MessageCircle, Users, DollarSign, Clock, Calendar, BarChart2 } from 'lucide-react';
import Link from 'next/link';

interface AstrologerProfile {
  name: string;
  email: string;
  phone: string;
  experience: string;
  expertise: string[];
  languages: string[];
  about: string;
  price: {
    original: number;
    discounted: number;
  };
  availability: {
    online: boolean;
    startTime: string;
    endTime: string;
  };
  profileImage?: string;
  rating: number;
  totalRatings: number;
  updatedAt: Date;
}

interface ChatHistory {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage: string;
  timestamp: Date;
  duration: number;
  earning: number;
}

interface EarningsSummary {
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
}

interface DashboardStats {
  totalUsers: number;
  activeChats: number;
  totalEarnings: number;
  todayEarnings: number;
  totalConsultations: number;
  avgRating: number;
}

const EXPERTISE_OPTIONS = [
  'Vedic Astrology',
  'KP Astrology',
  'Numerology',
  'Tarot Reading',
  'Vastu Shastra',
  'Palmistry',
  'Gemology',
  'Face Reading'
];

const LANGUAGE_OPTIONS = [
  'English',
  'Hindi',
  'Tamil',
  'Telugu',
  'Kannada',
  'Malayalam',
  'Bengali',
  'Gujarati'
];

export default function AstrologerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<AstrologerProfile>({
    name: '',
    email: '',
    phone: '',
    experience: '',
    expertise: [],
    languages: [],
    about: '',
    price: {
      original: 0,
      discounted: 0
    },
    availability: {
      online: false,
      startTime: '09:00',
      endTime: '18:00'
    },
    rating: 0,
    totalRatings: 0,
    updatedAt: new Date()
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [earnings, setEarnings] = useState<EarningsSummary>({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    total: 0
  });
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingEarnings, setLoadingEarnings] = useState(false);
  const [chatError, setChatError] = useState('');
  const [earningsError, setEarningsError] = useState('');
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeChats: 0,
    totalEarnings: 0,
    todayEarnings: 0,
    totalConsultations: 0,
    avgRating: 0
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== 'astrologer')) {
      router.push('/');
      return;
    }
  }, [loading, user, router]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://astroalert-backend-m1hn.onrender.com/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChatHistory = async () => {
    if (!user) return;
    setLoadingChats(true);
    setChatError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/astrologers/chats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch chat history');
      }

      const data = await response.json();
      setChatHistory(data);
    } catch (err) {
      console.error('Error fetching chat history:', err);
      setChatError('Failed to load chat history');
    } finally {
      setLoadingChats(false);
    }
  };

  const fetchEarnings = async () => {
    if (!user) return;
    setLoadingEarnings(true);
    setEarningsError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/astrologers/earnings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch earnings');
      }

      const data = await response.json();
      setEarnings(data);
    } catch (err) {
      console.error('Error fetching earnings:', err);
      setEarningsError('Failed to load earnings');
    } finally {
      setLoadingEarnings(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    if (user && user.role === 'astrologer') {
      fetchChatHistory();
      fetchEarnings();
    }
  }, [user]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file size and type
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      setError('Image size should be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`https://astroalert-backend-m1hn.onrender.com/api/astrologers/profile/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const url = await response.text();
      setProfile(prev => ({ ...prev, profileImage: url }));
      setSuccess('Image uploaded successfully!');
    } catch (err) {
      setError('Failed to upload image');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      // Prepare the data in the correct format
      const updateData = {
        name: profile.name,
        phone: profile.phone,
        experience: profile.experience,
        expertise: profile.expertise,
        languages: profile.languages,
        about: profile.about,
        price: profile.price,
        availability: {
          online: profile.availability.online,
          startTime: profile.availability.startTime,
          endTime: profile.availability.endTime
        },
        status: {
          chat: profile.availability.online,
          call: profile.availability.online
        }
      };

      const response = await fetch(`https://astroalert-backend-m1hn.onrender.com/api/astrologers/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('Server response:', responseData);
        throw new Error(responseData.message || 'Failed to update profile');
      }

      setProfile(prev => ({
        ...prev,
        ...responseData
      }));
      
      setSuccess('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      // This would be replaced with an actual API call in production
      // For now, using mock data
      const mockData = {
        totalUsers: 24,
        activeChats: 5,
        totalEarnings: 12500,
        todayEarnings: 1200,
        totalConsultations: 42,
        avgRating: 4.8
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setStats(mockData);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const renderDashboardContent = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5" gutterBottom>
          Overview
        </Typography>
      </Grid>
      
      {/* Earnings Cards */}
      {earningsError ? (
        <Grid item xs={12}>
          <Alert severity="error">{earningsError}</Alert>
        </Grid>
      ) : (
        <>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                {loadingEarnings ? (
                  <CircularProgress size={24} />
                ) : (
                  <>
                    <Typography color="textSecondary" gutterBottom>
                      Today's Earnings
                    </Typography>
                    <Typography variant="h4">₹{earnings.today}</Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                {loadingEarnings ? (
                  <CircularProgress size={24} />
                ) : (
                  <>
                    <Typography color="textSecondary" gutterBottom>
                      This Week
                    </Typography>
                    <Typography variant="h4">₹{earnings.thisWeek}</Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                {loadingEarnings ? (
                  <CircularProgress size={24} />
                ) : (
                  <>
                    <Typography color="textSecondary" gutterBottom>
                      This Month
                    </Typography>
                    <Typography variant="h4">₹{earnings.thisMonth}</Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                {loadingEarnings ? (
                  <CircularProgress size={24} />
                ) : (
                  <>
                    <Typography color="textSecondary" gutterBottom>
                      Total Earnings
                    </Typography>
                    <Typography variant="h4">₹{earnings.total}</Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </>
      )}

      {/* Chat History */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Consultations
            </Typography>
            {chatError ? (
              <Alert severity="error">{chatError}</Alert>
            ) : loadingChats ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : chatHistory.length === 0 ? (
              <Typography color="textSecondary" align="center" py={3}>
                No consultations yet
              </Typography>
            ) : (
              <List>
                {chatHistory.map((chat) => (
                  <React.Fragment key={chat.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar src={chat.userAvatar}>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={chat.userName}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="textPrimary">
                              Duration: {chat.duration} mins • Earned: ₹{chat.earning}
                            </Typography>
                            <br />
                            {new Date(chat.timestamp).toLocaleString()}
                          </>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  if (loading || isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab icon={<MoneyIcon />} label="Dashboard" />
            <Tab icon={<EditIcon />} label="Profile" />
          </Tabs>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {activeTab === 0 ? (
          <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
              <Typography variant="h4">Welcome, {user?.name}</Typography>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<MessageCircle />}
                component={Link}
                href="/dashboard/astrologer/chats"
              >
                Manage Chats
              </Button>
            </Box>

            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} sm={6} md={4}>
                <StatCard 
                  title="Active Chats" 
                  value={stats.activeChats} 
                  icon={MessageCircle} 
                  color="#4CAF50" 
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <StatCard 
                  title="Total Consultations" 
                  value={stats.totalConsultations} 
                  icon={Users} 
                  color="#2196F3" 
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <StatCard 
                  title="Total Earnings" 
                  value={`₹${stats.totalEarnings.toLocaleString()}`} 
                  icon={DollarSign} 
                  color="#FF9800" 
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <StatCard 
                  title="Earnings Today" 
                  value={`₹${stats.todayEarnings.toLocaleString()}`} 
                  icon={Calendar} 
                  color="#9C27B0" 
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <StatCard 
                  title="Total Users" 
                  value={stats.totalUsers} 
                  icon={Users} 
                  color="#f44336" 
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <StatCard 
                  title="Average Rating" 
                  value={stats.avgRating} 
                  icon={BarChart2} 
                  color="#009688" 
                />
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>Recent Consultations</Typography>
                  {/* Recent consultations would be displayed here */}
                  <Typography color="text.secondary">
                    No recent consultations to display.
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={5}>
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>Schedule</Typography>
                  {/* Calendar or schedule would be displayed here */}
                  <Typography color="text.secondary">
                    No upcoming consultations scheduled.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar
                    src={profile.profileImage}
                    sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
                  />
                  <Button
                    variant="outlined"
                    component="label"
                    sx={{ mb: 2 }}
                  >
                    Upload Photo
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </Button>
                </Box>
              </Grid>

              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={profile.name}
                      onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={profile.email}
                      disabled
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={profile.phone}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Experience (in years)"
                      value={profile.experience}
                      onChange={(e) => setProfile(prev => ({ ...prev, experience: e.target.value }))}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Autocomplete
                      multiple
                      options={EXPERTISE_OPTIONS}
                      value={profile.expertise}
                      onChange={(_, newValue) => setProfile(prev => ({ ...prev, expertise: newValue }))}
                      renderInput={(params) => (
                        <TextField {...params} label="Areas of Expertise" />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            label={option}
                            {...getTagProps({ index })}
                            key={option}
                          />
                        ))
                      }
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Autocomplete
                      multiple
                      options={LANGUAGE_OPTIONS}
                      value={profile.languages}
                      onChange={(_, newValue) => setProfile(prev => ({ ...prev, languages: newValue }))}
                      renderInput={(params) => (
                        <TextField {...params} label="Languages" />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            label={option}
                            {...getTagProps({ index })}
                            key={option}
                          />
                        ))
                      }
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="About"
                      value={profile.about}
                      onChange={(e) => setProfile(prev => ({ ...prev, about: e.target.value }))}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Original Price (₹/min)"
                      value={profile.price.original}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        price: { ...prev.price, original: Number(e.target.value) }
                      }))}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Discounted Price (₹/min)"
                      value={profile.price.discounted}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        price: { ...prev.price, discounted: Number(e.target.value) }
                      }))}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={profile.availability.online}
                          onChange={(e) => setProfile(prev => ({
                            ...prev,
                            availability: { ...prev.availability, online: e.target.checked }
                          }))}
                        />
                      }
                      label="Available Online"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="time"
                      label="Start Time"
                      value={profile.availability.startTime}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        availability: { ...prev.availability, startTime: e.target.value }
                      }))}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="time"
                      label="End Time"
                      value={profile.availability.endTime}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        availability: { ...prev.availability, endTime: e.target.value }
                      }))}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSaving}
                    sx={{ minWidth: 120 }}
                  >
                    {isSaving ? <CircularProgress size={24} /> : 'Save Changes'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  color: string;
}) => (
  <Card elevation={2} sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6" color="text.secondary">{title}</Typography>
        <Box 
          sx={{ 
            backgroundColor: `${color}20`, 
            borderRadius: '50%', 
            p: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
        >
          <Icon size={24} color={color} />
        </Box>
      </Box>
      <Typography variant="h4">{value}</Typography>
    </CardContent>
  </Card>
);