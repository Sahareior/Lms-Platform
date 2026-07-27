import React from "react";
import { useLocation } from "react-router-dom";
import MainNavbar from "../navbar/MainNavbar";
import AuthNavbar from "../navbar/AuthNavbar";
import { Clock, Flag, Pause, Play, Search } from "lucide-react";

type Props = {};

function ConditionalHeader({}: Props) {
  const location = useLocation();

  const returnedFun =()=> {
    if(location.pathname ==="/"){
      return <div>
                <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              Welcome back, Rahim!
            </h1>
            <p className="text-slate-500 mt-2">
              Let's crush your BCS preparation today.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl shadow-sm w-[320px]">
            <Search size={18} className="text-gray-400" />
            <input
              placeholder="Search topics, questions..."
              className="outline-none flex-1 bg-transparent"
            />
          </div>
        </div>
      </div>
    }
    else if(location.pathname ==="/courses"){

    } else if(location.pathname ==="/quiz"){

    } else if(location.pathname ==="/mock-exam"){
        return       <header className="bg-[#1a2332] text-white px-6 py-3 flex items-center justify-between shadow-md  top-0 z-50">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Play size={16} fill="white" className="text-white ml-0.5" />
                  </div>
                  <div className="text-sm font-bold">BCS Preliminary Mock Exam #4</div>
                  <div className="h-5 w-px bg-gray-600 mx-1"></div>
                  <div className="text-[10px] text-gray-400">
                    Full Syllabus • 200 Questions • 120 Minutes
                  </div>
                </div>
        
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-red-500 animate-pulse" />
                    <span className="text-xl font-bold text-red-500">01:28:43</span>
                  </div>
                  <div className="text-xs text-gray-300 text-center leading-tight">
                    <div className="font-bold text-white text-base">45 / 200</div>
                    <div className="text-[10px] text-gray-400">Answered</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="bg-gray-700 hover:bg-gray-600 text-xs px-3 py-1.5 rounded flex items-center gap-1.5 transition">
                      <Pause size={12} /> Pause
                    </button>
                    <button className="bg-red-500 hover:bg-red-600 text-xs font-bold px-4 py-1.5 rounded flex items-center gap-1.5 transition shadow-lg shadow-red-500/20">
                      <Flag size={12} /> Submit Exam
                    </button>
                  </div>
                </div>
              </header>

    } else if(location.pathname ==="/ai-assistant"){

    } else if(location.pathname ==="/question-bank"){

    } else if(location.pathname ==="/performance"){

    } else if(location.pathname ==="/settings"){

    }
  }
  return (
    <div>
     
    </div>
  );
}

export default ConditionalHeader