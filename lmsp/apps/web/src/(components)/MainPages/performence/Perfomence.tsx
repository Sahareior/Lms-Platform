import React from 'react';
import { 
  Calendar, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  BookOpen,
  Target,
  Clock,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  MoreHorizontal,
  Plus,
  Star,
  Zap,
  ChevronRight
} from 'lucide-react';
import {
  LineChart,
  Line,
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
  Area,
  AreaChart
} from 'recharts';

const Perfomence = () => {
  // Data for Radar Chart (Subject Strength)
  const radarData = [
    { subject: 'Bangla', value: 82, fullMark: 100 },
    { subject: 'English', value: 65, fullMark: 100 },
    { subject: 'Math', value: 55, fullMark: 100 },
    { subject: 'GK', value: 75, fullMark: 100 },
    { subject: 'Comp. & IT', value: 78, fullMark: 100 },
    { subject: 'Intl. Affairs', value: 61, fullMark: 100 },
  ];

  // Data for Accuracy Trend Chart
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

  // Subject Breakdown Data
  const subjectData = [
    { subject: 'BD Affairs', attempted: 684, correct: 602, accuracy: 88, trend: '+6%', action: 'View' },
    { subject: 'Bangla', attempted: 812, correct: 666, accuracy: 82, trend: '+3%', action: 'View' },
    { subject: 'Computer', attempted: 428, correct: 338, accuracy: 79, trend: '+2%', action: 'View' },
    { subject: 'General Knowledge', attempted: 552, correct: 408, accuracy: 74, trend: '0%', action: 'View' },
    { subject: 'English', attempted: 496, correct: 317, accuracy: 64, trend: '-3%', action: 'Practice', isWeak: true },
    { subject: 'International Affairs', attempted: 342, correct: 209, accuracy: 61, trend: '-5%', action: 'Practice', isWeak: true },
    { subject: 'Math', attempted: 528, correct: 290, accuracy: 55, trend: '-8%', action: 'Practice', isCritical: true },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-800 ">
      <div className="w-full mx-auto space-y-6">

        {/* ======= HEADER SECTION ======= */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-lg">
              RA
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-800">Rahim Ahmed</h1>
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold border border-green-200">
                  <Target size={10} className="inline mr-0.5" /> Target: BCS 47th
                </span>
              </div>
              <p className="text-xs text-gray-400">Performance Analytics • Last 30 days • Updated 12 min ago</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button className="flex items-center justify-center gap-1 text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-gray-600 bg-white w-full md:w-auto">
              <Calendar size={14} /> Last 30 days <ChevronDown size={12} />
            </button>
            <button className="flex items-center justify-center gap-1 text-xs bg-slate-800 text-white px-3 py-1.5 rounded-lg hover:bg-slate-900 transition w-full md:w-auto">
              <Download size={14} /> Export
            </button>
          </div>
        </header>

        {/* ======= STATS CARDS ======= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Overall Accuracy', value: '78.4 %', sub: '+4.2% vs last month', icon: <Target size={18} className="text-green-500" />, color: 'green', trend: 'up' },
            { label: 'Questions Attempted', value: '3,842', sub: '+288 this week', icon: <BookOpen size={18} className="text-blue-500" />, color: 'blue', trend: 'up' },
            { label: 'Avg Time / Question', value: '42 sec', sub: '-6 sec faster', icon: <Clock size={18} className="text-yellow-500" />, color: 'yellow', trend: 'down' },
            { label: 'National Rank', value: '# 2,148', sub: '↑ 412 ranks', icon: <Users size={18} className="text-purple-500" />, color: 'purple', trend: 'up' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-medium text-gray-400">{stat.label}</span>
                <div className={`p-1.5 rounded-lg bg-${stat.color}-50`}>
                  {stat.icon}
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-800 mb-0.5">{stat.value}</div>
              <div className="flex items-center gap-1 text-[10px] font-medium">
                <span className={stat.trend === 'up' ? 'text-green-600' : 'text-yellow-600'}>
                  {stat.trend === 'up' ? '▲' : '▼'} {stat.sub}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ======= FILTERS ======= */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-3">
          <button className="bg-[#0e1625] text-white text-xs font-bold px-4 py-1.5 rounded-lg">BCS Preliminary</button>
          <button className="text-xs font-medium text-gray-500 px-3 py-1.5 hover:bg-gray-50 rounded-lg">Bank Job</button>
          <button className="text-xs font-medium text-gray-500 px-3 py-1.5 hover:bg-gray-50 rounded-lg">Primary Teacher</button>
          <div className="ml-auto flex items-center gap-1 text-[10px] text-green-600">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            Live data • Synced
          </div>
        </div>

        {/* ======= CHARTS SECTION ======= */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Radar Chart */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-slate-800">Subject Strength Map</h3>
                <p className="text-[10px] text-gray-400">Accuracy % across 7 subjects</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 h-[280px]">
              <div className="w-full h-full max-w-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                    <Radar name="Accuracy" dataKey="value" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-1 text-xs">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> <span className="font-semibold">Strongest:</span> BD Affairs 88%</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-400"></div> <span className="font-semibold">Weakest:</span> Math 55%</div>
              </div>
            </div>
          </div>

          {/* Line Chart */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-slate-800">Accuracy Trend</h3>
                <p className="text-[10px] text-gray-400">Daily accuracy • last 30 days</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">78.4%</div>
                <div className="text-[10px] text-green-600 font-medium">+ 4.2</div>
              </div>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <defs>
                    <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="accuracy" stroke="#22c55e" fillOpacity={1} fill="url(#colorAcc)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ======= SUBJECT PERFORMANCE TABLE ======= */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-bold text-slate-800">Subject Performance Breakdown</h3>
            <p className="text-xs text-gray-400">Weak subjects highlighted in red. Click row to drill down.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left">Subject</th>
                  <th className="px-5 py-3 text-center">Attempted</th>
                  <th className="px-5 py-3 text-center">Correct</th>
                  <th className="px-5 py-3 text-left w-[200px]">Accuracy</th>
                  <th className="px-5 py-3 text-center">Trend</th>
                  <th className="px-5 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subjectData.map((row, idx) => (
                  <tr key={idx} className={`hover:bg-gray-50 transition ${row.isCritical ? 'bg-red-50' : row.isWeak ? 'bg-red-50/50' : ''}`}>
                    <td className="px-5 py-3 font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                        {row.subject}
                        {row.isWeak && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Weak</span>}
                        {row.isCritical && <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded">Critical</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center text-gray-600">{row.attempted}</td>
                    <td className="px-5 py-3 text-center text-gray-600">{row.correct}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-full h-1.5 bg-gray-200 rounded-full">
                          <div 
                            className="h-full rounded-full bg-gray-800" 
                            style={{ width: `${row.accuracy}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-slate-700 min-w-[35px]">{row.accuracy}%</span>
                      </div>
                    </td>
                    <td className={`px-5 py-3 text-center text-xs font-semibold ${row.trend.includes('-') ? 'text-red-500' : 'text-green-500'}`}>
                      {row.trend}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button className={`text-xs px-3 py-1 rounded border font-medium ${row.isWeak || row.isCritical ? 'border-red-300 text-red-600 hover:bg-red-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        {row.action}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ======= AI STUDY PLAN ======= */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">AI</div>
              <h3 className="font-bold text-slate-800">AI Study Plan — This Week</h3>
              <span className="text-[10px] text-gray-400">Personalized for your weak areas • auto-updated daily</span>
            </div>
            <button className="text-xs font-medium text-green-600 hover:underline flex items-center gap-1 mt-2 md:mt-0">
              <Plus size={14} /> Regenerate
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Mon */}
            <div className="border border-gray-100 rounded-lg p-3 bg-white hover:shadow-md transition">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-bold text-gray-400">MON</span>
                <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold">TUE</span>
              </div>
              <div className="text-xs font-bold text-slate-700 mb-1">Math — Percentages & Profit</div>
              <div className="text-[10px] text-gray-400 leading-tight mb-2">Focus on CP/SP problems. 25 MCQs from past BCS papers.</div>
              <div className="flex justify-between items-center text-[10px] text-gray-400 border-t border-gray-100 pt-1">
                 <div className="flex items-center gap-1"><Clock size={10} /> 90 min/day</div>
                 <ChevronRight size={12} className="text-gray-300" />
              </div>
            </div>

            {/* Tue */}
            <div className="border border-gray-100 rounded-lg p-3 bg-white hover:shadow-md transition">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-bold text-gray-400">TUE</span>
                <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold">WED</span>
              </div>
              <div className="text-xs font-bold text-slate-700 mb-1">English — Tense & Voice</div>
              <div className="text-[10px] text-gray-400 leading-tight mb-2">Do 10 grammar rules + 30 transformation MCQs.</div>
              <div className="flex justify-between items-center text-[10px] text-gray-400 border-t border-gray-100 pt-1">
                 <div className="flex items-center gap-1"><Clock size={10} /> 60 min/day</div>
                 <ChevronRight size={12} className="text-gray-300" />
              </div>
            </div>

             {/* Wed */}
            <div className="border border-gray-100 rounded-lg p-3 bg-white hover:shadow-md transition">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-bold text-gray-400">WED</span>
                <span className="text-[10px] bg-yellow-500 text-white px-1.5 py-0.5 rounded font-bold">FRI</span>
              </div>
              <div className="text-xs font-bold text-slate-700 mb-1">Intl Affairs — UN & SAARC</div>
              <div className="text-[10px] text-gray-400 leading-tight mb-2">Review UN charter & SAARC summits, recent events.</div>
              <div className="flex justify-between items-center text-[10px] text-gray-400 border-t border-gray-100 pt-1">
                 <div className="flex items-center gap-1"><Clock size={10} /> 45 min/day</div>
                 <ChevronRight size={12} className="text-gray-300" />
              </div>
            </div>
            
            {/* Thu */}
            <div className="border border-gray-100 rounded-lg p-3 bg-white hover:shadow-md transition">
               <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-bold text-gray-400">THU</span>
                <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded font-bold">SAT</span>
              </div>
              <div className="text-xs font-bold text-slate-700 mb-1">Full Mock Exam #5</div>
              <div className="text-[10px] text-gray-400 leading-tight mb-2">200 Qs • 2hrs • review weak topics afterward.</div>
              <div className="flex justify-between items-center text-[10px] text-gray-400 border-t border-gray-100 pt-1">
                 <div className="flex items-center gap-1"><Clock size={10} /> 2 hrs</div>
                 <ChevronRight size={12} className="text-gray-300" />
              </div>
            </div>

            {/* Fri-Sat Simplified */}
            <div className="border border-dashed border-gray-200 rounded-lg p-3 bg-gray-50 flex flex-col justify-center items-center col-span-2">
              <span className="text-[10px] text-green-600 font-bold px-2 py-0.5 bg-green-50 rounded mb-1">RECOMMENDED</span>
              <div className="text-xs font-bold text-slate-700">Daily Review & Practice</div>
              <div className="text-[10px] text-gray-400">Revise 2 weak subjects daily + 50 MCQs</div>
            </div>

          </div>
        </div>

        {/* ======= BANNER ======= */}
        <div className="bg-[#0e1625] text-white rounded-xl p-5 flex flex-col md:flex-row justify-between items-center gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
               <Target size={20} className="text-green-400" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Stick to this plan and your projected accuracy will reach <span className="text-green-400">82%</span> by exam day.</h4>
              <p className="text-xs text-gray-400">Consistent study leads to mastery. You're on the right track.</p>
            </div>
          </div>
          <button className="bg-green-500 hover:bg-green-600 text-white text-sm font-bold px-6 py-2 rounded-lg transition shadow-lg shadow-green-500/20 flex items-center gap-2 w-full md:w-auto justify-center">
            Continue Study <ChevronRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default Perfomence;