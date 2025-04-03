import type { ChatMessage, ChatRoom, DBUser, DBAstrologer } from '../types/chat';

export class Database {
  async createChatRoom(userId: string, astrologerId: string): Promise<ChatRoom> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ userId, astrologerId })
    });

    if (!response.ok) {
      throw new Error('Failed to create chat room');
    }

    return response.json();
  }

  async storeChatMessage(message: ChatMessage): Promise<void> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      throw new Error('Failed to store message');
    }
  }

  async getChatHistory(roomId: string): Promise<ChatMessage[]> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/rooms/${roomId}/messages`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch chat history');
    }

    return response.json();
  }

  async getUser(userId: string): Promise<DBUser> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }

    return response.json();
  }

  async getAstrologer(astrologerId: string): Promise<DBAstrologer> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/astrologers/${astrologerId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch astrologer');
    }

    return response.json();
  }
}
