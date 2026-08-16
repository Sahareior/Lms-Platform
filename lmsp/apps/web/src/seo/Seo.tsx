import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SeoConfig {
  title: string;
  description: string;
  /** Private pages (e.g. admin, onboarding) should not appear in search results. */
  noindex?: boolean;
}

const DEFAULT_CONFIG: SeoConfig = {
  title: 'Geneseon LMS – AI-Powered Exam Preparation & Mock Tests',
  description:
    'Geneseon LMS is an AI-powered learning platform for competitive exam preparation. Practice mock tests, quizzes, past questions, and get personalized AI performance reports.',
};

const ROUTE_CONFIG: Record<string, SeoConfig> = {
  '/landing': {
    title: 'Geneseon – AI-Powered Exam Preparation & Mock Tests',
    description:
      'Geneseon is an AI-powered learning platform for competitive exams. Practice mock tests, quizzes, and past questions, and get personalized AI performance reports to master your dream exam.',
  },
  '/': {
    title: 'Geneseon LMS – AI-Powered Exam Preparation & Mock Tests',
    description:
      'Practice mock tests, quizzes, and past questions with AI-powered performance analysis. Master your dream exam today.',
  },
  '/login': {
    title: 'Login – Geneseon LMS',
    description:
      'Log in to Geneseon LMS to continue your exam preparation with mock tests, quizzes, and AI performance reports.',
  },
  '/register': {
    title: 'Sign Up – Geneseon LMS',
    description:
      'Create a free Geneseon LMS account and start preparing for competitive exams with mock tests, quizzes, and AI-powered insights.',
  },
  '/forgot-password': {
    title: 'Forgot Password – Geneseon LMS',
    description:
      'Reset your Geneseon LMS password. Enter your email and we will send you a secure reset link.',
  },
  '/reset-password': {
    title: 'Reset Password – Geneseon LMS',
    description: 'Set a new password for your Geneseon LMS account.',
  },
  '/onboarding': {
    title: 'Get Started – Geneseon LMS',
    description: 'Pick your exams and start preparing with Geneseon LMS.',
    noindex: true,
  },
  '/admin': {
    title: 'Admin – Geneseon LMS',
    description: 'Geneseon LMS admin panel.',
    noindex: true,
  },
};

function setMeta(name: string, content: string, isProperty = false) {
  const attr = isProperty ? 'property' : 'name';
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(url: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', url);
}

/**
 * Adds or removes a single JSON-LD structured-data block (keyed by `id`).
 * Pass `null` to remove an existing block. Used to enrich the marketing
 * landing page with Organization / WebSite schema.
 */
function setJsonLd(id: string, data: Record<string, unknown> | null) {
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  if (!data) return;
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = id;
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

/**
 * Renders nothing, but keeps the document <head> in sync with the current
 * route: <title>, meta description, robots directive, canonical URL and the
 * Open Graph / Twitter equivalents. Mounted once at the router root layout.
 */
export default function Seo() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Exact match wins; otherwise fall back to the longest matching prefix
    // so nested routes like /admin/users inherit a sensible config.
    const config =
      ROUTE_CONFIG[pathname] ??
      Object.entries(ROUTE_CONFIG)
        .filter(([route]) => route !== '/' && pathname.startsWith(route))
        .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ??
      DEFAULT_CONFIG;

    document.title = config.title;
    setMeta('description', config.description);
    setMeta('robots', config.noindex ? 'noindex, nofollow' : 'index, follow');

    // Canonical + social URLs adapt to whatever domain the app is served from.
    const url = `${window.location.origin}${pathname}`;
    setCanonical(url);
    setMeta('og:url', url, true);
    setMeta('og:title', config.title, true);
    setMeta('og:description', config.description, true);
    setMeta('twitter:title', config.title);
    setMeta('twitter:description', config.description);

    // Structured data: Organization schema (with logo + social profiles) on
    // the marketing landing page. Removed on every other route.
    setJsonLd(
      'landing-organization',
      pathname === '/landing'
        ? {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Geneseon',
            url: url,
            logo: `${window.location.origin}/logo1.png`,
            description:
              'AI-powered learning platform for competitive exam preparation with mock tests, quizzes, and personalized AI performance reports.',
            sameAs: [],
          }
        : null
    );
  }, [pathname]);

  return null;
}
