import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import {
  Users,
  Layers,
  Sparkles,
  Settings,
  ShieldCheck,
  Mail,
  MessageSquare
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Prospio - Prospecting SaaS LinkedIn',
  description: 'SaaS d\'automatisation de la prospection LinkedIn propulsé par l\'IA Gemini',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="h-full bg-slate-50">
      <body className="h-full min-h-screen text-slate-900 bg-slate-50 antialiased flex flex-col font-sans">
        {/* Top Navbar */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/prospects" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-700 text-white flex items-center justify-center font-extrabold text-lg shadow-sm group-hover:scale-105 transition-transform">
                P
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-gray-900 flex items-center gap-1">
                  Prospio <span className="text-sky-600 font-normal text-xs bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">PRO</span>
                </span>
                <span className="text-[10px] text-gray-400 font-medium">LinkedIn & Email AI Automation</span>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                href="/prospects"
                className="flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-gray-700 hover:text-sky-600 hover:bg-sky-50 transition-colors"
              >
                <Users className="w-4 h-4 text-sky-600" />
                <span>Prospects</span>
              </Link>

              <Link
                href="/campaigns"
                className="flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-gray-700 hover:text-sky-600 hover:bg-sky-50 transition-colors"
              >
                <Layers className="w-4 h-4 text-sky-600" />
                <span>Campagnes</span>
              </Link>

              <Link
                href="/messages"
                className="flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Messages IA</span>
              </Link>

              <Link
                href="/emails"
                className="flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                <Mail className="w-4 h-4 text-emerald-600" />
                <span>Emails</span>
              </Link>

              <Link
                href="/crm"
                className="flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <span>CRM</span>
              </Link>

              <Link
                href="/settings"
                className="flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-gray-700 hover:text-sky-600 hover:bg-sky-50 transition-colors"
              >
                <Settings className="w-4 h-4 text-gray-500" />
                <span>Paramètres</span>
              </Link>
            </nav>

            {/* User Profile Quick Tag */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sécurité Active</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                AF
              </div>
            </div>
          </div>

          {/* Mobile Navigation Row */}
          <div className="md:hidden flex items-center justify-around border-t border-gray-100 bg-white py-2 px-2 overflow-x-auto">
            <Link href="/prospects" className="text-xs font-semibold text-gray-700 flex flex-col items-center gap-0.5 px-2">
              <Users className="w-4 h-4 text-sky-600" />
              <span>Prospects</span>
            </Link>
            <Link href="/campaigns" className="text-xs font-semibold text-gray-700 flex flex-col items-center gap-0.5 px-2">
              <Layers className="w-4 h-4 text-sky-600" />
              <span>Campagnes</span>
            </Link>
            <Link href="/messages" className="text-xs font-semibold text-gray-700 flex flex-col items-center gap-0.5 px-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Messages</span>
            </Link>
            <Link href="/emails" className="text-xs font-semibold text-gray-700 flex flex-col items-center gap-0.5 px-2">
              <Mail className="w-4 h-4 text-emerald-600" />
              <span>Emails</span>
            </Link>
            <Link href="/crm" className="text-xs font-semibold text-gray-700 flex flex-col items-center gap-0.5 px-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <span>CRM</span>
            </Link>
            <Link href="/settings" className="text-xs font-semibold text-gray-700 flex flex-col items-center gap-0.5 px-2">
              <Settings className="w-4 h-4 text-gray-500" />
              <span>Réglages</span>
            </Link>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
