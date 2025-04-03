import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, FormControlLabel, Switch, Box, Typography, Paper } from '@mui/material';
import { useState, useEffect } from 'react';
import { User } from '@/types/user';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { toast } from 'react-hot-toast';

interface ScheduleDialogProps {
  open: boolean;
  onClose: () => void;
  astrologer: User | null;
}

interface Schedule {
  workingDays: string[];
  startTime: string;
  endTime: string;
  breaks: {
    start: string;
    end: string;
  }[];
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function ScheduleDialog({ open, onClose, astrologer }: ScheduleDialogProps) {
  const [schedule, setSchedule] = useState<Schedule>({
    workingDays: [],
    startTime: '09:00',
    endTime: '18:00',
    breaks: []
  });

  useEffect(() => {
    if (open && astrologer) {
      fetchSchedule();
    }
  }, [open, astrologer]);

  const fetchSchedule = async () => {
    if (!astrologer) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/astrologers/${astrologer._id}/schedule`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch schedule');
      }

      const data = await response.json();
      setSchedule(data);
    } catch (err: any) {
      console.error('Error fetching schedule:', err);
      toast.error(err.message || 'Failed to fetch schedule');
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/astrologers/${astrologer?._id}/schedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(schedule)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update schedule');
      }

      toast.success('Schedule updated successfully');
      onClose();
    } catch (err: any) {
      console.error('Error updating schedule:', err);
      toast.error(err.message || 'Failed to update schedule');
    }
  };

  const addBreak = () => {
    setSchedule(prev => ({
      ...prev,
      breaks: [...prev.breaks, { start: '13:00', end: '14:00' }]
    }));
  };

  const removeBreak = (index: number) => {
    setSchedule(prev => ({
      ...prev,
      breaks: prev.breaks.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Manage Schedule</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {/* Working Hours */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>Working Hours</Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box display="flex" gap={2}>
                  <TimePicker
                    label="Start Time"
                    value={dayjs(schedule.startTime, 'HH:mm')}
                    onChange={(newValue) => setSchedule(prev => ({
                      ...prev,
                      startTime: newValue?.format('HH:mm') || '09:00'
                    }))}
                  />
                  <TimePicker
                    label="End Time"
                    value={dayjs(schedule.endTime, 'HH:mm')}
                    onChange={(newValue) => setSchedule(prev => ({
                      ...prev,
                      endTime: newValue?.format('HH:mm') || '18:00'
                    }))}
                  />
                </Box>
              </LocalizationProvider>
            </Paper>
          </Grid>

          {/* Working Days */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>Working Days</Typography>
              <Grid container spacing={1}>
                {DAYS.map((day) => (
                  <Grid item xs={6} sm={4} key={day}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={schedule.workingDays.includes(day)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSchedule(prev => ({
                                ...prev,
                                workingDays: [...prev.workingDays, day]
                              }));
                            } else {
                              setSchedule(prev => ({
                                ...prev,
                                workingDays: prev.workingDays.filter(d => d !== day)
                              }));
                            }
                          }}
                        />
                      }
                      label={day}
                    />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          {/* Break Times */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Break Times</Typography>
                <Button variant="outlined" onClick={addBreak}>Add Break</Button>
              </Box>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                {schedule.breaks.map((breakTime, index) => (
                  <Box key={index} display="flex" gap={2} mb={2} alignItems="center">
                    <TimePicker
                      label="Start Time"
                      value={dayjs(breakTime.start, 'HH:mm')}
                      onChange={(newValue) => {
                        const newBreaks = [...schedule.breaks];
                        newBreaks[index] = {
                          ...newBreaks[index],
                          start: newValue?.format('HH:mm') || breakTime.start
                        };
                        setSchedule(prev => ({ ...prev, breaks: newBreaks }));
                      }}
                    />
                    <TimePicker
                      label="End Time"
                      value={dayjs(breakTime.end, 'HH:mm')}
                      onChange={(newValue) => {
                        const newBreaks = [...schedule.breaks];
                        newBreaks[index] = {
                          ...newBreaks[index],
                          end: newValue?.format('HH:mm') || breakTime.end
                        };
                        setSchedule(prev => ({ ...prev, breaks: newBreaks }));
                      }}
                    />
                    <Button 
                      color="error" 
                      onClick={() => removeBreak(index)}
                    >
                      Remove
                    </Button>
                  </Box>
                ))}
              </LocalizationProvider>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
} 