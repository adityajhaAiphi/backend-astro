import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, FormControl, InputLabel, Select, MenuItem, Chip, Box, Typography, Switch, FormControlLabel } from '@mui/material';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { User } from '@/types/user';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

interface AstrologerDialogProps {
  open: boolean;
  onClose: () => void;
  astrologer: User | null;
  onUpdate: () => void;
}

const EXPERTISE_OPTIONS = [
  'Vedic Astrology',
  'Tarot Reading',
  'Palmistry',
  'Numerology',
  'Vastu',
  'Face Reading',
  'Gemology'
];

const LANGUAGE_OPTIONS = [
  'English',
  'Hindi',
  'Bengali',
  'Telugu',
  'Tamil',
  'Marathi',
  'Gujarati'
];

export function AstrologerDialog({ open, onClose, astrologer, onUpdate }: AstrologerDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    experience: '',
    expertise: [] as string[],
    languages: [] as string[],
    about: '',
    price: {
      original: 0,
      discounted: 0
    },
    availability: {
      online: false,
      startTime: '09:00',
      endTime: '18:00'
    },
    status: {
      chat: false,
      call: false
    }
  });

  useEffect(() => {
    if (astrologer) {
      setFormData({
        name: astrologer.name || '',
        email: astrologer.email || '',
        experience: astrologer.experience || '',
        expertise: astrologer.expertise || [],
        languages: astrologer.languages || [],
        about: astrologer.about || '',
        price: astrologer.price || {
          original: 0,
          discounted: 0
        },
        availability: astrologer.availability || {
          online: false,
          startTime: '09:00',
          endTime: '18:00'
        },
        status: astrologer.status || {
          chat: false,
          call: false
        }
      });
    }
  }, [astrologer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/astrologers/${astrologer?._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update astrologer');
      }
      
      toast.success('Astrologer updated successfully');
      onUpdate();
      onClose();
    } catch (err: any) {
      console.error('Error updating astrologer:', err);
      toast.error(err.message || 'Failed to update astrologer');
    }
  };

  const handleVerify = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/astrologers/verify/${astrologer?._id}`, {
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
      onUpdate();
      onClose();
    } catch (err: any) {
      console.error('Error verifying astrologer:', err);
      toast.error(err.message || 'Failed to verify astrologer');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {astrologer?.isVerified ? 'Edit Astrologer' : 'Verify Astrologer'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            {/* Basic Information */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                type="email"
              />
            </Grid>

            {/* Experience and About */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Experience"
                value={formData.experience}
                onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="About"
                value={formData.about}
                onChange={(e) => setFormData(prev => ({ ...prev, about: e.target.value }))}
                multiline
                rows={3}
              />
            </Grid>

            {/* Expertise and Languages */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Expertise</InputLabel>
                <Select
                  multiple
                  value={formData.expertise}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    expertise: typeof e.target.value === 'string' 
                      ? e.target.value.split(',') 
                      : e.target.value 
                  }))}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {EXPERTISE_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Languages</InputLabel>
                <Select
                  multiple
                  value={formData.languages}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    languages: typeof e.target.value === 'string' 
                      ? e.target.value.split(',') 
                      : e.target.value 
                  }))}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {LANGUAGE_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Pricing */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Original Price (per minute)"
                type="number"
                value={formData.price.original}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  price: { ...prev.price, original: Number(e.target.value) }
                }))}
                required
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Discounted Price (per minute)"
                type="number"
                value={formData.price.discounted}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  price: { ...prev.price, discounted: Number(e.target.value) }
                }))}
                required
                inputProps={{ min: 0 }}
              />
            </Grid>

            {/* Availability */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Availability
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.availability.online}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      availability: { ...prev.availability, online: e.target.checked }
                    }))}
                  />
                }
                label="Online"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  label="Start Time"
                  value={dayjs(formData.availability.startTime, 'HH:mm')}
                  onChange={(newValue) => setFormData(prev => ({
                    ...prev,
                    availability: { 
                      ...prev.availability, 
                      startTime: newValue?.format('HH:mm') || '09:00'
                    }
                  }))}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  label="End Time"
                  value={dayjs(formData.availability.endTime, 'HH:mm')}
                  onChange={(newValue) => setFormData(prev => ({
                    ...prev,
                    availability: { 
                      ...prev.availability, 
                      endTime: newValue?.format('HH:mm') || '18:00'
                    }
                  }))}
                />
              </LocalizationProvider>
            </Grid>

            {/* Status */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Service Status
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.status.chat}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      status: { ...prev.status, chat: e.target.checked }
                    }))}
                  />
                }
                label="Chat Available"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.status.call}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      status: { ...prev.status, call: e.target.checked }
                    }))}
                  />
                }
                label="Call Available"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          {!astrologer?.isVerified && (
            <Button onClick={handleVerify} color="success">
              Verify Astrologer
            </Button>
          )}
          <Button type="submit" variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
} 