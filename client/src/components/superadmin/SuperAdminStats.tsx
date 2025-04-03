import { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import { 
  Users, 
  UserCheck, 
  ShoppingBag, 
  DollarSign,
  AlertCircle,
  ShieldCheck,
  Star
} from 'lucide-react';

interface StatsProps {
  onError: (message: string) => void;
  clearError: () => void;
}

interface Stats {
  totalUsers: number;
  totalAstrologers: number;
  verifiedAstrologers: number;
  onlineAstrologers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalAdmins: number;
  pendingVerifications: number;
  totalSuperadmins: number;
}

export default function SuperAdminStats({ onError, clearError }: StatsProps) {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalAstrologers: 0,
    verifiedAstrologers: 0,
    onlineAstrologers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalAdmins: 0,
    pendingVerifications: 0,
    totalSuperadmins: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    clearError();
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      onError('Failed to load statistics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4">
              {value}
            </Typography>
          </Box>
          <Icon size={24} color={color} />
        </Box>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', textAlign: 'center', py: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* First row */}
      <Grid item xs={12} sm={6} md={3}>
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers}
          icon={Users}
          color="#2196f3"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard 
          title="Total Admins" 
          value={stats.totalAdmins}
          icon={ShieldCheck}
          color="#9c27b0"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard 
          title="Total Astrologers" 
          value={stats.totalAstrologers}
          icon={Star}
          color="#ff9800"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard 
          title="Total Revenue" 
          value={`₹${stats.totalRevenue}`}
          icon={DollarSign}
          color="#4caf50"
        />
      </Grid>

      {/* Second row */}
      <Grid item xs={12} sm={6} md={3}>
        <StatCard 
          title="Verified Astrologers" 
          value={stats.verifiedAstrologers}
          icon={UserCheck}
          color="#4caf50"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard 
          title="Pending Verifications" 
          value={stats.pendingVerifications}
          icon={AlertCircle}
          color="#ff5722"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard 
          title="Active Astrologers" 
          value={stats.onlineAstrologers}
          icon={UserCheck}
          color="#03a9f4"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard 
          title="Total Products" 
          value={stats.totalProducts}
          icon={ShoppingBag}
          color="#673ab7"
        />
      </Grid>
    </Grid>
  );
}