import React, { useState, useMemo } from 'react';
import { Plus, Search, MessageSquare, Trash2, Settings } from 'lucide-react';
import { useChatContext } from '../context/ChatContext';
import type { Conversation } from '../types';

export default function Sidebar() {
  const { state, dispatch } = useChatContext();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = state.searchQuery.toLowerCase();
    if (!q) return state.conversations;
    return state.conversations.filter((c) =>
      c.title.toLowerCase().includes(q)
    );
  }, [state.conversations, state.searchQuery]);

  function handleNew() {
    dispatch({ type: 'NEW_CONVERSATION' });
  }

  function handleSelect(id: string) {
    dispatch({ type: 'SELECT_CONVERSATION', payload: id });
  }

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    dispatch({ type: 'DELETE_CONVERSATION', payload: id });
  }

  function formatDate(ts: number): string {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (diff < 604800000) {
      return d.toLocaleDateString([], { weekday: 'short' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  return (
    <aside
      style={{ width: 280, minWidth: 280 }}
      className="flex flex-col h-full bg-[#f9fafb] border-r border-[#e5e7eb]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e7eb]">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}
          >
            <MessageSquare size={14} className="text-white" />
          </div>
          <span className="font-semibold text-[#111827] text-sm">
            CherryChat
          </span>
        </div>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
          className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#111827] hover:bg-[#e5e7eb] transition-colors"
          title="Settings"
        >
          <Settings size={16} />
        </button>
      </div>

      {/* New Chat */}
      <div className="px-3 pt-3 pb-2">
        <button
          onClick={handleNew}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ background: '#4f46e5' }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = '#4338ca')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = '#4f46e5')
          }
        >
          <Plus size={16} />
          New Chat
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6b7280]"
          />
          <input
            type="text"
            placeholder="Search conversations..."
            value={state.searchQuery}
            onChange={(e) =>
              dispatch({ type: 'SET_SEARCH', payload: e.target.value })
            }
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-white border border-[#e5e7eb] rounded-lg outline-none focus:border-[#4f46e5] transition-colors"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {filtered.length === 0 ? (
          <p className="text-xs text-[#6b7280] text-center py-4">
            No conversations
          </p>
        ) : (
          filtered.map((conv: Conversation) => (
            <div
              key={conv.id}
              onClick={() => handleSelect(conv.id)}
              onMouseEnter={() => setHoveredId(conv.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`group relative flex items-start gap-2 px-3 py-2.5 rounded-lg cursor-pointer mb-0.5 transition-colors ${
                state.currentConvId === conv.id
                  ? 'bg-[#f5f3ff] text-[#4f46e5]'
                  : 'hover:bg-white text-[#374151]'
              }`}
            >
              <MessageSquare
                size={14}
                className="mt-0.5 shrink-0 opacity-60"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate leading-tight">
                  {conv.title}
                </p>
                <p className="text-[10px] text-[#6b7280] mt-0.5">
                  {formatDate(conv.updatedAt)}
                </p>
              </div>
              {hoveredId === conv.id && (
                <button
                  onClick={(e) => handleDelete(e, conv.id)}
                  className="shrink-0 p-1 rounded text-[#6b7280] hover:text-[#ef4444] hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
