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
   CheckCircle,
   ChevronRight,
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
      <div className="w-full h-[calc(100vh-10px)] bg-[#0B0D12] text-[#F5F7FA] font-sans overflow-hidden">
         {/* ================= MAIN CARD ================= */}
         <main className="w-full flex flex-col h-full bg-[#111318] rounded-2xl border border-[#23262D] shadow-[0_0_20px_-5px_rgba(0,229,179,0.15)] relative overflow-hidden">

            {/* --- Header --- */}
            <header className="border-b border-[#23262D] p-5 bg-[#111318] flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10">
               <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#00E5B3]/10 border border-[#00E5B3]/30 flex items-center justify-center flex-shrink-0">
                     <Bot size={20} className="text-[#00E5B3]" />
                  </div>
                  <div>
                     <h2 className="text-base font-extrabold text-[#F5F7FA] tracking-tight">AI Assistant</h2>
                     <div className="flex flex-wrap items-center gap-2 text-xs mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-[#00E5B3] animate-pulse"></span>
                        <span className="text-[#A1A8B3] font-semibold">Online • Response 2s</span>
                        <span className="px-2 py-0.5 border border-[#00E5B3]/30 bg-[#00E5B3]/10 text-[#00E5B3] rounded-full font-bold text-[10px]">
                           BCS Syllabus Trained
                        </span>
                     </div>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <button className="text-xs font-bold flex items-center gap-1.5 px-3.5 py-2 text-[#A1A8B3] border border-[#23262D] rounded-xl hover:bg-[#161920] hover:text-[#F5F7FA] transition active:scale-95">
                     <Download size={14} /> Export Chat
                  </button>
                  <button className="text-xs font-bold flex items-center gap-1.5 px-3.5 py-2 text-[#A1A8B3] border border-[#23262D] rounded-xl hover:bg-[#161920] hover:text-[#F5F7FA] transition active:scale-95">
                     <Settings size={14} /> Settings
                  </button>
               </div>
            </header>

            {/* --- Exam Context Bar --- */}
            <div className="bg-[#161920] border-b border-[#23262D] text-white px-5 py-3 flex justify-between items-center text-xs">
               <div className="flex items-center gap-2 flex-wrap">
                  <div className="w-2 h-2 rounded-full bg-[#00E5B3]"></div>
                  <span className="text-[#A1A8B3] font-bold uppercase tracking-wider text-[9px]">Context:</span>
                  <span className="font-bold text-[#F5F7FA]">BCS 45th Preliminary</span>
                  <span className="text-[#6B7280] font-bold">•</span>
                  <span className="text-[#A1A8B3] font-medium">Bangla Literature</span>
               </div>
               <button className="flex items-center gap-1 text-[#00E5B3] hover:text-[#00C298] font-bold transition text-[11px]">
                  Change <ChevronRight size={13} />
               </button>
            </div>

            {/* --- Chat Area --- */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-5 md:p-6 bg-[#0E1016] space-y-6 pb-40">
               <div className="text-center text-[10px] text-[#6B7280] font-bold uppercase tracking-wider">Today, June 14</div>

               {messages.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-[#323742] bg-[#161920] p-10 text-center text-[#A1A8B3]">
                     Ask a question to start the chat.
                  </div>
               ) : (
                  messages.map((message) => (
                     <div key={message.id} className={message.sender === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                        <div
                           className={`max-w-[95%] ${
                              message.sender === 'user'
                                 ? 'md:max-w-[70%] bg-[#2F80ED] text-white rounded-2xl rounded-tr-sm'
                                 : 'md:max-w-[85%] bg-[#161920] border border-[#23262D] rounded-2xl'
                           } p-4`}
                        >
                           {message.sender === 'ai' && (
                              <div className="flex items-center gap-2 mb-2 pb-2.5 border-b border-[#23262D]">
                                 <div className="w-6 h-6 bg-[#00E5B3]/10 border border-[#00E5B3]/30 rounded-full flex items-center justify-center text-[10px] font-extrabold text-[#00E5B3]">
                                    AI
                                 </div>
                                 <span className="text-xs font-bold text-[#F5F7FA]">AI Assistant</span>
                              </div>
                           )}
                           <p className={`text-sm leading-relaxed ${message.sender === 'user' ? 'font-semibold' : 'text-[#A1A8B3]'}`}>
                              {message.text}
                           </p>
                           <div className={`mt-2 text-[10px] ${message.sender === 'user' ? 'text-white/60 text-right' : 'text-[#6B7280] text-left'} font-medium`}>
                              {message.time}
                           </div>
                        </div>
                     </div>
                  ))
               )}

               {isLoading && (
                  <div className="flex justify-start">
                     <div className="bg-[#161920] border border-[#23262D] rounded-2xl p-4 flex items-center gap-3">
                        <div className="flex gap-1.5">
                           <span className="w-1.5 h-1.5 bg-[#00E5B3] rounded-full animate-bounce"></span>
                           <span className="w-1.5 h-1.5 bg-[#00E5B3] rounded-full animate-bounce delay-100"></span>
                           <span className="w-1.5 h-1.5 bg-[#00E5B3] rounded-full animate-bounce delay-200"></span>
                        </div>
                        <span className="text-xs text-[#A1A8B3] font-bold">AI is preparing an answer...</span>
                     </div>
                  </div>
               )}
            </div>

            {/* --- Footer Input Area --- */}
            <div className="absolute bottom-0 left-0 right-0 bg-[#111318] border-t border-[#23262D] p-4 pb-6 z-10 rounded-b-2xl">
               {/* Suggestion Chips */}
               <div
                  onClick={() => setHidden((prev) => !prev)}
                  className={`flex gap-2 overflow-x-auto pb-2 mb-3.5 hide-scrollbar ${hidden ? 'hidden' : ''}`}
               >
                  <button className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold border border-[#23262D] bg-[#161920] rounded-full px-3.5 py-2 hover:bg-[#1C1F26] hover:text-[#F5F7FA] text-[#A1A8B3] transition active:scale-95">
                     <Lightbulb size={13} className="text-[#00E5B3]" /> Explain simply
                  </button>
                  <button className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold border border-[#23262D] bg-[#161920] rounded-full px-3.5 py-2 hover:bg-[#1C1F26] hover:text-[#F5F7FA] text-[#A1A8B3] transition active:scale-95">
                     <FileText size={13} className="text-[#00E5B3]" /> 10 MCQs
                  </button>
                  <button className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold border border-[#23262D] bg-[#161920] rounded-full px-3.5 py-2 hover:bg-[#1C1F26] hover:text-[#F5F7FA] text-[#A1A8B3] transition active:scale-95">
                     <Play size={13} className="text-[#00E5B3]" /> Most repeated
                  </button>
                  <button className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold border border-[#23262D] bg-[#161920] rounded-full px-3.5 py-2 hover:bg-[#1C1F26] hover:text-[#F5F7FA] text-[#A1A8B3] transition active:scale-95">
                     <Calendar size={13} className="text-[#00E5B3]" /> Study plan
                  </button>
                  <button className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold border border-[#23262D] bg-[#161920] rounded-full px-3.5 py-2 hover:bg-[#1C1F26] hover:text-[#F5F7FA] text-[#A1A8B3] transition active:scale-95">
                     <CheckCircle size={13} className="text-[#00E5B3]" /> Weak area
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
                     className="w-full pl-5 pr-20 py-3.5 bg-[#161920] border border-[#23262D] rounded-xl focus:outline-none focus:border-[#00E5B3] focus:ring-1 focus:ring-[#00E5B3]/30 text-sm text-[#F5F7FA] placeholder-[#6B7280] font-semibold"
                  />
                  <div className="absolute right-2.5 flex items-center gap-1.5">
                     <button className="p-1.5 text-[#A1A8B3] hover:text-[#F5F7FA] transition">
                        <MoreVertical size={18} />
                     </button>
                     <button
                        type="button"
                        onClick={handleSend}
                        disabled={isLoading || !inputText.trim()}
                        className="p-2.5 bg-[#00E5B3] hover:bg-[#00C298] rounded-full text-black transition shadow active:scale-95 disabled:cursor-not-allowed disabled:bg-[#23262D] disabled:text-[#6B7280]"
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