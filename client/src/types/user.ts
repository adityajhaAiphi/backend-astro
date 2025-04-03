export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'astrologer' | 'admin' | 'superadmin';
    balance: number;
    isVerified?: boolean;
    isActive?: boolean;
    // Astrologer specific fields
    experience?: string;
    expertise?: string[];
    languages?: string[];
    rating?: number;
    totalRatings?: number;
    about?: string;
    price?: {
      original: number;
      discounted: number;
    };
    availability?: {
      online: boolean;
      startTime: string;
      endTime: string;
      workingDays: string[];
      breaks: {
        start: string;
        end: string;
      }[];
    };
    status?: {
      chat: boolean;
      call: boolean;
    };
    earnings?: {
      total: number;
      thisMonth: number;
      lastMonth: number;
    };
    kycDetails?: {
      idType: string;
      idNumber: string;
      idImage: string;
      addressProof: string;
      isVerified: boolean;
      rejectionReason?: string;
    };
    categories?: string[];
    totalConsultations?: number;
    averageRating?: number;
    responseTime?: number;
    rejectionReason?: string;
    permissions?: string[]; // Admin and SuperAdmin specific field
  }
  
  export interface AuthResponse {
    user: User;
    token: string;
  } 