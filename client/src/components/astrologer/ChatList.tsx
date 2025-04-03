import { Box, List, ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, Typography, Badge } from '@mui/material';
import { format, formatDistance } from 'date-fns';
import { MessageSquare } from 'lucide-react';

interface ChatSession {
  _id: string;
  roomId: string;
  userId: {
    _id: string;
    name: string;
    profileImage: string | null;
  };
  lastMessage: string;
  startTime: string;
  status: string;
}

interface ChatListProps {
  chatSessions: ChatSession[];
  selectedChatId: string | undefined;
  onSelectChat: (chatSession: ChatSession) => void;
}

export function ChatList({ chatSessions, selectedChatId, onSelectChat }: ChatListProps) {
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (date.getTime() > today.getTime()) {
        return format(date, 'h:mm a');
      } else {
        return formatDistance(date, now, { addSuffix: true });
      }
    } catch (e) {
      return 'Unknown time';
    }
  };

  return (
    <Box sx={{ overflow: 'auto', flex: 1 }}>
      <List disablePadding>
        {chatSessions.map((chat) => (
          <ListItem 
            key={chat._id} 
            disablePadding
            divider
            sx={{
              backgroundColor: selectedChatId === chat._id ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            <ListItemButton onClick={() => onSelectChat(chat)}>
              <ListItemAvatar>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                  color={chat.status === 'active' ? 'success' : 'default'}
                >
                  <Avatar 
                    src={chat.userId.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${chat.userId.name}`} 
                    alt={chat.userId.name}
                  >
                    {chat.userId.name.charAt(0)}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography 
                    variant="subtitle2" 
                    noWrap 
                    sx={{ 
                      fontWeight: 500,
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{chat.userId.name}</span>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      component="span"
                    >
                      {formatTime(chat.startTime)}
                    </Typography>
                  </Typography>
                }
                secondary={
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    noWrap
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                  >
                    <MessageSquare size={12} />
                    <span>{chat.lastMessage || 'No messages'}</span>
                  </Typography>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
} 