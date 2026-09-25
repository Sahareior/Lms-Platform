import { useMemo, useState } from 'react';
import { Search as SearchIcon, BookOpen, FileText, GraduationCap, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSearchAllQuery } from '@my-monorepo/store';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get('q') || '';
  const [input, setInput] = useState(q);

  const { data, isFetching } = useSearchAllQuery(q, { skip: q.trim().length < 2 });

  const total = useMemo(
    () => (data ? data.exams.length + data.courses.length + data.lessons.length : 0),
    [data]
  );

  const submit = () => {
    const query = input.trim();
    if (query.length >= 2) setSearchParams({ q: query });
  };

  return (
    <div className="w-full text-[#F5F7FA] space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#00C8FF]/10 border border-[#00C8FF]/30 flex items-center justify-center">
          <SearchIcon size={20} className="text-[#00C8FF]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Search</h1>
          <p className="text-sm text-[#A1A8B3]">Find courses, exams, and lessons</p>
        </div>
      </div>

      {/* Search input */}
      <div className="flex items-center gap-2 bg-[#111318] border border-[#23262D] rounded-xl px-4 py-3 focus-within:border-[#00C8FF]/50 focus-within:ring-1 focus-within:ring-[#00C8FF]/30 transition-all">
        <SearchIcon size={18} className="text-[#6B7280]" />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Search courses, exams, lessons..."
          className="flex-1 bg-transparent outline-none text-sm placeholder-[#6B7280]"
          autoFocus
        />
        <button
          onClick={submit}
          disabled={input.trim().length < 2}
          className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#00C8FF] text-black hover:bg-[#00B0E0] disabled:opacity-50 transition-colors"
        >
          Search
        </button>
      </div>

      {isFetching && (
        <div className="flex justify-center py-10">
          <Loader2 size={28} className="animate-spin text-[#00C8FF]" />
        </div>
      )}

      {!isFetching && q.trim().length < 2 && (
        <p className="text-center text-sm text-[#6B7280] py-10">Type at least 2 characters to search</p>
      )}

      {!isFetching && q.trim().length >= 2 && total === 0 && (
        <p className="text-center text-sm text-[#6B7280] py-10">No results for “{q}”</p>
      )}

      {!isFetching && data && total > 0 && (
        <div className="space-y-6">
          {data.exams.length > 0 && (
            <Section title={`Exams (${data.exams.length})`}>
              {data.exams.map((exam) => (
                <ResultCard
                  key={exam._id}
                  icon={<GraduationCap size={16} className="text-[#9B51E0]" />}
                  title={exam.name}
                  subtitle={exam.description}
                  onClick={() => navigate('/mock-exam')}
                />
              ))}
            </Section>
          )}

          {data.courses.length > 0 && (
            <Section title={`Courses (${data.courses.length})`}>
              {data.courses.map((course) => (
                <ResultCard
                  key={course._id}
                  icon={<BookOpen size={16} className="text-[#2F80ED]" />}
                  title={course.title}
                  subtitle={course.description}
                  onClick={() => navigate(`/courses/${course._id}`)}
                />
              ))}
            </Section>
          )}

          {data.lessons.length > 0 && (
            <Section title={`Lessons (${data.lessons.length})`}>
              {data.lessons.map((lesson) => (
                <ResultCard
                  key={lesson._id}
                  icon={<FileText size={16} className="text-[#00E5B3]" />}
                  title={lesson.title}
                  subtitle={lesson.description}
                  onClick={() => lesson.course ? navigate(`/courses/${lesson.course}`) : undefined}
                />
              ))}
            </Section>
          )}
        </div>
      )}
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-3">{title}</h2>
    <div className="space-y-2">{children}</div>
  </div>
);

const ResultCard = ({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className="w-full text-left flex items-start gap-3 bg-[#111318] border border-[#23262D] rounded-xl p-4 hover:border-[#323742] hover:bg-[#161920] transition-all group"
  >
    <div className="mt-0.5 w-8 h-8 rounded-lg bg-[#161920] border border-[#23262D] flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-sm font-semibold text-[#F5F7FA] group-hover:text-[#00C8FF] transition-colors">{title}</p>
      {subtitle && <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-1">{subtitle}</p>}
    </div>
  </button>
);

export default SearchPage;
