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
            background: 'rgba(5, 7, 15, 0.6)', 
            backdropFilter: 'blur(4px)',
            zIndex: 99 
          }}
        />
      )}

      <aside className={`sidebar ${open ? 'open' : ''}`} style={{ borderRight: '3px solid #000000', background: '#ffffff' }}>
        {/* Brand Logo Header */}
        <div style={{ padding: '24px', borderBottom: '3px solid #000000' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: '4px',
              background: '#ffffff',
              border: '2.5px solid #000000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Pill size={20} color="#000000" />
            </div>
            <div style={{ 
              fontSize: '1.6rem', 
              fontWeight: 900, 
              color: '#000000',
              letterSpacing: '-0.02em',
            }}>
              MediCare
            </div>
          </div>
        </div>

        {/* Logged in User Section */}
        <div style={{ padding: '20px 24px', borderBottom: '3px solid #000000' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: '#ffffff',
              border: '2.5px solid #000000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#000000', flexShrink: 0,
            }}>
              <User size={22} color="#000000" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#000000', lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </div>
              <div style={{ 
                fontSize: '0.85rem', 
                color: '#000000', 
                textTransform: 'uppercase',
                fontWeight: 900,
                letterSpacing: '0.05em',
                marginTop: 2
              }}>
                {user?.role}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`nav-item ${pathname === href || pathname.startsWith(href + '/') ? 'active' : ''}`}
              onClick={onClose}
              style={{
                fontSize: '1.15rem',
                fontWeight: 'bold',
                color: '#000000',
              }}
            >
              <Icon size={20} strokeWidth={2.5} color="#000000" />
              {label.toUpperCase()}
            </Link>
          ))}
        </nav>

        {/* Logout Bottom Section */}
        <div style={{ padding: '16px 24px', borderTop: '3px solid #000000' }}>
          <button
            className="btn btn-outline btn-full"
            onClick={logout}
            style={{ 
              justifyContent: 'center', 
              gap: 10, 
              color: '#000000', 
              padding: '12px',
            }}
          >
            <LogOut size={20} strokeWidth={2.5} color="#000000" />
            SIGN OUT
          </button>
        </div>
      </aside>
    </>
  );
}
