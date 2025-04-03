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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent
} from '@mui/material';
import {
  Search,
  MoreVertical,
  Edit,
  Ban,
  Wallet,
  History,
  Trash2,
  UserCog,
  ArrowUpRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { EditProfileDialog } from '@/components/admin/dialogs/EditProfileDialog';
import { WalletDialog } from '@/components/admin/dialogs/WalletDialog';
import { ConsultationHistoryDialog } from '@/components/admin/dialogs/ConsultationHistoryDialog';
import { User } from '@/types/user';
import { useRouter } from 'next/navigation';

interface UserManagementProps {
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  clearMessages: () => void;
}

export default function UserManagement({ onError, onSuccess, clearMessages }: UserManagementProps) {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [consultationDialogOpen, setConsultationDialogOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<'user' | 'astrologer' | 'admin'>('user');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    clearMessages();
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.filter((user: User) => user.role === 'user'));
    } catch (err) {
      console.error('Error fetching users:', err);
      onError('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setProcessingAction(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/users/${selectedUser._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete user');
      }
      
      onSuccess('User deleted successfully');
      fetchUsers();
    } catch (err: any) {
      console.error('Error deleting user:', err);
      onError(err.message || 'Failed to delete user');
    } finally {
      setProcessingAction(false);
      setConfirmDeleteOpen(false);
      setAnchorEl(null);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user status');
      }

      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      fetchUsers();
    } catch (err: any) {
      console.error('Error updating user status:', err);
      toast.error(err.message || 'Failed to update user status');
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUser) return;
    
    setProcessingAction(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${selectedUser._id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user role');
      }
      
      onSuccess(`User role changed to ${newRole} successfully`);
      fetchUsers();
    } catch (err: any) {
      console.error('Error changing user role:', err);
      onError(err.message || 'Failed to change user role');
    } finally {
      setProcessingAction(false);
      setRoleDialogOpen(false);
    }
  };

  const filteredUsers = users.filter(user => 
    searchTerm === '' || 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        User Management
      </Typography>
      
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
                <TableCell>Status</TableCell>
                <TableCell>Wallet Balance</TableCell>
                <TableCell>Total Consultations</TableCell>
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
                  <TableCell>{user.totalConsultations || 0}</TableCell>
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
        )}
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          setEditDialogOpen(true);
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
          <History className="w-4 h-4 mr-2" /> View Consultations
        </MenuItem>
        
        <MenuItem onClick={() => {
          setRoleDialogOpen(true);
          setAnchorEl(null);
        }}>
          <UserCog className="w-4 h-4 mr-2" /> Change Role
        </MenuItem>
        
        <MenuItem onClick={() => {
          if (selectedUser) {
            handleToggleUserStatus(selectedUser._id, !!selectedUser.isActive);
            setAnchorEl(null);
          }
        }}>
          {selectedUser?.isActive ? (
            <>
              <Ban className="w-4 h-4 mr-2" /> Deactivate
            </>
          ) : (
            <>
              <ArrowUpRight className="w-4 h-4 mr-2" /> Activate
            </>
          )}
        </MenuItem>
        
        <MenuItem 
          onClick={() => {
            setConfirmDeleteOpen(true);
            setAnchorEl(null);
          }}
          sx={{ color: 'error.main' }}
        >
          <Trash2 className="w-4 h-4 mr-2" /> Delete User
        </MenuItem>
      </Menu>

      {/* Confirmation Dialog for Delete */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user <strong>{selectedUser?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteUser} 
            color="error"
            disabled={processingAction}
          >
            {processingAction ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Role Change Dialog */}
      <Dialog
        open={roleDialogOpen}
        onClose={() => setRoleDialogOpen(false)}
      >
        <DialogTitle>Change User Role</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Change the role of user <strong>{selectedUser?.name}</strong>:
          </Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel id="role-select-label">New Role</InputLabel>
            <Select
              labelId="role-select-label"
              value={newRole}
              label="New Role"
              onChange={(e) => setNewRole(e.target.value as 'user' | 'astrologer' | 'admin')}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="astrologer">Astrologer</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          {newRole === 'astrologer' && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Note: This will create a basic astrologer profile that will need to be completed by the user.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleChangeRole} 
            color="primary"
            disabled={processingAction}
          >
            {processingAction ? <CircularProgress size={24} /> : 'Change Role'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Other Dialogs */}
      <EditProfileDialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        user={selectedUser}
        onUpdate={fetchUsers}
      />

      <WalletDialog
        open={walletDialogOpen}
        onClose={() => setWalletDialogOpen(false)}
        user={selectedUser}
        onUpdate={fetchUsers}
      />

      <ConsultationHistoryDialog
        open={consultationDialogOpen}
        onClose={() => setConsultationDialogOpen(false)}
        user={selectedUser}
      />
    </Box>
  );
} 