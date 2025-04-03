import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress
} from '@mui/material';
import {
  MoreVertical,
  Search,
  UserCheck,
  Ban,
  Edit,
  Wallet,
  History,
  Calendar,
  DollarSign
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { EditProfileDialog } from '@/components/admin/dialogs/EditProfileDialog';
import { WalletDialog } from '@/components/admin/dialogs/WalletDialog';
import { ConsultationHistoryDialog } from '@/components/admin/dialogs/ConsultationHistoryDialog';
import { ScheduleDialog } from '@/components/admin/dialogs/ScheduleDialog';
import { EarningsDialog } from '@/components/admin/dialogs/EarningsDialog';
import { User } from '@/types/user';

interface AstrologerManagementProps {
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  clearMessages: () => void;
}

export default function AstrologerManagement({ onError, onSuccess, clearMessages }: AstrologerManagementProps) {
  const [astrologers, setAstrologers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Dialog states
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [verificationPrice, setVerificationPrice] = useState({
    original: 20,
    discounted: 10
  });

  // Other dialogs
  const [astrologerDialogOpen, setAstrologerDialogOpen] = useState(false);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [consultationDialogOpen, setConsultationDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [earningsDialogOpen, setEarningsDialogOpen] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    fetchAstrologers();
  }, []);

  const fetchAstrologers = async () => {
    clearMessages();
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/astrologers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch astrologers');
      }

      const data = await response.json();
      setAstrologers(data);
    } catch (err) {
      console.error('Error fetching astrologers:', err);
      onError('Failed to load astrologers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAstrologer = async () => {
    if (!selectedUser) return;
    
    setProcessingAction(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/astrologers/verify/${selectedUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ price: verificationPrice })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify astrologer');
      }
      
      onSuccess('Astrologer verified successfully');
      fetchAstrologers();
    } catch (err: any) {
      console.error('Error verifying astrologer:', err);
      onError(err.message || 'Failed to verify astrologer');
    } finally {
      setProcessingAction(false);
      setVerifyDialogOpen(false);
      setAnchorEl(null);
    }
  };

  const handleRejectAstrologer = async () => {
    if (!selectedUser) return;
    
    setProcessingAction(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/astrologers/reject/${selectedUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: rejectionReason })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject astrologer');
      }
      
      onSuccess('Astrologer rejected successfully');
      fetchAstrologers();
    } catch (err: any) {
      console.error('Error rejecting astrologer:', err);
      onError(err.message || 'Failed to reject astrologer');
    } finally {
      setProcessingAction(false);
      setRejectDialogOpen(false);
      setRejectionReason('');
      setAnchorEl(null);
    }
  };

  const handleUnverifyAstrologer = async () => {
    if (!selectedUser) return;
    
    setProcessingAction(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/astrologers/unverify/${selectedUser._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to unverify astrologer');
      }
      
      onSuccess('Astrologer unverified successfully');
      fetchAstrologers();
    } catch (err: any) {
      console.error('Error unverifying astrologer:', err);
      onError(err.message || 'Failed to unverify astrologer');
    } finally {
      setProcessingAction(false);
      setAnchorEl(null);
    }
  };

  const handleUserAction = async (userId: string, action: 'activate' | 'deactivate') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: action === 'activate' })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} user`);
      }

      toast.success(`User ${action}d successfully`);
      fetchAstrologers();
    } catch (err: any) {
      console.error(`Error ${action}ing user:`, err);
      toast.error(err.message || `Failed to ${action} user`);
    }
  };

  const filteredAstrologers = astrologers.filter(user => 
    searchTerm === '' || 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.expertise?.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Astrologer Management
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search astrologers by name, email, or expertise..."
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

      <TableContainer component={Paper}>
        {isLoading ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
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
                    <Chip
                      label={astrologer.isVerified ? 'Verified' : 'Pending'}
                      color={astrologer.isVerified ? 'success' : 'warning'}
                      size="small"
                    />
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
        )}
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          setAstrologerDialogOpen(true);
          setAnchorEl(null);
        }}>
          <Edit className="w-4 h-4 mr-2" /> Edit Profile
        </MenuItem>
        
        <MenuItem onClick={() => {
          setWalletDialogOpen(true);
          setAnchorEl(null);
        }}>
          <Wallet className="w-4 h-4 mr-2" /> Manage Wallet
        </MenuItem>
        
        <MenuItem onClick={() => {
          setConsultationDialogOpen(true);
          setAnchorEl(null);
        }}>
          <History className="w-4 h-4 mr-2" /> View History
        </MenuItem>
        
        <MenuItem onClick={() => {
          setScheduleDialogOpen(true);
          setAnchorEl(null);
        }}>
          <Calendar className="w-4 h-4 mr-2" /> Manage Schedule
        </MenuItem>
        
        <MenuItem onClick={() => {
          setEarningsDialogOpen(true);
          setAnchorEl(null);
        }}>
          <DollarSign className="w-4 h-4 mr-2" /> View Earnings
        </MenuItem>
        
        {selectedUser?.isVerified ? (
          <MenuItem onClick={() => {
            handleUnverifyAstrologer();
            setAnchorEl(null);
          }}>
            <Ban className="w-4 h-4 mr-2" /> Unverify Astrologer
          </MenuItem>
        ) : (
          [
            <MenuItem key="verify" onClick={() => {
              setVerifyDialogOpen(true);
              setAnchorEl(null);
            }}>
              <UserCheck className="w-4 h-4 mr-2" /> Verify Astrologer
            </MenuItem>,
            <MenuItem key="reject" onClick={() => {
              setRejectDialogOpen(true);
              setAnchorEl(null);
            }}>
              <Ban className="w-4 h-4 mr-2" /> Reject Verification
            </MenuItem>
          ]
        )}
        
        <MenuItem onClick={() => {
          if (selectedUser) {
            handleUserAction(
              selectedUser._id, 
              selectedUser.isActive ? 'deactivate' : 'activate'
            );
          }
          setAnchorEl(null);
        }}>
          <Ban className="w-4 h-4 mr-2" /> 
          {selectedUser?.isActive ? 'Deactivate' : 'Activate'}
        </MenuItem>
      </Menu>

      {/* Verification Dialog */}
      <Dialog open={verifyDialogOpen} onClose={() => setVerifyDialogOpen(false)}>
        <DialogTitle>Verify Astrologer</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Set pricing for {selectedUser?.name}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Original Price (₹/min)"
              type="number"
              margin="normal"
              value={verificationPrice.original}
              onChange={(e) => setVerificationPrice({
                ...verificationPrice,
                original: Number(e.target.value)
              })}
            />
            <TextField
              fullWidth
              label="Discounted Price (₹/min)"
              type="number"
              margin="normal"
              value={verificationPrice.discounted}
              onChange={(e) => setVerificationPrice({
                ...verificationPrice,
                discounted: Number(e.target.value)
              })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerifyDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleVerifyAstrologer} 
            color="primary"
            disabled={processingAction}
          >
            {processingAction ? <CircularProgress size={24} /> : 'Verify'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
        <DialogTitle>Reject Verification</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Please provide a reason for rejecting {selectedUser?.name}'s verification
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            margin="normal"
            label="Reason for rejection"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleRejectAstrologer} 
            color="error"
            disabled={processingAction || !rejectionReason.trim()}
          >
            {processingAction ? <CircularProgress size={24} /> : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Other Dialogs */}
      <EditProfileDialog 
        open={astrologerDialogOpen} 
        onClose={() => setAstrologerDialogOpen(false)}
        user={selectedUser}
        onUpdate={fetchAstrologers}
      />

      <WalletDialog
        open={walletDialogOpen}
        onClose={() => setWalletDialogOpen(false)}
        user={selectedUser}
        onUpdate={fetchAstrologers}
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
          fetchAstrologers();
        }}
        astrologer={selectedUser}
      />

      <EarningsDialog
        open={earningsDialogOpen}
        onClose={() => setEarningsDialogOpen(false)}
        astrologer={selectedUser}
      />
    </Box>
  );
}