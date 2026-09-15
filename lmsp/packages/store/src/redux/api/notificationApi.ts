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
    // The backend scopes notifications to the token's user, so no userId param
    // is sent (sending one used to allow reading other users' notifications).
    getMyNotifications: build.query<
      { notifications: AppNotification[]; unreadCount: number },
      void
    >({
      query: () => ({ url: '/notifications/mine' }),
      providesTags: [{ type: 'Notification', id: 'LIST' }],
    }),

    markNotificationRead: build.mutation<AppNotification, string>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: 'POST' }),
      invalidatesTags: [{ type: 'Notification', id: 'LIST' }],
    }),

    markAllNotificationsRead: build.mutation<{ message: string }, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'POST',
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
