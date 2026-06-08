'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, Pill, ClipboardList, Bell,
  BarChart2, Shield, LogOut, User, Users,
} from 'lucide-react';

const patientLinks = [
  { href: '/dashboard',      label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/medicines',      label: 'My Medicines', icon: Pill },
  { href: '/logs',           label: 'Dose History', icon: ClipboardList },
  { href: '/verify',         label: 'Verify',       icon: Shield },
  { href: '/analytics',      label: 'Reports',      icon: BarChart2 },
  { href: '/notifications',  label: 'Notifications',icon: Bell },
  { href: '/profile',        label: 'My Profile',   icon: User },
];

const staffLinks = [
  { href: '/dashboard',      label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/patients',       label: 'Patients',     icon: Users },
  { href: '/medicines/add',  label: 'Add Medicine', icon: Pill },
  { href: '/analytics',      label: 'Analytics',    icon: BarChart2 },
  { href: '/notifications',  label: 'Alerts',       icon: Bell },
  { href: '/profile',        label: 'My Profile',   icon: User },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const links = user?.role === 'patient' ? patientLinks : staffLinks;

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          style={{ 
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(0, 0, 0, 0.5)', 
            zIndex: 99 
          }}
        />
      )}

      <aside className={`sidebar ${open ? 'open' : ''}`} style={{ background: 'var(--clr-surface)' }}>
        {/* Brand Logo Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--clr-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 'var(--radius-sm)',
              background: 'var(--clr-primary-lt)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Pill size={16} color="var(--clr-primary)" />
            </div>
            <div style={{ 
              fontSize: '1.25rem', 
              fontWeight: 600, 
              color: 'var(--clr-text)',
              letterSpacing: '-0.01em',
            }}>
              MediCare
            </div>
          </div>
        </div>

        {/* Logged in User Section */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--clr-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--clr-primary-lt)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--clr-primary)', flexShrink: 0,
            }}>
              <User size={18} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--clr-text)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </div>
              <div style={{ 
                fontSize: '0.75rem', 
                color: 'var(--clr-muted)', 
                textTransform: 'uppercase',
                fontWeight: 500,
                letterSpacing: '0.05em',
                marginTop: 2
              }}>
                {user?.role}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`nav-item ${pathname === href || pathname.startsWith(href + '/') ? 'active' : ''}`}
              onClick={onClose}
              style={{
                fontSize: '0.92rem',
                color: 'var(--clr-text)',
              }}
            >
              <Icon size={18} color="currentColor" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Logout Bottom Section */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--clr-border)' }}>
          <button
            className="btn btn-outline btn-full btn-sm"
            onClick={logout}
            style={{ 
              justifyContent: 'center', 
              gap: 8, 
            }}
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
