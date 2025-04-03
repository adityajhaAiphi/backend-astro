import { useState } from 'react';
import { IconButton, Menu, MenuItem, Popover, Box } from '@mui/material';
import { MoreVertical, Quote, Trash2, SmilePlus } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import type { ChatMessage } from '@/types/chat';

interface MessageActionsProps {
  message: ChatMessage;
  onQuote: (message: ChatMessage) => void;
  onDelete: (messageId: string) => void;
  onReact: (messageId: string, reaction: string) => void;
  isOwnMessage: boolean;
}

export function MessageActions({ message, onQuote, onDelete, onReact, isOwnMessage }: MessageActionsProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [emojiAnchorEl, setEmojiAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEmojiClick = (event: React.MouseEvent<HTMLElement>) => {
    setEmojiAnchorEl(event.currentTarget);
    handleClose();
  };

  const handleEmojiSelect = (emojiData: any) => {
    onReact(message.id, emojiData.emoji);
    setEmojiAnchorEl(null);
  };

  const handleQuote = () => {
    onQuote(message);
    handleClose();
  };

  const handleDelete = () => {
    onDelete(message.id);
    handleClose();
  };

  return (
    <>
      <IconButton size="small" onClick={handleClick}>
        <MoreVertical size={16} />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleQuote}>
          <Quote size={16} className="mr-2" />
          Quote
        </MenuItem>
        <MenuItem onClick={handleEmojiClick}>
          <SmilePlus size={16} className="mr-2" />
          React
        </MenuItem>
        {isOwnMessage && (
          <MenuItem onClick={handleDelete} className="text-red-500">
            <Trash2 size={16} className="mr-2" />
            Delete
          </MenuItem>
        )}
      </Menu>

      <Popover
        open={Boolean(emojiAnchorEl)}
        anchorEl={emojiAnchorEl}
        onClose={() => setEmojiAnchorEl(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <EmojiPicker onEmojiClick={handleEmojiSelect} />
      </Popover>
    </>
  );
} 