// Post Types
export type PostType = 'CO_BUY' | 'SHARE' | 'RENT' | 'TRIP' | 'PROJECT' | 'STUDY';

export type PostStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'CANCELLED';

export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';

// API Response Types
export interface User {
  id: string;
  email: string;
  name: string;
  image: string | null;
  bio: string | null;
  college: string | null;
  isVerified: boolean;
  isAdmin: boolean;
  trustScore: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
}

export interface Post {
  id: string;
  title: string;
  description: string;
  type: PostType;
  itemName: string;
  itemPrice: number | null;
  itemCondition: string | null;
  itemImage: string | null;
  maxParticipants: number;
  currentParticipants: number;
  location: string | null;
  terms: string | null;
  startDate: string | null;
  endDate: string | null;
  status: PostStatus;
  isUrgent: boolean;
  authorId: string;
  categoryId: string;
  createdAt: string;
  author: User;
  category: Category;
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  parentId: string | null;
  likes: number;
  createdAt: string;
  author: User;
}

export interface JoinRequest {
  id: string;
  postId: string;
  senderId: string;
  receiverId: string;
  message: string | null;
  status: RequestStatus;
  agreement: string | null;
  createdAt: string;
  sender: User;
  receiver: User;
  post: Post;
}

// Form Types
export interface CreatePostInput {
  title: string;
  description: string;
  type: PostType;
  itemName: string;
  itemPrice?: number;
  itemCondition?: string;
  itemImage?: string;
  maxParticipants: number;
  location?: string;
  terms?: string;
  startDate?: string;
  endDate?: string;
  categoryId: string;
  isUrgent?: boolean;
}

export interface SignupInput {
  email: string;
  name: string;
  password: string;
  college?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// Post type labels for UI
export const POST_TYPE_LABELS: Record<PostType, { label: string; color: string; icon: string }> = {
  CO_BUY: { label: 'Co-Buy', color: 'bg-green-100 text-green-800', icon: '🛒' },
  SHARE: { label: 'Share', color: 'bg-blue-100 text-blue-800', icon: '🤝' },
  RENT: { label: 'Rent', color: 'bg-purple-100 text-purple-800', icon: '💰' },
  TRIP: { label: 'Trip', color: 'bg-orange-100 text-orange-800', icon: '✈️' },
  PROJECT: { label: 'Project', color: 'bg-pink-100 text-pink-800', icon: '💡' },
  STUDY: { label: 'Study', color: 'bg-cyan-100 text-cyan-800', icon: '📚' },
};

export const POST_STATUS_LABELS: Record<PostStatus, { label: string; color: string }> = {
  OPEN: { label: 'Open', color: 'bg-green-100 text-green-800' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
  CLOSED: { label: 'Closed', color: 'bg-gray-100 text-gray-800' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};
