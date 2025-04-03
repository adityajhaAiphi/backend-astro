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
  UserPlus,
  Edit,
  Ban,
  Shield,
  ShieldOff,
  Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { EditProfileDialog } from '@/components/admin/dialogs/EditProfileDialog';
import { WalletDialog } from '@/components/admin/dialogs/WalletDialog';
import { User } from '@/types/user';

// Extended User type to include superadmin role and permissions
interface AdminUser extends Omit<User, 'role'> {
  role: 'admin' | 'superadmin';
  permissions?: string[];
}

interface AdminManagementProps {
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  clearMessages: () => void;
}

export default function AdminManagement({ onError, onSuccess, clearMessages }: AdminManagementProps) {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin' as const,
    permissions: [] as string[]
  });
  const [processingAction, setProcessingAction] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const PERMISSIONS = [
    'manage_users',
    'manage_astrologers',
    'manage_content',
    'manage_payments',
    'view_reports'
  ];

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    clearMessages();
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/admins`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch admins');
      }

      const data = await response.json();
      setAdmins(data);
    } catch (err) {
      console.error('Error fetching admins:', err);
      onError('Failed to load admins');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    setProcessingAction(true);
    try {
      // Validate the form
      if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
        onError('Please fill all required fields');
        setProcessingAction(false);
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAdmin)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create admin');
      }
      
      onSuccess('Admin created successfully');
      setCreateDialogOpen(false);
      setNewAdmin({
        name: '',
        email: '',
        password: '',
        role: 'admin',
        permissions: []
      });
      fetchAdmins();
    } catch (err: any) {
      console.error('Error creating admin:', err);
      onError(err.message || 'Failed to create admin');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;
    
    setProcessingAction(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/admins/${selectedAdmin._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete admin');
      }
      
      onSuccess('Admin deleted successfully');
      fetchAdmins();
    } catch (err: any) {
      console.error('Error deleting admin:', err);
      onError(err.message || 'Failed to delete admin');
    } finally {
      setProcessingAction(false);
      setConfirmDeleteOpen(false);
      setAnchorEl(null);
    }
  };

  const handleToggleAdminStatus = async (adminId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/admins/${adminId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update admin status');
      }

      toast.success(`Admin ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      fetchAdmins();
    } catch (err: any) {
      console.error('Error updating admin status:', err);
      toast.error(err.message || 'Failed to update admin status');
    }
  };

  const handlePermissionChange = (event: SelectChangeEvent<string[]>) => {
    setNewAdmin({
      ...newAdmin,
      permissions: event.target.value as string[]
    });
  };

  const filteredAdmins = admins.filter(admin => 
    searchTerm === '' || 
    admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Admin Management
        </Typography>
        
        <Button 
          variant="contained" 
          startIcon={<UserPlus />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Admin
        </Button>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search admins by name or email..."
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
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Permissions</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAdmins.map((admin) => (
                <TableRow key={admin._id}>
                  <TableCell>{admin.name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Chip 
                      color={admin.role === 'superadmin' ? 'primary' : 'default'}
                      label={admin.role.charAt(0).toUpperCase() + admin.role.slice(1)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={admin.isActive ? 'Active' : 'Inactive'}
                      color={admin.isActive ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {admin.permissions?.map((permission) => (
                        <Chip key={permission} label={permission} size="small" />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      onClick={(e) => {
                        setSelectedAdmin(admin);
                        setAnchorEl(e.currentTarget);
                      }}
                      disabled={admin.role === 'superadmin'} // Disable actions for superadmins
                    >
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
          <Shield className="w-4 h-4 mr-2" /> Edit Permissions
        </MenuItem>
        
        <MenuItem onClick={() => {
          if (selectedAdmin) {
            handleToggleAdminStatus(selectedAdmin._id, !!selectedAdmin.isActive);
            setAnchorEl(null);
          }
        }}>
          {selectedAdmin?.isActive ? (
            <>
              <Ban className="w-4 h-4 mr-2" /> Deactivate
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 mr-2" /> Activate
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
          <Trash2 className="w-4 h-4 mr-2" /> Delete Admin
        </MenuItem>
      </Menu>

      {/* Create Admin Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create New Admin</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Full Name"
              margin="normal"
              value={newAdmin.name}
              onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
            />
            
            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              value={newAdmin.email}
              onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
            />
            
            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              value={newAdmin.password}
              onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="permissions-label">Permissions</InputLabel>
              <Select
                labelId="permissions-label"
                multiple
                value={newAdmin.permissions}
                onChange={handlePermissionChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {PERMISSIONS.map((permission) => (
                  <MenuItem key={permission} value={permission}>
                    {permission.replace('_', ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateAdmin} 
            color="primary"
            disabled={processingAction}
          >
            {processingAction ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog for Delete */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete admin <strong>{selectedAdmin?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteAdmin} 
            color="error"
            disabled={processingAction}
          >
            {processingAction ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Profile Dialog */}
      <EditProfileDialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        user={selectedAdmin as User}
        onUpdate={fetchAdmins}
      />

      {/* Wallet Dialog */}
      <WalletDialog
        open={walletDialogOpen}
        onClose={() => setWalletDialogOpen(false)}
        user={selectedAdmin as User}
        onUpdate={fetchAdmins}
      />
    </Box>
  );
} 