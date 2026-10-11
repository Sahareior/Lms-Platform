import { useEffect, useRef, useState } from 'react';
import { Bot, MoreVertical, Send } from 'lucide-react';
import {
   useAppSelector,
   useSendChatMessageMutation,
   useLazyGetAiChatHistoryQuery,
   useSaveAiChatMessagesMutation,
   type AiChatHistoryMessage,
} from '@my-monorepo/store';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { chatSessionManager } from './chatSessionManager';
import { useTheme } from '../../../theme/ThemeContext';

type ChatMessage = {
   id: string;
   sender: 'user' | 'ai';
   text: string;
   time: string;
};

type StreamingState = {
   id: string;
   displayText: string;
   fullText: string;
   isComplete: boolean;
};

const HISTORY_PAGE_SIZE = 30;

interface CachedChatHistory {
   userId: string | null;
   messages: ChatMessage[];
   hasMore: boolean;
   nextCursor: string | null;
}
let chatHistoryCache: CachedChatHistory | null = null;

function appendAiToCache(text: string) {
   if (!chatHistoryCache) return;
   chatHistoryCache.messages = [
      ...chatHistoryCache.messages,
      { id: `ai-cached-${Date.now()}`, sender: 'ai', text, time: createTimestampShared() },
   ];
}

