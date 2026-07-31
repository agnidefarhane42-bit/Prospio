'use client';

import React, { useState } from 'react';
import {
  Search,
  Plus,
  Bell,
  Linkedin,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left section spacer for mobile hamburger / Brand alignment */}
      <div className="flex items-center gap-3 lg:w-48">
        {/* On mobile, spacing for sidebar hamburger */}
        <div className="w-8 lg:hidden" />
        <div className="hidden sm:flex items-center gap-2 bg-blue-50/80 border border-blue-200/60 rounded-full px-3 py-1">
          <Linkedin className="w-3.5 h-3.5 text-[#0a66c2] fill-current" />
          <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            LinkedIn Connecté
          </span>
        </div>
      </div>

      {/* Centered Search Bar */}
      <div className="flex-1 max-w-md mx-auto">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher des prospects, campagnes, messages..."
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-xs sm:text-sm rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#0a66c2]/20 focus:border-[#0a66c2] transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Right Section: Quick actions, Notifications, Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Quick Action Button Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="inline-flex items-center gap-1.5 bg-[#0a66c2] hover:bg-[#004182] text-white font-medium text-xs sm:text-sm px-3.5 py-2 rounded-lg shadow-sm transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouveau</span>
          </button>

          {showQuickActions && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              onMouseLeave={() => setShowQuickActions(false)}
            >
              <button
                type="button"
                className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#0a66c2]" />
                Nouvelle campagne IA
              </button>
              <button
                type="button"
                className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <User className="w-3.5 h-3.5 text-gray-500" />
                Ajouter un prospect
              </button>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#0a66c2] text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-blue-100">
              F
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-gray-800 leading-none">
                Farhane
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5">
                Pro Plan
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden md:block" />
          </button>

          {showProfileMenu && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 divide-y divide-gray-100"
              onMouseLeave={() => setShowProfileMenu(false)}
            >
              <div className="px-4 py-3">
                <p className="text-xs font-semibold text-gray-900">Farhane</p>
                <p className="text-xs text-gray-500 truncate">farhane@prospio.io</p>
              </div>
              <div className="py-1">
                <a
                  href="/settings"
                  className="px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Settings className="w-3.5 h-3.5 text-gray-400" />
                  Paramètres du compte
                </a>
              </div>
              <div className="py-1">
                <button
                  type="button"
                  className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
