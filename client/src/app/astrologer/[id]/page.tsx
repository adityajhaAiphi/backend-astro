'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { 
  Container, 
  Grid, 
  Typography, 
  Avatar, 
  Button, 
  Chip, 
  Box, 
  CircularProgress, 
  Alert,
  Divider,
  Paper,
  Rating,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
} from '@mui/material';
import { 
  Star, 
  Clock, 
  MessageCircle, 
  Phone, 
  Calendar, 
  Languages, 
  Award,
  ThumbsUp,
  MapPin,
  Info,
  FileText
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { SparklesCore } from '@/components/ui/sparkles';
import { GlowingStarsText } from '@/components/ui/glowing-stars';

interface Astrologer {
  _id: string;
  name: string;
  experience: string;
  expertise: string[];
  languages: string[];
  price: {
    original: number;
    discounted: number;
  };
  rating: number;
  totalRatings: number;
  availability: {
    online: boolean;
    startTime: string;
    endTime: string;
  };
  status: {
    chat: boolean;
    call: boolean;
  };
  isOnline: boolean;
  profileImage?: string;
  bio?: string;
  description?: string;
  reviews?: {
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
    userImage?: string;
  }[];
}

export default function AstrologerProfile() {
  const { id } = useParams();
  const [astrologer, setAstrologer] = useState<Astrologer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function fetchAstrologerDetails() {
      try {
        setLoading(true);
        
        // Fetch from the main astrologers endpoint instead of a specific astrologer endpoint
        const response = await fetch('/api/astrologers', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch astrologers: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Fetched astrologers:', data);
        
        // Find the specific astrologer by ID
        let astrologerData;
        if (Array.isArray(data)) {
          astrologerData = data.find(astro => astro._id === id);
        } else if (data.astrologers && Array.isArray(data.astrologers)) {
          astrologerData = data.astrologers.find((astro: Astrologer) => astro._id === id);
        }
        
        if (astrologerData) {
          setAstrologer(astrologerData);
          setError(null);
        } else {
          setAstrologer(null);
          setError('Astrologer not found. The requested astrologer may no longer be available.');
        }
      } catch (error) {
        console.error('Error fetching astrologer:', error);
        setError('Failed to load astrologer details. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchAstrologerDetails();
    }
  }, [id]);

  const handleChat = async () => {
    if (!user) {
      router.push('/sign-in');
      return;
    }
    if (astrologer) {
      router.push(`/consult-astro/${astrologer._id}`);
    }
  };

  const handleCall = async () => {
    if (!user) {
      router.push('/sign-in');
      return;
    }
    if (astrologer) {
      router.push(`/call/${astrologer._id}`);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-sacred-sandal via-white to-sacred-saffron/10 relative overflow-hidden">
      {/* Sacred Mandala Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('/mandala-pattern.png')] bg-repeat opacity-20" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-sacred-gold rounded-full mix-blend-multiply filter blur-xl animate-blob" />
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-sacred-vermilion rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-1/3 w-64 h-64 bg-sacred-copper rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
      </div>

      <BackgroundBeams className="opacity-25" />
      
      <Container maxWidth="lg" className="relative z-10 py-12">
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress sx={{ color: 'var(--sacred-gold)' }} />
          </Box>
        ) : error ? (
          <Alert severity="error" className="bg-red-50 border border-red-200 mb-4">{error}</Alert>
        ) : astrologer ? (
          <Grid container spacing={4}>
            {/* Left Column - Astrologer Profile */}
            <Grid item xs={12} md={4}>
              <Paper className="p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-sacred-gold/20">
                <Box className="flex flex-col items-center text-center mb-6">
                  <Avatar
                    src={astrologer.profileImage}
                    sx={{ 
                      width: 160, 
                      height: 160, 
                      border: '3px solid', 
                      borderColor: 'rgba(212,175,55,0.3)',
                      boxShadow: '0 0 25px rgba(212,175,55,0.3)',
                      mb: 2
                    }}
                  />
                  <Typography variant="h4" className="text-sacred-copper font-bold mb-1">
                    {astrologer.name}
                  </Typography>
                  <Typography variant="subtitle1" className="text-sacred-copper/80 mb-2">
                    {astrologer.experience} experience
                  </Typography>
                  <Box className="flex items-center justify-center mb-3">
                    <Star className="text-sacred-gold w-5 h-5 mr-1" />
                    <Typography variant="body1" className="text-sacred-copper font-medium">
                      {astrologer.rating ? astrologer.rating.toFixed(1) : '0.0'} ({astrologer.totalRatings || 0} ratings)
                    </Typography>
                  </Box>
                  <Chip
                    label={astrologer.isOnline ? 'Online' : 'Offline'}
                    className={`${
                      astrologer.isOnline 
                        ? 'bg-green-500/10 text-green-600 border border-green-200' 
                        : 'bg-gray-500/10 text-gray-600 border border-gray-200'
                    }`}
                    size="small"
                  />
                </Box>
                
                <Divider className="mb-4 border-sacred-gold/20" />
                
                <Box className="mb-4">
                  <Typography variant="h6" className="flex items-center gap-2 mb-2 text-sacred-vermilion">
                    <Award size={20} /> Expertise
                  </Typography>
                  <Box>
                    {astrologer.expertise.map((skill) => (
                      <Chip
                        key={skill}
                        label={skill}
                        size="small"
                        className="mr-1 mb-1 bg-sacred-gold/10 text-sacred-copper border border-sacred-gold/30"
                      />
                    ))}
                  </Box>
                </Box>
                
                <Box className="mb-4">
                  <Typography variant="h6" className="flex items-center gap-2 mb-2 text-sacred-vermilion">
                    <Languages size={20} /> Languages
                  </Typography>
                  <Box>
                    {astrologer.languages.map((language) => (
                      <Chip
                        key={language}
                        label={language}
                        size="small"
                        className="mr-1 mb-1 bg-sacred-gold/10 text-sacred-copper border border-sacred-gold/30"
                      />
                    ))}
                  </Box>
                </Box>
                
                <Box className="mb-4">
                  <Typography variant="h6" className="flex items-center gap-2 mb-2 text-sacred-vermilion">
                    <Clock size={20} /> Availability
                  </Typography>
                  <Typography className="text-sacred-copper">
                    {astrologer.availability?.startTime} - {astrologer.availability?.endTime}
                  </Typography>
                </Box>
                
                <Box className="mb-6">
                  <Typography variant="h6" className="flex items-center gap-2 mb-2 text-sacred-vermilion">
                    <Info size={20} /> Price
                  </Typography>
                  <Box className="flex items-center gap-2">
                    <Typography variant="h5" className="text-sacred-vermilion font-bold">
                      ₹{astrologer.price?.discounted || 0}/min
                    </Typography>
                    {astrologer.price?.original > (astrologer.price?.discounted || 0) && (
                      <Typography variant="body2" className="text-sacred-copper/50 line-through">
                        ₹{astrologer.price?.original || 0}/min
                      </Typography>
                    )}
                  </Box>
                </Box>
                
                <Box>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<MessageCircle size={20} />}
                    onClick={handleChat}
                    className="bg-gradient-to-r from-sacred-copper via-sacred-gold to-sacred-vermilion
                              text-white font-semibold hover:shadow-lg hover:shadow-sacred-gold/20
                              transition-all duration-300 mb-2"
                  >
                    Chat Now
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Phone size={20} />}
                    onClick={handleCall}
                    className="bg-gradient-to-r from-sacred-vermilion via-sacred-gold to-sacred-copper
                              text-white font-semibold hover:shadow-lg hover:shadow-sacred-gold/20
                              transition-all duration-300"
                  >
                    Call Now
                  </Button>
                </Box>
              </Paper>
            </Grid>
            
            {/* Right Column - About and Reviews */}
            <Grid item xs={12} md={8}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* About Section */}
                <Paper className="p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-sacred-gold/20 mb-4">
                  <Typography variant="h5" className="flex items-center gap-2 mb-4 text-sacred-vermilion font-bold">
                    <FileText size={24} /> About {astrologer.name}
                  </Typography>
                  
                  <Typography className="text-sacred-copper mb-4 leading-relaxed">
                    {astrologer.bio || `${astrologer.name} is a professional astrologer with ${astrologer.experience} of experience specializing in ${astrologer.expertise.join(', ')}. They are highly skilled in providing accurate readings and guidance based on vedic astrology principles.`}
                  </Typography>
                  
                  <Typography className="text-sacred-copper leading-relaxed">
                    {astrologer.description || `With deep knowledge in ${astrologer.expertise.slice(0, 3).join(', ')} and other astrological domains, ${astrologer.name} has helped many clients find clarity and direction in their lives. They are known for their precise predictions and compassionate approach to guiding clients through life's challenges.`}
                  </Typography>
                </Paper>
                
                {/* Reviews Section */}
                <Paper className="p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-sacred-gold/20">
                  <Typography variant="h5" className="flex items-center gap-2 mb-4 text-sacred-vermilion font-bold">
                    <ThumbsUp size={24} /> Client Reviews
                  </Typography>
                  
                  {astrologer.reviews && astrologer.reviews.length > 0 ? (
                    <List>
                      {astrologer.reviews.map((review, index) => (
                        <Box key={index}>
                          <ListItem alignItems="flex-start">
                            <ListItemAvatar>
                              <Avatar src={review.userImage} />
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box className="flex justify-between">
                                  <Typography className="font-semibold text-sacred-copper">{review.userName}</Typography>
                                  <Typography variant="body2" className="text-gray-500">{review.date}</Typography>
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Rating value={review.rating} readOnly size="small" className="mb-1" />
                                  <Typography className="text-sacred-copper/80">{review.comment}</Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                          {index < (astrologer.reviews?.length || 0) - 1 && <Divider className="border-sacred-gold/10" />}
                        </Box>
                      ))}
                    </List>
                  ) : (
                    <Typography className="text-sacred-copper/70 italic text-center py-6">
                      No reviews available yet. Be the first to consult with {astrologer.name} and leave a review!
                    </Typography>
                  )}
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        ) : (
          <Alert severity="error" className="bg-red-50 border border-red-200 mb-4">
            Astrologer not found. The requested astrologer may no longer be available.
          </Alert>
        )}
      </Container>
    </main>
  );
}