function createTimestampShared() {
   return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const AIChatInterface = () => {
   const [messages, setMessages] = useState<ChatMessage[]>([]);
   const [inputText, setInputText] = useState('');
   const [sendChatMessage, { isLoading }] = useSendChatMessageMutation();
   const [fetchHistory, { isFetching: isHistoryLoading }] = useLazyGetAiChatHistoryQuery();
   const [saveMessages] = useSaveAiChatMessagesMutation();
   const chatContainerRef = useRef<HTMLDivElement | null>(null);
   const inputRef = useRef<HTMLInputElement | null>(null);
   const updateKbOffsetRef = useRef<() => void>(() => {});
   const date = new Date();
   const [kbOffset, setKbOffset] = useState(0);
   const [streaming, setStreaming] = useState<StreamingState | null>(null);
   const streamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
   const wordsQueueRef = useRef<string[]>([]);
   const streamingBubbleRef = useRef<HTMLDivElement | null>(null);
   const { theme, isDark, setTheme, toggleTheme } = useTheme();
   const [isAiThinking, setIsAiThinking] = useState(() => chatSessionManager.isActive());
   const handledInFlightIdRef = useRef<string | null>(null);

   const userId = useAppSelector((state) => state.user.user?._id);
   const [hasMore, setHasMore] = useState(false);
   const [nextCursor, setNextCursor] = useState<string | null>(null);
   const historyLoadedRef = useRef(false);
   const autoScrollRef = useRef(true);
   const scrollAnchorRef = useRef(0);
   const scrollHeightBeforeRef = useRef(0);

   useEffect(() => {
      const vv = window.visualViewport;
      if (!vv) return;
      const updateKbOffset = () => {
         const diff = Math.max(0, window.innerHeight - vv.height);
         const keyboardOpen = document.activeElement === inputRef.current && diff > 100;
         setKbOffset(keyboardOpen ? diff : 0);
      };
      updateKbOffsetRef.current = updateKbOffset;
      vv.addEventListener('resize', updateKbOffset);
      vv.addEventListener('scroll', updateKbOffset);
      updateKbOffset();
      return () => {
         vv.removeEventListener('resize', updateKbOffset);
         vv.removeEventListener('scroll', updateKbOffset);
      };
   }, []);

   const createTimestamp = () =>
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

   const formatTime = (iso?: string) =>
      iso
         ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
         : createTimestamp();

   const toChatMessage = (m: AiChatHistoryMessage): ChatMessage => ({
      id: m._id,
      sender: m.sender,
      text: m.text,
      time: formatTime(m.createdAt),
   });

   const withInFlightUserMessage = (loaded: ChatMessage[]): ChatMessage[] => {
      const active = chatSessionManager.getActiveState();
      if (active && (active.status === 'pending' || active.status === 'success')) {
         const alreadyPresent = loaded.some(
            (m) =>
               m.id === active.userMessageId ||
               (m.sender === 'user' && m.text === active.question)
         );
         if (!alreadyPresent) {
            return [
               ...loaded,
               {
                  id: active.userMessageId,
                  sender: 'user',
                  text: active.question,
                  time: active.userMessageTime || createTimestamp(),
               },
            ];
         }
      }
      return loaded;
   };

   const resumePendingQuestion = async (question: string) => {
      if (chatSessionManager.isActive()) return;
      setIsAiThinking(true);
      try {
         await chatSessionManager.start({
            question,
            userMessageId: `user-resume-${Date.now()}`,
            userMessageTime: createTimestamp(),
            sendChat: () => sendChatMessage({ question }).unwrap(),
            saveAiMessage: async (aiText) => {
               appendAiToCache(aiText);
               await saveMessages({
                  messages: [{ sender: 'ai', text: aiText }],
               }).unwrap();
            },
         });
      } catch (err) {
         console.error('Failed to resume AI chat:', err);
      }
   };

   useEffect(() => {
      const unsubscribe = chatSessionManager.subscribe((state) => {
         if (!state) {
            setIsAiThinking(false);
            return;
         }

         if (state.status === 'pending') {
            setIsAiThinking(true);
            setMessagesSynced((prev) => {
               if (
                  prev.some(
                     (m) =>
                        m.id === state.userMessageId ||
                        (m.sender === 'user' && m.text === state.question)
                  ) ||
                  (prev.length === 0 && !!chatHistoryCache?.messages.length)
               ) {
                  return prev;
               }
               return [
                  ...prev,
                  {
                     id: state.userMessageId,
                     sender: 'user',
                     text: state.question,
                     time: state.userMessageTime || createTimestamp(),
                  },
               ];
            });
         } else if (state.status === 'success' || state.status === 'error') {
            setIsAiThinking(false);
            const alreadyRestored =
               !!state.aiText &&
               !!chatHistoryCache?.messages.some((m) => m.sender === 'ai' && m.text === state.aiText);
            if (
               state.aiText &&
               !alreadyRestored &&
               handledInFlightIdRef.current !== state.userMessageId
            ) {
               handledInFlightIdRef.current = state.userMessageId;
               const aiId = `ai-${Date.now()}`;
               const aiTime = createTimestamp();
               startStreaming(aiId, state.aiText, aiTime);
            }
         }
      });

      return () => {
         unsubscribe();
      };
   }, []);

   useEffect(() => {
      if (!userId) return;

      if (chatHistoryCache && chatHistoryCache.userId !== userId) {
         chatHistoryCache = null;
      }

      if (chatHistoryCache) {
         setMessages(withInFlightUserMessage(chatHistoryCache.messages));
         setHasMore(chatHistoryCache.hasMore);
         setNextCursor(chatHistoryCache.nextCursor);
         return;
      }

      if (historyLoadedRef.current) return;
      historyLoadedRef.current = true;
      fetchHistory({ limit: HISTORY_PAGE_SIZE })
         .unwrap()
         .then((res) => {
            setHasMore(res.hasMore);
            setNextCursor(res.nextCursor);
            let loaded = res.messages.map(toChatMessage);

            loaded = withInFlightUserMessage(loaded);

            chatHistoryCache = {
               userId,
               messages: loaded,
               hasMore: res.hasMore,
               nextCursor: res.nextCursor,
            };

            setMessages(loaded);

            const lastMsg = loaded[loaded.length - 1];
            if (lastMsg && lastMsg.sender === 'user' && !chatSessionManager.isActive()) {
               resumePendingQuestion(lastMsg.text);
            }
         })
         .catch(() => {
            historyLoadedRef.current = false;
         });
   }, [userId, fetchHistory]);

   useEffect(() => {
      if (isAiThinking) {
         requestAnimationFrame(() => {
            const container = chatContainerRef.current;
            if (container) {
               container.scrollTop = container.scrollHeight;
            }
         });
      }
   }, [isAiThinking]);

   useEffect(() => {
      const container = chatContainerRef.current;
      if (container && autoScrollRef.current) {
         container.scrollTop = container.scrollHeight;
      }
   }, [messages]);

   const setMessagesSynced = (
      updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])
   ) => {
      setMessages((prev) => {
         const next = typeof updater === 'function' ? updater(prev) : updater;
         if (
            chatHistoryCache &&
            prev.length === 0 &&
            chatHistoryCache.messages.length > next.length
         ) {
            return next;
         }
         if (chatHistoryCache) chatHistoryCache.messages = next;
         return next;
      });
   };

   const addMessage = (message: ChatMessage) => {
      setMessagesSynced((prev) => [...prev, message]);
   };

   const startStreaming = (id: string, fullText: string, time: string) => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);

      const words = fullText.split(' ');
      wordsQueueRef.current = words;
      let wordIndex = 0;

      setStreaming({ id, displayText: '', fullText, isComplete: false });
      autoScrollRef.current = false;

      requestAnimationFrame(() => {
         requestAnimationFrame(() => {
            streamingBubbleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
         });
      });

      const WORDS_PER_TICK = 1;
      const INTERVAL_MS = 40;

      streamIntervalRef.current = setInterval(() => {
         wordIndex += WORDS_PER_TICK;
         const slice = wordsQueueRef.current.slice(0, wordIndex).join(' ');
         const done = wordIndex >= wordsQueueRef.current.length;

         setStreaming({ id, displayText: done ? fullText : slice, fullText, isComplete: done });

         if (done) {
            if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
            streamIntervalRef.current = null;
            setMessagesSynced((prev) => [
               ...prev,
               { id, sender: 'ai', text: fullText, time },
            ]);
            setStreaming(null);
         }
      }, INTERVAL_MS);
   };

   const handleScroll = () => {
      const container = chatContainerRef.current;
      if (!container || isHistoryLoading || !hasMore || !nextCursor) return;
      if (container.scrollTop > 60) return;

      scrollAnchorRef.current = container.scrollTop;
      scrollHeightBeforeRef.current = container.scrollHeight;
      autoScrollRef.current = false;

      fetchHistory({ limit: HISTORY_PAGE_SIZE, before: nextCursor })
         .unwrap()
         .then((res) => {
            setHasMore(res.hasMore);
            setNextCursor(res.nextCursor);
            setMessagesSynced((prev) => [...res.messages.map(toChatMessage), ...prev]);
            if (chatHistoryCache) {
               chatHistoryCache.hasMore = res.hasMore;
               chatHistoryCache.nextCursor = res.nextCursor;
            }
            requestAnimationFrame(() => {
               const c = chatContainerRef.current;
               if (c) {
                  c.scrollTop =
                     scrollAnchorRef.current + (c.scrollHeight - scrollHeightBeforeRef.current);
               }
            });
         })
         .catch(() => {});
   };

   const handleSend = async () => {
      const question = inputText.trim();
      if (!question || isLoading || isAiThinking) return;

      const userTime = createTimestamp();
      const userMessageId = `user-${Date.now()}`;
      const userMessage: ChatMessage = {
         id: userMessageId,
         sender: 'user',
         text: question,
         time: userTime,
      };

      addMessage(userMessage);
      setInputText('');
      autoScrollRef.current = true;

      saveMessages({
         messages: [{ sender: 'user', text: question }],
      }).catch((err) => {
         console.error('Failed to immediately save user message:', err);
      });

      try {
         await chatSessionManager.start({
            question,
            userMessageId,
            userMessageTime: userTime,
            sendChat: () => sendChatMessage({ question }).unwrap(),
            saveAiMessage: async (aiText) => {
               appendAiToCache(aiText);
               await saveMessages({
                  messages: [{ sender: 'ai', text: aiText }],
               }).unwrap();
            },
         });
      } catch (err) {
         console.error('Failed in chatSessionManager:', err);
      }
   };

   // ─── LIGHT MODE THEME TOKENS ────────────────────────────────
   const lightClasses = {
      outerBg: "bg-[#e8e4db]",
      mainCard: "bg-[#f2efe9] border-[#d8d4cb] shadow-[4px_4px_0px_0px_#1a1a1a]",
      header: "border-[#d8d4cb] bg-[#f2efe9]",
      headerIcon: "bg-[#1a1a1a] border-[#1a1a1a]",
      headerIconInner: "text-[#f2efe9]",
      headerTitle: "text-[#1a1a1a] font-serif font-black",
      headerStatus: "text-[#4a4a4a] font-serif italic",
      statusDot: "bg-[#b91c1c]",
      chatArea: "bg-[#ede9e1]",
      dateLabel: "text-[#4a4a4a] font-serif",
      emptyState: "border-[#d8d4cb] bg-[#f2efe9] text-[#4a4a4a] font-serif italic",
      userBubble: "bg-[#1a1a1a] text-[#f2efe9] border-[#1a1a1a] shadow-[2px_2px_0px_0px_#b91c1c]",
      aiBubble: "bg-[#f2efe9] border-[#d8d4cb] shadow-[2px_2px_0px_0px_#1a1a1a]",
      aiHeaderDivider: "border-[#d8d4cb]",
      aiBadge: "bg-[#1a1a1a] border-[#1a1a1a] text-[#f2efe9]",
      aiName: "text-[#1a1a1a] font-serif font-bold",
      aiText: "text-[#1a1a1a] font-serif",
      userText: "text-[#f2efe9] font-serif",
      timestamp: "text-[#6B7280] font-serif italic",
      timestampUser: "text-[#f2efe9]/60 font-serif",
      thinkingBubble: "bg-[#f2efe9] border-[#d8d4cb] shadow-[2px_2px_0px_0px_#1a1a1a]",
      thinkingDot: "bg-[#b91c1c]",
      thinkingText: "text-[#4a4a4a] font-serif italic",
      footer: "bg-[#f2efe9] border-[#d8d4cb]",
      input: "bg-[#f2efe9] border-[#d8d4cb] focus:border-[#b91c1c] focus:ring-[#b91c1c]/30 text-[#1a1a1a] placeholder-[#6B7280] font-serif shadow-[2px_2px_0px_0px_#1a1a1a]",
      moreBtn: "text-[#4a4a4a] hover:text-[#1a1a1a]",
      sendBtn: "bg-[#1a1a1a] hover:bg-[#333] text-[#f2efe9] shadow-[2px_2px_0px_0px_#b91c1c] hover:shadow-[3px_3px_0px_0px_#b91c1c]",
      sendBtnDisabled: "bg-[#e0dcd5] text-[#6B7280]",
      loadingText: "text-[#4a4a4a] font-serif italic",
   };

   const darkClasses = {
      outerBg: "bg-[#0B0D12] text-[#F5F7FA]",
      mainCard: "bg-[#111318] border-[#23262D] shadow-[0_0_20px_-5px_rgba(0,229,179,0.15)]",
      header: "border-[#23262D] bg-[#111318]",
      headerIcon: "bg-[#00E5B3]/10 border-[#00E5B3]/30",
      headerIconInner: "text-[#00E5B3]",
      headerTitle: "text-[#F5F7FA]",
      headerStatus: "text-[#A1A8B3]",
      statusDot: "bg-[#00E5B3]",
      chatArea: "bg-[#0E1016]",
      dateLabel: "text-[#6B7280]",
      emptyState: "border-[#323742] bg-[#161920] text-[#A1A8B3]",
      userBubble: "bg-[#065f46] text-white",
      aiBubble: "bg-[#161920] border-[#23262D]",
      aiHeaderDivider: "border-[#23262D]",
      aiBadge: "bg-[#00E5B3]/10 border-[#00E5B3]/30 text-[#00E5B3]",
      aiName: "text-[#F5F7FA]",
      aiText: "text-white",
      userText: "text-white",
      timestamp: "text-[#6B7280]",
      timestampUser: "text-white/60",
      thinkingBubble: "bg-[#161920] border-[#23262D]",
      thinkingDot: "bg-[#00E5B3]",
      thinkingText: "text-[#A1A8B3]",
      footer: "bg-[#111318] border-[#23262D]",
      input: "bg-[#161920] border-[#23262D] focus:border-[#00E5B3] focus:ring-[#00E5B3]/30 text-[#F5F7FA] placeholder-[#6B7280]",
      moreBtn: "text-[#A1A8B3] hover:text-[#F5F7FA]",
      sendBtn: "bg-[#00E5B3] hover:bg-[#00C298] text-black",
      sendBtnDisabled: "bg-[#23262D] text-[#6B7280]",
      loadingText: "text-[#6B7280]",
   };

   const c = isDark ? darkClasses : lightClasses;

   // Markdown renderer — adapts colors based on theme
   const markdownComponents = {
      h1: ({node, ref, ...props}: any) => <h1 className={`text-2xl font-bold mb-4 ${isDark ? 'text-[#F5F7FA]' : 'text-[#1a1a1a] font-serif'}`} {...props} />,
      h2: ({node, ref, ...props}: any) => <h2 className={`text-xl font-bold mt-6 mb-3 ${isDark ? 'text-[#F5F7FA]' : 'text-[#1a1a1a] font-serif'}`} {...props} />,
      h3: ({node, ref, ...props}: any) => <h3 className={`text-lg font-bold mt-4 mb-2 ${isDark ? 'text-[#F5F7FA]' : 'text-[#1a1a1a] font-serif'}`} {...props} />,
      p: ({node, ref, ...props}: any) => <p className="mb-3 last:mb-0 leading-relaxed" {...props} />,
      ul: ({node, ref, ...props}: any) => <ul className="list-disc pl-5 mb-4 space-y-2" {...props} />,
      ol: ({node, ref, ...props}: any) => <ol className="list-decimal pl-5 mb-4 space-y-2" {...props} />,
      li: ({node, ref, ...props}: any) => <li className="leading-relaxed" {...props} />,
      a: ({node, ref, ...props}: any) => <a className={isDark ? "text-[#00E5B3] hover:underline" : "text-[#b91c1c] hover:underline font-bold"} {...props} />,
      strong: ({node, ref, ...props}: any) => <strong className={`font-bold ${isDark ? 'text-[#F5F7FA]' : 'text-[#1a1a1a]'}`} {...props} />,
      code: ({node, ref, className, children, ...props}: any) => {
         return <code className={`${isDark ? 'bg-[#1C1F26] text-[#00E5B3]' : 'bg-[#e0dcd5] text-[#b91c1c] border border-[#d8d4cb]'} px-1.5 py-0.5 rounded text-sm font-mono ${className || ''}`} {...props}>{children}</code>;
      },
      pre: ({node, ref, children, ...props}: any) => {
         return <pre className={`block ${isDark ? 'bg-[#0B0D12] border-[#23262D]' : 'bg-[#e0dcd5] border-[#d8d4cb]'} p-4 rounded-lg text-sm font-mono overflow-x-auto my-3 border`} {...props}>{children}</pre>;
      },
      table: ({node, ref, ...props}: any) => <div className="overflow-x-auto my-4"><table className="w-full text-left border-collapse" {...props} /></div>,
      th: ({node, ref, ...props}: any) => <th className={`border-b ${isDark ? 'border-[#23262D] text-[#F5F7FA]' : 'border-[#d8d4cb] text-[#1a1a1a] font-serif'} pb-2 font-semibold`} {...props} />,
      td: ({node, ref, ...props}: any) => <td className={`border-b ${isDark ? 'border-[#23262D]' : 'border-[#d8d4cb]'} py-2`} {...props} />,
   };

   return (
      <div className={`w-full  md:h-[calc(100dvh-10px)] h-full font-sans overflow-hidden ${c.outerBg}`}>
         <main className={`w-full min-h-0 flex flex-col h-full border relative overflow-hidden ${c.mainCard}`}>
            {/* --- Header --- */}
            <header className={`border-b md:p-4 p-1  flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 ${c.header}`}>
               <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-full border flex items-center justify-center flex-shrink-0 ${c.headerIcon}`}>
                     <Bot size={20} className={c.headerIconInner} />
                  </div>
                  <div>
                     <h2 className={`text-base font-extrabold tracking-tight ${c.headerTitle}`}>AI Assistant</h2>
                     <div className={`flex flex-wrap items-center gap-2 text-xs mt-0.5 ${c.headerStatus}`}>
                        <span className={`w-2 h-2 rounded-full animate-pulse ${c.statusDot}`}></span>
                        <span className="font-semibold">Online</span>
                     </div>
                  </div>
               </div>
            </header>

            {/* --- Chat Area --- */}
            <div
               ref={chatContainerRef}
               onScroll={handleScroll}
               className={`flex-1 min-h-0 overflow-y-auto p-1 space-y-6 ${c.chatArea}`}
               style={{ paddingBottom: `calc(10rem + ${kbOffset}px)` }}
            >
               <div className={`text-center text-[10px] font-bold uppercase tracking-wider ${c.dateLabel}`}>{date.toDateString()}</div>

               {isHistoryLoading && messages.length > 0 && (
                  <div className="flex justify-center">
                     <span className={`text-[10px] font-bold uppercase tracking-wider animate-pulse ${c.loadingText}`}>
                        Loading earlier messages...
                     </span>
                  </div>
               )}

               {messages.length === 0 ? (
                  <div className={`rounded-3xl border border-dashed p-10 text-center ${c.emptyState}`}>
                     {isHistoryLoading ? 'Loading chat history...' : 'Ask a question to start the chat.'}
                  </div>
               ) : (
                  messages.map((message) => (
                     <div key={message.id} className={message.sender === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                        <div
                           className={`max-w-[95%] ${
                              message.sender === 'user'
                                 ? `md:max-w-[70%] rounded-2xl rounded-tr-sm ${c.userBubble}`
                                 : `md:max-w-[85%] rounded-2xl ${c.aiBubble}`
                           } p-4`}
                        >
                           {message.sender === 'ai' && (
                              <div className={`flex items-center gap-2 mb-2 pb-2.5 border-b ${c.aiHeaderDivider}`}>
                                 <div className={`w-6 h-6 border rounded-full flex items-center justify-center text-[10px] font-extrabold ${c.aiBadge}`}>
                                    AI
                                 </div>
                                 <span className={`text-xs font-bold ${c.aiName}`}>AI Assistant</span>
                              </div>
                           )}
                           {message.sender === 'user' && (
                              <p className={`md:text-[19px] text-[16px] leading-relaxed font-medium ${c.userText}`}>
                                 {message.text}
                              </p>
                           )}
                           {message.sender === 'ai' && (
                              <div className={`md:text-[19px] text-[16px] leading-relaxed w-full break-words ${c.aiText}`}>
                                 <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                    {message.text}
                                 </ReactMarkdown>
                              </div>
                           )}
                           <div className={`mt-2 text-[10px] font-medium ${message.sender === 'user' ? `text-right ${c.timestampUser}` : `text-left ${c.timestamp}`}`}>
                              {message.time}
                           </div>
                        </div>
                     </div>
                  ))
               )}

               {/* Streaming (typewriter) AI bubble */}
               {streaming && (
                  <div ref={streamingBubbleRef} className="flex justify-start">
                     <div className={`max-w-[95%] md:max-w-[85%] rounded-2xl p-4 ${c.aiBubble}`}>
                        <div className={`flex items-center gap-2 mb-2 pb-2.5 border-b ${c.aiHeaderDivider}`}>
                           <div className={`w-6 h-6 border rounded-full flex items-center justify-center text-[10px] font-extrabold ${c.aiBadge}`}>
                              AI
                           </div>
                           <span className={`text-xs font-bold ${c.aiName}`}>AI Assistant</span>
                        </div>
                        <div className={`md:text-[19px] text-[16px] leading-relaxed w-full break-words ${c.aiText}`}>
                           <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                              {streaming.displayText}
                           </ReactMarkdown>
                           {!streaming.isComplete && (
                              <span className={`inline-block w-0.5 h-4 ml-0.5 animate-pulse align-middle ${isDark ? 'bg-[#00E5B3]' : 'bg-[#b91c1c]'}`} />
                           )}
                        </div>
                     </div>
                  </div>
               )}

               {/* Thinking dots */}
               {(isLoading || isAiThinking) && !streaming && (
                  <div className="flex justify-start">
                     <div className={`rounded-2xl p-4 flex items-center gap-3 ${c.thinkingBubble}`}>
                        <div className="flex gap-1.5">
                           <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${c.thinkingDot}`}></span>
                           <span className={`w-1.5 h-1.5 rounded-full animate-bounce delay-100 ${c.thinkingDot}`}></span>
                           <span className={`w-1.5 h-1.5 rounded-full animate-bounce delay-200 ${c.thinkingDot}`}></span>
                        </div>
                        <span className={`text-xs font-bold ${c.thinkingText}`}>AI is preparing an answer...</span>
                     </div>
                  </div>
               )}
            </div>

            {/* --- Footer Input Area --- */}
            <div
               className={`border-t p-4 pb-6 z-10 rounded-b-2xl ${c.footer} ${kbOffset > 0 ? 'sticky bottom-0' : ''}`}
               style={{
                  paddingBottom: kbOffset > 0 ? `${Math.max(24, kbOffset + 24)}px` : undefined,
               }}
            >
               <div className="flex items-center gap-3 relative">
                  <input
                     ref={inputRef}
                     type="text"
                     value={inputText}
                     onChange={(event) => setInputText(event.target.value)}
                     onFocus={() => updateKbOffsetRef.current()}
                     onBlur={() => updateKbOffsetRef.current()}
                     onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                           event.preventDefault();
                           if (!isLoading && !isAiThinking && inputText.trim()) {
                              handleSend();
                           }
                        }
                     }}
                     placeholder="Ask anything about your exam..."
                     className={`w-full pl-5 pr-20 py-3.5 rounded-xl border focus:outline-none focus:ring-1 text-sm font-semibold ${c.input}`}
                  />
                  <div className="absolute right-2.5 flex items-center gap-1.5">
                     <button className={`p-1.5 transition ${c.moreBtn}`}>
                        <MoreVertical size={18} />
                     </button>
                     <button
                        type="button"
                        onClick={handleSend}
                        disabled={isLoading || isAiThinking || !inputText.trim()}
                        className={`p-2.5 rounded-full transition active:scale-95 disabled:cursor-not-allowed ${
                           isLoading || isAiThinking || !inputText.trim()
                              ? c.sendBtnDisabled
                              : c.sendBtn
                        }`}
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