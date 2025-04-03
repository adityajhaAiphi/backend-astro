import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, Chip } from '@mui/material';
import { useState, useEffect } from 'react';
import { User } from '@/types/user';

interface ConsultationHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

interface Consultation {
  _id: string;
  userId: string;
  astrologerId: string;
  type: 'chat' | 'call';
  status: 'completed' | 'cancelled' | 'ongoing';
  startTime: string;
  endTime?: string;
  duration: number;
  amount: number;
  rating?: number;
  review?: string;
}

export function ConsultationHistoryDialog({ open, onClose, user }: ConsultationHistoryDialogProps) {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      fetchConsultations();
    }
  }, [open, user]);

  const fetchConsultations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/consultations/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch consultations');
      }

      const data = await response.json();
      setConsultations(data);
    } catch (err) {
      console.error('Error fetching consultations:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Consultation History</DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Rating</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {consultations.map((consultation) => (
                <TableRow key={consultation._id}>
                  <TableCell>
                    {new Date(consultation.startTime).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={consultation.type.toUpperCase()} 
                      color={consultation.type === 'call' ? 'primary' : 'secondary'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{consultation.duration} mins</TableCell>
                  <TableCell>₹{consultation.amount}</TableCell>
                  <TableCell>
                    <Chip
                      label={consultation.status}
                      color={
                        consultation.status === 'completed' ? 'success' :
                        consultation.status === 'cancelled' ? 'error' : 'warning'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {consultation.rating ? (
                      <Box display="flex" alignItems="center">
                        {consultation.rating}/5
                      </Box>
                    ) : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
} 