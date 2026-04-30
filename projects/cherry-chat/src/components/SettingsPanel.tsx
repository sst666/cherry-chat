import { useState } from 'react';
import { X, Eye, EyeOff, CheckCircle, AlertCircle, RefreshCw, Star } from 'lucide-react';
import { useChatContext } from '../context/ChatContext';
import type { ApiConfig } from '../types';

export default function SettingsPanel() {
  const { state, dispatch, fetchModels } = useChatContext();
  const [form, setForm] = useState<ApiConfig>({ ...state.config });
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [testMsg, setTestMsg] = useState('');

  if (!state.settingsOpen) return null;

  function handleSave() {
    dispatch({ type: 'SET_CONFIG', payload: form });
    dispatch({ type: 'TOGGLE_SETTINGS' });
  }

  async function handleTest() {
    setTestStatus('loading');
    setTestMsg('');
    try {
      const endpoint = form.endpoint.replace(/\/$/, '');
      const res = await fetch(`${endpoint}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${form.apiKey}`,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: form.model,
          max_tokens: 16,
          messages: [{ role: 'user', content: 'Hi' }],
        }),
      });
      if (res.ok) {
        setTestStatus('ok');
        setTestMsg('连接成功！');
      } else {
        setTestStatus('error');
        setTestMsg(`错误 ${res.status}`);
      }
    } catch (err) {
      setTestStatus('error');
      setTestMsg(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleFetchModels() {
    if (!form.apiKey || !form.endpoint) {
      setTestMsg('请先填写 API 地址和 Key');
      setTestStatus('error');
      return;
    }
    setTestStatus('loading');
    setTestMsg('获取中...');
    try {
      dispatch({ type: 'SET_CONFIG', payload: form });
      const list = await fetchModels(form.endpoint, form.apiKey);
      setTestStatus('ok');
      setTestMsg(`模型已同步 (${list.length}个)`);
    } catch {
      setTestStatus('error');
      setTestMsg('获取模型列表失败');
    }
  }

  const isFavorite = state.favoriteModels.includes(form.model);
  const allModelOptions = [
    ...state.favoriteModels,
    ...state.models.filter((m) => !state.favoriteModels.includes(m)),
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget)
          dispatch({ type: 'TOGGLE_SETTINGS' });
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb]">
          <h2 className="text-base font-semibold text-[#111827]">API 设置</h2>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
            className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#111827] hover:bg-[#f3f4f6] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Endpoint */}
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1.5">
              API 地址
            </label>
            <input
              type="url"
              value={form.endpoint}
              onChange={(e) =>
                setForm((f) => ({ ...f, endpoint: e.target.value }))
              }
              placeholder="https://api.bywlai.cn"
              className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] rounded-xl outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all"
            />
          </div>

          {/* API Key */}
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1.5">
              API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={form.apiKey}
                onChange={(e) =>
                  setForm((f) => ({ ...f, apiKey: e.target.value }))
                }
                placeholder="sk-..."
                className="w-full px-3 py-2.5 pr-10 text-sm border border-[#e5e7eb] rounded-xl outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-[#111827]"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Default Model — dropdown with favorites */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[#374151]">
                默认模型
              </label>
              <button
                type="button"
                onClick={() =>
                  dispatch({ type: 'TOGGLE_FAVORITE_MODEL', payload: form.model })
                }
                className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-colors ${
                  isFavorite
                    ? 'text-amber-600 bg-amber-50'
                    : 'text-[#9ca3af] hover:text-amber-500'
                }`}
              >
                <Star
                  size={12}
                  fill={isFavorite ? 'currentColor' : 'none'}
                />
                {isFavorite ? '已添加常用' : '加入常用'}
              </button>
            </div>

            {state.models.length > 0 ? (
              <select
                value={form.model}
                onChange={(e) =>
                  setForm((f) => ({ ...f, model: e.target.value }))
                }
                className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] rounded-xl outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all bg-white"
              >
                {allModelOptions.map((m) => (
                  <option key={m} value={m}>
                    {state.favoriteModels.includes(m) ? '⭐ ' : ''}
                    {m}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={form.model}
                onChange={(e) =>
                  setForm((f) => ({ ...f, model: e.target.value }))
                }
                placeholder="claude-sonnet-4-6"
                className="w-full px-3 py-2.5 text-sm border border-[#e5e7eb] rounded-xl outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all"
              />
            )}
          </div>

          {/* Test result */}
          {testStatus !== 'idle' && (
            <div
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm ${
                testStatus === 'ok'
                  ? 'bg-green-50 text-green-700'
                  : testStatus === 'error'
                  ? 'bg-red-50 text-red-700'
                  : 'bg-[#f5f3ff] text-[#4f46e5]'
              }`}
            >
              {testStatus === 'ok' && (
                <CheckCircle size={16} className="shrink-0" />
              )}
              {testStatus === 'error' && (
                <AlertCircle size={16} className="shrink-0" />
              )}
              {testStatus === 'loading' && (
                <RefreshCw size={16} className="shrink-0 animate-spin" />
              )}
              <span className="text-xs">{testMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#e5e7eb] bg-[#f9fafb]">
          <button
            onClick={handleFetchModels}
            disabled={testStatus === 'loading'}
            className="px-4 py-2 text-xs font-medium text-[#4f46e5] border border-[#4f46e5] rounded-xl hover:bg-[#f5f3ff] transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            <RefreshCw
              size={13}
              className={testStatus === 'loading' ? 'animate-spin' : ''}
            />
            获取模型列表
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => dispatch({ type: 'TOGGLE_SETTINGS' })}
              className="px-4 py-2 text-sm font-medium text-[#6b7280] hover:text-[#111827] transition-colors"
            >
              取消
            </button>
            <button
              onClick={() => {
                handleTest();
                handleSave();
              }}
              className="px-5 py-2 text-sm font-medium text-white rounded-xl transition-colors"
              style={{ background: '#4f46e5' }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = '#4338ca')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = '#4f46e5')
              }
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
