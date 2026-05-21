'use client';
import { useState } from 'react';
import { Menu, Bell } from 'lucide-react';

export default function Topbar({ onMenuToggle, title }) {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 28,
      gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Hamburger — visible only on mobile (CSS handles it) */}
        <button
          className="btn btn-ghost btn-sm"
          onClick={onMenuToggle}
          id="menu-toggle"
          aria-label="Open menu"
          style={{ padding: 10 }}
        >
          <Menu size={24} />
        </button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--clr-text)' }}>{title}</h1>
      </div>
      <div style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>
        {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </div>
    </header>
  );
}
