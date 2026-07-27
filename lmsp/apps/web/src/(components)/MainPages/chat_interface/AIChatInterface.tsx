import React, { useEffect, useRef, useState } from 'react';
import {
   Bot,
   Settings,
   Download,
   MoreVertical,
   Send,
   Lightbulb,
   FileText,
   Play,
   Calendar,
   BookOpen,
   ChevronRight,
   CheckCircle,
} from 'lucide-react';
import { useSendChatMessageMutation } from '@my-monorepo/store';

type ChatMessage = {
   id: string;
   sender: 'user' | 'ai';
   text: string;
   time: string;
};

const AIChatInterface = () => {
   const [hidden, setHidden] = useState(false);
   const [messages, setMessages] = useState<ChatMessage[]>([]);
   const [inputText, setInputText] = useState('');
   const [sendChatMessage, { isLoading }] = useSendChatMessageMutation();
   const chatContainerRef = useRef<HTMLDivElement | null>(null);

   const createTimestamp = () =>
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

   useEffect(() => {
      const container = chatContainerRef.current;
      if (container) {
         container.scrollTop = container.scrollHeight;
      }
   }, [messages]);

   const addMessage = (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
   };

   const handleSend = async () => {
      const question = inputText.trim();
      if (!question) return;

      const userMessage: ChatMessage = {
         id: `user-${Date.now()}`,
         sender: 'user',
         text: question,
         time: createTimestamp(),
      };

      addMessage(userMessage);
      setInputText('');

      try {
         const response = await sendChatMessage({ question }).unwrap();
         addMessage({
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: response.answer,
            time: createTimestamp(),
         });
      } catch (error) {
         addMessage({
            id: `ai-error-${Date.now()}`,
            sender: 'ai',
            text: 'Unable to send your question right now. Please try again.',
            time: createTimestamp(),
         });
      }
   };

   return (
      <div className="w-full h-[calc(100vh-10px)] font-sans text-slate-800 overflow-hidden">

         {/* ================= MAIN CONTENT ================= */}
         <main className="w-full flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">

            {/* --- Main Header --- */}
            <header className="border-b border-slate-200 p-5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 shadow-sm">
               <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#0e1625] flex items-center justify-center text-white shadow-sm flex-shrink-0">
                     <Bot size={20} />
                  </div>
                  <div>
                     <h2 className="text-base font-extrabold text-slate-900 tracking-tight">AI Assistant</h2>
                     <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="font-semibold">Online • Response 2s</span>
                        <span className="px-2 py-0.5 border border-green-200 bg-green-50 text-green-700 rounded-full font-bold text-[10px]">BCS Syllabus Trained</span>
                     </div>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <button className="text-xs font-bold flex items-center gap-1.5 px-3.5 py-2 text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition active:scale-95">
                     <Download size={14} /> Export Chat
                  </button>
                  <button className="text-xs font-bold flex items-center gap-1.5 px-3.5 py-2 text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition active:scale-95">
                     <Settings size={14} /> Settings
                  </button>
               </div>
            </header>

            {/* --- Exam Context Bar --- */}
            <div className="bg-[#0e1625] text-white px-5 py-3 flex justify-between items-center text-xs shadow-sm">
               <div className="flex items-center gap-2 flex-wrap">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Context:</span>
                  <span className="font-bold">BCS 45th Preliminary</span>
                  <span className="text-slate-650 font-bold">•</span>
                  <span className="text-slate-300 font-medium">Bangla Literature</span>
               </div>
               <button className="flex items-center gap-1 hover:text-green-400 font-bold transition text-[11px]">
                  Change <ChevronRight size={13} />
               </button>
            </div>

            {/* --- Chat Area --- */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-5 md:p-6 bg-slate-50 space-y-6 pb-40">
               <div className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">Today, June 14</div>

               {messages.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-10 text-center text-slate-500 shadow-sm">
                     Ask a question to start the chat.
                  </div>
               ) : (
                  messages.map((message) => (
                     <div key={message.id} className={message.sender === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                        <div className={`max-w-[95%] ${message.sender === 'user' ? 'md:max-w-[70%] bg-[#1b2433] text-white rounded-2xl rounded-tr-sm' : 'md:max-w-[85%] bg-white border border-slate-200 rounded-2xl'} p-4.5 shadow-sm`}>
                           {message.sender === 'ai' && (
                              <div className="flex items-center gap-2 mb-2 pb-2.5 border-b border-slate-100">
                                 <div className="w-6 h-6 bg-[#0e1625] rounded-full flex items-center justify-center text-[10px] font-extrabold text-white">AI</div>
                                 <span className="text-xs font-bold text-slate-800">AI Assistant</span>
                              </div>
                           )}
                           <p className={`text-sm leading-relaxed ${message.sender === 'user' ? 'font-semibold' : 'text-slate-700'}`}>
                              {message.text}
                           </p>
                           <div className={`mt-2 text-[10px] ${message.sender === 'user' ? 'text-slate-400 text-right' : 'text-slate-400 text-left'} font-medium`}>
                              {message.time}
                           </div>
                        </div>
                     </div>
                  ))
               )}

               {isLoading && (
                  <div className="flex justify-start">
                     <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                        <div className="flex gap-1.5">
                           <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                           <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                           <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                        <span className="text-xs text-slate-500 font-bold">AI is preparing an answer...</span>
                     </div>
                  </div>
               )}
            </div>

            {/* --- Footer Input Area --- */}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 pb-6 z-10 shadow-lg rounded-b-2xl">
               {/* Suggestion Chips */}
               <div onClick={() => setHidden(prev => !prev)} className={`flex gap-2 overflow-x-auto pb-2 mb-3.5 hide-scrollbar ${hidden ? "hidden" : ""}`}>
                  <button className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold border border-slate-200 bg-slate-50 rounded-full px-3.5 py-2 hover:bg-slate-100 text-slate-700 transition active:scale-95 shadow-sm">
                     <Lightbulb size={13} className="text-green-600" /> Explain simply
                  </button>
                  <button className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold border border-slate-200 bg-slate-50 rounded-full px-3.5 py-2 hover:bg-slate-100 text-slate-700 transition active:scale-95 shadow-sm">
                     <FileText size={13} className="text-blue-500" /> 10 MCQs
                  </button>
                  <button className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold border border-slate-200 bg-slate-50 rounded-full px-3.5 py-2 hover:bg-slate-100 text-slate-700 transition active:scale-95 shadow-sm">
                     <Play size={13} className="text-purple-500" /> Most repeated
                  </button>
                  <button className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold border border-slate-200 bg-slate-50 rounded-full px-3.5 py-2 hover:bg-slate-100 text-slate-700 transition active:scale-95 shadow-sm">
                     <Calendar size={13} className="text-orange-500" /> Study plan
                  </button>
                  <button className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold border border-slate-200 bg-slate-50 rounded-full px-3.5 py-2 hover:bg-slate-100 text-slate-700 transition active:scale-95 shadow-sm">
                     <CheckCircle size={13} className="text-pink-500" /> Weak area
                  </button>
               </div>

               {/* Input Field */}
               <div className="flex items-center gap-3 relative">
                  <input
                     type="text"
                     value={inputText}
                     onChange={(event) => setInputText(event.target.value)}
                     onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                           event.preventDefault();
                           handleSend();
                        }
                     }}
                     placeholder="Ask anything about your exam..."
                     className="w-full pl-5 pr-20 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#2cdf71] focus:ring-1 focus:ring-[#2cdf71] text-sm text-slate-800 placeholder-slate-400 font-semibold"
                  />
                  <div className="absolute right-2.5 flex items-center gap-1.5">
                     <button className="p-1.5 text-slate-400 hover:text-slate-650 transition">
                        <MoreVertical size={18} />
                     </button>
                     <button
                        type="button"
                        onClick={handleSend}
                        disabled={isLoading || !inputText.trim()}
                        className="p-2.5 bg-[#2cdf71] hover:bg-green-600 rounded-full text-white transition shadow active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300"
                     >
                        <Send size={16} />
                     </button>
                  </div>
               </div>

              
            </div>

         </main>
      </div>
   );
};

export default AIChatInterface;