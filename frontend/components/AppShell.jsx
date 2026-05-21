'use client';
import { useState } from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import Topbar from './Topbar';

export default function AppShell({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content fade-in">
        <Topbar title={title} onMenuToggle={() => setSidebarOpen(true)} />
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
