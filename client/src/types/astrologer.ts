export interface AstrologerStatus {
  chat: boolean;
  call: boolean;
}

export interface Astrologer {
  _id: string;
  name: string;
  profileImage: string;
  rating: number;
  totalRatings: number;
  isOnline: boolean;
  expertise: string[];
  languages: string[];
  experience: string;
  price: {
    original: number;
    discounted: number;
  };
  availability: {
    startTime: string;
    endTime: string;
  };
  consultations: number;
  status: {
    chat: boolean;
    call: boolean;
  };
  createdAt?: Date;
  updatedAt?: Date;
} 