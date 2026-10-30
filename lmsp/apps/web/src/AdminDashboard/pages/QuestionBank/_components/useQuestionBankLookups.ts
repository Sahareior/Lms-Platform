import { useCallback, useMemo } from 'react';
import {
  useGetAdminExamsQuery,
  useGetAdminExamVersionsQuery,
  useGetAdminSubjectsQuery,
  BANGLADESH_BOARDS,
  type AdminSubject,
} from '@my-monorepo/store';
import type { FilterOption } from './questionBankUtils';

/** `subject.exam` may arrive populated (object) or as a raw id. */
const examIdOfSubject = (subject: AdminSubject): string =>
  typeof subject.exam === 'object' && subject.exam ? subject.exam._id : subject.exam;

const shortId = (id: string) => id.slice(-8);

const BOARD_OPTIONS: FilterOption[] = BANGLADESH_BOARDS.map((b) => ({
  label: b,
  value: b,
}));

/**
 * Exam / version / subject lookups shared by every Question Bank page.
 *
 * All three queries are cached by RTK Query, so mounting this hook on both the
 * list page and the per-document page costs a single network round trip.
 */
export const useQuestionBankLookups = () => {
  const { data: exams, isLoading: examsLoading } = useGetAdminExamsQuery();
  const { data: examVersions, isLoading: versionsLoading } = useGetAdminExamVersionsQuery();
  const { data: subjects, isLoading: subjectsLoading } = useGetAdminSubjectsQuery();

  const examsById = useMemo(() => new Map((exams ?? []).map((e) => [e._id, e])), [exams]);
  const versionsById = useMemo(() => new Map((examVersions ?? []).map((v) => [v._id, v])), [examVersions]);
  const subjectsById = useMemo(() => new Map((subjects ?? []).map((s) => [s._id, s])), [subjects]);

  const getExamName = useCallback(
    (examId?: string) => (examId ? examsById.get(examId)?.name ?? shortId(examId) : '—'),
    [examsById]
  );

  const getVersionName = useCallback(
    (versionId?: string) =>
      versionId ? versionsById.get(versionId)?.examVersion ?? shortId(versionId) : '—',
    [versionsById]
  );

  const getSubjectName = useCallback(
    (subjectId?: string) => (subjectId ? subjectsById.get(subjectId)?.name ?? shortId(subjectId) : '—'),
    [subjectsById]
  );

  const examOptions = useMemo<FilterOption[]>(
    () => (exams ?? []).map((e) => ({ label: e.name, value: e._id })),
    [exams]
  );

  // Versions / subjects belong to an exam, so they stay disabled until it's picked.
  const versionsForExam = useCallback(
    (examId: string): FilterOption[] =>
      examId
        ? (examVersions ?? [])
            .filter((v) => v.exam === examId)
            .map((v) => ({ label: v.examVersion, value: v._id }))
        : [],
    [examVersions]
  );

  const subjectsForExam = useCallback(
    (examId: string): FilterOption[] =>
      examId
        ? (subjects ?? [])
            .filter((s) => examIdOfSubject(s) === examId)
            .map((s) => ({ label: s.name, value: s._id }))
        : [],
    [subjects]
  );

  return {
    exams: exams ?? [],
    examVersions: examVersions ?? [],
    subjects: subjects ?? [],
    isLoading: examsLoading || versionsLoading || subjectsLoading,
    examOptions,
    boardOptions: BOARD_OPTIONS,
    versionsForExam,
    subjectsForExam,
    getExamName,
    getVersionName,
    getSubjectName,
  };
};
