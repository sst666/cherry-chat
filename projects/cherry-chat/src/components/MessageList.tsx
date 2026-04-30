import { useEffect, useRef } from 'react';
import { useChatContext } from '../context/ChatContext';
import MessageBubble from './MessageBubble';

export default function MessageList() {
  const { currentConversation, state } = useChatContext();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages.length, state.isLoading]);

  if (!currentConversation) return null;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
      {currentConversation.messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {state.isLoading && (
        <div className="flex items-start gap-3 py-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4f46e5] to-[#6366f1] flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-white text-[10px] font-bold">AI</span>
          </div>
          <div className="flex items-center gap-1.5 px-4 py-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-2xl rounded-tl-sm">
            <span className="loading-dot w-1.5 h-1.5 rounded-full bg-[#6b7280]" />
            <span className="loading-dot w-1.5 h-1.5 rounded-full bg-[#6b7280]" />
            <span className="loading-dot w-1.5 h-1.5 rounded-full bg-[#6b7280]" />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
