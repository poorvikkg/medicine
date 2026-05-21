'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Pill, Shield, BarChart2, Bell } from 'lucide-react';

const links = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/medicines', label: 'Medicines', icon: Pill },
  { href: '/verify', label: 'Verify', icon: Shield },
  { href: '/analytics', label: 'Reports', icon: BarChart2 },
  { href: '/notifications', label: 'Alerts', icon: Bell },
];

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="mobile-nav">
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={`mobile-nav-item ${pathname.startsWith(href) ? 'active' : ''}`}
        >
          <Icon size={22} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
