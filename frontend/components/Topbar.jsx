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
      borderBottom: '3px solid #000000',
      paddingBottom: 18,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Hamburger — visible only on mobile */}
        <button
          className="btn btn-outline btn-sm"
          onClick={onMenuToggle}
          id="menu-toggle"
          aria-label="Open menu"
          style={{ 
            padding: 10,
            display: 'none',
            border: '2px solid #000000',
          }}
        >
          <Menu size={20} color="#000000" />
        </button>
        <style>{`@media (max-width: 768px) { #menu-toggle { display: flex !important; } }`}</style>
        <h1 style={{ 
          fontSize: '2.0rem', 
          fontWeight: 850, 
          color: '#000000',
          margin: 0,
        }}>
          {title}
        </h1>
      </div>
      
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: '1.1rem', 
        color: '#000000',
        background: '#ffffff',
        padding: '8px 16px',
        border: '3px solid #000000',
        borderRadius: '6px',
        fontWeight: 800,
        whiteSpace: 'nowrap',
      }}>
        <Calendar size={18} style={{ color: '#000000' }} />
        {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
      </div>
    </header>
  );
}
