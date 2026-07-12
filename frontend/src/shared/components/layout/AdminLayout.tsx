import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import PageView from '../core/PageView';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[15px] leading-normal antialiased text-left text-gray-900">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/25 backdrop-blur-[2px] z-40 lg:hidden transition-opacity duration-200"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden
        />
      )}

      <div
        className={`
                fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-out lg:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
      >
        <Sidebar
          onClose={() => setIsSidebarOpen(false)}
          collapsed={sidebarCollapsed}
        />
      </div>

      <div
        className={`flex flex-col min-h-screen transition-[padding] duration-300 ease-out ${
          sidebarCollapsed ? 'lg:pl-14' : 'lg:pl-56'
        }`}
      >
        <Topbar
          onMenuClick={() => setIsSidebarOpen(true)}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebarCollapsed={() => setSidebarCollapsed((c) => !c)}
        />

        <main className="flex-1 mt-14 sm:mt-14 px-2 py-3 sm:px-3 sm:py-3 lg:px-4 lg:py-4">
          <div className="max-w-[min(100%,90rem)] mx-auto w-full animate-in fade-in duration-500">
            <PageView>
              <Outlet />
            </PageView>
          </div>
        </main>

       
      </div>
    </div>
  );
}
