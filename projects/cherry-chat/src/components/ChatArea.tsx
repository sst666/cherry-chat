import { MessageSquare, Sparkles } from 'lucide-react';
import { useChatContext } from '../context/ChatContext';
import MessageList from './MessageList';
import InputArea from './InputArea';
import ModelSelector from './ModelSelector';

export default function ChatArea() {
  const { state, dispatch, currentConversation } = useChatContext();

  return (
    <div className="flex flex-col flex-1 min-w-0 h-full bg-white">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#e5e7eb] shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <MessageSquare size={16} className="text-[#6b7280] shrink-0" />
          <h1 className="text-sm font-medium text-[#111827] truncate">
            {state.conversations.find((c) => c.id === state.currentConvId)
              ?.title ?? 'New Conversation'}
          </h1>
        </div>
        <ModelSelector />
      </div>

      {/* Model quick-switch bar: favorites + recent */}
      {(state.favoriteModels.length > 0 || state.recentModels.length > 0) && (
        <div
          className="flex items-center gap-2 px-4 py-2 border-b border-[#e5e7eb] bg-[#fafafa] overflow-x-auto shrink-0"
          style={{ scrollbarWidth: 'none' } as React.CSSProperties}
        >
          {state.favoriteModels.length > 0 && (
            <>
              <span className="text-[10px] text-[#d97706] shrink-0 font-semibold flex items-center gap-0.5">
                ⭐ 常用
              </span>
              {state.favoriteModels.map((m) => (
                <button
                  key={`fav-${m}`}
                  onClick={() => dispatch({ type: 'SET_MODEL', payload: m })}
                  className={`px-2.5 py-1 rounded-full text-xs whitespace-nowrap shrink-0 transition-all ${
                    state.config.model === m
                      ? 'text-white shadow-sm'
                      : 'text-[#d97706] bg-amber-50 border border-amber-200 hover:border-amber-400'
                  }`}
                  style={
                    state.config.model === m
                      ? {
                          background: 'linear-gradient(135deg, #d97706, #f59e0b)',
                        }
                      : {}
                  }
                >
                  {m}
                </button>
              ))}
            </>
          )}

          {state.favoriteModels.length > 0 && state.recentModels.length > 0 && (
            <div className="w-px h-4 bg-[#e5e7eb] shrink-0 mx-1" />
          )}

          {state.recentModels.length > 0 && (
            <>
              <span className="text-[10px] text-[#9ca3af] shrink-0 font-medium">
                最近
              </span>
              {state.recentModels.slice(0, 8).map((m) => (
                <button
                  key={`recent-${m}`}
                  onClick={() => {
                    dispatch({ type: 'SET_MODEL', payload: m });
                    if (!state.favoriteModels.includes(m)) {
                      dispatch({ type: 'ADD_RECENT_MODEL', payload: m });
                    }
                  }}
                  className={`px-2.5 py-1 rounded-full text-xs whitespace-nowrap shrink-0 transition-all ${
                    state.config.model === m
                      ? 'text-white shadow-sm'
                      : 'text-[#6b7280] bg-white border border-[#e5e7eb] hover:border-[#4f46e5]/50'
                  }`}
                  style={
                    state.config.model === m
                      ? {
                          background:
                            'linear-gradient(135deg, #4f46e5, #6366f1)',
                        }
                      : {}
                  }
                >
                  {m}
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {/* Messages or empty state */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {!currentConversation ||
        currentConversation.messages.length === 0 ? (
          <EmptyState />
        ) : (
          <MessageList />
        )}
      </div>

      {/* Input */}
      <InputArea />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
        }}
      >
        <Sparkles size={24} className="text-white" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-[#111827] mb-1">
          How can I help you today?
        </h2>
        <p className="text-sm text-[#6b7280] max-w-xs">
          Start a conversation, attach images or PDFs, and explore ideas with
          AI.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-2 max-w-sm w-full">
        {[
          'Explain a concept',
          'Write some code',
          'Summarize a document',
          'Brainstorm ideas',
        ].map((s) => (
          <div
            key={s}
            className="px-3 py-2 text-xs text-[#6b7280] bg-[#f9fafb] border border-[#e5e7eb] rounded-lg text-center"
          >
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}
