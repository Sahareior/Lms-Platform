import React from 'react';
import { 
  Flag, 
  Check, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Pause, 
  Lightbulb,
  Clock,
} from 'lucide-react';

const ExamUI = () => {
  return (
    <div className="w-full font-sans text-slate-800 space-y-6">
      
      {/* ================= TOP HEADER ================= */}
      <header className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between w-full bg-[#1e293b] p-5 md:p-6 rounded-2xl gap-5 text-white border-b border-[#334155] shadow-sm">
        
        {/* --- LEFT SECTION: Logo & Navigation --- */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Logo Group */}
          <div className="flex items-center gap-3">
            <div className="bg-[#10b981] p-2 rounded-full flex items-center justify-center shrink-0 shadow-sm">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-4 h-4 text-black"
              >
                <path d="M12 2l9 5.25v10.5L12 23l-9-5.25V7.25L12 2z" />
              </svg>
            </div>
            <span className="font-extrabold text-sm text-white tracking-wider">BanglaPrep</span>
          </div>

          {/* Vertical Divider */}
          <div className="h-6 w-px bg-slate-700 hidden sm:block"></div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-3">
            <div className="bg-[#10b981] px-3.5 py-1.5 rounded-lg text-xs font-bold text-black cursor-pointer hover:bg-[#059669] transition shadow-sm">
              Bank Job Quiz
            </div>
            <span className="text-xs font-bold text-slate-300 cursor-pointer hover:text-white transition">
              General Math
            </span>
          </div>
        </div>

        {/* --- CENTER SECTION: Progress & Count --- */}
        <div className="flex items-center gap-4 flex-1 justify-center max-w-xl mx-2">
          {/* Question Counter */}
          <div className="flex items-baseline gap-1 font-bold">
            <span className="text-base text-white">14</span>
            <span className="text-xs text-slate-400">/</span>
            <span className="text-xs text-slate-400">40</span>
          </div>

          {/* Progress Bar */}
          <div className="flex-1 flex items-center gap-3">
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div className="h-full bg-[#10b981] rounded-full transition-all duration-300" style={{ width: '35%' }}></div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap uppercase tracking-wider">Q14 of 40</span>
          </div>
        </div>

        {/* --- RIGHT SECTION: Timer & User Controls --- */}
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-5">
          

          {/* Vertical Divider */}
          <div className="h-6 w-px bg-slate-700 hidden md:block"></div>

          {/* User Profile */}
          <div className="flex items-center gap-2.5 cursor-pointer">
            <img 
              src="https://i.pravatar.cc/150?u=rahim-quiz" 
              alt="User Avatar" 
              className="w-8 h-8 rounded-full object-cover border border-slate-700"
            />
            <span className="font-bold text-xs text-slate-300 hidden sm:block">Rahim</span>
          </div>

          {/* Pause Button */}
         

        </div>
      </header>

      {/* ================= MAIN LAYOUT ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

        {/* ========== SIDEBAR: QUESTION NAVIGATOR ========== */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-200 lg:sticky lg:top-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">Question Navigator</h3>
            </div>
            
            <div className="flex flex-col gap-2 text-xs text-slate-500 font-semibold">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-850"></div>
                <span>Answered</span>
                <span className="ml-auto font-extrabold text-slate-800">13</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-100 border border-slate-300"></div>
                <span>Unanswered</span>
                <span className="ml-auto font-extrabold text-slate-800">24</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                <span>Flagged</span>
                <span className="ml-auto font-extrabold text-slate-800">2</span>
              </div>
            </div>

            <div className="grid grid-cols-8 md:grid-cols-5 gap-2 pt-2">
              {Array.from({ length: 40 }, (_, i) => i + 1).map((num) => {
                let bgClass = "bg-slate-50 text-slate-500 border border-slate-200"; // Unanswered
                if ([1, 2, 3, 4, 6, 7, 8, 11, 12].includes(num)) bgClass = "bg-[#1a2332] text-white border-none"; // Answered
                if ([16, 17, 20].includes(num)) bgClass = "bg-yellow-100 text-yellow-700 border border-yellow-300"; // Flagged
                if (num === 14) bgClass = "bg-white text-green-600 border-2 border-green-500 font-bold"; // Current
                
                return (
                  <div key={num} className={`w-full aspect-square rounded-lg text-xs font-bold flex items-center justify-center cursor-pointer hover:opacity-85 transition shadow-sm ${bgClass}`}>
                    {num}
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2">
               <button className="w-full bg-[#1a2332] text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#2a3648] transition active:scale-95 shadow-sm">
                 <Flag size={13} /> Submit Exam
               </button>
               <div className="text-center text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  13 answered • 25 remaining
               </div>
            </div>
          </div>
        </div>

        {/* ========== MAIN CONTENT AREA ========== */}
        <div className="lg:col-span-3 flex flex-col gap-6">

          {/* --- Section Progress --- */}
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
             <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">Section Progress:</span>
             </div>
             <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                <div className="flex items-center gap-2">
                   <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="w-full h-full bg-green-500 rounded-full"></div></div>
                   <span className="text-[10px] font-bold text-slate-500">Math</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="w-[70%] h-full bg-green-500 rounded-full"></div></div>
                   <span className="text-[10px] font-bold text-slate-500">English</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="w-[40%] h-full bg-green-500 rounded-full"></div></div>
                   <span className="text-[10px] font-bold text-slate-500">General Knowledge</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="w-[60%] h-full bg-green-500 rounded-full"></div></div>
                   <span className="text-[10px] font-bold text-slate-500">BD Affairs</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden"></div>
                   <span className="text-[10px] font-bold text-slate-500">ICT</span>
                </div>
             </div>
             <div className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-150">Score: 9/13</div>
          </div>

          {/* --- Question Card --- */}
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-slate-200 space-y-6">
             
             {/* Question Header */}
             <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-slate-100">
                <span className="bg-[#1a2332] text-white text-xs font-extrabold px-2.5 py-0.5 rounded-lg shadow-sm">Q14</span>
                <span className="bg-slate-100 border border-slate-200 text-slate-600 text-xs px-2.5 py-0.5 rounded-lg font-bold">General Math</span>
                <span className="bg-blue-50 border border-blue-200 text-blue-600 text-xs px-2.5 py-0.5 rounded-lg font-bold">Profit & Loss</span>
                <div className="ml-auto flex items-center gap-1.5 text-slate-400 text-xs font-bold hover:text-slate-650 cursor-pointer transition">
                   <Flag size={14} /> Mark
                </div>
             </div>

             {/* Question Text */}
             <div className="space-y-1.5">
                <p className="text-lg font-extrabold text-slate-900 leading-relaxed">
                   একটি পণ্য ১০% লাভে বিক্রি করা হয়, যা থেকে ৫০ টাকা লাভ হয়। পণ্যটি যদি ১৫% লাভে বিক্রি করা হয়, তবে নতুন লাভ কত টাকা হবে?
                </p>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                   A product is sold at 10% profit, earning Tk. 50. If sold at 15% profit, how much profit would be made?
                </p>
             </div>

             {/* Options Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Option A */}
                <div className="border border-slate-200 rounded-xl p-4 flex items-center gap-3.5 cursor-pointer hover:border-slate-350 hover:bg-slate-50/50 transition shadow-sm">
                   <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-sm font-bold flex-shrink-0">A</div>
                   <div className="text-sm font-bold text-slate-800">৪০০ টাকা</div>
                   <div className="text-xs text-slate-400 font-semibold ml-auto">Tk. 400</div>
                </div>

                {/* Option B (Correct - Green) */}
                <div className="border-2 border-green-500 bg-green-50 rounded-xl p-4 flex items-center gap-3.5 cursor-pointer relative shadow-sm">
                   <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold flex-shrink-0">B</div>
                   <div className="text-sm font-extrabold text-green-800">৪৫০ টাকা</div>
                   <div className="text-xs text-green-600 font-bold ml-auto mr-7">Tk. 450</div>
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow">
                      <Check size={14} className="text-white" />
                   </div>
                </div>

                {/* Option C (Incorrect - Red) */}
                <div className="border-2 border-red-400 bg-red-50 rounded-xl p-4 flex items-center gap-3.5 cursor-pointer relative shadow-sm">
                   <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-sm font-bold flex-shrink-0">C</div>
                   <div className="text-sm font-extrabold text-red-700 line-through">৫০০ টাকা</div>
                   <div className="text-xs text-red-500 font-bold ml-auto mr-7">Tk. 500</div>
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow">
                      <X size={14} className="text-white" />
                   </div>
                </div>

                {/* Option D */}
                <div className="border border-slate-200 rounded-xl p-4 flex items-center gap-3.5 cursor-pointer hover:border-slate-350 hover:bg-slate-50/50 transition shadow-sm">
                   <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-sm font-bold flex-shrink-0">D</div>
                   <div className="text-sm font-bold text-slate-800">৫৫০ টাকা</div>
                   <div className="text-xs text-slate-400 font-semibold ml-auto">Tk. 550</div>
                </div>
             </div>

             {/* Explanation Section */}
             <div className="bg-[#fafbfc] border border-slate-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                   <div className="w-5 h-5 mt-0.5 rounded-full bg-red-100 flex-shrink-0 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                   </div>
                   <div className="w-full space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                         <span className="text-sm font-extrabold text-slate-900">Explanation</span>
                         <span className="text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-lg border border-red-100">Wrong Answer — Correct: B</span>
                      </div>
                      <div className="text-sm text-slate-600 leading-relaxed space-y-2">
                         <p>
                            Cost price = ১০ + ৫০% = Tk. ৫০০. <br/>
                            At ১০% profit: ৫০০ + ১০% = Tk. ৭৫. <br/>
                            But if base gain is Tk. ৫০ at ১০%, at ১৫% it would be Tk. ৪৫০. <br/>
                            Profit difference = Tk. ৭৫ - Tk. ৫০ = Tk. ২৫. <br/>
                            <span className="font-bold text-slate-800">Correct Answer: Tk. ৪৫০</span>
                         </p>
                         <div className="flex items-center gap-2 text-blue-600 text-xs font-bold hover:underline cursor-pointer pt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" /></svg>
                            Watch video explanation
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             {/* Action Buttons */}
             <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                   <button className="flex items-center gap-1.5 px-4.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition disabled:opacity-50 w-full sm:w-auto justify-center" disabled>
                      <ChevronLeft size={16} /> Previous
                   </button>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
                   <button className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-yellow-600 border border-yellow-300 bg-yellow-50 rounded-xl text-xs font-bold hover:bg-yellow-100 transition w-full sm:w-auto shadow-sm active:scale-95">
                      <Flag size={14} /> Flag for Review
                   </button>
                   <button className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-slate-500 text-xs font-bold bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition w-full sm:w-auto shadow-sm">
                      Skip <ChevronRight size={14} />
                   </button>
                   <button className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#1a2332] text-white text-xs font-bold rounded-xl hover:bg-[#2a3648] transition w-full sm:w-auto shadow-md active:scale-95">
                      Next Question <ChevronRight size={14} />
                   </button>
                </div>
             </div>

          </div>

          {/* --- Quick Tip --- */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex justify-between items-center shadow-sm text-xs md:text-sm text-blue-800">
             <div className="flex items-center gap-3">
                <Lightbulb size={18} className="text-blue-500 flex-shrink-0" />
                <span className="font-bold">Quick Tip:</span>
                <span className="text-blue-700 leading-relaxed">
                  Profit & Loss formula: <span className="bg-white px-1.5 py-0.5 rounded border border-blue-100 text-xs font-mono font-bold">Profit% = (Profit / Cost Price) × 100</span>. Remember: always find cost price first!
                </span>
             </div>
             <X size={16} className="text-blue-300 hover:text-blue-500 cursor-pointer flex-shrink-0 ml-4" />
          </div>

        </div>
      </div>

    </div>
  );
};

export default ExamUI;