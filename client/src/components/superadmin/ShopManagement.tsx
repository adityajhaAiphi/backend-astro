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
  SelectChangeEvent,
  Grid
} from '@mui/material';
import {
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Star,
  Plus,
  Tag,
  Package,
  FileText,
  ImagePlus
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface ShopItem {
  _id: string;
  itemName: string;
  description: string;
  category: string;
  price: number;
  discountedPrice?: number;
  stock: number;
  rating: number;
  totalRatings: number;
  images: string[];
  featured?: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface ShopManagementProps {
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  clearMessages: () => void;
}

export default function ShopManagement({ onError, onSuccess, clearMessages }: ShopManagementProps) {
  const router = useRouter();
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchShopItems();
  }, []);

  const fetchShopItems = async () => {
    clearMessages();
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/shop`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch shop items');
      }

      const data = await response.json();
      setShopItems(data);
      
      // Extract unique categories with proper type assertion
      const categories = [...new Set(data.map((item: ShopItem) => item.category))] as string[];
      setAvailableCategories(categories);
    } catch (err) {
      console.error('Error fetching shop items:', err);
      onError('Failed to load shop items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    
    setProcessingAction(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/shop/${selectedItem._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete shop item');
      }
      
      onSuccess('Shop item deleted successfully');
      fetchShopItems();
    } catch (err: any) {
      console.error('Error deleting shop item:', err);
      onError(err.message || 'Failed to delete shop item');
    } finally {
      setProcessingAction(false);
      setConfirmDeleteOpen(false);
      setAnchorEl(null);
    }
  };

  const handleToggleFeatured = async (itemId: string, currentFeatured: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/shop/${itemId}/featured`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ featured: !currentFeatured })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update item');
      }

      toast.success(`Item ${currentFeatured ? 'removed from' : 'marked as'} featured`);
      fetchShopItems();
    } catch (err: any) {
      console.error('Error updating item:', err);
      toast.error(err.message || 'Failed to update item');
    }
  };

  const handleCreateItem = () => {
    router.push('/dashboard/superadmin/shop/create');
  };

  const handleEditItem = (itemId: string) => {
    router.push(`/dashboard/superadmin/shop/edit/${itemId}`);
  };

  const handleViewOrders = (itemId: string) => {
    router.push(`/dashboard/superadmin/shop/orders/${itemId}`);
  };

  const filteredItems = shopItems.filter(item => {
    // First apply category filter
    if (categoryFilter !== 'all' && item.category !== categoryFilter) {
      return false;
    }
    
    // Then apply search term filter
    return searchTerm === '' || 
      item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Shop Management
        </Typography>
        
        <Button 
          variant="contained" 
          startIcon={<Plus />}
          onClick={handleCreateItem}
        >
          Add New Item
        </Button>
      </Box>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search items by name, description or tags..."
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
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel id="category-filter-label">Category</InputLabel>
            <Select
              labelId="category-filter-label"
              value={categoryFilter}
              label="Category"
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {availableCategories.map((category) => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        {isLoading ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
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
                <TableCell>Featured</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>{item.itemName}</TableCell>
                  <TableCell>
                    <Chip label={item.category} size="small" />
                  </TableCell>
                  <TableCell>
                    {item.discountedPrice ? (
                      <Box>
                        <Typography 
                          variant="body2" 
                          component="span" 
                          sx={{ textDecoration: 'line-through', color: 'text.secondary', mr: 1 }}
                        >
                          ₹{item.price}
                        </Typography>
                        <Typography variant="body2" component="span" color="error">
                          ₹{item.discountedPrice}
                        </Typography>
                      </Box>
                    ) : (
                      `₹${item.price}`
                    )}
                  </TableCell>
                  <TableCell>{item.stock}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Star size={16} color="#FFD700" />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {item.rating} ({item.totalRatings})
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={item.featured ? "Featured" : "Regular"}
                      color={item.featured ? "primary" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={(e) => {
                      setSelectedItem(item);
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
          if (selectedItem) {
            handleEditItem(selectedItem._id);
          }
          setAnchorEl(null);
        }}>
          <Edit className="w-4 h-4 mr-2" /> Edit Item
        </MenuItem>
        
        <MenuItem onClick={() => {
          if (selectedItem) {
            handleToggleFeatured(selectedItem._id, !!selectedItem.featured);
          }
          setAnchorEl(null);
        }}>
          <Star className="w-4 h-4 mr-2" /> 
          {selectedItem?.featured ? 'Remove from Featured' : 'Mark as Featured'}
        </MenuItem>
        
        <MenuItem onClick={() => {
          if (selectedItem) {
            handleViewOrders(selectedItem._id);
          }
          setAnchorEl(null);
        }}>
          <Package className="w-4 h-4 mr-2" /> View Orders
        </MenuItem>
        
        <MenuItem 
          onClick={() => {
            setConfirmDeleteOpen(true);
            setAnchorEl(null);
          }}
          sx={{ color: 'error.main' }}
        >
          <Trash2 className="w-4 h-4 mr-2" /> Delete Item
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
            Are you sure you want to delete <strong>{selectedItem?.itemName}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteItem} 
            color="error"
            disabled={processingAction}
          >
            {processingAction ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 