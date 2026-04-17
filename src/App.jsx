import React, { Suspense, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { DataProvider } from '@/context/DataContext';

// Lazy loading pages — react-best-practices skill: Dynamic imports
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const Students = React.lazy(() => import('@/pages/Students'));
const StudentDetail = React.lazy(() => import('@/pages/StudentDetail'));

const PageLoader = () => (
  <div className="flex flex-col justify-center items-center h-full w-full gap-4">
    <div className="w-10 h-10 rounded-full border-2 border-cyan-glow/30 border-t-cyan-glow animate-spin" />
    <span className="text-text-muted text-sm font-mono">Yükleniyor...</span>
  </div>
);

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <DataProvider>
      <BrowserRouter>
        <div className="noise flex h-screen bg-obsidian font-display overflow-hidden">
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={closeSidebar}
            />
          )}

          <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <Header onToggleSidebar={toggleSidebar} />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-obsidian p-4 md:p-6">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/students" element={<Students />} />
                  <Route path="/students/:userId" element={<StudentDetail />} />
                </Routes>
              </Suspense>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </DataProvider>
  );
}

export default App;