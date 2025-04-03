import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { useState, useEffect } from 'react';
import { User } from '@/types/user';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';

interface EarningsDialogProps {
  open: boolean;
  onClose: () => void;
  astrologer: User | null;
}

interface EarningStats {
  totalEarnings: number;
  monthlyEarnings: number;
  dailyAverage: number;
  earningsHistory: {
    date: string;
    amount: number;
  }[];
}

export function EarningsDialog({ open, onClose, astrologer }: EarningsDialogProps) {
  const [stats, setStats] = useState<EarningStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && astrologer) {
      fetchEarningStats();
    }
  }, [open, astrologer]);

  const fetchEarningStats = async () => {
    if (!astrologer) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/astrologers/${astrologer._id}/earnings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch earnings stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching earnings stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Earnings Statistics</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1}>
                  <DollarSign />
                  <Typography variant="h6">Total Earnings</Typography>
                </Box>
                <Typography variant="h4">₹{stats?.totalEarnings || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1}>
                  <Calendar />
                  <Typography variant="h6">This Month</Typography>
                </Box>
                <Typography variant="h4">₹{stats?.monthlyEarnings || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1}>
                  <TrendingUp />
                  <Typography variant="h6">Daily Average</Typography>
                </Box>
                <Typography variant="h4">₹{stats?.dailyAverage || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Earnings Chart */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Earnings Trend</Typography>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={stats?.earningsHistory || []}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="amount" stroke="#8884d8" name="Earnings" />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
} 