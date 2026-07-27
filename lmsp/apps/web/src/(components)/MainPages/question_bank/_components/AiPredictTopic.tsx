import React from 'react';

const AiPredictTopic = () => {
    return (
        <div>
                   <div className="space-y-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0f172a] to-[#334155] flex items-center justify-center text-white text-xs font-extrabold shadow-lg">AI</div>
                            <div>
                                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">AI Predicted High-Probability Topics</h2>
                                <p className="text-xs text-slate-400 font-medium">For Next BCS Exam • Pattern Analysis 2015-2024</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-5 text-[11px] font-bold text-slate-500">
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> High</span>
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Medium</span>
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300"></span> Low</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[
                            { id: 1, title: "বাংলা সাহিত্যের ইতিহাস ও ধারা", sub: "Bangla Literature", freq: "47 Times", time: "8:45h", level: "High", accent: "from-emerald-500 to-teal-400" },
                            { id: 2, title: "Profit, Loss & Percentage — Word Problems", sub: "Mathematics", freq: "42 Times", time: "6:30h", level: "High", accent: "from-blue-500 to-indigo-400" },
                            { id: 3, title: "Bangladesh Constitution — Fundamental Rights", sub: "Bangladesh Affairs", freq: "38 Times", time: "5:15h", level: "High", accent: "from-violet-500 to-purple-400" },
                            { id: 4, title: "English — Correction & Prepositions", sub: "English", freq: "35 Times", time: "4:20h", level: "Medium", accent: "from-amber-500 to-yellow-400" },
                            { id: 5, title: "Liberation War — Timeline & Key Events", sub: "Bangladesh Affairs", freq: "33 Times", time: "7:10h", level: "Medium", accent: "from-rose-500 to-pink-400" },
                            { id: 6, title: "Computer Networks & Internet Basics", sub: "Science & ICT", freq: "21 Times", time: "3:00h", level: "Low", accent: "from-slate-400 to-slate-300" },
                        ].map((item) => (
                            <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                                {/* Top accent strip */}
                                <div className={`h-1 bg-gradient-to-r ${item.accent}`}></div>
                                <div className="p-5">
                                    <div className="flex justify-between items-start gap-3 mb-3">
                                        <div className="flex items-start gap-3">
                                            <span className={`w-7 h-7 bg-gradient-to-br ${item.accent} text-white text-xs font-bold rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm`}>{item.id}</span>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-[#0f172a] transition-colors">{item.title}</h4>
                                                <span className="text-[11px] text-slate-400 font-semibold">{item.sub}</span>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg flex-shrink-0
                                            ${item.level === 'High' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                              item.level === 'Medium' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                              'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                                            {item.level}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-slate-100 pt-3.5 mt-1 text-xs text-slate-500">
                                        <span className="font-bold text-slate-700">{item.freq}</span>
                                        <span className="flex items-center gap-1 text-slate-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></svg>
                                            {item.time}
                                        </span>
                                        <button className="bg-[#0f172a] text-white px-4 py-1.5 rounded-lg font-bold hover:bg-[#1e293b] transition-all text-xs active:scale-95 shadow-sm">
                                            Practice →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
        </div>
    );
};

export default AiPredictTopic;