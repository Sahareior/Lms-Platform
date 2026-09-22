import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    BookOpen,
    Search,
    Bookmark,
    CheckCircle,
    ChevronRight,
    RotateCcw,
    LayoutGrid,
    Zap,
    HelpCircle,
    GraduationCap,
    X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import testPaperRaw from './testPaper.json';
import type { CreativeQuestion, FontSize, SourceCategory, StudyMode } from './tools/types';
import {
    toBengaliNumber,
    getSourceCategory,
    EDUCATION_BOARDS,
    YEARS,
} from './tools/bengaliUtils';
import CQQuestionCard from './_component/CQQuestionCard';
import QuestionDrawer from './_component/QuestionDrawer';
import { useTheme } from '../../../../theme/ThemeContext';

const rawQuestions = testPaperRaw as unknown as CreativeQuestion[];

const ReadingPage: React.FC = () => {
    const { isDark } = useTheme();
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSourceCategory, setSelectedSourceCategory] = useState<SourceCategory>('all');
    const [selectedBoard, setSelectedBoard] = useState('সকল বোর্ড');
    const [selectedYear, setSelectedYear] = useState('সকল সাল');
    const [studyMode, setStudyMode] = useState<StudyMode>('read');
    const [activeCognitiveFilter, setActiveCognitiveFilter] = useState<string>('all');
    const [fontSize, setFontSize] = useState<FontSize>('base');
    const [showOnlyBookmarked, setShowOnlyBookmarked] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [displayCount, setDisplayCount] = useState(12);

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

    const filteredQuestions = useMemo(() => {
        return rawQuestions.filter((q) => {
            if (showOnlyBookmarked && !bookmarkedIds.has(q.id)) return false;

            if (selectedSourceCategory !== 'all') {
                const cat = getSourceCategory(q);
                if (cat !== selectedSourceCategory) return false;
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
                if (!year.includes(selectedYear) && !raw.includes(selectedYear)) return false;
            }

            if (searchQuery.trim()) {
                const term = searchQuery.toLowerCase().trim();
                const stimulusMatch = q.stimulus?.toLowerCase().includes(term);
                const boardMatch = q.source?.board?.toLowerCase().includes(term);
                const rawMatch = q.source?.raw?.toLowerCase().includes(term);
                const partsMatch = (q.parts || []).some(
                    (p) => p.text?.toLowerCase().includes(term) || p.answer?.toLowerCase().includes(term)
                );
                const notesMatch = q.answerNotes?.toLowerCase().includes(term);
                if (!stimulusMatch && !boardMatch && !rawMatch && !partsMatch && !notesMatch) return false;
            }

            return true;
        });
    }, [
        showOnlyBookmarked,
        bookmarkedIds,
        selectedSourceCategory,
        selectedBoard,
        selectedYear,
        searchQuery,
    ]);

    useEffect(() => {
        setDisplayCount(12);
    }, [
        searchQuery,
        selectedSourceCategory,
        selectedBoard,
        selectedYear,
        studyMode,
        activeCognitiveFilter,
        showOnlyBookmarked,
    ]);

    const displayedQuestions = useMemo(
        () => filteredQuestions.slice(0, displayCount),
        [filteredQuestions, displayCount]
    );

    const scrollToQuestion = (id: string) => {
        const target = document.getElementById(`cq-${id}`);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            const idx = filteredQuestions.findIndex((q) => q.id === id);
            if (idx >= 0) {
                setDisplayCount(Math.max(displayCount, idx + 10));
                setTimeout(() => {
                    const el = document.getElementById(`cq-${id}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        }
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setSelectedSourceCategory('all');
        setSelectedBoard('সকল বোর্ড');
        setSelectedYear('সকল সাল');
        setActiveCognitiveFilter('all');
        setShowOnlyBookmarked(false);
    };

    const totalQuestions = rawQuestions.length;
    const readCount = readIds.size;
    const progressPercent = Math.min(100, Math.round((readCount / totalQuestions) * 100));

    const countBoard = useMemo(
        () => rawQuestions.filter((q) => getSourceCategory(q) === 'board').length,
        []
    );
    const countCollege = useMemo(
        () => rawQuestions.filter((q) => getSourceCategory(q) === 'college').length,
        []
    );
    const countCadet = useMemo(
        () => rawQuestions.filter((q) => getSourceCategory(q) === 'cadet').length,
        []
    );

    const hasActiveFilters =
        !!searchQuery ||
        selectedSourceCategory !== 'all' ||
        selectedBoard !== 'সকল বোর্ড' ||
        selectedYear !== 'সকল সাল' ||
        activeCognitiveFilter !== 'all' ||
        showOnlyBookmarked;

    return (
        <div
            className={`min-h-screen pb-12 transition-colors ${isDark ? 'bg-[#0B0D12] text-[#F5F7FA]' : 'bg-[#e8e4db] text-[#1a1a1a]'
                }`}
            style={{
                fontFamily: "'Hind Siliguri', 'Inter', sans-serif",
                backgroundImage: isDark
                    ? undefined
                    : 'radial-gradient(#d8d4cb 1px, transparent 1px)',
                backgroundSize: isDark ? undefined : '16px 16px',
            }}
        >
            <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 pt-3 md:pt-4">
                {/* ── Breadcrumb ────────────────────────────────────────── */}
                <div className="flex items-center gap-1.5 text-[11px] mb-2 font-medium">
                    <button
                        type="button"
                        onClick={() => navigate('/study-section')}
                        className={`transition-colors hover:underline ${isDark ? 'text-[#A1A8B3] hover:text-white' : 'text-[#555] hover:text-black'
                            }`}
                    >
                        Study Section
                    </button>
                    <ChevronRight size={11} className="text-gray-400" />
                    <span className="text-[#2F80ED] font-bold">টেস্ট পেপার রিডিং (CQ)</span>
                </div>

                {/* ── Compact Hero Banner ───────────────────────────────── */}
                <div
                    className={`relative overflow-hidden rounded-xl p-4 md:p-5 mb-3 border transition-all ${isDark
                        ? 'bg-gradient-to-br from-[#161920] via-[#111318] to-[#0B0D12] border-[#23262D]'
                        : 'bg-[#f2efe9] border-2 border-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a]'
                        }`}
                >
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="max-w-2xl min-w-0">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 border border-[#2F80ED]/30 bg-[#2F80ED]/10 text-[#2F80ED]">
                                <GraduationCap size={12} />
                                <span>এইচএসসি ও এসএসসি সৃজনশীল প্রশ্নব্যাংক</span>
                            </div>
                            <h1 className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight mb-1.5 leading-tight">
                                তথ্য ও যোগাযোগ প্রযুক্তি (ICT) টেস্ট পেপার
                            </h1>
                            <p
                                className={`text-xs md:text-sm leading-relaxed ${isDark ? 'text-[#A1A8B3]' : 'text-[#444]'
                                    }`}
                            >
                                ১ম অধ্যায়: বিশ্ব ও বাংলাদেশ প্রেক্ষিত — বিগত বছরের ঢাকা, রাজশাহী, কুমিল্লাসহ সকল
                                বোর্ড এবং শীর্ষ কলেজ ও ক্যাডেট কলেজের ১০৫টি সৃজনশীল প্রশ্ন ও পূর্ণাঙ্গ সমাধান।
                            </p>

                            {/* Compact Stat Badges */}
                            <div className="flex flex-wrap items-center gap-1.5 mt-3 text-[11px] font-semibold">
                                <span
                                    className={`px-2 py-0.5 rounded-md border ${isDark
                                        ? 'bg-[#1C1F26] border-[#23262D] text-[#F5F7FA]'
                                        : 'bg-white border-[#1a1a1a]'
                                        }`}
                                >
                                    মোট: <strong className="text-[#2F80ED]">{toBengaliNumber(totalQuestions)}</strong>
                                </span>
                                <span
                                    className={`px-2 py-0.5 rounded-md border ${isDark
                                        ? 'bg-[#1C1F26] border-[#23262D] text-[#F5F7FA]'
                                        : 'bg-white border-[#1a1a1a]'
                                        }`}
                                >
                                    বোর্ড: <strong>{toBengaliNumber(countBoard)}</strong>
                                </span>
                                <span
                                    className={`px-2 py-0.5 rounded-md border ${isDark
                                        ? 'bg-[#1C1F26] border-[#23262D] text-[#F5F7FA]'
                                        : 'bg-white border-[#1a1a1a]'
                                        }`}
                                >
                                    কলেজ: <strong>{toBengaliNumber(countCollege)}</strong>
                                </span>
                                <span
                                    className={`px-2 py-0.5 rounded-md border ${isDark
                                        ? 'bg-[#1C1F26] border-[#23262D] text-[#F5F7FA]'
                                        : 'bg-white border-[#1a1a1a]'
                                        }`}
                                >
                                    ক্যাডেট: <strong>{toBengaliNumber(countCadet)}</strong>
                                </span>
                            </div>
                        </div>

                        {/* Compact Reading Progress Card */}
                        <div
                            className={`p-3 rounded-lg border shrink-0 w-full lg:w-64 ${isDark
                                ? 'bg-[#141720] border-[#23262D]'
                                : 'bg-white border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                                    <CheckCircle size={12} />
                                    পড়ার অগ্রগতি
                                </span>
                                <span className="text-xs font-black text-[#2F80ED]">
                                    {toBengaliNumber(progressPercent)}%
                                </span>
                            </div>
                            <div className="w-full h-2 bg-black/10 dark:bg-[#1F232D] rounded-full overflow-hidden mb-2">
                                <div
                                    className="h-full bg-gradient-to-r from-[#2F80ED] to-[#00E5B3] transition-all duration-500 rounded-full"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-[#A1A8B3]">
                                <span>পড়া: {toBengaliNumber(readCount)}</span>
                                <span>বাকি: {toBengaliNumber(Math.max(0, totalQuestions - readCount))}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Compact Sticky Study Mode Bar ──────────────────────── */}
                <div
                    className={`sticky top-1.5 z-30 mb-3 p-2 rounded-lg border backdrop-blur-md transition-all ${isDark
                        ? 'bg-[#111318]/95 border-[#23262D] shadow-md shadow-black/40'
                        : 'bg-[#f4efe6]/95 border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]'
                        }`}
                >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        {/* Mode Selectors */}
                        <div className="flex flex-wrap items-center gap-1">
                            <span
                                className={`text-[10px] font-bold mr-0.5 hidden sm:inline ${isDark ? 'text-[#A1A8B3]' : 'text-gray-700'
                                    }`}
                            >
                                মোড:
                            </span>

                            <button
                                type="button"
                                onClick={() => setStudyMode('read')}
                                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold transition-all ${studyMode === 'read'
                                    ? isDark
                                        ? 'bg-[#2F80ED] text-white'
                                        : 'bg-[#1a1a1a] text-white'
                                    : isDark
                                        ? 'bg-[#1C1F26] text-[#A1A8B3] hover:text-white'
                                        : 'bg-white text-[#1a1a1a] border border-[#1a1a1a] hover:bg-[#ded5c2]'
                                    }`}
                            >
                                <BookOpen size={12} />
                                <span>পড়ার মোড</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setStudyMode('practice')}
                                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold transition-all ${studyMode === 'practice'
                                    ? isDark
                                        ? 'bg-[#2F80ED] text-white'
                                        : 'bg-[#1a1a1a] text-white'
                                    : isDark
                                        ? 'bg-[#1C1F26] text-[#A1A8B3] hover:text-white'
                                        : 'bg-white text-[#1a1a1a] border border-[#1a1a1a] hover:bg-[#ded5c2]'
                                    }`}
                            >
                                <Zap size={12} className="text-amber-400" />
                                <span>অনুশীলন</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setStudyMode('k-special')}
                                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${studyMode === 'k-special'
                                    ? 'bg-blue-600 text-white'
                                    : isDark
                                        ? 'bg-[#1C1F26] text-[#A1A8B3] hover:text-white'
                                        : 'bg-white text-[#1a1a1a] border border-[#1a1a1a]'
                                    }`}
                            >
                                ক-স্পেশাল
                            </button>

                            <button
                                type="button"
                                onClick={() => setStudyMode('kh-special')}
                                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${studyMode === 'kh-special'
                                    ? 'bg-emerald-600 text-white'
                                    : isDark
                                        ? 'bg-[#1C1F26] text-[#A1A8B3] hover:text-white'
                                        : 'bg-white text-[#1a1a1a] border border-[#1a1a1a]'
                                    }`}
                            >
                                খ-স্পেশাল
                            </button>
                        </div>

                        {/* Utility Tools */}
                        <div className="flex items-center gap-1.5">
                            {/* Font Size */}
                            <div
                                className={`flex items-center rounded-md p-0.5 border ${isDark ? 'bg-[#161920] border-[#23262D]' : 'bg-white border-[#1a1a1a]'
                                    }`}
                            >
                                <button
                                    type="button"
                                    onClick={() => setFontSize('sm')}
                                    title="ছোট ফন্ট"
                                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${fontSize === 'sm'
                                        ? isDark
                                            ? 'bg-[#2F80ED] text-white'
                                            : 'bg-[#1a1a1a] text-white'
                                        : 'text-gray-400 hover:text-gray-200'
                                        }`}
                                >
                                    A-
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFontSize('base')}
                                    title="স্বাভাবিক ফন্ট"
                                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${fontSize === 'base'
                                        ? isDark
                                            ? 'bg-[#2F80ED] text-white'
                                            : 'bg-[#1a1a1a] text-white'
                                        : 'text-gray-400 hover:text-gray-200'
                                        }`}
                                >
                                    A
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFontSize('lg')}
                                    title="বড় ফন্ট"
                                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${fontSize === 'lg'
                                        ? isDark
                                            ? 'bg-[#2F80ED] text-white'
                                            : 'bg-[#1a1a1a] text-white'
                                        : 'text-gray-400 hover:text-gray-200'
                                        }`}
                                >
                                    A+
                                </button>
                            </div>

                            {/* Bookmarks Toggle */}
                            <button
                                type="button"
                                onClick={() => setShowOnlyBookmarked(!showOnlyBookmarked)}
                                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-all border ${showOnlyBookmarked
                                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                    : isDark
                                        ? 'bg-[#161920] border-[#23262D] text-[#A1A8B3] hover:text-[#F5F7FA]'
                                        : 'bg-white border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#ded5c2]'
                                    }`}
                            >
                                <Bookmark size={11} className={showOnlyBookmarked ? 'fill-amber-400' : ''} />
                                <span className="hidden sm:inline">বুকমার্ক</span>
                                <span>({toBengaliNumber(bookmarkedIds.size)})</span>
                            </button>

                            {/* Drawer Button */}
                            <button
                                type="button"
                                onClick={() => setIsDrawerOpen(true)}
                                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold transition-all ${isDark
                                    ? 'bg-[#2F80ED]/20 text-[#2F80ED] border border-[#2F80ED]/40 hover:bg-[#2F80ED]/30'
                                    : 'bg-[#1a1a1a] text-white border border-[#1a1a1a]'
                                    }`}
                            >
                                <LayoutGrid size={11} />
                                <span>নেভিগেটর</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Compact Filters Section ────────────────────────────── */}
                <div
                    className={`p-3 rounded-xl border mb-4 transition-all ${isDark
                        ? 'bg-[#111318] border-[#23262D]'
                        : 'bg-[#f4efe6] border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]'
                        }`}
                >
                    {/* Search */}
                    <div className="relative mb-3">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="যেকোনো বিষয় লিখে খুঁজুন (যেমন: বায়োমেট্রিক্স, ন্যানোটেকনোলজি...)"
                            className={`w-full pl-9 pr-9 py-2 text-xs rounded-lg border outline-none transition-all ${isDark
                                ? 'bg-[#161920] border-[#23262D] text-[#F5F7FA] focus:border-[#2F80ED] focus:ring-1 focus:ring-[#2F80ED]'
                                : 'bg-white border-2 border-[#1a1a1a] text-[#1a1a1a] focus:ring-1 focus:ring-black'
                                }`}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Tabs & Dropdowns */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div
                            className={`flex flex-wrap items-center gap-0.5 p-0.5 rounded-lg ${isDark ? 'bg-[#161920]' : 'bg-black/5'
                                }`}
                        >
                            {(
                                [
                                    { id: 'all', label: 'সকল', count: totalQuestions },
                                    { id: 'board', label: 'বোর্ড', count: countBoard },
                                    { id: 'college', label: 'কলেজ', count: countCollege },
                                    { id: 'cadet', label: 'ক্যাডেট', count: countCadet },
                                ] as const
                            ).map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
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
                            <select
                                value={selectedBoard}
                                onChange={(e) => setSelectedBoard(e.target.value)}
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
                                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${isDark
                                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25'
                                        : 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
                                        }`}
                                >
                                    <RotateCcw size={10} />
                                    <span>রিসেট</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Cognitive Filter Chips */}
                    <div className="flex flex-wrap items-center gap-1 mt-2 pt-2 border-t border-inherit">
                        <span
                            className={`text-[10px] font-semibold mr-0.5 ${isDark ? 'text-[#6B7280]' : 'text-gray-500'
                                }`}
                        >
                            অংশ:
                        </span>
                        {(
                            [
                                { id: 'all', label: 'সকল' },
                                { id: 'ক', label: 'ক (জ্ঞান)' },
                                { id: 'খ', label: 'খ (অনুধাবন)' },
                                { id: 'গ', label: 'গ (প্রয়োগ)' },
                                { id: 'ঘ', label: 'ঘ (উচ্চতর)' },
                            ] as const
                        ).map((chip) => (
                            <button
                                key={chip.id}
                                type="button"
                                onClick={() => setActiveCognitiveFilter(chip.id)}
                                className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${activeCognitiveFilter === chip.id
                                    ? isDark
                                        ? 'bg-[#2F80ED]/25 text-[#2F80ED] border border-[#2F80ED]/40 font-bold'
                                        : 'bg-[#1a1a1a] text-white font-bold'
                                    : isDark
                                        ? 'bg-[#161920] text-[#A1A8B3] hover:text-[#F5F7FA]'
                                        : 'bg-white text-gray-700 border border-[#1a1a1a]'
                                    }`}
                            >
                                {chip.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Result Count ───────────────────────────────────────── */}
                <div className="flex items-center justify-between mb-3 px-1">
                    <div
                        className={`text-[11px] md:text-xs font-semibold ${isDark ? 'text-[#A1A8B3]' : 'text-gray-700'
                            }`}
                    >
                        দেখাচ্ছে:{' '}
                        <span className="text-[#2F80ED] font-bold">
                            {toBengaliNumber(filteredQuestions.length)}
                        </span>{' '}
                        টি সৃজনশীল প্রশ্ন
                        {searchQuery && (
                            <span className="ml-1 text-[10px]">
                                (অনুসন্ধান: &ldquo;{searchQuery}&rdquo;)
                            </span>
                        )}
                    </div>
                </div>

                {/* ── Question Cards List ─────────────────────────────────── */}
                {filteredQuestions.length === 0 ? (
                    <div
                        className={`p-10 text-center rounded-xl border ${isDark ? 'bg-[#111318] border-[#23262D]' : 'bg-white border-2 border-[#1a1a1a]'
                            }`}
                    >
                        <HelpCircle size={36} className="mx-auto text-gray-400 mb-2" />
                        <h3 className="text-sm md:text-base font-bold mb-1">কোনো প্রশ্ন পাওয়া যায়নি</h3>
                        <p
                            className={`text-xs max-w-sm mx-auto mb-3 ${isDark ? 'text-[#A1A8B3]' : 'text-gray-600'
                                }`}
                        >
                            আপনার দেওয়া ফিল্টার বা অনুসন্ধানের সাথে মিল রেখে কোনো প্রশ্ন পাওয়া যায়নি।
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
                    <div className="space-y-4">
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
                                activeCognitiveFilter={activeCognitiveFilter}
                                searchQuery={searchQuery}
                            />
                        ))}

                        {displayCount < filteredQuestions.length && (
                            <div className="text-center pt-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setDisplayCount((prev) =>
                                            Math.min(prev + 12, filteredQuestions.length)
                                        )
                                    }
                                    className={`px-5 py-2.5 rounded-lg font-bold text-xs transition-all shadow-md ${isDark
                                        ? 'bg-[#161920] border border-[#23262D] text-[#F5F7FA] hover:bg-[#1A1E27] hover:border-[#2F80ED]/50'
                                        : 'bg-[#1a1a1a] text-white hover:bg-black'
                                        }`}
                                >
                                    আরও {toBengaliNumber(Math.min(12, filteredQuestions.length - displayCount))} টি দেখুন (বাকি{' '}
                                    {toBengaliNumber(filteredQuestions.length - displayCount)}টি)
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Question Navigator Drawer ─────────────────────────── */}
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