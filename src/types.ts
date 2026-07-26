export type UserRole = 'member' | 'admin' | 'lord_patron' | 'patron';
export type MemberStatus = 'pending' | 'active' | 'suspended';

export interface Member {
  id: string;
  name: string;
  classYear: string;
  email: string;
  phone: string;
  role: UserRole;
  status: MemberStatus;
  joinedAt: string;
  avatarUrl?: string;
  position?: string;
  isPatron?: boolean;
  patronTitle?: string;
  biography?: string;
  workplace?: string;
  jobTitle?: string;
  achievements?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  } | null;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  date: string;
  category: string;
  isPinned: boolean;
  visibleOnHome: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  registrations: string[]; // memberIds
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  isPinned: boolean;
}

export interface News {
  id: string;
  title: string;
  content: string;
  date: string;
  isPinned: boolean;
}

export interface DiscussionReply {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  createdAt: string;
}

export interface DiscussionComment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  createdAt: string;
  replies: DiscussionReply[];
}

export interface Discussion {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  category: string;
  createdAt: string;
  reactions: Record<string, string[]>; // e.g. { "👍": ["id1"], "⚓": ["id2"] }
  comments: DiscussionComment[];
  isLocked: boolean;
  isPinned: boolean;
}

export type ChatChannel = 'general' | 'announcements' | 'instant';

export interface ChatMessage {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  createdAt: string;
  channel: ChatChannel;
  isPinned: boolean;
}

export interface SenateMotion {
  id: string;
  title: string;
  description: string;
  authorId?: string;
  authorName?: string;
  votes: {
    aye: number;
    nay: number;
    abstain: number;
  };
  voters: string[];
  status: 'active' | 'concluded' | 'cancelled';
  createdAt: string;
  deletionRequested?: boolean;
  deletionRequestedBy?: string;
  deletionRequestedAt?: string;
}

export interface Ballot {
  id: string;
  title: string;
  description: string;
  type: 'policy' | 'election';
  options: string[]; // e.g. ['Aye', 'Nay'] or Candidate Names
  votes: Record<string, string>; // memberId -> option
  status: 'active' | 'closed';
  resultsPublished: boolean;
  createdAt: string;
}

export interface DuesRecord {
  id: string;
  memberId: string;
  memberName: string;
  months: string[]; // e.g. ['2026-07', '2026-08']
  amount: number;
  reference: string;
  remarks: string;
  date: string;
  status: 'paid' | 'pending';
  receiptNo: string;
}

export interface LordPatronInvite {
  code: string;
  isUsed: boolean;
  usedBy: string | null;
  createdAt: string;
}

export interface PatronInvite {
  token: string;
  patronType: 'Lord Patron' | 'Patron';
  isUsed: boolean;
  usedBy?: string | null;
  usedByName?: string | null;
  createdAt: string;
  expiresAt?: string | null;
}

export interface LeadershipMember {
  id?: string;
  memberId?: string;
  name: string;
  position: string;
  image: string;
  biography?: string;
  socialLinks?: { twitter?: string; linkedin?: string };
  currentTerm?: string;
  isAutoElected?: boolean;
  createdAt?: string;
}

export interface WebsiteAppearance {
  logoUrl: string;
  logoText?: string;
  logoSubtext?: string;
  logoHeight?: number; // e.g., 28-64
  logoStyle?: 'transparent' | 'framed' | 'rounded' | 'circle';
  logoFit?: 'contain' | 'cover';
  heroTitle: string;
  heroSubtitle: string;
  heroBannerUrl: string;
  announcements: string[];
  gallery: string[];
  leaders: LeadershipMember[];
  // Synchronized & Computed Image Settings
  imageOverlayOpacity?: number;
  imageObjectFit?: string;
  imageFilterStyle?: string;
  heroImageHeight?: number;
  computedAspect?: string;
  autoOptimizeImages?: boolean;
  imageBorderRadius?: string;
}

export interface DashboardStats {
  totalMembers: number;
  pendingRegistrations: number;
  activeBallots: number;
  totalPayments: number;
  upcomingEventsCount: number;
  activeDiscussionsCount: number;
}
