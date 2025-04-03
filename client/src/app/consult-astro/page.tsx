'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { Container, Grid, Typography, Avatar, Button, Chip, Box, CircularProgress, Alert } from '@mui/material';
import { Star, Clock, MessageCircle, Phone } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
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
}

export default function ConsultAstro() {
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const API_URL = "/api/connect";

  useEffect(() => {
    async function testApiConnection() {
      try {
        const response = await fetch('/api/test', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const data = await response.json();
        console.log('API test response:', data);
        
        // Check if either environment variable or hardcoded URI is available
        if (!data.env.hasMongoDB && !data.env.hasHardcodedUri) {
          setError('MongoDB connection string is not configured on the server.');
          setLoading(false);
          return false;
        }
        
        return true;
      } catch (error) {
        console.error('Error testing API connection:', error);
        setError('Cannot connect to API. Please check if the server is running.');
        setLoading(false);
        return false;
      }
    }
    
    async function fetchAstrologers() {
      try {
        setLoading(true);
        
        // Test API connection first
        const isApiWorking = await testApiConnection();
        if (!isApiWorking) return;
        
        console.log('Fetching astrologers data...');
        const response = await fetch('/api/astrologers', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error('API error response:', errorData);
          throw new Error(`Failed to fetch astrologers: ${response.status} ${response.statusText}`);
        }
  
        const data = await response.json();
        console.log('Fetched astrologers:', data);
        
        // Check if we got an array or an object with a message
        if (Array.isArray(data)) {
          setAstrologers(data);
          if (data.length === 0) {
            setError('No astrologers found in the database. You may need to seed the database with sample data.');
          } else {
            setError(null);
          }
        } else if (data.message && data.astrologers) {
          // We got a response with a message and empty astrologers array
          setAstrologers(data.astrologers);
          setError(data.message);
        } else {
          // Unexpected response format
          setAstrologers([]);
          setError('Received unexpected data format from the server.');
        }
      } catch (error) {
        console.error('Error fetching astrologers:', error);
        setError('Failed to load astrologers. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
  
    fetchAstrologers();
  }, []);
  
  const seedDatabase = async () => {
    try {
      setLoading(true);
      setError('Seeding database with sample data...');
      
      const response = await fetch('/api/seed-astrologers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      console.log('Seed response:', data);
      
      if (data.success) {
        // Refetch astrologers after seeding
        fetchAstrologers();
      } else {
        setError(`Failed to seed database: ${data.error}`);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error seeding database:', error);
      setError('Failed to seed database. Please try again later.');
      setLoading(false);
    }
  };
  
  // Add the fetchAstrologers function to the component scope
  const fetchAstrologers = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching astrologers data...');
      const response = await fetch('/api/astrologers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('API error response:', errorData);
        throw new Error(`Failed to fetch astrologers: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Fetched astrologers:', data);
      
      // Check if we got an array or an object with a message
      if (Array.isArray(data)) {
        setAstrologers(data);
        if (data.length === 0) {
          setError('No astrologers found in the database. You may need to seed the database with sample data.');
        } else {
          setError(null);
        }
      } else if (data.message && data.astrologers) {
        // We got a response with a message and empty astrologers array
        setAstrologers(data.astrologers);
        setError(data.message);
      } else {
        // Unexpected response format
        setAstrologers([]);
        setError('Received unexpected data format from the server.');
      }
    } catch (error) {
      console.error('Error fetching astrologers:', error);
      setError('Failed to load astrologers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (astrologerId: string) => {
    router.push(`/astrologer/${astrologerId}`);
  };

  const handleChat = async (astrologerId: string) => {
    if (!user) {
      router.push('/sign-in');
      return;
    }
    router.push(`/consult-astro/${astrologerId}`);
  };

  const handleCall = async (astrologerId: string) => {
    if (!user) {
      router.push('/sign-in');
      return;
    }
    router.push(`/call/${astrologerId}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-sacred-sandal via-white to-sacred-saffron/10 relative overflow-hidden">
      {/* Sacred Mandala Background */}
      <div className="absolute inset-0 opacity-5"></div>
      <div className="absolute inset-0 bg-[url('/mandala-pattern.png')] bg-repeat opacity-20" />

      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-sacred-gold rounded-full mix-blend-multiply filter blur-xl animate-blob" />
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-sacred-vermilion rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-1/3 w-64 h-64 bg-sacred-copper rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
      </div>

      <BackgroundBeams className="opacity-25" />
      
      <Container maxWidth="lg" className="relative z-10 py-12">
        {/* Enhanced Header Section */}
        <div className="text-center mb-16">
          <div className="relative inline-block mb-6">
            <div className="relative bg-white/80 backdrop-blur-sm rounded-full px-8 py-2 border-2 border-sacred-gold/20
                          shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_20px_rgba(212,175,55,0.5)]
                          transition-all duration-500">
              <motion.span 
                className="inline-block text-lg md:text-xl bg-gradient-to-r from-sacred-copper via-sacred-gold to-sacred-vermilion
                           bg-clip-text text-transparent font-semibold tracking-wide"
                whileHover={{ scale: 1.05 }}
              >
                <span className="animate-glow inline-block">🕉️</span>
                <span className="mx-2">आचार्य परामर्श</span>
                <span className="animate-glow inline-block">🕉️</span>
              </motion.span>
            </div>
          </div>

          <motion.div className="relative h-[40px] w-full mb-8">
            <SparklesCore background="transparent" minSize={0.4} maxSize={1} particleDensity={1200} className="w-full h-full" particleColor="#ff8303" />
          </motion.div>

          <GlowingStarsText>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-sacred-vermilion via-sacred-gold to-sacred-copper">
              Expert Vedic Consultations
            </h1>
          </GlowingStarsText>
        </div>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress sx={{ color: 'var(--sacred-gold)' }} />
          </Box>
        ) : error ? (
          <Box>
            <Alert severity="error" className="bg-red-50 border border-red-200 mb-4">{error}</Alert>
            {error.includes('No astrologers found') && (
              <Box display="flex" justifyContent="center" mt={2}>
                <Button 
                  variant="contained" 
                  onClick={seedDatabase}
                  className="bg-gradient-to-r from-sacred-vermilion via-sacred-gold to-sacred-copper
                           text-white font-semibold hover:shadow-lg hover:shadow-sacred-gold/20
                           transition-all duration-300"
                >
                  Seed Database with Sample Data
                </Button>
              </Box>
            )}
          </Box>
        ) : (
          <Grid container spacing={4}>
            {astrologers.map((astrologer) => (
              <Grid item xs={12} sm={6} md={4} key={astrologer._id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="relative bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-xl
                                border border-sacred-gold/20 hover:shadow-2xl hover:shadow-sacred-gold/20
                                transition-all duration-500 group">
                    {/* Decorative Corner Ornaments */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-sacred-gold/30 rounded-tl-2xl" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-sacred-gold/30 rounded-tr-2xl" />
                    
                    <Chip
                      label={astrologer.isOnline ? 'Online' : 'Offline'}
                      className={`absolute top-4 right-4 ${
                        astrologer.isOnline 
                          ? 'bg-green-500/10 text-green-600 border border-green-200' 
                          : 'bg-gray-500/10 text-gray-600 border border-gray-200'
                      }`}
                      size="small"
                    />

                    <Box display="flex" alignItems="center" mb={3}>
                      <Avatar
                        src={astrologer.profileImage}
                        sx={{ 
                          width: 70, 
                          height: 70, 
                          border: '2px solid', 
                          borderColor: 'rgba(212,175,55,0.3)',
                          boxShadow: '0 0 15px rgba(212,175,55,0.2)'
                        }}
                      />
                      <Box ml={2}>
                        <Typography variant="h6" className="text-sacred-copper font-bold">
                          {astrologer.name}
                        </Typography>
                        <Typography variant="body2" className="text-sacred-copper/70">
                          {astrologer.experience} experience
                        </Typography>
                      </Box>
                    </Box>

                    <Box mb={3}>
                      {astrologer.expertise.map((skill) => (
                        <Chip
                          key={skill}
                          label={skill}
                          size="small"
                          className="mr-1 mb-1 bg-sacred-gold/10 text-sacred-copper border border-sacred-gold/30"
                        />
                      ))}
                    </Box>

                    <Box display="flex" alignItems="center" mb={3}>
                      <Star className="text-sacred-gold w-5 h-5 mr-1" />
                      <Typography variant="body2" className="text-sacred-copper">
                        {astrologer.rating ? astrologer.rating.toFixed(1) : '0.0'} ({astrologer.totalRatings || 0} ratings)
                      </Typography>
                    </Box>

                    <Box className="flex justify-between items-end mb-4">
                      <Box>
                        <Typography variant="h6" className="text-sacred-vermilion font-bold">
                          ₹{astrologer.price?.discounted || 0}/min
                        </Typography>
                        {astrologer.price?.original > (astrologer.price?.discounted || 0) && (
                          <Typography variant="body2" className="text-sacred-copper/50 line-through">
                            ₹{astrologer.price?.original || 0}/min
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="contained"
                        onClick={() => handleViewProfile(astrologer._id)}
                        className="bg-gradient-to-r from-sacred-copper to-sacred-gold
                                 text-white font-semibold hover:shadow-lg hover:shadow-sacred-gold/20
                                 transition-all duration-300"
                        size="small"
                      >
                        View Profile
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<MessageCircle size={16} />}
                        onClick={() => handleChat(astrologer._id)}
                        className="bg-gradient-to-r from-sacred-gold to-sacred-vermilion
                                 text-white font-semibold hover:shadow-lg hover:shadow-sacred-gold/20
                                 transition-all duration-300"
                        size="small"
                      >
                        Chat
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<Phone size={16} />}
                        onClick={() => handleCall(astrologer._id)}
                        className="bg-gradient-to-r from-sacred-vermilion to-sacred-copper
                                 text-white font-semibold hover:shadow-lg hover:shadow-sacred-gold/20
                                 transition-all duration-300"
                        size="small"
                      >
                        Call
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </main>
  );
}

