// ─── User Types ──────────────────────────────────────────────
export interface User {
  _id: string;
  email: string;
  role: 'student' | 'admin';
  // existing optional
  name?: string; // maps to username?
  avatar?: string;
  batch?: string;
  // new fields
  username?: string; // if you want to use backend's username
  dateOfBirth?: string; // ISO date
  division?: string;
  district?: string;
  thana?: string;
  village?: string;
  postCode?: string;
  fullAddress?: string;
  education?: string;
  institute?: string;
  targetDate?: string;
  preferredCenter?: string;
  hearAbout?: string;
  notes?: string;
  agreed?: boolean;
  selectedExams?: string[]; // array of exam IDs
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type ExamCategory = 'academic' | 'job_preparation';

export type BangladeshBoard = 'Barishal' | 'Chattogram' | 'Comilla' | 'Dhaka' | 'Dinajpur' | 'Jessore' | 'Rajshahi' | 'Sylhet';

export const BANGLADESH_BOARDS: BangladeshBoard[] = [
  'Barishal',
  'Chattogram',
  'Comilla',
  'Dhaka',
  'Dinajpur',
  'Jessore',
  'Rajshahi',
  'Sylhet',
];

export interface Exam {
   _id: string;
   name: string;
   image?: string;
   description?: string;
   applicants?: string;
   category?: ExamCategory;
}


// ─── Course Types ────────────────────────────────────────────
export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  totalLessons: number;
  completedLessons: number;
  category: string;
  progress: number; // 0-100
}

export interface CourseState {
  courses: Course[];
  activeCourseId: string | null;
  isLoading: boolean;
}

// ─── UI Types ────────────────────────────────────────────────
export type Theme = 'light' | 'dark';

export interface UIState {
  sidebarCollapsed: boolean;
  theme: Theme;
  isMobile: boolean;
}

// ─── Root State ──────────────────────────────────────────────
export interface RootState {
  user: AuthState;
  course: CourseState;
  ui: UIState;
}
