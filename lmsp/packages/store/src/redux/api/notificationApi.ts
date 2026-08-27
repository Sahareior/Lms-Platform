import { api } from './baseApi';

export interface AppNotification {
  _id: string;
  title: string;
  message: string;
  type: string;
  link: string;
  read: boolean;
  createdAt: string;
}

const notificationApi = api.injectEndpoints({
  endpoints: (build) => ({
    getMyNotifications: build.query<
      { notifications: AppNotification[]; unreadCount: number },
      string
    >({
      query: (userId) => ({ url: `/notifications/mine?userId=${userId}` }),
      providesTags: [{ type: 'Notification', id: 'LIST' }],
    }),

    markNotificationRead: build.mutation<AppNotification, string>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: 'POST' }),
      invalidatesTags: [{ type: 'Notification', id: 'LIST' }],
    }),

    markAllNotificationsRead: build.mutation<{ message: string }, string>({
      query: (userId) => ({
        url: '/notifications/read-all',
        method: 'POST',
        body: { userId },
      }),
      invalidatesTags: [{ type: 'Notification', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMyNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationApi;
