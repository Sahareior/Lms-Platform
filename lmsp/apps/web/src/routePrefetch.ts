/**
 * Route Prefetching System
 * ─────────────────────────
 * Eagerly loads lazy route chunks so that navigation feels instant.
 *
 * Strategy:
 * 1. On HOVER over a nav link → prefetch that route's chunk immediately
 * 2. After IDLE (3s after initial mount) → prefetch all primary routes
 *
 * This eliminates the 2-4 second delay users see on Netlify because the
 * JS chunks are already downloaded & cached by the time they click.
 */

// ── Map route paths to their dynamic import functions ──────────
// These must match the exact same import() paths used in router.tsx
// so that Vite/webpack deduplicates them into the same chunk.
const routeImportMap: Record<string, () => Promise<unknown>> = {
  '/dashboard': () => import('./(components)/MainPages/dashboard/Dashboard'),
  '/courses': () => import('./(components)/MainPages/lesson/LessonPage'),
  '/ai-assistant': () => import('./(components)/MainPages/chat_interface/AIChatInterface'),
  '/mock-exam': () => import('./(components)/MainPages/mock_exam/ExamOptions'),
  '/study-section': () => import('./(components)/MainPages/study_section/StudySection'),
  '/question-bank': () => import('./(components)/MainPages/question_patterns/QuestionPatterns'),
  '/performance': () => import('./(components)/MainPages/performence/Perfomence'),
  '/question-center': () => import('./(components)/MainPages/Question_Master/ExamCategorySelection'),
  '/notebook': () => import('./(components)/MainPages/mistake_notebook/MistakeNotebook'),
  '/settings': () => import('./(components)/Settings'),
  '/navigate': () => import('./navigation/NavigationHub'),
  '/available-courses': () => import('./(components)/AvailableCourses'),
  '/search': () => import('./(components)/MainPages/search/SearchPage'),
};

const prefetchedRoutes = new Set<string>();

/**
 * Prefetch a single route's JS chunk.
 * Safe to call multiple times — deduplicates automatically.
 */
export function prefetchRoute(path: string): void {
  // Normalize path: strip trailing slash, match prefix
  const key = Object.keys(routeImportMap).find(
    (k) => path === k || path.startsWith(k + '/')
  );

  if (!key || prefetchedRoutes.has(key)) return;
  prefetchedRoutes.add(key);

  // Use requestIdleCallback so we don't block the main thread
  const load = () => {
    routeImportMap[key]().catch(() => {
      // Chunk failed to load (offline, etc.) — allow retry next time
      prefetchedRoutes.delete(key);
    });
  };

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(load, { timeout: 2000 });
  } else {
    setTimeout(load, 100);
  }
}

/**
 * Prefetch ALL primary routes after the app has settled.
 * Call this once after initial render (e.g., in a useEffect with a delay).
 */
export function prefetchAllRoutes(): void {
  Object.keys(routeImportMap).forEach((path) => {
    prefetchRoute(path);
  });
}
