'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderTree,
  Palette,
  Settings,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Package, label: 'Products', href: '/dashboard/products' },
  { icon: FolderTree, label: 'Categories', href: '/dashboard/categories' },
  { icon: ShoppingCart, label: 'Orders', href: '/dashboard/orders' },
  { icon: Users, label: 'Customers', href: '/dashboard/customers' },
  { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
  { icon: Palette, label: 'Theme', href: '/dashboard/theme' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 glass border-r border-white/20 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          E-Commerce
        </h1>
        <p className="text-sm text-gray-600">Admin Dashboard</p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'nav-link',
                isActive && 'nav-link-active'
              )}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
