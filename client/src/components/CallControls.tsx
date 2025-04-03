import { Box, Button, IconButton, Tooltip } from '@mui/material';
import { PhoneCall, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';

interface CallControlsProps {
  isActive: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  hasBalance: boolean;
  onStart: () => void;
  onEnd: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
}

export function CallControls({
  isActive,
  isMuted,
  isVideoOff,
  hasBalance,
  onStart,
  onEnd,
  onToggleMute,
  onToggleVideo
}: CallControlsProps) {
  return (
    <Box sx={{ 
      display: 'flex', 
      gap: 2, 
      justifyContent: 'center',
      p: 2,
      bgcolor: 'background.paper',
      borderRadius: 1,
      boxShadow: 1
    }}>
      {isActive ? (
        <>
          <Tooltip title={isMuted ? "Unmute" : "Mute"}>
            <IconButton onClick={onToggleMute} color={isMuted ? "error" : "primary"}>
              {isMuted ? <MicOff /> : <Mic />}
            </IconButton>
          </Tooltip>
          <Tooltip title={isVideoOff ? "Turn on video" : "Turn off video"}>
            <IconButton onClick={onToggleVideo} color={isVideoOff ? "error" : "primary"}>
              {isVideoOff ? <VideoOff /> : <Video />}
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="error"
            startIcon={<PhoneOff />}
            onClick={onEnd}
          >
            End Call
          </Button>
        </>
      ) : (
        <Button
          variant="contained"
          color="success"
          startIcon={<PhoneCall />}
          onClick={onStart}
          disabled={!hasBalance}
        >
          {hasBalance ? 'Start Call' : 'Insufficient Balance'}
        </Button>
      )}
    </Box>
  );
} 