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
    <nav className="mobile-nav">
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={`mobile-nav-item ${pathname === href || (href !== '/dashboard' && pathname.startsWith(href)) ? 'active' : ''}`}
        >
          <Icon size={20} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
