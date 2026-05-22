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
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 99 }}
        />
      )}

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--clr-border)' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--clr-primary)', letterSpacing: '-0.02em' }}>
            MediCare
          </div>
        </div>

        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--clr-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--clr-primary-lt)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--clr-primary)', flexShrink: 0,
            }}>
              <User size={17} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.3 }}>{user?.name}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--clr-subtle)', textTransform: 'capitalize' }}>
                {user?.role}
              </div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`nav-item ${pathname === href || pathname.startsWith(href + '/') ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon size={17} strokeWidth={2} />
              {label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--clr-border)' }}>
          <button
            className="btn btn-ghost btn-full"
            onClick={logout}
            style={{ justifyContent: 'flex-start', gap: 8, color: 'var(--clr-danger)', padding: '9px 0' }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
