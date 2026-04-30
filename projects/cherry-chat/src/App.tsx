import { useState } from 'react';
import { Settings } from 'lucide-react';
import { ChatProvider } from './context/ChatContext';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import SettingsPanel from './components/SettingsPanel';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ChatProvider>
      <div className="flex h-full w-full overflow-hidden">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`
            fixed inset-y-0 left-0 z-40
            transform transition-transform duration-200 ease-out
            md:relative md:transform-none md:z-auto
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <Sidebar />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          {/* Mobile top bar */}
          <div className="md:hidden flex items-center px-4 py-3 bg-white border-b border-[#e5e7eb]">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg text-[#6b7280] hover:text-[#111827] hover:bg-[#f3f4f6] transition-colors mr-3"
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-[#111827]">CherryChat</span>
            {/* Settings button always visible on mobile */}
            <button
              onClick={() => {
                setSidebarOpen(false);
                window.dispatchEvent(new CustomEvent('cherrychat:open-settings'));
              }}
              className="ml-auto p-1.5 rounded-lg text-[#6b7280] hover:text-[#111827] hover:bg-[#f3f4f6] transition-colors"
            >
              <Settings size={18} />
            </button>
          </div>

          <ChatArea />
        </div>

        <SettingsPanel />
      </div>
    </ChatProvider>
  );
}
