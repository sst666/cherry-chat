import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Star, Clock } from 'lucide-react';
import { useChatContext } from '../context/ChatContext';

export default function ModelSelector() {
  const { state, dispatch, currentConversation } = useChatContext();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const currentModel = currentConversation?.model ?? state.config.model;

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

  function select(model: string) {
    dispatch({ type: 'SET_MODEL', payload: model });
    dispatch({ type: 'ADD_RECENT_MODEL', payload: model });
    setOpen(false);
    setSearch('');
  }

  function toggleFavorite(e: React.MouseEvent, model: string) {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_FAVORITE_MODEL', payload: model });
  }

  const q = search.toLowerCase();

  const favoriteFiltered = state.favoriteModels.filter((m) =>
    m.toLowerCase().includes(q)
  );
  const recentFiltered = state.recentModels
    .filter((m) => !state.favoriteModels.includes(m))
    .filter((m) => m.toLowerCase().includes(q));
  const allFiltered = state.models
    .filter((m) => !state.favoriteModels.includes(m))
    .filter((m) => !state.recentModels.includes(m))
    .filter((m) => m.toLowerCase().includes(q));

  function shortName(model: string): string {
    return model.length > 22 ? model.slice(0, 20) + '…' : model;
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#374151] bg-white border border-[#e5e7eb] rounded-lg hover:border-[#4f46e5] hover:text-[#4f46e5] transition-colors"
      >
        <span>{shortName(currentModel)}</span>
        <ChevronDown
          size={12}
          className={open ? 'rotate-180' : ''}
          style={{ transition: 'transform 0.15s' }}
        />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 right-0 sm:left-auto sm:w-72 w-full bg-white border border-[#e5e7eb] rounded-xl shadow-lg z-40 overflow-hidden max-h-[60vh] sm:max-h-72 overflow-y-auto">
          {/* Search */}
          <div className="p-2 border-b border-[#e5e7eb]">
            <div className="relative">
              <Search
                size={12}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6b7280]"
              />
              <input
                type="text"
                placeholder="搜索模型..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 text-sm border border-[#e5e7eb] rounded-lg outline-none focus:border-[#4f46e5]"
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {/* Favorites */}
            {favoriteFiltered.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold text-[#d97706] uppercase tracking-wide">
                  <Star size={10} />
                  常用模型
                </div>
                {favoriteFiltered.map((m) => (
                  <ModelOption
                    key={`fav-${m}`}
                    model={m}
                    active={m === currentModel}
                    onSelect={select}
                    starred
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
                <div className="border-t border-[#e5e7eb] my-1" />
              </div>
            )}

            {/* Recent */}
            {state.recentModels.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold text-[#6b7280] uppercase tracking-wide">
                  <Clock size={10} />
                  最近使用
                </div>
                {recentFiltered.slice(0, 8).map((m) => (
                  <ModelOption
                    key={`recent-${m}`}
                    model={m}
                    active={m === currentModel}
                    onSelect={select}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
                <div className="border-t border-[#e5e7eb] my-1" />
              </div>
            )}

            {/* All models */}
            {allFiltered.length > 0 && (
              <div>
                <div className="px-3 py-1.5 text-[10px] font-semibold text-[#6b7280] uppercase tracking-wide">
                  所有模型
                </div>
                {allFiltered.map((m) => (
                  <ModelOption
                    key={m}
                    model={m}
                    active={m === currentModel}
                    onSelect={select}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            )}

            {favoriteFiltered.length === 0 &&
              recentFiltered.length === 0 &&
              allFiltered.length === 0 && (
                <p className="text-xs text-[#6b7280] text-center py-4">
                  未找到模型，请先在设置中同步模型列表
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
  starred,
  onToggleFavorite,
}: {
  model: string;
  active: boolean;
  onSelect: (m: string) => void;
  starred?: boolean;
  onToggleFavorite?: (e: React.MouseEvent, model: string) => void;
}) {
  return (
    <div className="flex items-center">
      <button
        onClick={() => onSelect(model)}
        className={`flex-1 text-left px-3 py-2 text-xs transition-colors ${
          active
            ? 'bg-[#f5f3ff] text-[#4f46e5] font-medium'
            : 'text-[#374151] hover:bg-[#f9fafb]'
        }`}
      >
        {model}
      </button>
      {onToggleFavorite && (
        <button
          onClick={(e) => onToggleFavorite(e, model)}
          className={`px-2 py-2 shrink-0 transition-colors ${
            starred
              ? 'text-amber-500'
              : 'text-[#d1d5db] hover:text-amber-400'
          }`}
          title={starred ? '取消常用' : '加入常用'}
        >
          <Star size={12} fill={starred ? 'currentColor' : 'none'} />
        </button>
      )}
    </div>
  );
}
