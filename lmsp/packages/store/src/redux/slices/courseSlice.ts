import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Course, CourseState } from '../../types';

const initialState: CourseState = {
  courses: [],
  activeCourseId: null,
  isLoading: false,
};

const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {
    setCourses(state, action: PayloadAction<Course[]>) {
      state.courses = action.payload;
    },
    setActiveCourse(state, action: PayloadAction<string | null>) {
      state.activeCourseId = action.payload;
    },
    updateCourseProgress(
      state,
      action: PayloadAction<{ courseId: string; progress: number }>,
    ) {
      const course = state.courses.find(
        (c) => c.id === action.payload.courseId,
      );
      if (course) {
        course.progress = action.payload.progress;
        course.completedLessons = Math.round(
          (action.payload.progress / 100) * course.totalLessons,
        );
      }
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setCourses,
  setActiveCourse,
  updateCourseProgress,
  setLoading,
} = courseSlice.actions;
export default courseSlice.reducer;
