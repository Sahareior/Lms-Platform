import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    BookOpen,
    Bookmark,
    ChevronRight,
    RotateCcw,
    LayoutGrid,
    Zap,
    HelpCircle,
    GraduationCap,
    ArrowUp,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { message } from 'antd';
import {
    useGetCreativeQuestionSetsQuery,
    useCQSetQuestions,
    type CQQuestionSetSummary,
} from '@my-monorepo/store';
import type { CreativeQuestion, FontSize, SourceCategory, StudyMode } from './tools/types';
import {
    toBengaliNumber,
    getSourceCategory,
    getChapters,
    EDUCATION_BOARDS,
    YEARS,
} from './tools/bengaliUtils';
import CQQuestionCard from './_component/CQQuestionCard';
import QuestionDrawer from './_component/QuestionDrawer';
import { useTheme } from '../../../../theme/ThemeContext';

// Offline fallback: the original static test paper, used only when the API is
// unreachable. Lazily imported so ~1 MB of JSON stays out of the main bundle.
let fallbackQuestions: CreativeQuestion[] | null = null;
const loadFallbackQuestions = async (): Promise<CreativeQuestion[]> => {
    if (fallbackQuestions) return fallbackQuestions;
    const mod = await import('./testPaper.json');
    fallbackQuestions = (mod.default ?? mod) as unknown as CreativeQuestion[];
    return fallbackQuestions;
};

/** Questions rendered per page (client-side pagination). */
const PAGE_SIZE = 50;
const PREFS_KEY = 'lms_cq_prefs';

/** Reading preferences (font size + study mode) persisted across visits. */
interface ReadingPrefs {
    fontSize: FontSize;
    studyMode: StudyMode;
}

const loadPrefs = (): ReadingPrefs => {
    try {
        const saved = localStorage.getItem(PREFS_KEY);
        if (saved) {
            const parsed = JSON.parse(saved) as Partial<ReadingPrefs>;
            return {
                fontSize:
                    parsed.fontSize === 'sm' || parsed.fontSize === 'lg'
                        ? parsed.fontSize
                        : 'base',
                studyMode: parsed.studyMode === 'practice' ? 'practice' : 'read',
            };
        }
    } catch {
        /* ignore corrupted prefs */
    }
    return { fontSize: 'base', studyMode: 'read' };
};

/* ── Small presentational helpers ─────────────────────────────────────── */

