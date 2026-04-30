import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Clock } from 'lucide-react';
import { useChatContext } from '../context/ChatContext';

const ALL_MODELS = [
  'claude-opus-4-7',
  'claude-sonnet-4-6',
  'claude-haiku-4-5-20251001',
  'claude-opus-4-5',
  'claude-sonnet-4-5',
  'claude-haiku-4-5',
  'claude-3-5-sonnet-20241022',
  'claude-3-5-haiku-20241022',
  'claude-3-opus-20240229',
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4-turbo',
  'gpt-3.5-turbo',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
];

export default function ModelSelector() {
  const { state, dispatch, currentConversation } = useChatContext();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const currentModel =
    currentConversation?.model ?? state.config.model;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = ALL_MODELS.filter((m) =>
    m.toLowerCase().includes(search.toLowerCase())
  );

  const recents = state.recentModels.filter((m) =>
    m.toLowerCase().includes(search.toLowerCase())
  );

  function select(model: string) {
    dispatch({ type: 'SET_MODEL', payload: model });
    setOpen(false);
    setSearch('');
  }

  function shortName(model: string): string {
    return model.length > 24 ? model.slice(0, 22) + '…' : model;
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#374151] bg-white border border-[#e5e7eb] rounded-lg hover:border-[#4f46e5] hover:text-[#4f46e5] transition-colors"
      >
        <span>{shortName(currentModel)}</span>
        <ChevronDown size={12} className={open ? 'rotate-180' : ''} style={{ transition: 'transform 0.15s' }} />
      </button>

      {open && (
        <div className="absolute top-full mt-1 right-0 w-64 bg-white border border-[#e5e7eb] rounded-xl shadow-lg z-40 overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-[#e5e7eb]">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6b7280]" />
              <input
                autoFocus
                type="text"
                placeholder="Search models..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 text-xs border border-[#e5e7eb] rounded-lg outline-none focus:border-[#4f46e5]"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {/* Recent */}
            {recents.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold text-[#6b7280] uppercase tracking-wide">
                  <Clock size={10} />
                  Recent
                </div>
                {recents.map((m) => (
                  <ModelOption
                    key={`recent-${m}`}
                    model={m}
                    active={m === currentModel}
                    onSelect={select}
                  />
                ))}
                <div className="border-t border-[#e5e7eb] my-1" />
              </div>
            )}

            {/* All */}
            <div className="px-3 py-1.5 text-[10px] font-semibold text-[#6b7280] uppercase tracking-wide">
              All Models
            </div>
            {filtered.map((m) => (
              <ModelOption
                key={m}
                model={m}
                active={m === currentModel}
                onSelect={select}
              />
            ))}
            {filtered.length === 0 && (
              <p className="text-xs text-[#6b7280] text-center py-3">
                No models found
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ModelOption({
  model,
  active,
  onSelect,
}: {
  model: string;
  active: boolean;
  onSelect: (m: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(model)}
      className={`w-full text-left px-3 py-2 text-xs transition-colors ${
        active
          ? 'bg-[#f5f3ff] text-[#4f46e5] font-medium'
          : 'text-[#374151] hover:bg-[#f9fafb]'
      }`}
    >
      {model}
    </button>
  );
}
