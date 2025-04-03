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
  Menu,
  MenuItem,
} from '@mui/material';
import { 
  Users, 
  ShoppingBag, 
  Star, 
  Calendar,
  DollarSign,
  UserCheck,
  Ban,
  Wallet,
  History,
  Search,
  MoreVertical,
  Edit,
  Shield,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { EditProfileDialog } from '@/components/admin/dialogs/EditProfileDialog';
import { WalletDialog } from '@/components/admin/dialogs/WalletDialog';
import { AstrologerDialog } from '@/components/admin/dialogs/AstrologerDialog';
import { ConsultationHistoryDialog } from '@/components/admin/dialogs/ConsultationHistoryDialog';
import { ScheduleDialog } from '@/components/admin/dialogs/ScheduleDialog';
import { EarningsDialog } from '@/components/admin/dialogs/EarningsDialog';
import { User } from '@/types/user';
import SuperAdminStats from '@/components/superadmin/SuperAdminStats';
import AstrologerManagement from '@/components/superadmin/AstrologerManagement';
import UserManagement from '@/components/superadmin/UserManagement';
import AdminManagement from '@/components/superadmin/AdminManagement';
import ShopManagement from '@/components/superadmin/ShopManagement';

interface ShopItem {
  _id: string;
  itemName: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
  totalRatings: number;
}

interface Admin extends User {
  permissions?: string[];
}

export default function SuperAdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [consultationDialogOpen, setConsultationDialogOpen] = useState(false);
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
    monthlyRevenue: [],
    revenueBreakdown: {
      products: 0,
      consultations: 0
    }
  });

  // Add loading states for each data type
  const [loadingStates, setLoadingStates] = useState({
    users: true,
    admins: true,
    shop: true,
    stats: true
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== 'superadmin')) {
      router.push('/');
      return;
    }
    
    if (user && user.role === 'superadmin') {
      setIsLoading(false);
    }
  }, [loading, user, router]);

  const handleRetry = () => {
    setIsLoading(true);
    setError('');
    // Reload the current page
    window.location.reload();
  };

  if (loading || isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user || user.role !== 'superadmin') {
    return null;
  }

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom>
        Super Admin Dashboard
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

      <TabContext value={activeTab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="Dashboard" value="dashboard" icon={<Shield className="w-4 h-4" />} />
            <Tab label="Users" value="users" icon={<Users className="w-4 h-4" />} />
            <Tab label="Admins" value="admins" icon={<Shield className="w-4 h-4" />} />
            <Tab label="Astrologers" value="astrologers" icon={<Star className="w-4 h-4" />} />
            <Tab label="Shop" value="shop" icon={<ShoppingBag className="w-4 h-4" />} />
          </Tabs>
        </Box>

        <Paper elevation={0} sx={{ p: 2 }}>
          <TabPanel value="dashboard">
            <SuperAdminStats 
              onError={(message) => setError(message)} 
              clearError={() => setError('')}
            />
          </TabPanel>

          <TabPanel value="users">
            <UserManagement 
              onError={(message) => setError(message)} 
              onSuccess={(message) => setSuccess(message)}
              clearMessages={() => {
                setError('');
                setSuccess('');
              }}
            />
          </TabPanel>
          
          <TabPanel value="admins">
            <AdminManagement 
              onError={(message) => setError(message)} 
              onSuccess={(message) => setSuccess(message)}
              clearMessages={() => {
                setError('');
                setSuccess('');
              }}
            />
          </TabPanel>

          <TabPanel value="astrologers">
            <AstrologerManagement 
              onError={(message) => setError(message)} 
              onSuccess={(message) => setSuccess(message)}
              clearMessages={() => {
                setError('');
                setSuccess('');
              }}
            />
          </TabPanel>

          <TabPanel value="shop">
            <ShopManagement 
              onError={(message) => setError(message)} 
              onSuccess={(message) => setSuccess(message)}
              clearMessages={() => {
                setError('');
                setSuccess('');
              }}
            />
          </TabPanel>
        </Paper>
      </TabContext>
    </Container>
  );
}