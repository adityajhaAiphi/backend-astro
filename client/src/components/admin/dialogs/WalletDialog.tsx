import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Box, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { User } from '@/types/user';
import { DollarSign } from 'lucide-react';

interface WalletDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onUpdate: () => void;
}

export function WalletDialog({ open, onClose, user, onUpdate }: WalletDialogProps) {
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState<'credit' | 'debit'>('credit');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setAmount('');
    setTransactionType('credit');
    setNote('');
    setError('');
  };

  const handleTypeChange = (event: SelectChangeEvent<string>) => {
    setTransactionType(event.target.value as 'credit' | 'debit');
  };

  const validateInput = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return false;
    }

    if (transactionType === 'debit' && (!user?.balance || user.balance < Number(amount))) {
      setError(`Insufficient balance. Available: ₹${user?.balance || 0}`);
      return false;
    }

    setError('');
    return true;
  };

  const handleTransaction = async () => {
    if (!validateInput()) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${user?._id}/wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: transactionType,
          amount: Number(amount),
          note: note || `Admin ${transactionType} transaction`
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.details || 'Transaction failed');
      }
      
      toast.success(`Successfully ${transactionType === 'credit' ? 'added' : 'deducted'} ₹${amount}`);
      onUpdate();
      resetForm();
    } catch (err: any) {
      console.error('Error processing transaction:', err);
      setError(err.message || 'Transaction failed');
      toast.error(err.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Manage Wallet</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <DollarSign size={24} />
          <Typography variant="h6">
            Current Balance: ₹{user?.balance || 0}
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="transaction-type-label">Transaction Type</InputLabel>
          <Select
            labelId="transaction-type-label"
            id="transaction-type"
            value={transactionType}
            label="Transaction Type"
            onChange={handleTypeChange}
          >
            <MenuItem value="credit">Credit (Add Money)</MenuItem>
            <MenuItem value="debit">Debit (Deduct Money)</MenuItem>
          </Select>
        </FormControl>
        
        <TextField
          fullWidth
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          sx={{ mb: 2 }}
          inputProps={{ min: 0 }}
          required
        />
        
        <TextField
          fullWidth
          label="Note (Optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          sx={{ mb: 2 }}
          placeholder="Purpose of transaction"
        />
        
        <Button
          variant="contained"
          color={transactionType === 'credit' ? 'success' : 'error'}
          onClick={handleTransaction}
          disabled={loading || !amount || Number(amount) <= 0}
          fullWidth
          sx={{ mb: 1 }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            `${transactionType === 'credit' ? 'Add' : 'Deduct'} Money`
          )}
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}