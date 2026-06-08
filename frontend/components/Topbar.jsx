'use client';
import { useState } from 'react';
import { Menu, Bell, Calendar } from 'lucide-react';

export default function Topbar({ onMenuToggle, title }) {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 32,
      gap: 16,
      borderBottom: '1px solid var(--clr-border)',
      paddingBottom: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Hamburger — visible only on mobile */}
        <button
          className="btn btn-outline btn-sm"
          onClick={onMenuToggle}
          id="menu-toggle"
          aria-label="Open menu"
          style={{ 
            padding: 8,
            display: 'none',
          }}
        >
          <Menu size={18} />
        </button>
        <style>{`@media (max-width: 768px) { #menu-toggle { display: flex !important; } }`}</style>
        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 600, 
          margin: 0,
        }}>
          {title}
        </h1>
      </div>
      
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: '0.85rem', 
        color: 'var(--clr-muted)',
        background: 'var(--clr-surface-2)',
        padding: '6px 12px',
        border: '1px solid var(--clr-border)',
        borderRadius: 'var(--radius-sm)',
        fontWeight: 500,
        whiteSpace: 'nowrap',
      }}>
        <Calendar size={14} />
        {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
      </div>
    </header>
  );
}
