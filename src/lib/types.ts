// Core database types and interfaces for the church management SaaS

export interface Church {
  id: string;
  name: string;
  subdomain: string;
  address: string;
  phone: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  subscriptionStatus: 'active' | 'inactive' | 'suspended' | 'trial';
  memberCount: number;
  monthlyFee: number;
  adminUserId: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  churchId?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  twoFactorEnabled: boolean;
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  CHURCH_ADMIN = 'church_admin',
  PASTOR = 'pastor',
  LEADER = 'leader',
  MEMBER = 'member',
  VISITOR = 'visitor'
}

export interface Member {
  id: string;
  churchId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  birthDate?: Date;
  address: Address;
  photo?: string;
  baptismDate?: Date;
  membershipDate: Date;
  isActive: boolean;
  cellGroupId?: string;
  ministries: string[];
  emergencyContact: EmergencyContact;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface CellGroup {
  id: string;
  churchId: string;
  name: string;
  description?: string;
  leaderId: string;
  coLeaderId?: string;
  address: Address;
  meetingDay: string;
  meetingTime: string;
  isActive: boolean;
  maxMembers?: number;
  currentMembers: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorshipTeam {
  id: string;
  churchId: string;
  name: string;
  description?: string;
  leaderId: string;
  members: WorshipTeamMember[];
  ministry: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorshipTeamMember {
  memberId: string;
  role: string;
  instrument?: string;
  skills: string[];
  availability: Availability[];
  isActive: boolean;
}

export interface Availability {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string;
  endTime: string;
}

export interface Song {
  id: string;
  churchId: string;
  title: string;
  artist: string;
  key: string;
  tempo: number;
  genre: string;
  lyrics?: string;
  chords?: string;
  ccliNumber?: string;
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Setlist {
  id: string;
  churchId: string;
  name: string;
  eventDate: Date;
  eventType: string;
  songs: SetlistSong[];
  teamId: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SetlistSong {
  songId: string;
  order: number;
  key?: string;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId?: string;
  groupId?: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  fileUrl?: string;
  fileName?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  churchId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
}

export interface Payment {
  id: string;
  churchId: string;
  amount: number;
  memberCount: number;
  method: 'pix' | 'credit_card' | 'boleto';
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  dueDate: Date;
  paidAt?: Date;
  transactionId?: string;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  churchId?: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

// LGPD Compliance Types
export interface ConsentRecord {
  id: string;
  userId: string;
  churchId: string;
  purpose: string;
  consentGiven: boolean;
  consentDate: Date;
  withdrawnDate?: Date;
  ipAddress: string;
  userAgent: string;
}

export interface DataRequest {
  id: string;
  userId: string;
  churchId: string;
  type: 'access' | 'deletion' | 'portability' | 'rectification';
  status: 'pending' | 'processing' | 'completed' | 'denied';
  requestDate: Date;
  completedDate?: Date;
  notes?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Dashboard Statistics
export interface ChurchStats {
  totalMembers: number;
  activeCellGroups: number;
  worshipTeams: number;
  monthlyGrowth: number;
  recentActivities: number;
}

export interface SuperAdminStats {
  totalChurches: number;
  totalUsers: number;
  totalRevenue: number;
  activeSubscriptions: number;
  monthlyGrowthRate: number;
}