const StatChip: React.FC<{
    label: string;
    value: number;
    isDark: boolean;
    accent?: boolean;
}> = ({ label, value, isDark, accent }) => (
    <span
        className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${isDark
            ? 'bg-[#1C1F26] border-[#23262D] text-[#A1A8B3]'
            : 'bg-white border-[#1a1a1a] text-[#333]'
            }`}
    >
        {label}:{' '}
        <strong
            className={
                accent
                    ? 'text-[#2F80ED]'
                    : isDark
                        ? 'text-[#F5F7FA]'
                        : 'text-[#1a1a1a]'
            }
        >
            {toBengaliNumber(value)}
        </strong>
    </span>
);

const ReadingPage: React.FC = () => {
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    /* ── Data: question sets from the API (offline JSON fallback) ──
       ?set=<setId> selects a set; without it the newest set is used. */
    const {
        data: questionSets,
        isLoading: setsLoading,
    } = useGetCreativeQuestionSetsQuery(undefined);

    const selectedSetId = searchParams.get('set') || '';

    const activeSet: CQQuestionSetSummary | undefined = useMemo(() => {
        const sets = questionSets ?? [];
        if (sets.length === 0) return undefined;
        return sets.find((s) => s._id === selectedSetId) ?? sets[0];
    }, [questionSets, selectedSetId]);

    // Paged fetch: first 100 questions render immediately, remaining pages
    // load in the background and merge in server order.
    const {
        data: activeSetData,
        questions: setQuestions,
        isLoading: setLoading,
        isError: setLoadError,
    } = useCQSetQuestions(activeSet?._id);

    const usingFallback = !setsLoading && !setLoading && (!activeSetData || setLoadError);

    /* Offline fallback is fetched on demand (keeps it out of the main bundle). */
    const [fallbackQuestions, setFallbackQuestions] = useState<CreativeQuestion[]>([]);
    useEffect(() => {
        if (!usingFallback) return;
        let cancelled = false;
        loadFallbackQuestions()
            .then((qs) => {
                if (!cancelled) setFallbackQuestions(qs);
            })
            .catch(() => {
                if (!cancelled) setFallbackQuestions([]);
            });
        return () => {
            cancelled = true;
        };
    }, [usingFallback]);

    const rawQuestions = (
        setQuestions.length > 0 ? setQuestions : fallbackQuestions
    ) as unknown as CreativeQuestion[];
    const questionsReady = !setsLoading && !setLoading && rawQuestions.length > 0;
    /* Authoritative total from the server (accurate even before all pages land). */
    const serverTotal = activeSetData?.totalQuestions ?? 0;

    const handleSelectSet = useCallback(
        (setId: string) => {
            setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set('set', setId);
                return next;
            }, { replace: true });
        },
        [setSearchParams]
    );

    /* ── Filters ── */
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSourceCategory, setSelectedSourceCategory] =
        useState<SourceCategory>('all');
    const [selectedBoard, setSelectedBoard] = useState('সকল বোর্ড');
    const [selectedYear, setSelectedYear] = useState('সকল সাল');
    const [selectedChapter, setSelectedChapter] = useState<string>('all');
    const [showOnlyBookmarked, setShowOnlyBookmarked] = useState(false);

    /* ── Reading prefs (persisted) ── */
    const initialPrefs = useMemo(loadPrefs, []);
    const [studyMode, setStudyMode] = useState<StudyMode>(initialPrefs.studyMode);
    const [fontSize, setFontSize] = useState<FontSize>(initialPrefs.fontSize);

    /* ── UI state ── */
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [showScrollTop, setShowScrollTop] = useState(false);

    /* ── Persisted progress (bookmarks + read) ── */
    const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
        try {
            const saved = localStorage.getItem('lms_cq_bookmarks');
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch {
            return new Set();
        }
    });

    const [readIds, setReadIds] = useState<Set<string>>(() => {
        try {
            const saved = localStorage.getItem('lms_cq_read_ids');
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch {
            return new Set();
        }
    });

    /* ── Persist reading preferences ── */
    useEffect(() => {
        try {
            localStorage.setItem(
                PREFS_KEY,
                JSON.stringify({ fontSize, studyMode })
            );
        } catch {
            /* storage unavailable */
        }
    }, [fontSize, studyMode]);    /* ── Back-to-top visibility ── */
    useEffect(() => {
        const onScroll = () => setShowScrollTop(window.scrollY > 800);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    /* ── Jump back to the top when the page changes ── */
    const handlePageChange = useCallback((next: number) => {
        setPage(next);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const toggleBookmark = useCallback((id: string) => {
        setBookmarkedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
                message.info('বুকমার্ক থেকে সরানো হয়েছে');
            } else {
                next.add(id);
                message.success('বুকমার্কে যুক্ত করা হয়েছে');
            }
            try {
                localStorage.setItem('lms_cq_bookmarks', JSON.stringify([...next]));
            } catch (err) {
                console.error(err);
            }
            return next;
        });
    }, []);

    const toggleRead = useCallback((id: string) => {
        setReadIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
                message.success('পড়া হিসেবে চিহ্নিত করা হয়েছে');
            }
            try {
                localStorage.setItem('lms_cq_read_ids', JSON.stringify([...next]));
            } catch (err) {
                console.error(err);
            }
            return next;
        });
    }, []);

    /* ── Filtering ── */
    const filteredQuestions = useMemo(() => {
        return rawQuestions.filter((q) => {
            if (showOnlyBookmarked && !bookmarkedIds.has(q.id)) return false;

            if (selectedSourceCategory !== 'all') {
                if (getSourceCategory(q) !== selectedSourceCategory) return false;
            }

            if (selectedBoard !== 'সকল বোর্ড') {
                const board = (q.source?.board || '').toLowerCase();
                const raw = (q.source?.raw || '').toLowerCase();
                const target = selectedBoard.toLowerCase();
                if (!board.includes(target) && !raw.includes(target)) return false;
            }

            if (selectedYear !== 'সকল সাল') {
                const year = q.source?.year || '';
                const raw = q.source?.raw || '';
                if (!year.includes(selectedYear) && !raw.includes(selectedYear))
                    return false;
            }

            if (selectedChapter !== 'all') {
                const qChapterId = q.chapterId || String(q.chapterNumber ?? '');
                if (qChapterId !== selectedChapter) return false;
            }

            if (searchQuery.trim()) {
                const term = searchQuery.toLowerCase().trim();
                const stimulusMatch = q.stimulus?.toLowerCase().includes(term);
                const boardMatch = q.source?.board?.toLowerCase().includes(term);
                const rawMatch = q.source?.raw?.toLowerCase().includes(term);
                const partsMatch = (q.parts || []).some(
                    (p) =>
                        p.text?.toLowerCase().includes(term) ||
                        p.answer?.toLowerCase().includes(term)
                );
                const notesMatch = q.answerNotes?.toLowerCase().includes(term);
                if (!stimulusMatch && !boardMatch && !rawMatch && !partsMatch && !notesMatch)
                    return false;
            }

            return true;
        });
    }, [
        rawQuestions,
        showOnlyBookmarked,
        bookmarkedIds,
        selectedSourceCategory,
        selectedBoard,
        selectedYear,
        searchQuery,
    ]);

    useEffect(() => {
        setPage(1);
    }, [
        searchQuery,
        selectedSourceCategory,
        selectedBoard,
        selectedYear,
        selectedChapter,
        showOnlyBookmarked,
    ]);

    /* ── Client-side pagination: 100 questions per page ── */
    const pageCount = Math.max(1, Math.ceil(filteredQuestions.length / PAGE_SIZE));
    const safePage = Math.min(page, pageCount);
    const displayedQuestions = useMemo(
        () =>
            filteredQuestions.slice(
                (safePage - 1) * PAGE_SIZE,
                safePage * PAGE_SIZE
            ),
        [filteredQuestions, safePage]
    );

    /* ── Reset filters ── */
    const handleResetFilters = useCallback(() => {
        setSearchQuery('');
        setSelectedSourceCategory('all');
        setSelectedBoard('সকল বোর্ড');
        setSelectedYear('সকল সাল');
        setSelectedChapter('all');
        setShowOnlyBookmarked(false);
    }, []);

    /* ── Navigate to a question from the drawer ──
       If the question is hidden by active filters, clear them first so the
       navigator always lands on the selected question. */
    const scrollToQuestion = useCallback(
        (id: string) => {
            const scrollNow = () => {
                document
                    .getElementById(`cq-${id}`)
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            };

            if (document.getElementById(`cq-${id}`)) {
                scrollNow();
                return;
            }

            const idx = filteredQuestions.findIndex((q) => q.id === id);
            if (idx >= 0) {
                setPage(Math.floor(idx / PAGE_SIZE) + 1);
                setTimeout(scrollNow, 150);
            } else {
                handleResetFilters();
                const rawIdx = rawQuestions.findIndex((q) => q.id === id);
                setPage(Math.floor(rawIdx / PAGE_SIZE) + 1);
                setTimeout(scrollNow, 200);
            }
        },
        [rawQuestions, filteredQuestions, handleResetFilters]
    );

    /* ── Stats ── */
    const totalQuestions = serverTotal > 0 ? serverTotal : rawQuestions.length;

    const { countBoard, countCollege, countCadet } = useMemo(() => {
        let b = 0;
        let c = 0;
        let d = 0;
        for (const q of rawQuestions) {
            const cat = getSourceCategory(q);
            if (cat === 'board') b += 1;
            else if (cat === 'college') c += 1;
            else d += 1;
        }
        return { countBoard: b, countCollege: c, countCadet: d };
    }, [rawQuestions]);

    const hasActiveFilters =
        !!searchQuery ||
        selectedSourceCategory !== 'all' ||
        selectedBoard !== 'সকল বোর্ড' ||
        selectedYear !== 'সকল সাল' ||
        selectedChapter !== 'all' ||
        showOnlyBookmarked;

    /* Chapters derived from the active question set */
    const chapters = useMemo(() => getChapters(rawQuestions), [rawQuestions]);

    const sourceTabs = [
        { id: 'all' as const, label: 'সকল', count: totalQuestions },
        { id: 'board' as const, label: 'বোর্ড', count: countBoard },
        { id: 'college' as const, label: 'কলেজ', count: countCollege },
        { id: 'cadet' as const, label: 'ক্যাডেট', count: countCadet },
    ];

    /* ── Data status banner ── */
    const dataStatus = !questionsReady ? (
        setsLoading || setLoading ? (
            <div
                className={`p-10 text-center rounded-xl border mb-4 ${isDark
                    ? 'bg-[#111318] border-[#23262D] text-[#A1A8B3]'
                    : 'bg-white border-2 border-[#1a1a1a] text-gray-600'
                    }`}
            >
                <div className="inline-block w-6 h-6 border-2 border-[#2F80ED] border-t-transparent rounded-full animate-spin mb-2" />
                <p className="text-xs font-semibold">প্রশ্ন লোড হচ্ছে…</p>
            </div>
        ) : (
            <div
                className={`p-6 text-center rounded-xl border mb-4 ${isDark
                    ? 'bg-[#111318] border-[#23262D]'
                    : 'bg-white border-2 border-[#1a1a1a]'
                    }`}
            >
                <HelpCircle size={28} className="mx-auto text-gray-400 mb-2" />
                <h3 className="text-sm font-bold mb-1">
                    {usingFallback ? 'অফলাইন মোড: সংরক্ষিত টেস্ট পেপার দেখানো হচ্ছে' : 'কোনো প্রশ্ন সেট পাওয়া যায়নি'}
                </h3>
                <p className={`text-xs max-w-md mx-auto ${isDark ? 'text-[#A1A8B3]' : 'text-gray-600'}`}>
                    {usingFallback
                        ? 'সার্ভারে সংযোগ করা যায়নি — তাই ডিভাইসে সংরক্ষিত কপি দেখানো হচ্ছে। নতুন টেস্ট পেপার দেখতে পরে আবার চেষ্টা করুন।'
                        : 'এখনো কোনো টেস্ট পেপার আপলোড করা হয়নি। অ্যাডমিন প্যানেল থেকে JSON ফাইল আপলোড করুন।'}
                </p>
            </div>
        )
    ) : null;

    return (
        <div
            className={`min-h-screen pb-16 transition-colors ${isDark ? 'bg-[#0B0D12] text-[#F5F7FA]' : 'bg-[#e8e4db] text-[#1a1a1a]'
                }`}
            style={{
                fontFamily: "'Hind Siliguri', 'Inter', sans-serif",
                backgroundImage: isDark
                    ? undefined
                    : 'radial-gradient(#d8d4cb 1px, transparent 1px)',
                backgroundSize: isDark ? undefined : '16px 16px',
            }}
        >
            <div className="max-w-8xl mx-auto px-2  pt-3 md:pt-4">
                {/* ── Breadcrumb ─────────────────────────────────────── */}
                <div className="flex items-center gap-1.5 text-[11px] mb-2 font-medium">
                    <button
                        type="button"
                        onClick={() => navigate('/study-section')}
                        className={`transition-colors hover:underline ${isDark
                            ? 'text-[#A1A8B3] hover:text-white'
                            : 'text-[#555] hover:text-black'
                            }`}
                    >
                        Study Section
                    </button>
                    <ChevronRight size={11} className="text-gray-400" />
                    <span className="text-[#2F80ED] font-bold">
                        টেস্ট পেপার রিডিং (CQ)
                    </span>
                </div>

                {dataStatus}

                {/* ── Set picker (when multiple sets exist) ───────────── */}
                {(questionSets?.length ?? 0) > 1 && (
                    <div className="flex items-center gap-2 mb-3">
                        <label
                            className={`text-[11px] font-bold shrink-0 ${isDark ? 'text-[#A1A8B3]' : 'text-[#555]'}`}
                            htmlFor="cq-set-picker"
                        >
                            টেস্ট পেপার:
                        </label>
                        <select
                            id="cq-set-picker"
                            value={activeSet?._id ?? ''}
                            onChange={(e) => handleSelectSet(e.target.value)}
                            className={`flex-1 max-w-md px-2.5 py-1.5 text-xs font-semibold rounded-lg border outline-none cursor-pointer ${isDark
                                ? 'bg-[#161920] border-[#23262D] text-[#F5F7FA]'
                                : 'bg-white border-[#1a1a1a] text-[#1a1a1a]'
                                }`}
                        >
                            {(questionSets ?? []).map((s) => {
                                const examName =
                                    typeof s.exam === 'object' && s.exam ? s.exam.name : '';
                                const versionName =
                                    typeof s.examVersion === 'object' && s.examVersion
                                        ? s.examVersion.examVersion
                                        : '';
                                const subjectName =
                                    typeof s.subject === 'object' && s.subject
                                        ? s.subject.name
                                        : '';
                                const label =
                                    s.title ||
                                    [examName, versionName, subjectName].filter(Boolean).join(' — ') ||
                                    s._id;
                                return (
                                    <option key={s._id} value={s._id}>
                                        {label} ({toBengaliNumber(s.questionCount)}টি প্রশ্ন)
                                    </option>
                               );
                            })}
                        </select>
                    </div>
                )}

                {/* ── Slim Study Header ──────────────────────────────── */}
                <div
                    className={`rounded-xl p-3.5 md:p-4 mb-3 border flex flex-col lg:flex-row lg:items-center gap-3 transition-all ${isDark
                        ? 'bg-[#111318] border-[#23262D]'
                        : 'bg-[#f2efe9] border-2 border-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a]'
                        }`}
                >
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-[#2F80ED]/30 bg-[#2F80ED]/10 text-[#2F80ED]">
                                <GraduationCap size={12} />
                                সৃজনশীল প্রশ্নব্যাংক
                            </span>
                            <h1 className="text-base md:text-lg font-black tracking-tight leading-tight">
                                তথ্য ও যোগাযোগ প্রযুক্তি (ICT) টেস্ট পেপার
                            </h1>
                        </div>
                        <p
                            className={`text-[11px] md:text-xs leading-relaxed ${isDark ? 'text-[#A1A8B3]' : 'text-[#444]'
                                }`}
                        >
                            বিগত বছরের সকল বোর্ড ও শীর্ষ কলেজ-ক্যাডেট কলেজের প্রশ্নসহ
                            পূর্ণাঙ্গ সমাধান। অধ্যায়, বোর্ড ও সাল অনুযায়ী ফিল্টার করে পড়ুন।
                        </p>

                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <StatChip label="মোট" value={totalQuestions} isDark={isDark} accent />
                            <StatChip label="বোর্ড" value={countBoard} isDark={isDark} />
                            <StatChip label="কলেজ" value={countCollege} isDark={isDark} />
                            <StatChip label="ক্যাডেট" value={countCadet} isDark={isDark} />
                            <StatChip label="বুকমার্ক" value={bookmarkedIds.size} isDark={isDark} />
                        </div>
                    </div>


                </div>

                {/* ── Sticky Study Toolbar (search + filters + tools) ── */}
                <div
                    className={`sticky -top-1.2 z-30 mb-3 p-2.5 rounded-xl border backdrop-blur-md transition-all ${isDark
                        ? 'bg-[#111318]/95 border-[#23262D] shadow-md shadow-black/40'
                        : 'bg-[#f4efe6]/95 border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]'
                        }`}
                >
                    {/* Row 1 — Search + Mode + Utilities */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Search */}


                        {/* Study mode: read / practice */}
                        <div
                            className={`flex items-center rounded-lg p-0.5 border ${isDark
                                ? 'bg-[#161920] border-[#23262D]'
                                : 'bg-white border-[#1a1a1a]'
                                }`}
                            role="group"
                            aria-label="স্টাডি মোড"
                        >
                            <button
                                type="button"
                                onClick={() => setStudyMode('read')}
                                aria-pressed={studyMode === 'read'}
                                title="উত্তরসহ পড়ুন"
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${studyMode === 'read'
                                    ? isDark
                                        ? 'bg-[#2F80ED] text-white'
                                        : 'bg-[#1a1a1a] text-white'
                                    : isDark
                                        ? 'text-[#A1A8B3] hover:text-white'
                                        : 'text-gray-600 hover:text-black'
                                    }`}
                            >
                                <BookOpen size={12} />
                                পড়ার মোড
                            </button>
                            <button
                                type="button"
                                onClick={() => setStudyMode('practice')}
                                aria-pressed={studyMode === 'practice'}
                                title="উত্তর লুকিয়ে নিজে অনুশীলন করুন"
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${studyMode === 'practice'
                                    ? isDark
                                        ? 'bg-amber-500 text-black'
                                        : 'bg-amber-400 text-black'
                                    : isDark
                                        ? 'text-[#A1A8B3] hover:text-white'
                                        : 'text-gray-600 hover:text-black'
                                    }`}
                            >
                                <Zap size={12} />
                                অনুশীলন
                            </button>
                        </div>

                        {/* Font size */}
                        <div
                            className={`flex items-center rounded-lg p-0.5 border ${isDark
                                ? 'bg-[#161920] border-[#23262D]'
                                : 'bg-white border-[#1a1a1a]'
                                }`}
                            role="group"
                            aria-label="ফন্ট সাইজ"
                        >
                            {(
                                [
                                    { id: 'sm' as const, label: 'A-', title: 'ছোট ফন্ট' },
                                    { id: 'base' as const, label: 'A', title: 'স্বাভাবিক ফন্ট' },
                                    { id: 'lg' as const, label: 'A+', title: 'বড় ফন্ট' },
                                ] as const
                            ).map((f) => (
                                <button
                                    key={f.id}
                                    type="button"
                                    onClick={() => setFontSize(f.id)}
                                    title={f.title}
                                    aria-pressed={fontSize === f.id}
                                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${fontSize === f.id
                                        ? isDark
                                            ? 'bg-[#2F80ED] text-white'
                                            : 'bg-[#1a1a1a] text-white'
                                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        {/* Bookmarks toggle */}
                        <button
                            type="button"
                            onClick={() => setShowOnlyBookmarked(!showOnlyBookmarked)}
                            aria-pressed={showOnlyBookmarked}
                            title="শুধু বুকমার্ক করা প্রশ্ন দেখুন"
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all border ${showOnlyBookmarked
                                ? 'bg-amber-500/20 text-amber-500 border-amber-500/40'
                                : isDark
                                    ? 'bg-[#161920] border-[#23262D] text-[#A1A8B3] hover:text-[#F5F7FA]'
                                    : 'bg-white border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#e0dcd5]'
                                }`}
                        >
                            <Bookmark
                                size={11}
                                className={showOnlyBookmarked ? 'fill-amber-500' : ''}
                            />
                            <span className="hidden sm:inline">বুকমার্ক</span>
                            <span>({toBengaliNumber(bookmarkedIds.size)})</span>
                        </button>

                        {/* Navigator */}
                        <button
                            type="button"
                            onClick={() => setIsDrawerOpen(true)}
                            title="সব প্রশ্নের তালিকা থেকে যেকোনো প্রশ্নে যান"
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${isDark
                                ? 'bg-[#2F80ED]/20 text-[#2F80ED] border border-[#2F80ED]/40 hover:bg-[#2F80ED]/30'
                                : 'bg-[#1a1a1a] text-white border border-[#1a1a1a] hover:bg-black'
                                }`}
                        >
                            <LayoutGrid size={11} />
                            নেভিগেটর
                        </button>
                    </div>

                    {/* Row 2 — Source tabs + Board/Year + Part chips + Reset */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-inherit">
                        <div
                            className={`flex flex-wrap items-center gap-0.5 p-0.5 rounded-lg ${isDark ? 'bg-[#161920]' : 'bg-black/5'
                                }`}
                            role="tablist"
                            aria-label="উৎস অনুযায়ী ফিল্টার"
                        >
                            {sourceTabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={selectedSourceCategory === tab.id}
                                    onClick={() => setSelectedSourceCategory(tab.id)}
                                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${selectedSourceCategory === tab.id
                                        ? isDark
                                            ? 'bg-[#2F80ED] text-white'
                                            : 'bg-[#1a1a1a] text-white'
                                        : isDark
                                            ? 'text-[#A1A8B3] hover:text-[#F5F7FA]'
                                            : 'text-gray-700 hover:text-black'
                                        }`}
                                >
                                    {tab.label} ({toBengaliNumber(tab.count)})
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                            {/* Chapter filter */}
                            <select
                                value={selectedChapter}
                                onChange={(e) => setSelectedChapter(e.target.value)}
                                aria-label="অধ্যায় নির্বাচন"
                                title="অধ্যায় অনুযায়ী প্রশ্ন ফিল্টার করুন"
                                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border outline-none cursor-pointer ${isDark
                                    ? 'bg-[#161920] border-[#23262D] text-[#F5F7FA]'
                                    : 'bg-white border-[#1a1a1a] text-[#1a1a1a]'
                                    }`}
                            >
                                <option value="all">অধ্যায়: সকল</option>
                                {chapters.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        অধ্যায় {toBengaliNumber(c.number)}: {c.name} ({toBengaliNumber(c.count)})
                                    </option>
                                ))}
                            </select>

                            <select
                                value={selectedBoard}
                                onChange={(e) => setSelectedBoard(e.target.value)}
                                aria-label="বোর্ড নির্বাচন"
                                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border outline-none cursor-pointer ${isDark
                                    ? 'bg-[#161920] border-[#23262D] text-[#F5F7FA]'
                                    : 'bg-white border-[#1a1a1a] text-[#1a1a1a]'
                                    }`}
                            >
                                {EDUCATION_BOARDS.map((b) => (
                                    <option key={b} value={b}>
                                        {b}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                aria-label="সাল নির্বাচন"
                                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border outline-none cursor-pointer ${isDark
                                    ? 'bg-[#161920] border-[#23262D] text-[#F5F7FA]'
                                    : 'bg-white border-[#1a1a1a] text-[#1a1a1a]'
                                    }`}
                            >
                                {YEARS.map((y) => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                ))}
                            </select>

                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    title="সব ফিল্টার রিসেট করুন"
                                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${isDark
                                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25'
                                        : 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
                                        }`}
                                >
                                    <RotateCcw size={10} />
                                    রিসেট
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Result summary ─────────────────────────────────── */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-0.5">
                    <p
                        className={`text-[11px] md:text-xs font-semibold ${isDark ? 'text-[#A1A8B3]' : 'text-gray-700'
                            }`}
                    >
                        পৃষ্ঠা {toBengaliNumber(safePage)}/{toBengaliNumber(pageCount)} — দেখাচ্ছে{' '}
                        <span className="text-[#2F80ED] font-bold">
                            {toBengaliNumber(displayedQuestions.length)}
                        </span>{' '}
                        / {toBengaliNumber(filteredQuestions.length)} (মোট{' '}
                        {toBengaliNumber(totalQuestions)}) টি প্রশ্ন
                        {searchQuery.trim() && (
                            <span className="ml-1 text-[10px]">
                                — অনুসন্ধান: &ldquo;{searchQuery}&rdquo;
                            </span>
                        )}
                    </p>

                    {studyMode === 'practice' && (
                        <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${isDark
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/40'
                                : 'bg-amber-100 text-amber-800 border-amber-400'
                                }`}
                        >
                            <Zap size={10} />
                            অনুশীলন মোড: উত্তর লুকানো — নিজে ভেবে &ldquo;দেখুন&rdquo; চাপুন
                        </span>
                    )}
                </div>

                {/* ── Question list ──────────────────────────────────── */}
                {filteredQuestions.length === 0 ? (
                    <div
                        className={`p-10 text-center rounded-xl border ${isDark
                            ? 'bg-[#111318] border-[#23262D]'
                            : 'bg-white border-2 border-[#1a1a1a]'
                            }`}
                    >
                        <HelpCircle size={36} className="mx-auto text-gray-400 mb-2" />
                        <h3 className="text-sm md:text-base font-bold mb-1">
                            কোনো প্রশ্ন পাওয়া যায়নি
                        </h3>
                        <p
                            className={`text-xs max-w-sm mx-auto mb-3 ${isDark ? 'text-[#A1A8B3]' : 'text-gray-600'
                                }`}
                        >
                            {showOnlyBookmarked && bookmarkedIds.size === 0
                                ? 'এখনো কোনো বুকমার্ক করা প্রশ্ন নেই। প্রশ্নের বুকমার্ক আইকনে ক্লিক করে সেভ করুন।'
                                : 'আপনার ফিল্টার বা অনুসন্ধানের সাথে মিল রেখে কোনো প্রশ্ন পাওয়া যায়নি।'}
                        </p>
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="px-4 py-1.5 bg-[#2F80ED] text-white text-xs font-bold rounded-lg hover:bg-[#2563eb] transition-colors"
                        >
                            সকল প্রশ্ন দেখুন
                        </button>
                    </div>
                ) : (
                    <div className="md:space-y-24 space-y-16">
                        {displayedQuestions.map((question, index) => (
                            <CQQuestionCard
                                key={question.id}
                                question={question}
                                index={index}
                                studyMode={studyMode}
                                fontSize={fontSize}
                                isBookmarked={bookmarkedIds.has(question.id)}
                                isRead={readIds.has(question.id)}
                                onToggleBookmark={toggleBookmark}
                                onToggleRead={toggleRead}
                            />
                        ))}

                        {/* ── Pagination: 100 questions per page ── */}
                        {pageCount > 1 && (
                            <div className="flex items-center justify-center gap-2 pt-4 pb-2">
                                <button
                                    type="button"
                                    disabled={safePage <= 1}
                                    onClick={() => handlePageChange(Math.max(1, safePage - 1))}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${isDark
                                        ? 'bg-[#161920] border border-[#23262D] text-[#F5F7FA] hover:bg-[#1A1E27]'
                                        : 'bg-[#1a1a1a] text-white hover:bg-black'
                                        }`}
                                >
                                    ‹ পূর্ববর্তী
                                </button>
                                <span
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${isDark
                                        ? 'bg-[#2F80ED]/15 text-[#2F80ED] border border-[#2F80ED]/30'
                                        : 'bg-white border-2 border-[#1a1a1a]'
                                        }`}
                                >
                                    {toBengaliNumber(safePage)} / {toBengaliNumber(pageCount)}
                                </span>
                                <button
                                    type="button"
                                    disabled={safePage >= pageCount}
                                    onClick={() => handlePageChange(Math.min(pageCount, safePage + 1))}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${isDark
                                        ? 'bg-[#161920] border border-[#23262D] text-[#F5F7FA] hover:bg-[#1A1E27]'
                                        : 'bg-[#1a1a1a] text-white hover:bg-black'
                                        }`}
                                >
                                    পরবর্তী ›
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Back to top ────────────────────────────────────────── */}
            {showScrollTop && (
                <button
                    type="button"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    aria-label="পৃষ্ঠার শুরুতে যান"
                    title="উপরে যান"
                    className={`fixed bottom-5 right-5 z-40 p-2.5 rounded-full transition-all ${isDark
                        ? 'bg-[#161920] border border-[#2F80ED]/50 text-[#2F80ED] shadow-lg shadow-black/40 hover:bg-[#1A1E27]'
                        : 'bg-[#1a1a1a] text-white border-2 border-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a] hover:bg-black'
                        }`}
                >
                    <ArrowUp size={16} />
                </button>
            )}

            {/* ── Question Navigator Drawer ──────────────────────────── */}
            <QuestionDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                questions={rawQuestions}
                bookmarkedIds={bookmarkedIds}
                readIds={readIds}
                onSelectQuestion={scrollToQuestion}
            />
        </div>
    );
};

export default ReadingPage;
