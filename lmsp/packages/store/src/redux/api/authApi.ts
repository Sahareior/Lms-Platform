import { api } from './baseApi';
import type { User } from '../../types';

// ─── Request / Response Types ───────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUser {
  name?: string;
  username?: string;
  phone?: string;
  email?: string;
  profilePic?: string;
  dateOfBirth?: Date | string; // can be string or Date
  division?: string;
  district?: string;
  thana?: string;
  village?: string;
  postCode?: string;
  fullAddress?: string;
  education?: string;
  institute?: string;
  targetDate?: Date | string;
  preferredCenter?: string;
  hearAbout?: string;
  notes?: string;
  agreed?: boolean;
  selectedExams?: string[];
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ─── Injected Endpoints ─────────────────────────────────────
const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    // ── Login ────────────────────────────────────────────────
    login: build.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/sign-in',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    // ── Register ─────────────────────────────────────────────
    register: build.mutation<AuthResponse, RegisterRequest>({
      query: (data) => ({
        url: '/auth/sign-up',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

  addUserInfo: build.mutation<User, { id: string; data: UpdateUser }>({
    query: ({ id, data }) => ({
      url: `/auth/update/${id}`,
      method: 'PUT',
      body: data,
    }),
    invalidatesTags: ['User'],
  }),

    // ── Get Current User (protected) ─────────────────────────
    getProfile: build.query<User, any>({
      query: (id) => ({ url: `/auth/user/${id}` }),
      providesTags: ['User'],
    }),

    // ── Get Me (uses JWT token to identify the user) ─────────
    getMe: build.query<User, void>({
      query: () => ({ url: '/auth/me' }),
      providesTags: ['User'],
    }),

    // ── Password reset ───────────────────────────────────────
    forgotPassword: build.mutation<{ message: string }, { email: string }>({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),

    resetPassword: build.mutation<{ message: string }, { token: string; email?: string; newPassword: string }>({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),

    // ── Update Profile ───────────────────────────────────────
    updateProfile: build.mutation<User, Partial<User>>({
      query: (data) => ({
        url: '/auth/profile',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
  }),
  overrideExisting: false,
});

// ─── Exported Hooks ─────────────────────────────────────────
export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useGetMeQuery,
  useUpdateProfileMutation,
  useAddUserInfoMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
