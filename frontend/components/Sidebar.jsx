'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, Pill, ClipboardList, Bell,
  BarChart2, Shield, LogOut, X, User,
} from 'lucide-react';

const patientLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/medicines', label: 'My Medicines', icon: Pill },
  { href: '/logs', label: 'Dose History', icon: ClipboardList },
  { href: '/verify', label: 'Verify Medicine', icon: Shield },
  { href: '/analytics', label: 'Reports', icon: BarChart2 },
  { href: '/notifications', label: 'Notifications', icon: Bell },
];

const doctorLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/medicines/add', label: 'Add Medicine', icon: Pill },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/notifications', label: 'Alerts', icon: Bell },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const links = user?.role === 'patient' ? patientLinks : doctorLinks;

  return (
    <>
      {/* Overlay on mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-90 md:hidden"
          onClick={onClose}
          style={{ zIndex: 99 }}
        />
      )}

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        {/* Logo */}
        <div style={{ padding: '0 24px 24px', borderBottom: '1px solid var(--clr-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--clr-primary)' }}>
                💊 MediCare
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)', marginTop: 2 }}>
                Medicine Reminder System
              </div>
            </div>
            <button className="btn btn-ghost btn-sm md:hidden" onClick={onClose} style={{ display: 'none' }} id="close-sidebar">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* User info */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--clr-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'var(--clr-primary-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--clr-primary)',
            }}>
              <User size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{user?.name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)', textTransform: 'capitalize' }}>
                {user?.role}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`nav-item ${pathname === href || pathname.startsWith(href + '/') ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon size={20} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--clr-border)' }}>
          <button
            className="btn btn-outline btn-full"
            onClick={logout}
            style={{ justifyContent: 'flex-start', gap: 10 }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
