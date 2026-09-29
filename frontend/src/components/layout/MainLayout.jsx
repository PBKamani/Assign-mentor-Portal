import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-color)' }}>
      <Navbar onToggleSidebar={() => setSidebarOpen(prev => !prev)} />

      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main
          style={{
            flex: 1,
            padding: '2rem 1.5rem',
            maxWidth: '1200px',
            margin: '0 auto',
            width: '100%',
            overflowX: 'hidden'
          }}
        >
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .assignmentor-sidebar {
            position: fixed !important;
            top: 65px !important;
            bottom: 0 !important;
            left: 0 !important;
            transform: translateX(-100%);
            box-shadow: 10px 0 25px rgba(0,0,0,0.2) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MainLayout;
