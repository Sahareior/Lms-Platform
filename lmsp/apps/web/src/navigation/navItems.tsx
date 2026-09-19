import {
  LayoutDashboard,
  BookOpen,
  Bot,
  FileCheck,
  Library,
  BarChart3,
  NotebookPen,
  GraduationCap,
  Settings,
  Search,
} from 'lucide-react';
import type { ReactNode } from 'react';

export interface NavItemConfig {
  label: string;
  path: string;
  icon: ReactNode;
  description: string;
  glowClass?: string;
  activeColorClass?: string;
}

/** Single source of truth for the main app navigation (sidebar + hub + settings picker). */
export const navItemConfigs: NavItemConfig[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} />, description: 'Your learning overview and quick actions', glowClass: 'glow-primary', activeColorClass: 'bg-[#2F80ED] text-white' },
  { label: 'My Courses', path: '/courses', icon: <BookOpen size={18} />, description: 'Browse enrolled courses and lessons', glowClass: 'glow-primary', activeColorClass: 'bg-[#2F80ED] text-white' },
  { label: 'AI Assistant', path: '/ai-assistant', icon: <Bot size={18} />, description: 'Chat with your AI study companion', glowClass: 'glow-ai', activeColorClass: 'bg-[#00E5B3] text-black font-semibold' },
  { label: 'Mock Exam', path: '/mock-exam', icon: <FileCheck size={18} />, description: 'Take timed mock exams and view results', glowClass: 'glow-purple', activeColorClass: 'bg-[#9B51E0] text-white' },
  { label: 'Study Section', path: '/study-section', icon: <GraduationCap size={18} />, description: 'Videos, PDFs, posts and study groups', glowClass: 'glow-primary', activeColorClass: 'bg-[#2F80ED] text-white' },
  { label: 'Question Analysis', path: '/question-bank', icon: <Library size={18} />, description: 'Practice questions organized by topic', glowClass: 'glow-cyan', activeColorClass: 'bg-[#00C8FF] text-black font-semibold' },
  { label: 'Performance', path: '/performance', icon: <BarChart3 size={18} />, description: 'Track scores, streaks, and progress', glowClass: 'glow-cyan', activeColorClass: 'bg-[#00C8FF] text-black font-semibold' },
  { label: 'Question Center', path: '/question-center', icon: <Search size={18} />, description: 'Explore questions by exam and subject', glowClass: 'glow-cyan', activeColorClass: 'bg-[#00C8FF] text-black font-semibold' },
  { label: 'Notebook', path: '/notebook', icon: <NotebookPen size={18} />, description: 'Review mistakes from past attempts', glowClass: 'glow-purple', activeColorClass: 'bg-[#9B51E0] text-white' },
  { label: 'Settings', path: '/settings', icon: <Settings size={18} />, description: 'Manage your profile and preferences', glowClass: 'glow-primary', activeColorClass: 'bg-[#23262D] text-[#F5F7FA]' },
];
