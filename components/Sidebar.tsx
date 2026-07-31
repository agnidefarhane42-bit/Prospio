'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Zap,
  LayoutDashboard,
  Users,
  Send,
  Mail,
  Activity,
  KanbanSquare,
  Settings,
  ShieldCheck,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Prospects', href: '/prospects', icon: Users },
  { name: 'Campagnes', href: '/campagnes', icon: Send },
  { name: 'Messages', href: '/messages', icon: Mail },
  { name: 'Signaux', href: '/signaux', icon: Activity, badge: 'IA' },
  { name: 'CRM', href: '/crm', icon: KanbanSquare },
  { name: 'Paramètres', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile Hamburger Toggle Button */}
      <button
        type="button"
        onClick={toggleMobileMenu}
        aria-label="Toggle navigation menu"
        className="lg:hidden fixed top-3 left-4 z-50 p-2 rounded-lg bg-white shadow-md border border-gray-200 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0a66c2]"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-[240px] bg-white border-r border-gray-200 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & Brand Logo */}
        <div>
          <div className="h-16 px-6 flex items-center border-b border-gray-100 justify-between">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 font-bold text-xl text-gray-900 tracking-tight"
            >
              <div className="w-8 h-8 rounded-lg bg-[#0a66c2] text-white flex items-center justify-center shadow-sm">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <span className="text-gray-900">
                Prosp<span className="text-[#0a66c2]">io</span>
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <div className="px-3 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Menu Principal
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#e8f2ff] text-[#0a66c2] font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-[#0a66c2]' : 'text-gray-400 group-hover:text-gray-600'
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-[#0a66c2]/10 text-[#0a66c2]">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: LinkedIn Safety Status Indicator */}
        <div className="p-4 border-t border-gray-100">
          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3 flex items-start gap-3">
            <div className="relative flex-shrink-0 mt-0.5">
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-900 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Mode Sécurisé
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-medium">
                  Actif
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 mt-1 leading-tight">
                Limites d&apos;actions LinkedIn respectées.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
