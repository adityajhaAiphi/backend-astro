export interface ChatMessage {
  id: string;
  content: string;
  type: 'text' | 'image' | 'document' | 'quick_prompt';
  sender: {
    id: string;
    name: string;
    role: 'user' | 'astrologer';
  };
  receiver: {
    id: string;
    role: 'user' | 'astrologer';
  };
  roomId: string;
  sessionId: string;
  timestamp: string;
  reactions?: string[];  // Array of emoji reactions
  quotedMessage?: {      // For quoted messages
    id: string;
    content: string;
    sender: {
      name: string;
    };
  };
  isDeleted?: boolean;   // For soft deletion
}

export interface ChatRoom {
  id: string;
  userId: string;
  astrologerId: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'ended';
  messages: ChatMessage[];
}

// Database interfaces for future implementation
export interface DBUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'astrologer';
  chatRooms: string[]; // room IDs
}

export interface DBAstrologer {
  id: string;
  userId: string; // reference to DBUser
  // ... other astrologer specific fields
}

export interface QuickPrompt {
  id: string;
  icon: string;
  text: string;
  questions: string[];
}

export interface Message {
  id: string;
  content: string | QuickPrompt[];
  type: 'text' | 'image' | 'document' | 'quick_prompt' | 'system';
  timestamp: string;
  senderId?: string;
  sender: {
    id?: string;
    _id?: string;
    name: string;
    role: 'user' | 'astrologer';
  };
  sessionId: string;
  roomId: string;
  fileUrl?: string;
  fileName?: string;
}

export interface ChatSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
}

export interface MessageGroup {
  date: Date;
  messages: Message[];
  sessionId: string;
}

// Add this if you need it
export interface ChatState {
  messages: Message[];
  isTyping: boolean;
  isConnected: boolean;
  isRoomJoined: boolean;
  roomId: string | null;
  error: string | null;
}

export interface ChatUser {
  _id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}
