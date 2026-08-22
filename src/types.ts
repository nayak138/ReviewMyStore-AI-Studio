export interface StoreSocialLinks {
  instagram?: string;
  facebook?: string;
  x?: string;
  whatsapp?: string;
  tiktok?: string;
  maps?: string;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  address: string;
  locality: string;
  category: string;
  industry: 'cafe' | 'salon' | 'dental' | 'automotive' | 'gym' | 'retail' | 'services' | 'other';
  phone: string;
  email?: string;
  website: string;
  openingHours: string;
  photoUrl: string;
  logoUrl?: string;
  rating: number;
  userRatingsTotal: number;
  googlePlaceId: string;
  googleReviewUrl: string;
  socialLinks: StoreSocialLinks;
  nfcEnabled: boolean;
  privateFeedbackShield: boolean;
  autoPilot: {
    enabled: boolean;
    minRating: number;
    tone: 'Warm & Grateful' | 'Professional & Brief' | 'Problem Resolver' | 'Return Incentive';
    ownerName: string;
  };
}

export interface KeywordItem {
  id: string;
  text: string;
  category: 'experience' | 'product' | 'staff' | 'general';
  isCustom?: boolean;
}

export interface IndustryTemplate {
  id: string;
  name: string;
  industry: Store['industry'];
  icon: string;
  keywords: {
    experience: string[];
    product: string[];
    staff: string[];
  };
}

export interface ReviewItem {
  id: string;
  storeId: string;
  customerName: string;
  customerAvatar: string;
  rating: number;
  date: string;
  reviewText: string;
  selectedKeywords: string[];
  aiReply?: string;
  replyStatus: 'pending' | 'drafted' | 'published';
  sentiment: 'positive' | 'neutral' | 'negative';
  mentionedEntities: string[];
  publishedAt?: string;
  isAutoPilot?: boolean;
}

export interface FeedbackSubmission {
  id: string;
  storeId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  rating: number;
  feedbackText: string;
  date: string;
  status: 'new' | 'contacted' | 'resolved';
}

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  plan: 'starter' | 'growth' | 'agency';
  role: 'owner' | 'manager' | 'staff';
  storeCount: number;
  createdAt: string;
}

export interface SocialBroadcastRecord {
  id: string;
  storeId: string;
  reviewId: string;
  channels: string[];
  caption: string;
  postId?: string;
  status: 'published' | 'scheduled' | 'failed';
  createdAt: string;
}
