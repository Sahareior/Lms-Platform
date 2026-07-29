import { api } from './baseApi';

export interface Note {
  _id?: string;
  lesson: string;
  user: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NoteResponse {
  message?: string;
  note: Note;
}

export interface NotesListResponse {
  notes: Note[];
}

// ─── Injected Endpoints ─────────────────────────────────────
const noteApi = api.injectEndpoints({
  endpoints: (build) => ({
    getLessonNote: build.query<NoteResponse, { lessonId: string; userId: string }>({
      query: ({ lessonId, userId }) => ({ url: `/notes/lesson/${lessonId}?userId=${userId}` }),
      providesTags: (_result, _error, { lessonId }) => [{ type: 'Note', id: lessonId }],
    }),

    saveLessonNote: build.mutation<NoteResponse, { lessonId: string; userId: string; content: string }>({
      query: ({ lessonId, userId, content }) => ({
        url: `/notes/lesson/${lessonId}`,
        method: 'PUT',
        body: { userId, content },
      }),
      invalidatesTags: (_result, _error, { lessonId }) => [{ type: 'Note', id: lessonId }],
    }),

    getAllUserNotes: build.query<NotesListResponse, string>({
      query: (userId) => ({ url: `/notes/user/${userId}` }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetLessonNoteQuery,
  useSaveLessonNoteMutation,
  useGetAllUserNotesQuery,
} = noteApi;
