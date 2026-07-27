export interface Course {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  category: string;
  progress: number; // 0-100
  totalLessons: number;
  completedLessons: number;
  color: string; // accent color for the card
}

export interface DashboardStats {
  totalCourses: number;
  inProgress: number;
  completed: number;
  certificates: number;
}
