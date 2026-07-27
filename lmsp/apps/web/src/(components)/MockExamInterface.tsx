import React from 'react';
import { 
  Clock, 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  Check, 
  XCircle, 
  Info,
  Lock
} from 'lucide-react';

const MockExamInterface = () => {
  // Simulate navigation data
  const totalQuestions = 200;
  const currentQuestionId = 45;
  const selectedOption = 'B';

  // Helper to determine grid item style based on question ID
  const getNavItemStyle = (id: number) => {
    if (id === currentQuestionId) {
      return 'bg-white border-2 border-green-500 text-green-600 font-bold'; // Current
    }
    if (id < 45 && id !== 34 && id !== 42) {
      return 'bg-[#1a2332] text-white'; // Answered
    }
    if (id === 34 || id === 42) {
      return 'bg-yellow-100 text-yellow-700 border border-yellow-300'; // Marked
    }
    return 'bg-white border border-slate-200 text-slate-500'; // Not visited
  };

  return (
    <div className="w-full font-sans text-slate-800 space-y-6">
      
      {/* ================= TOP HEADER ================= */}
      <header className="bg-[#1a2332] text-white p-5 md:p-6 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center shadow">
            <Play size={16} fill="white" className="text-white ml-0.5" />
          </div>
          <div>
            <div className="text-base font-extrabold tracking-tight">BCS Preliminary Mock Exam #4</div>
            <div className="text-xs text-slate-300 mt-0.5">
              Full Syllabus • 200 Questions • 120 Minutes
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
            <Clock size={18} className="text-red-400 animate-pulse" />
            <span className="text-xl font-extrabold text-red-400 tracking-tight">01:28:43</span>
          </div>
          <div className="text-xs text-slate-300 text-center leading-tight">
            <div className="font-bold text-white text-lg">45 <span className="text-xs text-slate-400">/ 200</span></div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Answered</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition active:scale-95">
              <Pause size={13} /> Pause
            </button>
            <button className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-5 py-2 rounded-xl flex items-center gap-1.5 transition shadow-md shadow-red-500/20 active:scale-95">
              <Flag size={13} /> Submit Exam
            </button>
          </div>
        </div>
      </header>

      {/* ================= CATEGORY BAR ================= */}
      <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {['Bangla 35', 'English 35', 'General Knowledge 35', 'Bangladesh Affairs 30', 'Science & Tech 20', 'Mental Ability 20', 'Mathematics 25'].map((item, idx) => {
            const isActive = item.includes('Bangladesh Affairs');
            return (
              <div key={idx} className={`text-xs px-3.5 py-1.5 rounded-xl cursor-pointer transition font-semibold ${isActive ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                {item}
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
          <Info size={14} className="text-slate-400" /> Negative marking: -0.5 per wrong answer
        </div>
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">

        {/* ====== LEFT SIDEBAR: NAVIGATOR ====== */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5 lg:sticky lg:top-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-base">Question Navigator</h3>
          </div>
          
          {/* Legend */}
          <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs text-slate-500">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#1a2332]"></span>Answered <span className="ml-auto font-bold text-slate-800">44</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full border-2 border-green-500 bg-white"></span>Current <span className="ml-auto font-bold text-slate-800">1</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full border border-slate-300 bg-white"></span>Not visited <span className="ml-auto font-bold text-slate-800">152</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-400"></span>Marked <span className="ml-auto font-bold text-slate-800">3</span></div>
          </div>

          {/* Progress */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-bold text-slate-600">
               <span>Progress</span>
               <span>44 / 200</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
               <div className="w-[22%] h-full bg-green-500 rounded-full"></div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-10 gap-2 pt-2">
            {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((num) => (
              <div 
                key={num} 
                className={`w-full aspect-square rounded-lg text-[10px] font-bold flex items-center justify-center cursor-pointer hover:opacity-85 transition shadow-sm ${getNavItemStyle(num)}`}
              >
                {num}
              </div>
            ))}
          </div>
        </div>

        {/* ====== RIGHT PANEL: QUESTION & OPTIONS ====== */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 flex flex-col space-y-6">
          
          {/* Question Header */}
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#1a2332] text-white text-xs flex items-center justify-center font-extrabold shadow">45</div>
              <div>
                <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Question 45 of 200</div>
                <div className="flex items-center gap-2 mt-1">
                   <span className="bg-green-50 text-green-700 border border-green-200 text-xs px-2.5 py-0.5 rounded-lg font-bold">Bangladesh Affairs</span>
                   <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2.5 py-0.5 rounded-lg font-bold">Constitution</span>
                   <span className="text-xs text-slate-400 font-semibold">1 Mark</span>
                </div>
              </div>
            </div>
            <button className="flex items-center gap-1.5 border border-yellow-400 bg-yellow-50 text-yellow-600 text-xs px-3.5 py-1.5 rounded-xl hover:bg-yellow-100 transition-all font-bold shadow-sm active:scale-95">
              <Flag size={14} /> Marked for Review
            </button>
          </div>

          {/* Question Text */}
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900 leading-relaxed">
              বাংলাদেশের সংবিধান কবে কার্যকর হয়েছিল?
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              When did the Constitution of Bangladesh come into effect?
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {/* Option A */}
            <div className="flex items-center p-4 border border-slate-200 rounded-xl cursor-pointer hover:border-slate-300 hover:bg-slate-50/50 transition-all relative group shadow-sm">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-sm font-bold mr-3.5 flex-shrink-0">A</div>
              <div>
                <div className="text-sm font-bold text-slate-800">বাংলাদেশের সংবিধান কার্যকর হয় ১৬ ডিসেম্বর ১৯৭২ সালে</div>
                <div className="text-xs text-slate-400 font-medium mt-0.5">The Constitution of Bangladesh came into effect on 16 December 1972</div>
              </div>
            </div>

            {/* Option B - Selected */}
            <div className="flex items-center justify-between p-4 bg-[#1a2332] rounded-xl cursor-pointer border-2 border-[#1a2332] relative group shadow-md transition-all">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold mr-3.5 flex-shrink-0">B</div>
                <div>
                  <div className="text-sm font-bold text-white">বাংলাদেশের সংবিধান কার্যকর হয় ৪ নভেম্বর ১৯৭২ সালে</div>
                  <div className="text-xs text-slate-300 font-medium mt-0.5">The Constitution of Bangladesh came into effect on 4 November 1972</div>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow">
                 <Check size={14} className="text-white" />
              </div>
            </div>

            {/* Option C */}
            <div className="flex items-center p-4 border border-slate-200 rounded-xl cursor-pointer hover:border-slate-300 hover:bg-slate-50/50 transition-all relative group shadow-sm">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-sm font-bold mr-3.5 flex-shrink-0">C</div>
              <div>
                <div className="text-sm font-bold text-slate-800">বাংলাদেশের সংবিধান কার্যকর হয় ২৬ মার্চ ১৯৭২ সালে</div>
                <div className="text-xs text-slate-400 font-medium mt-0.5">The Constitution of Bangladesh came into effect on 26 March 1972</div>
              </div>
            </div>

            {/* Option D */}
            <div className="flex items-center p-4 border border-slate-200 rounded-xl cursor-pointer hover:border-slate-300 hover:bg-slate-50/50 transition-all relative group shadow-sm">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-sm font-bold mr-3.5 flex-shrink-0">D</div>
              <div>
                <div className="text-sm font-bold text-slate-800">বাংলাদেশের সংবিধান কার্যকর হয় ১৭ এপ্রিল ১৯৭২ সালে</div>
                <div className="text-xs text-slate-400 font-medium mt-0.5">The Constitution of Bangladesh came into effect on 17 April 1972</div>
              </div>
            </div>
          </div>

          {/* Exam Mode Notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center gap-2.5">
             <Lock size={15} className="text-slate-400" />
             <span className="text-xs text-slate-500 font-semibold">Exam mode — answers and explanations will be shown after submission.</span>
          </div>

          {/* Bottom Action Bar */}
          <div className="border-t border-slate-100 pt-5 flex flex-wrap items-center justify-between gap-4">
             <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-4.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all disabled:opacity-50" disabled>
                   <ChevronLeft size={16} /> Previous
                </button>
             </div>

             <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-4.5 py-2.5 border border-yellow-400 bg-yellow-50 text-yellow-600 text-xs font-bold rounded-xl hover:bg-yellow-100 transition-all active:scale-95 shadow-sm">
                   <Flag size={15} /> Mark
                </button>
                <button className="flex items-center gap-1.5 px-4.5 py-2.5 border border-red-200 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition-all active:scale-95 shadow-sm">
                   <XCircle size={15} /> Clear
                </button>
             </div>

             <div className="flex items-center gap-2">
                <div className="text-xs font-bold text-slate-400 whitespace-nowrap">Jump to:</div>
                <div className="flex border border-slate-300 rounded-xl overflow-hidden shadow-sm">
                   <input type="text" defaultValue="45" className="w-12 h-9 text-center text-sm font-bold outline-none border-r border-slate-300 bg-slate-50" />
                   <button className="bg-[#1a2332] text-white px-3.5 text-xs font-bold hover:bg-[#2a3648] transition-all">Go</button>
                </div>
             </div>

             <button className="flex items-center gap-2 px-6 py-2.5 bg-[#1a2332] text-white text-xs font-bold rounded-xl hover:bg-[#2a3648] transition-all shadow-md active:scale-95">
                Save & Next <ChevronRight size={16} />
              </button>
          </div>

        </div>
      </div>

      {/* ================= FOOTER SHORTCUTS ================= */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur border border-slate-200 rounded-full shadow-xl px-5 py-2.5 flex items-center gap-5 text-xs text-slate-500 font-semibold z-40">
         <div className="flex items-center gap-1.5"><ChevronLeft size={12} /> <ChevronRight size={12} /> <span className="font-bold text-slate-700">Prev / Next</span></div>
         <div className="w-px h-3.5 bg-slate-200"></div>
         <div className="flex items-center gap-1.5"><span className="font-bold text-slate-700">A B C D</span> <span className="text-slate-400">Option select</span></div>
         <div className="w-px h-3.5 bg-slate-200"></div>
         <div className="flex items-center gap-1.5"><span className="font-bold text-slate-700">N</span> <span className="text-slate-400">Mark review</span></div>
         <div className="w-px h-3.5 bg-slate-200"></div>
         <div className="flex items-center gap-1.5"><span className="font-bold text-slate-700">ESC</span> <span className="text-slate-400">Pause exam</span></div>
      </div>

    </div>
  );
};

export default MockExamInterface;