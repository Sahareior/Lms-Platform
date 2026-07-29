import React from 'react';
import {
  Calendar,
  Download,
  ChevronDown,
  ChevronRight,
  Target,
  BookOpen,
  Clock,
  Users,
  Plus,
  Star,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';

const Performance = () => {
  // Radar data – subject strengths
  const radarData = [
    { subject: 'Bangla', value: 82, fullMark: 100 },
    { subject: 'English', value: 65, fullMark: 100 },
    { subject: 'Math', value: 55, fullMark: 100 },
    { subject: 'GK', value: 75, fullMark: 100 },
    { subject: 'Comp. & IT', value: 78, fullMark: 100 },
    { subject: 'Intl. Affairs', value: 61, fullMark: 100 },
  ];

  // Daily accuracy trend
  const trendData = [
    { day: 'Oct 25', accuracy: 62 },
    { day: 'Oct 27', accuracy: 68 },
    { day: 'Oct 29', accuracy: 58 },
    { day: 'Oct 31', accuracy: 72 },
    { day: 'Nov 02', accuracy: 70 },
    { day: 'Nov 04', accuracy: 75 },
    { day: 'Nov 06', accuracy: 78 },
    { day: 'Nov 08', accuracy: 80 },
    { day: 'Nov 10', accuracy: 82 },
    { day: 'Nov 12', accuracy: 85 },
  ];

  // Subject breakdown
  const subjectData = [
    { subject: 'BD Affairs', attempted: 684, correct: 602, accuracy: 88, trend: '+6%', isWeak: false, isCritical: false },
    { subject: 'Bangla', attempted: 812, correct: 666, accuracy: 82, trend: '+3%', isWeak: false, isCritical: false },
    { subject: 'Computer', attempted: 428, correct: 338, accuracy: 79, trend: '+2%', isWeak: false, isCritical: false },
    { subject: 'General Knowledge', attempted: 552, correct: 408, accuracy: 74, trend: '0%', isWeak: false, isCritical: false },
    { subject: 'English', attempted: 496, correct: 317, accuracy: 64, trend: '-3%', isWeak: true, isCritical: false },
    { subject: 'International Affairs', attempted: 342, correct: 209, accuracy: 61, trend: '-5%', isWeak: true, isCritical: false },
    { subject: 'Math', attempted: 528, correct: 290, accuracy: 55, trend: '-8%', isWeak: true, isCritical: true },
  ];

  // Chart color scheme (BrainForge)
  const successColor = '#00E5B3'; // teal
  const warningColor = '#F2C94C'; // amber
  const dangerColor = '#EB5757'; // red
  const primaryColor = '#2F80ED'; // blue

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F5F7FA]">
      <div className="w-full mx-auto space-y-6 p-4 md:p-6">

        {/* ─── HEADER ─── */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#111318] p-4 rounded-2xl border border-[#23262D]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#2F80ED]/10 border border-[#2F80ED]/30 text-[#2F80ED] flex items-center justify-center font-bold text-lg">
              RA
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-[#F5F7FA]">Rahim Ahmed</h1>
                <span className="text-[10px] bg-[#2F80ED]/10 text-[#2F80ED] px-2 py-0.5 rounded-full font-bold border border-[#2F80ED]/30">
                  <Target size={10} className="inline mr-0.5" /> Target: BCS 47th
                </span>
              </div>
              <p className="text-xs text-[#A1A8B3]">
                Performance Analytics • Last 30 days • Updated 12 min ago
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button className="flex items-center justify-center gap-1 text-xs border border-[#23262D] px-3 py-1.5 rounded-lg hover:bg-[#161920] text-[#A1A8B3] bg-[#111318] w-full md:w-auto">
              <Calendar size={14} /> Last 30 days <ChevronDown size={12} />
            </button>
            <button className="flex items-center justify-center gap-1 text-xs bg-[#2F80ED] text-white px-3 py-1.5 rounded-lg hover:bg-[#256BCE] transition w-full md:w-auto active:scale-95">
              <Download size={14} /> Export
            </button>
          </div>
        </header>

        {/* ─── STATS CARDS ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Overall Accuracy', value: '78.4 %', sub: '+4.2% vs last month', icon: <Target size={18} className="text-[#00E5B3]" />, color: '#00E5B3', trend: 'up' },
            { label: 'Questions Attempted', value: '3,842', sub: '+288 this week', icon: <BookOpen size={18} className="text-[#2F80ED]" />, color: '#2F80ED', trend: 'up' },
            { label: 'Avg Time / Question', value: '42 sec', sub: '-6 sec faster', icon: <Clock size={18} className="text-[#F2C94C]" />, color: '#F2C94C', trend: 'down' },
            { label: 'National Rank', value: '# 2,148', sub: '↑ 412 ranks', icon: <Users size={18} className="text-[#9B51E0]" />, color: '#9B51E0', trend: 'up' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-[#111318] p-4 rounded-2xl border border-[#23262D] flex flex-col">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-medium text-[#A1A8B3]">{stat.label}</span>
                <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${stat.color}1A` }}>
                  {stat.icon}
                </div>
              </div>
              <div className="text-2xl font-bold text-[#F5F7FA] mb-0.5">{stat.value}</div>
              <div className="flex items-center gap-1 text-[10px] font-medium">
                <span className={stat.trend === 'up' ? 'text-[#00E5B3]' : 'text-[#F2C94C]'}>
                  {stat.trend === 'up' ? '▲' : '▼'} {stat.sub}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ─── EXAM FILTERS ─── */}
        <div className="bg-[#111318] p-3 rounded-2xl border border-[#23262D] flex flex-wrap items-center gap-3">
          <button className="bg-[#2F80ED] text-white text-xs font-bold px-4 py-1.5 rounded-lg">BCS Preliminary</button>
          <button className="text-xs font-medium text-[#A1A8B3] px-3 py-1.5 hover:bg-[#161920] hover:text-[#F5F7FA] rounded-lg transition">Bank Job</button>
          <button className="text-xs font-medium text-[#A1A8B3] px-3 py-1.5 hover:bg-[#161920] hover:text-[#F5F7FA] rounded-lg transition">Primary Teacher</button>
          <div className="ml-auto flex items-center gap-1 text-[10px] text-[#00E5B3]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00E5B3] animate-pulse"></div>
            Live data • Synced
          </div>
        </div>

        {/* ─── CHARTS ─── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Radar Chart */}
          <div className="bg-[#111318] p-5 rounded-2xl border border-[#23262D]">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-[#F5F7FA]">Subject Strength Map</h3>
                <p className="text-[10px] text-[#A1A8B3]">Accuracy % across 7 subjects</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 h-[280px]">
              <div className="w-full h-full max-w-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#23262D" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#A1A8B3', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8, fill: '#A1A8B3' }} />
                    <Radar name="Accuracy" dataKey="value" stroke={primaryColor} fill={primaryColor} fillOpacity={0.15} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-1 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#00E5B3]"></div>
                  <span className="font-semibold text-[#F5F7FA]">Strongest:</span> BD Affairs 88%
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#EB5757]"></div>
                  <span className="font-semibold text-[#F5F7FA]">Weakest:</span> Math 55%
                </div>
              </div>
            </div>
          </div>

          {/* Area Chart (accuracy trend) */}
          <div className="bg-[#111318] p-5 rounded-2xl border border-[#23262D]">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-[#F5F7FA]">Accuracy Trend</h3>
                <p className="text-[10px] text-[#A1A8B3]">Daily accuracy • last 30 days</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#00E5B3]">78.4%</div>
                <div className="text-[10px] text-[#00E5B3] font-medium">+ 4.2</div>
              </div>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#23262D" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#A1A8B3' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 10, fill: '#A1A8B3' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #23262D',
                      backgroundColor: '#111318',
                      color: '#F5F7FA',
                    }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <defs>
                    <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={successColor} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={successColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="accuracy" stroke={successColor} fillOpacity={1} fill="url(#colorAcc)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ─── SUBJECT PERFORMANCE TABLE ─── */}
        <div className="bg-[#111318] rounded-2xl border border-[#23262D] overflow-hidden">
          <div className="p-5 border-b border-[#23262D]">
            <h3 className="font-bold text-[#F5F7FA]">Subject Performance Breakdown</h3>
            <p className="text-xs text-[#A1A8B3]">Weak subjects highlighted. Click to drill down.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#161920] text-[11px] font-medium text-[#A1A8B3] uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left">Subject</th>
                  <th className="px-5 py-3 text-center">Attempted</th>
                  <th className="px-5 py-3 text-center">Correct</th>
                  <th className="px-5 py-3 text-left w-[200px]">Accuracy</th>
                  <th className="px-5 py-3 text-center">Trend</th>
                  <th className="px-5 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#23262D]">
                {subjectData.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`hover:bg-[#161920] transition ${
                      row.isCritical ? 'bg-[#EB5757]/5' : row.isWeak ? 'bg-[#EB5757]/[0.02]' : ''
                    }`}
                  >
                    <td className="px-5 py-3 font-medium text-[#F5F7FA]">
                      <div className="flex items-center gap-2">
                        {row.subject}
                        {row.isWeak && (
                          <span className="text-[10px] bg-[#EB5757]/10 text-[#EB5757] px-1.5 py-0.5 rounded border border-[#EB5757]/30">
                            Weak
                          </span>
                        )}
                        {row.isCritical && (
                          <span className="text-[10px] bg-[#EB5757] text-white px-1.5 py-0.5 rounded">
                            Critical
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center text-[#A1A8B3]">{row.attempted}</td>
                    <td className="px-5 py-3 text-center text-[#A1A8B3]">{row.correct}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-full h-1.5 bg-[#1C1F26] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#2F80ED] to-[#00E5B3]"
                            style={{ width: `${row.accuracy}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-[#F5F7FA] min-w-[35px]">{row.accuracy}%</span>
                      </div>
                    </td>
                    <td
                      className={`px-5 py-3 text-center text-xs font-semibold ${
                        row.trend.includes('-') ? 'text-[#EB5757]' : 'text-[#00E5B3]'
                      }`}
                    >
                      {row.trend}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        className={`text-xs px-3 py-1 rounded border font-medium transition ${
                          row.isWeak || row.isCritical
                            ? 'border-[#EB5757]/30 text-[#EB5757] hover:bg-[#EB5757]/10'
                            : 'border-[#23262D] text-[#A1A8B3] hover:bg-[#161920] hover:text-[#F5F7FA]'
                        }`}
                      >
                        {row.action}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── AI STUDY PLAN ─── */}
        <div className="bg-[#111318] rounded-2xl border border-[#23262D] p-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 border-b border-[#23262D] pb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#00E5B3]/10 border border-[#00E5B3]/30 flex items-center justify-center text-[#00E5B3] text-xs font-bold">
                AI
              </div>
              <h3 className="font-bold text-[#F5F7FA]">AI Study Plan — This Week</h3>
              <span className="text-[10px] text-[#A1A8B3] hidden sm:inline">
                Personalized for weak areas • auto‑updated daily
              </span>
            </div>
            <button className="text-xs font-medium text-[#00E5B3] hover:underline flex items-center gap-1 mt-2 md:mt-0">
              <Plus size={14} /> Regenerate
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Monday */}
            <div className="bg-[#161920] border border-[#23262D] rounded-lg p-3 hover:border-[#323742] transition">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-bold text-[#A1A8B3]">MON</span>
                <span className="text-[10px] bg-[#EB5757] text-white px-1.5 py-0.5 rounded font-bold">TUE</span>
              </div>
              <div className="text-xs font-bold text-[#F5F7FA] mb-1">Math — Percentages & Profit</div>
              <div className="text-[10px] text-[#A1A8B3] leading-tight mb-2">Focus on CP/SP problems. 25 MCQs from past BCS papers.</div>
              <div className="flex justify-between items-center text-[10px] text-[#6B7280] border-t border-[#23262D] pt-1">
                <div className="flex items-center gap-1"><Clock size={10} /> 90 min/day</div>
                <ChevronRight size={12} />
              </div>
            </div>

            {/* Tuesday */}
            <div className="bg-[#161920] border border-[#23262D] rounded-lg p-3 hover:border-[#323742] transition">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-bold text-[#A1A8B3]">TUE</span>
                <span className="text-[10px] bg-[#EB5757] text-white px-1.5 py-0.5 rounded font-bold">WED</span>
              </div>
              <div className="text-xs font-bold text-[#F5F7FA] mb-1">English — Tense & Voice</div>
              <div className="text-[10px] text-[#A1A8B3] leading-tight mb-2">Do 10 grammar rules + 30 transformation MCQs.</div>
              <div className="flex justify-between items-center text-[10px] text-[#6B7280] border-t border-[#23262D] pt-1">
                <div className="flex items-center gap-1"><Clock size={10} /> 60 min/day</div>
                <ChevronRight size={12} />
              </div>
            </div>

            {/* Wednesday */}
            <div className="bg-[#161920] border border-[#23262D] rounded-lg p-3 hover:border-[#323742] transition">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-bold text-[#A1A8B3]">WED</span>
                <span className="text-[10px] bg-[#F2C94C] text-white px-1.5 py-0.5 rounded font-bold">FRI</span>
              </div>
              <div className="text-xs font-bold text-[#F5F7FA] mb-1">Intl Affairs — UN & SAARC</div>
              <div className="text-[10px] text-[#A1A8B3] leading-tight mb-2">Review UN charter & SAARC summits, recent events.</div>
              <div className="flex justify-between items-center text-[10px] text-[#6B7280] border-t border-[#23262D] pt-1">
                <div className="flex items-center gap-1"><Clock size={10} /> 45 min/day</div>
                <ChevronRight size={12} />
              </div>
            </div>

            {/* Thursday */}
            <div className="bg-[#161920] border border-[#23262D] rounded-lg p-3 hover:border-[#323742] transition">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-bold text-[#A1A8B3]">THU</span>
                <span className="text-[10px] bg-[#00E5B3] text-black px-1.5 py-0.5 rounded font-bold">SAT</span>
              </div>
              <div className="text-xs font-bold text-[#F5F7FA] mb-1">Full Mock Exam #5</div>
              <div className="text-[10px] text-[#A1A8B3] leading-tight mb-2">200 Qs • 2hrs • review weak topics afterward.</div>
              <div className="flex justify-between items-center text-[10px] text-[#6B7280] border-t border-[#23262D] pt-1">
                <div className="flex items-center gap-1"><Clock size={10} /> 2 hrs</div>
                <ChevronRight size={12} />
              </div>
            </div>

            {/* Friday + Weekend (simplified) */}
            <div className="border border-dashed border-[#323742] rounded-lg p-3 bg-[#161920] flex flex-col justify-center items-center col-span-2">
              <span className="text-[10px] text-[#00E5B3] font-bold px-2 py-0.5 bg-[#00E5B3]/10 border border-[#00E5B3]/30 rounded mb-1">
                RECOMMENDED
              </span>
              <div className="text-xs font-bold text-[#F5F7FA]">Daily Review & Practice</div>
              <div className="text-[10px] text-[#A1A8B3]">Revise 2 weak subjects daily + 50 MCQs</div>
            </div>
          </div>
        </div>

        {/* ─── BOTTOM BANNER ─── */}
        <div className="bg-[#111318] border border-[#23262D] rounded-2xl p-5 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00E5B3]/10 border border-[#00E5B3]/30 rounded-lg">
              <Target size={20} className="text-[#00E5B3]" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#F5F7FA]">
                Stick to this plan and your projected accuracy will reach{' '}
                <span className="text-[#00E5B3]">82%</span> by exam day.
              </h4>
              <p className="text-xs text-[#A1A8B3]">
                Consistent study leads to mastery. You're on the right track.
              </p>
            </div>
          </div>
          <button className="bg-[#00E5B3] hover:bg-[#00C298] text-black text-sm font-bold px-6 py-2 rounded-lg transition active:scale-95 flex items-center gap-2 w-full md:w-auto justify-center">
            Continue Study <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Performance;