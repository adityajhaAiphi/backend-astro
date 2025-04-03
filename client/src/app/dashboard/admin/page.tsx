'use client'
import dotenv from "dotenv";
dotenv.config();
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  Grid,
  Card,
  CardContent,
  Chip,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Menu
} from '@mui/material';
import { 
  Users, 
  ShoppingBag, 
  Star, 
  Calendar,
  Phone,
  MessageCircle,
  DollarSign,
  UserCheck,
  AlertCircle,
  Search,
  MoreVertical,
  Edit,
  Ban,
  Wallet,
  History,
  HelpCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { EditProfileDialog } from '@/components/admin/dialogs/EditProfileDialog';
import { WalletDialog } from '@/components/admin/dialogs/WalletDialog';
import { User } from '@/types/user';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { AstrologerDialog } from '@/components/admin/dialogs/AstrologerDialog';
import { ConsultationHistoryDialog } from '@/components/admin/dialogs/ConsultationHistoryDialog';
import { ScheduleDialog } from '@/components/admin/dialogs/ScheduleDialog';
import { EarningsDialog } from '@/components/admin/dialogs/EarningsDialog';
import { configDotenv } from "dotenv";

interface ShopItem {
  _id: string;
  itemName: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
  totalRatings: number;
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [consultationDialogOpen, setConsultationDialogOpen] = useState(false);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [astrologerDialogOpen, setAstrologerDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [earningsDialogOpen, setEarningsDialogOpen] = useState(false);

  // Dashboard statistics
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAstrologers: 0,
    verifiedAstrologers: 0,
    onlineAstrologers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    averageRating: 0,
    activeUsers: 0,
    pendingTickets: 0
  });

  // Add loading states for each data type
  const [loadingStates, setLoadingStates] = useState({
    users: true,
    shop: true,
    stats: true
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/');
      return;
    }

    fetchDashboardData();
  }, [user, loading, router]);

  const fetchDashboardData = async () => {
    try {
      // Reset error state
      setError('');
      
      // Fetch data in parallel with individual error handling
      const results = await Promise.allSettled([
        fetchUsers(),
        fetchShopItems(),
        fetchStats()
      ]);

      // Check if all promises were rejected
      if (results.every(result => result.status === 'rejected')) {
        setError('Failed to load dashboard data. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, users: true }));
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Failed to fetch users');
    } finally {
      setLoadingStates(prev => ({ ...prev, users: false }));
    }
  };

  const fetchShopItems = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, shop: true }));
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/shop`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch shop items');
      }

      const data = await response.json();
      setShopItems(data);
    } catch (err) {
      console.error('Error fetching shop items:', err);
      throw err;
    } finally {
      setLoadingStates(prev => ({ ...prev, shop: false }));
    }
  };

  const fetchStats = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, stats: true }));
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      throw err;
    } finally {
      setLoadingStates(prev => ({ ...prev, stats: false }));
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) throw new Error('Failed to update user role');

      setSuccess(`Successfully updated user role to ${newRole}`);
      fetchUsers();
    } catch (err) {
      console.error('Error updating role:', err);
      setError('Failed to update user role');
    }
  };

  // Add retry functionality
  const handleRetry = () => {
    setIsLoading(true);
    setError('');
    fetchDashboardData();
  };

  const handleUserAction = async (userId: string, action: 'edit' | 'deactivate' | 'delete') => {
    try {
      if (action === 'edit') {
        setUserDialogOpen(true);
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}`, {
        method: action === 'delete' ? 'DELETE' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        ...(action === 'deactivate' && {
          body: JSON.stringify({ isActive: false })
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} user`);
      }

      toast.success(`User ${action}d successfully`);
      fetchUsers();
    } catch (err: any) {
      console.error(`Error ${action}ing user:`, err);
      toast.error(err.message || `Failed to ${action} user`);
    }
  };

  const handleWalletManagement = (user: User) => {
    setSelectedUser(user);
    setWalletDialogOpen(true);
  };

  const handleConsultationHistory = (user: User) => {
    setSelectedUser(user);
    setConsultationDialogOpen(true);
  };

  const handleSupportTickets = (user: User) => {
    setSelectedUser(user);
    setTicketDialogOpen(true);
  };

  const handleVerifyAstrologer = async (astrologer: User) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/astrologers/verify/${astrologer._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify astrologer');
      }
      
      toast.success('Astrologer verified successfully');
      fetchUsers();
    } catch (err: any) {
      console.error('Error verifying astrologer:', err);
      toast.error(err.message || 'Failed to verify astrologer');
    }
  };

  const handleUnverifyAstrologer = async (astrologer: User) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/astrologers/unverify/${astrologer._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to unverify astrologer');
      }
      
      toast.success('Astrologer unverified successfully');
      fetchUsers();
    } catch (err: any) {
      console.error('Error unverifying astrologer:', err);
      toast.error(err.message || 'Failed to unverify astrologer');
    }
  };

  const handleAstrologerEdit = (astrologer: User) => {
    setSelectedUser(astrologer);
    setAstrologerDialogOpen(true);
  };

  const handleSchedule = (astrologer: User) => {
    setSelectedUser(astrologer);
    setScheduleDialogOpen(true);
  };

  const handleEarnings = (astrologer: User) => {
    setSelectedUser(astrologer);
    setEarningsDialogOpen(true);
  };

  if (loading || isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

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

  const filteredAstrologers = users.filter(user => 
    user.role === 'astrologer' && 
    (searchTerm === '' || 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.expertise?.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  const filteredUsers = users.filter(user => 
    user.role === 'user' && 
    (searchTerm === '' || 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={handleRetry}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {loadingStates.stats ? (
          <Box sx={{ width: '100%', textAlign: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
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
                title="Active Astrologers" 
                value={stats.onlineAstrologers}
                icon={UserCheck}
                color="#4caf50"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Total Products" 
                value={stats.totalProducts}
                icon={ShoppingBag}
                color="#ff9800"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Revenue" 
                value={`₹${stats.totalRevenue}`}
                icon={DollarSign}
                color="#f44336"
              />
            </Grid>
          </>
        )}
      </Grid>

      <TabContext value={activeTab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <TabList onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="Users" value="users" icon={<Users className="w-4 h-4" />} />
            <Tab label="Astrologers" value="astrologers" icon={<Star className="w-4 h-4" />} />
            <Tab label="Shop" value="shop" icon={<ShoppingBag className="w-4 h-4" />} />
          </TabList>
        </Box>

        <TabPanel value="users">
          <TableContainer component={Paper}>
            {loadingStates.users ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Wallet Balance</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.isActive ? 'Active' : 'Inactive'}
                            color={user.isActive ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>₹{user.balance || 0}</TableCell>
                        <TableCell>
                          <IconButton onClick={(e) => {
                            setSelectedUser(user);
                            setAnchorEl(e.currentTarget);
                          }}>
                            <MoreVertical />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </TableContainer>
        </TabPanel>

        <TabPanel value="astrologers">
          <TableContainer component={Paper}>
            {loadingStates.users ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search astrologers by name, expertise..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Expertise</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Verification</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAstrologers.map((astrologer) => (
                      <TableRow key={astrologer._id}>
                        <TableCell>{astrologer.name}</TableCell>
                        <TableCell>{astrologer.email}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {astrologer.expertise?.map((exp) => (
                              <Chip key={exp} label={exp} size="small" />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={astrologer.isActive ? 'Active' : 'Inactive'}
                            color={astrologer.isActive ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip 
                            title={
                              !astrologer.isVerified && astrologer.rejectionReason 
                                ? `Reason: ${astrologer.rejectionReason}` 
                                : ''
                            }
                          >
                            <Chip
                              label={astrologer.isVerified ? 'Verified' : 'Pending'}
                              color={astrologer.isVerified ? 'success' : 'warning'}
                              size="small"
                            />
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={(e) => {
                            setSelectedUser(astrologer);
                            setAnchorEl(e.currentTarget);
                          }}>
                            <MoreVertical />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </TableContainer>
        </TabPanel>

        <TabPanel value="shop">
          <TableContainer component={Paper}>
            {loadingStates.shop ? (
              <Box sx={{ width: '100%', textAlign: 'center', py: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Stock</TableCell>
                    <TableCell>Rating</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shopItems.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>{item.itemName}</TableCell>
                      <TableCell>
                        <Chip label={item.category} size="small" />
                      </TableCell>
                      <TableCell>₹{item.price}</TableCell>
                      <TableCell>{item.stock}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Star size={16} />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {item.rating} ({item.totalRatings})
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => router.push(`/admin/shop/${item._id}`)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </TabPanel>
      </TabContext>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {selectedUser?.role === 'astrologer' ? [
          <MenuItem key="edit" onClick={() => handleAstrologerEdit(selectedUser)}>
            <Edit className="w-4 h-4 mr-2" /> Edit Profile
          </MenuItem>,
          <MenuItem key="wallet" onClick={() => handleWalletManagement(selectedUser)}>
            <Wallet className="w-4 h-4 mr-2" /> Manage Wallet
          </MenuItem>,
          <MenuItem key="history" onClick={() => handleConsultationHistory(selectedUser)}>
            <History className="w-4 h-4 mr-2" /> View History
          </MenuItem>,
          <MenuItem key="schedule" onClick={() => handleSchedule(selectedUser)}>
            <Calendar className="w-4 h-4 mr-2" /> Manage Schedule
          </MenuItem>,
          <MenuItem key="earnings" onClick={() => handleEarnings(selectedUser)}>
            <DollarSign className="w-4 h-4 mr-2" /> View Earnings
          </MenuItem>,
          selectedUser.isVerified ? (
            <MenuItem key="unverify" onClick={() => handleUnverifyAstrologer(selectedUser)}>
              <Ban className="w-4 h-4 mr-2" /> Unverify Astrologer
            </MenuItem>
          ) : (
            <MenuItem key="verify" onClick={() => handleVerifyAstrologer(selectedUser)}>
              <UserCheck className="w-4 h-4 mr-2" /> Verify Astrologer
            </MenuItem>
          ),
          <MenuItem key="status" onClick={() => handleUserAction(selectedUser._id, 'deactivate')}>
            <Ban className="w-4 h-4 mr-2" /> {selectedUser.isActive ? 'Deactivate' : 'Activate'}
          </MenuItem>
        ].filter(Boolean) : [
          <MenuItem key="edit" onClick={() => handleUserAction(selectedUser?._id!, 'edit')}>
            <Edit className="w-4 h-4 mr-2" /> Edit Profile
          </MenuItem>,
          <MenuItem key="wallet" onClick={() => handleWalletManagement(selectedUser!)}>
            <Wallet className="w-4 h-4 mr-2" /> Manage Wallet
          </MenuItem>,
          <MenuItem key="deactivate" onClick={() => handleUserAction(selectedUser?._id!, 'deactivate')}>
            <Ban className="w-4 h-4 mr-2" /> Deactivate
          </MenuItem>
        ]}
      </Menu>

      {/* Dialogs for different actions */}
      <EditProfileDialog 
        open={userDialogOpen} 
        onClose={() => setUserDialogOpen(false)}
        user={selectedUser}
        onUpdate={fetchUsers}
      />

      <WalletDialog
        open={walletDialogOpen}
        onClose={() => setWalletDialogOpen(false)}
        user={selectedUser}
        onUpdate={fetchUsers}
      />

      <AstrologerDialog
        open={astrologerDialogOpen}
        onClose={() => setAstrologerDialogOpen(false)}
        astrologer={selectedUser}
        onUpdate={fetchUsers}
      />

      <ConsultationHistoryDialog
        open={consultationDialogOpen}
        onClose={() => setConsultationDialogOpen(false)}
        user={selectedUser}
      />

      <ScheduleDialog
        open={scheduleDialogOpen}
        onClose={() => {
          setScheduleDialogOpen(false);
          fetchUsers(); // Fetch users after closing to update the list
        }}
        astrologer={selectedUser}
      />

      <EarningsDialog
        open={earningsDialogOpen}
        onClose={() => setEarningsDialogOpen(false)}
        astrologer={selectedUser}
      />
    </Container>
  );
} 