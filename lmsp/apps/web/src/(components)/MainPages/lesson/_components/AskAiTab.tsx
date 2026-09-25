import { useRef, useEffect, useState } from 'react';
import { Send, Bot, BookOpen, FileText, HelpCircle, Lightbulb } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  useSendChatMessageMutation,
  useGetAiChatHistoryQuery,
  useSaveAiChatMessagesMutation,
} from '@my-monorepo/store';
import { useTheme } from '../../../../theme/ThemeContext';


interface AskAiTabProps {
  lessonTitle?: string;
  chapterId?: string;
  lessonId?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

type StreamingState = {
  id: string;
  displayText: string;
  fullText: string;
  isComplete: boolean;
};

const createTimestamp = (dateStr?: string) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const QUICK_ACTIONS = [
  { mode: 'explain', label: 'Explain this topic', icon: BookOpen },
  { mode: 'summary', label: 'Give me a summary', icon: FileText },
  { mode: 'mcqs', label: 'Create MCQs', icon: HelpCircle },
  { mode: 'real_world', label: 'Real-world example', icon: Lightbulb },
];

const getMarkdownComponents = (isDark: boolean): React.ComponentProps<typeof ReactMarkdown>['components'] => ({
  h1: ({ node: _n, ref: _r, ...props }: any) => <h1 className={`text-xl font-bold mb-3 ${isDark ? 'text-[#F5F7FA]' : 'text-[#1a1a1a]'}`} {...props} />,
  h2: ({ node: _n, ref: _r, ...props }: any) => <h2 className={`text-lg font-bold mt-4 mb-2 ${isDark ? 'text-[#F5F7FA]' : 'text-[#1a1a1a]'}`} {...props} />,
  h3: ({ node: _n, ref: _r, ...props }: any) => <h3 className={`text-base font-bold mt-3 mb-1.5 ${isDark ? 'text-[#00E5B3]' : 'text-[#b91c1c]'}`} {...props} />,
  p: ({ node: _n, ref: _r, ...props }: any) => <p className="mb-2.5 last:mb-0 leading-relaxed" {...props} />,
  ul: ({ node: _n, ref: _r, ...props }: any) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
  ol: ({ node: _n, ref: _r, ...props }: any) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
  li: ({ node: _n, ref: _r, ...props }: any) => <li className="leading-relaxed" {...props} />,
  a: ({ node: _n, ref: _r, ...props }: any) => <a className={isDark ? 'text-[#00E5B3] hover:underline' : 'text-[#b91c1c] hover:underline'} {...props} />,
  strong: ({ node: _n, ref: _r, ...props }: any) => <strong className={`font-bold ${isDark ? 'text-[#F5F7FA]' : 'text-[#1a1a1a]'}`} {...props} />,
  blockquote: ({ node: _n, ref: _r, ...props }: any) => <blockquote className={`border-l-2 ${isDark ? 'border-[#00E5B3] bg-[#00E5B3]/5 text-[#A1A8B3]' : 'border-[#b91c1c] bg-[#f2efe9] text-[#4a4a4a]'} rounded-r-lg py-2 px-3 my-2`} {...props} />,
  hr: ({ node: _n, ref: _r, ...props }: any) => <hr className={isDark ? 'border-[#23262D] my-3' : 'border-[#d8d4cb] my-3'} {...props} />,
  code: ({ node: _n, ref: _r, className, children, ...props }: any) => (
    <code className={`${isDark ? 'bg-[#1C1F26] text-[#00E5B3]' : 'bg-[#ebe7e0] text-[#b91c1c]'} px-1.5 py-0.5 rounded text-sm font-mono ${className || ''}`} {...props}>{children}</code>
  ),
  pre: ({ node: _n, ref: _r, children, ...props }: any) => (
    <pre className={`${isDark ? 'bg-[#0B0D12] border-[#23262D]' : 'bg-[#f7f4ef] border-[#d8d4cb]'} block p-3 rounded-lg text-sm font-mono overflow-x-auto my-2 border`} {...props}>{children}</pre>
  ),
});

export default function AskAiTab({ lessonTitle, chapterId, lessonId }: AskAiTabProps) {
  const { isDark } = useTheme();
  const activeChapter = chapterId || lessonId || 'default-chapter';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');

  // ── Typewriter streaming state ──────────────────────────────────────
  const [streaming, setStreaming] = useState<StreamingState | null>(null);
  const streamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wordsQueueRef = useRef<string[]>([]);
  const streamingBubbleRef = useRef<HTMLDivElement | null>(null);
  const autoScrollRef = useRef(true);

  const { data: historyData, isLoading: isHistoryLoading } = useGetAiChatHistoryQuery(
    { chapter: activeChapter, limit: 50 },
    { skip: !activeChapter }
  );

  const [saveChatMessages] = useSaveAiChatMessagesMutation();
  const [sendChatMessage, { isLoading }] = useSendChatMessageMutation();
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (historyData?.messages) {
      setMessages(
        historyData.messages.map((m) => ({
          id: m._id,
          sender: m.sender,
          text: m.text,
          time: createTimestamp(m.createdAt),
        }))
      );
    }
  }, [historyData]);

  // Auto-scroll to bottom when new messages arrive — but NOT during streaming
  useEffect(() => {
    const container = chatContainerRef.current;
    if (container && autoScrollRef.current) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  // Auto-scroll when loading indicator appears
  useEffect(() => {
    if (isLoading) {
      requestAnimationFrame(() => {
        const container = chatContainerRef.current;
        if (container) container.scrollTop = container.scrollHeight;
      });
    }
  }, [isLoading]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    };
  }, []);

  const addMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  // ── Typewriter effect ───────────────────────────────────────────────
  const startStreaming = (id: string, fullText: string, time: string) => {
    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);

    const words = fullText.split(' ');
    wordsQueueRef.current = words;
    let wordIndex = 0;

    setStreaming({ id, displayText: '', fullText, isComplete: false });
    autoScrollRef.current = false;

    // Scroll the top of the new AI bubble into view after React paints it
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
        setMessages((prev) => [...prev, { id, sender: 'ai', text: fullText, time }]);
        setStreaming(null);
        autoScrollRef.current = true;
      }
    }, INTERVAL_MS);
  };

  const handleSendMessage = async (textToSend: string, mode?: string) => {
    const question = textToSend.trim();
    if (!question || isLoading || streaming) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: question,
      time: createTimestamp(),
    };

    autoScrollRef.current = true;
    addMessage(userMsg);
    setInputText('');

    saveChatMessages({
      chapter: activeChapter,
      messages: [{ sender: 'user', text: question, chapter: activeChapter }],
    }).catch(() => {});

    try {
      const response = await sendChatMessage({
        question,
        mode,
        topic: lessonTitle,
        session_id: activeChapter,
      }).unwrap();

      const aiId = `ai-${Date.now()}`;
      const aiTime = createTimestamp();

      startStreaming(aiId, response.answer, aiTime);

      saveChatMessages({
        chapter: activeChapter,
        messages: [{ sender: 'ai', text: response.answer, chapter: activeChapter }],
      }).catch(() => {});
    } catch {
      addMessage({
        id: `ai-error-${Date.now()}`,
        sender: 'ai',
        text: 'Unable to get an answer right now. Please try again.',
        time: createTimestamp(),
      });
      autoScrollRef.current = true;
    }
  };

  const handleSend = () => handleSendMessage(inputText);

  return (
    <div className={isDark ? 'bg-[#111318] rounded-2xl border border-[#23262D] overflow-hidden flex flex-col glow-ai' : 'bg-[#f2efe9] rounded-lg border border-[#d8d4cb] overflow-hidden flex flex-col shadow-[2px_2px_0px_0px_#1a1a1a]'}>
      <div className={isDark ? 'flex items-center justify-between px-5 py-4 border-b border-[#23262D]' : 'flex items-center justify-between px-5 py-4 border-b border-[#d8d4cb]'}>
        <div className="flex items-center gap-2">
          <div className={isDark ? 'w-8 h-8 rounded-full bg-[#00E5B3]/10 border border-[#00E5B3]/30 flex items-center justify-center' : 'w-8 h-8 rounded-full bg-[#1a1a1a]/10 border border-[#1a1a1a]/20 flex items-center justify-center'}>
            <Bot size={16} className={isDark ? 'text-[#00E5B3]' : 'text-[#1a1a1a]'} />
          </div>
          <div>
            <h3 className={isDark ? 'font-bold text-[#F5F7FA] text-sm' : 'font-black text-[#1a1a1a] text-sm font-serif'}>Ask AI</h3>
            <div className="flex items-center gap-1.5">
              <span className={isDark ? 'w-1.5 h-1.5 rounded-full bg-[#00E5B3] animate-pulse' : 'w-1.5 h-1.5 rounded-full bg-[#1a1a1a] animate-pulse'} />
              <span className={isDark ? 'text-[10px] text-[#A1A8B3]' : 'text-[10px] text-[#4a4a4a] font-serif'}>Online</span>
            </div>
          </div>
        </div>
        <span className={isDark ? 'text-[10px] text-[#00E5B3] bg-[#00E5B3]/10 border border-[#00E5B3]/30 px-2 py-1 rounded-lg max-w-[440px] truncate' : 'text-[10px] text-[#1a1a1a] bg-[#e0dcd5] border border-[#d8d4cb] px-2 py-1 rounded-md max-w-[440px] truncate font-serif'}>
          {lessonTitle ? ` ${lessonTitle}` : 'Lesson context'}
        </span>
      </div>

      <div
        ref={chatContainerRef}
        className={isDark ? 'flex-1 overflow-y-auto p-4 bg-[#0E1016] space-y-4 max-h-[360px] min-h-[200px]' : 'flex-1 overflow-y-auto p-4 bg-[#f7f4ef] space-y-4 max-h-[360px] min-h-[200px]'}
      >
        {/* Loading history */}
        {isHistoryLoading && (
          <div className="flex items-center justify-center py-6 gap-2 text-[#6B7280]">
            <div className="w-4 h-4 border-2 border-[#00E5B3]/50 border-t-[#00E5B3] rounded-full animate-spin" />
            <span className="text-xs">Loading chat history...</span>
          </div>
        )}

        {/* Welcome message */}
        {!isHistoryLoading && messages.length === 0 && !streaming && (
          <div className="flex gap-3">
            <div className={isDark ? 'w-7 h-7 rounded-full bg-[#00E5B3]/10 border border-[#00E5B3]/30 flex-shrink-0 flex items-center justify-center' : 'w-7 h-7 rounded-full bg-[#1a1a1a]/10 border border-[#1a1a1a]/20 flex-shrink-0 flex items-center justify-center'}>
              <Bot size={14} className={isDark ? 'text-[#00E5B3]' : 'text-[#1a1a1a]'} />
            </div>
            <div className={isDark ? 'max-w-[85%] bg-[#161920] border border-[#23262D] p-3 rounded-xl rounded-tl-none text-sm text-[#A1A8B3]' : 'max-w-[85%] bg-[#e0dcd5] border border-[#d8d4cb] p-3 rounded-lg rounded-tl-none text-sm text-[#4a4a4a]'}>
              <p className={isDark ? 'font-medium text-[#F5F7FA] mb-1' : 'font-bold text-[#1a1a1a] mb-1 font-serif'}>How can I help you with this lesson?</p>
              <p className={isDark ? 'text-xs text-[#6B7280]' : 'text-xs text-[#4a4a4a] font-serif italic'}>
                Ask anything about &quot;{lessonTitle || 'this lesson'}&quot;, or use the quick buttons below.
              </p>
            </div>
          </div>
        )}

        {/* Persisted messages */}
        {messages.map((msg) => (
          <div key={msg.id} className={msg.sender === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div
              className={`max-w-[90%] p-3 ${
                msg.sender === 'user'
                  ? (isDark ? 'bg-[#2F80ED] text-white rounded-2xl rounded-tr-sm' : 'bg-[#1a1a1a] text-[#f2efe9] rounded-lg rounded-tr-sm')
                  : (isDark ? 'bg-[#161920] border border-[#23262D] rounded-2xl' : 'bg-[#e0dcd5] border border-[#d8d4cb] rounded-lg')
              }`}
            >
              {msg.sender === 'ai' && (
                <div className={isDark ? 'flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-[#23262D]' : 'flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-[#d8d4cb]'}>
                  <div className={isDark ? 'w-5 h-5 bg-[#00E5B3]/10 border border-[#00E5B3]/30 rounded-full flex items-center justify-center text-[8px] font-bold text-[#00E5B3]' : 'w-5 h-5 bg-[#1a1a1a]/10 border border-[#1a1a1a]/20 rounded-full flex items-center justify-center text-[8px] font-bold text-[#1a1a1a]'}>AI</div>
                  <span className={isDark ? 'text-[11px] font-bold text-[#F5F7FA]' : 'text-[11px] font-bold text-[#1a1a1a]'}>AI Assistant</span>
                </div>
              )}
              {msg.sender === 'user' ? (
                <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
              ) : (
                <div className={isDark ? 'text-[15px] leading-relaxed text-[#D1D5DB]' : 'text-[15px] leading-relaxed text-[#1a1a1a]'}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={getMarkdownComponents(isDark)}>
                    {msg.text}
                  </ReactMarkdown>
                </div>
              )}
              <p className={`mt-1 text-[10px] font-medium ${msg.sender === 'user' ? 'text-white/60 text-right' : (isDark ? 'text-[#6B7280] text-left' : 'text-[#4a4a4a] text-left font-serif')}`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}

        {/* ── Streaming (typewriter) bubble ─────────────────────────────── */}
        {streaming && (
          <div ref={streamingBubbleRef} className="flex justify-start">
            <div className={isDark ? 'max-w-[90%] bg-[#161920] border border-[#23262D] rounded-2xl p-3' : 'max-w-[90%] bg-[#e0dcd5] border border-[#d8d4cb] rounded-lg p-3'}>
              <div className={isDark ? 'flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-[#23262D]' : 'flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-[#d8d4cb]'}>
                <div className={isDark ? 'w-5 h-5 bg-[#00E5B3]/10 border border-[#00E5B3]/30 rounded-full flex items-center justify-center text-[8px] font-bold text-[#00E5B3]' : 'w-5 h-5 bg-[#1a1a1a]/10 border border-[#1a1a1a]/20 rounded-full flex items-center justify-center text-[8px] font-bold text-[#1a1a1a]'}>AI</div>
                <span className={isDark ? 'text-[11px] font-bold text-[#F5F7FA]' : 'text-[11px] font-bold text-[#1a1a1a]'}>AI Assistant</span>
              </div>
              <div className={isDark ? 'text-[15px] leading-relaxed text-[#D1D5DB]' : 'text-[15px] leading-relaxed text-[#1a1a1a]'}>
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={getMarkdownComponents(isDark)}>
                  {streaming.displayText}
                </ReactMarkdown>
                {!streaming.isComplete && (
                  <span className={isDark ? 'inline-block w-0.5 h-4 bg-[#00E5B3] ml-0.5 animate-pulse align-middle' : 'inline-block w-0.5 h-4 bg-[#1a1a1a] ml-0.5 animate-pulse align-middle'} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Thinking dots — while waiting for API response, before streaming */}
        {isLoading && !streaming && (
          <div className="flex justify-start">
            <div className={isDark ? 'bg-[#161920] border border-[#23262D] rounded-2xl p-3 flex items-center gap-2' : 'bg-[#e0dcd5] border border-[#d8d4cb] rounded-lg p-3 flex items-center gap-2'}>
              <div className="flex gap-1">
                <span className={isDark ? 'w-1.5 h-1.5 bg-[#00E5B3] rounded-full animate-bounce' : 'w-1.5 h-1.5 bg-[#1a1a1a] rounded-full animate-bounce'} />
                <span className={isDark ? 'w-1.5 h-1.5 bg-[#00E5B3] rounded-full animate-bounce delay-100' : 'w-1.5 h-1.5 bg-[#1a1a1a] rounded-full animate-bounce delay-100'} />
                <span className={isDark ? 'w-1.5 h-1.5 bg-[#00E5B3] rounded-full animate-bounce delay-200' : 'w-1.5 h-1.5 bg-[#1a1a1a] rounded-full animate-bounce delay-200'} />
              </div>
              <span className={isDark ? 'text-xs text-[#A1A8B3] font-medium' : 'text-xs text-[#4a4a4a] font-serif'}>AI is preparing an answer...</span>
            </div>
          </div>
        )}
      </div>

      <div className={isDark ? 'border-t border-[#23262D] p-3 bg-[#111318]' : 'border-t border-[#d8d4cb] p-3 bg-[#f2efe9]'}>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isLoading || !!streaming}
            placeholder="Ask anything about this lesson..."
            className={isDark ? 'flex-1 px-4 py-2.5 bg-[#161920] border border-[#23262D] rounded-lg text-sm focus:outline-none focus:border-[#00E5B3] focus:ring-1 focus:ring-[#00E5B3]/30 text-[#F5F7FA] placeholder-[#6B7280] disabled:opacity-60' : 'flex-1 px-4 py-2.5 bg-[#f7f4ef] border border-[#d8d4cb] rounded-md text-sm focus:outline-none focus:border-[#b91c1c] focus:ring-1 focus:ring-[#b91c1c]/20 text-[#1a1a1a] placeholder-[#6B7280] disabled:opacity-60 font-serif'}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !!streaming || !inputText.trim()}
            className={isDark ? 'p-2.5 bg-[#00E5B3] hover:bg-[#00C298] rounded-full text-black transition shadow-sm active:scale-95 disabled:cursor-not-allowed disabled:bg-[#23262D] disabled:text-[#6B7280]' : 'p-2.5 bg-[#1a1a1a] hover:bg-[#2b2b2b] rounded-full text-[#f2efe9] transition shadow-[2px_2px_0px_0px_#b91c1c] active:scale-95 disabled:cursor-not-allowed disabled:bg-[#d8d4cb] disabled:text-[#4a4a4a]'}
          >
            <Send size={15} />
          </button>
        </div>
        <div className="flex gap-1.5 mt-2.5 overflow-x-auto pb-1 hide-scrollbar">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.mode}
                disabled={isLoading || !!streaming}
                onClick={() => handleSendMessage(action.label, action.mode)}
                className={isDark ? 'flex items-center gap-1.5 flex-shrink-0 text-[10px] font-medium border border-[#23262D] bg-[#161920] rounded-full px-2.5 py-1 hover:bg-[#1C1F26] hover:border-[#00E5B3]/50 text-[#A1A8B3] hover:text-[#00E5B3] transition whitespace-nowrap active:scale-95 disabled:opacity-50' : 'flex items-center gap-1.5 flex-shrink-0 text-[10px] font-bold border border-[#d8d4cb] bg-[#e0dcd5] rounded-full px-2.5 py-1 hover:bg-[#d8d4cb] text-[#1a1a1a] transition whitespace-nowrap active:scale-95 disabled:opacity-50 font-serif'}
              >
                <Icon size={12} className={isDark ? 'text-[#00E5B3]' : 'text-[#1a1a1a]'} />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
