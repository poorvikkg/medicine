'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, Pill, Shield, BarChart2, Bell, Users, User } from 'lucide-react';

const patientLinks = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/medicines', label: 'Meds', icon: Pill },
  { href: '/verify', label: 'Verify', icon: Shield },
  { href: '/analytics', label: 'Reports', icon: BarChart2 },
  { href: '/profile', label: 'Profile', icon: User },
];

const staffLinks = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/patients', label: 'Patients', icon: Users },
  { href: '/medicines/add', label: 'Add Med', icon: Pill },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const links = user?.role === 'patient' ? patientLinks : staffLinks;

  if (!user) return null;

  return (
    <nav className="mobile-nav" style={{ background: '#ffffff', borderTop: '3px solid #000000', padding: '12px 0' }}>
      {links.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            style={{
              color: '#000000',
              fontWeight: isActive ? '900' : 'bold',
              textDecoration: isActive ? 'underline' : 'none',
              fontSize: '0.9rem',
            }}
          >
            <Icon size={24} color="#000000" strokeWidth={isActive ? 3.0 : 2.0} />
            <span>{label.toUpperCase()}</span>
          </Link>
        );
      })}
    </nav>
  );
}
