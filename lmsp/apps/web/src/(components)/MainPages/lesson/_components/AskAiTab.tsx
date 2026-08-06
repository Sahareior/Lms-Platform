import { useRef, useEffect, useState } from 'react';
import { Send, Bot } from 'lucide-react';
import { useSendChatMessageMutation } from '@my-monorepo/store';

interface AskAiTabProps {
  lessonTitle?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

const createTimestamp = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function AskAiTab({ lessonTitle }: AskAiTabProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sendChatMessage, { isLoading }] = useSendChatMessageMutation();
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

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

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: question,
      time: createTimestamp(),
    };

    addMessage(userMsg);
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
        text: 'Unable to get an answer right now. Please try again.',
        time: createTimestamp(),
      });
    }
  };

  return (
    <div className="bg-[#111318] rounded-2xl border border-[#23262D] overflow-hidden flex flex-col glow-ai">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#23262D]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#00E5B3]/10 border border-[#00E5B3]/30 flex items-center justify-center">
            <Bot size={16} className="text-[#00E5B3]" />
          </div>
          <div>
            <h3 className="font-bold text-[#F5F7FA] text-sm">Ask AI</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E5B3] animate-pulse" />
              <span className="text-[10px] text-[#A1A8B3]">Online</span>
            </div>
          </div>
        </div>
        <span className="text-[10px] text-[#00E5B3] bg-[#00E5B3]/10 border border-[#00E5B3]/30 px-2 py-1 rounded-lg">
          Lesson context
        </span>
      </div>

      {/* Chat container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-[#0E1016] space-y-4 max-h-[360px] min-h-[200px]"
      >
        {/* Welcome message */}
        {messages.length === 0 && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-[#00E5B3]/10 border border-[#00E5B3]/30 flex-shrink-0 flex items-center justify-center">
              <Bot size={14} className="text-[#00E5B3]" />
            </div>
            <div className="max-w-[85%] bg-[#161920] border border-[#23262D] p-3 rounded-xl rounded-tl-none text-sm text-[#A1A8B3]">
              <p className="font-medium text-[#F5F7FA] mb-1">
                How can I help you with this lesson?
              </p>
              <p className="text-xs text-[#6B7280]">
                Ask anything about "{lessonTitle || 'this lesson'}"
              </p>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => (
          <div key={msg.id} className={msg.sender === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div
              className={`max-w-[90%] p-3 ${
                msg.sender === 'user'
                  ? 'bg-[#2F80ED] text-white rounded-2xl rounded-tr-sm'
                  : 'bg-[#161920] border border-[#23262D] rounded-2xl'
              }`}
            >
              {msg.sender === 'ai' && (
                <div className="flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-[#23262D]">
                  <div className="w-5 h-5 bg-[#00E5B3]/10 border border-[#00E5B3]/30 rounded-full flex items-center justify-center text-[8px] font-bold text-[#00E5B3]">AI</div>
                  <span className="text-[11px] font-bold text-[#F5F7FA]">AI Assistant</span>
                </div>
              )}
              <p className={`text-sm leading-relaxed ${msg.sender === 'user' ? 'font-medium' : 'text-[#A1A8B3]'}`}>
                {msg.text}
              </p>
              <p className={`mt-1 text-[10px] font-medium ${msg.sender === 'user' ? 'text-white/60 text-right' : 'text-[#6B7280] text-left'}`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#161920] border border-[#23262D] rounded-2xl p-3 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-[#00E5B3] rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-[#00E5B3] rounded-full animate-bounce delay-100" />
                <span className="w-1.5 h-1.5 bg-[#00E5B3] rounded-full animate-bounce delay-200" />
              </div>
              <span className="text-xs text-[#A1A8B3] font-medium">AI is preparing an answer...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-[#23262D] p-3 bg-[#111318]">
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
            placeholder="Ask anything about this lesson..."
            className="flex-1 px-4 py-2.5 bg-[#161920] border border-[#23262D] rounded-lg text-sm focus:outline-none focus:border-[#00E5B3] focus:ring-1 focus:ring-[#00E5B3]/30 text-[#F5F7FA] placeholder-[#6B7280]"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputText.trim()}
            className="p-2.5 bg-[#00E5B3] hover:bg-[#00C298] rounded-full text-black transition shadow-sm active:scale-95 disabled:cursor-not-allowed disabled:bg-[#23262D] disabled:text-[#6B7280]"
          >
            <Send size={15} />
          </button>
        </div>
        {/* Quick suggestions */}
        <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1 hide-scrollbar">
          {['Explain this topic', 'Give me a summary', 'Create MCQs', 'Real-world example'].map((s) => (
            <button
              key={s}
              onClick={() => setInputText(s)}
              className="flex-shrink-0 text-[10px] font-medium border border-[#23262D] bg-[#161920] rounded-full px-2.5 py-1 hover:bg-[#1C1F26] hover:border-[#00E5B3]/50 text-[#A1A8B3] hover:text-[#00E5B3] transition whitespace-nowrap"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}