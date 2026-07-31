'use client';

import React, { useState } from 'react';
import { SettingsState } from '@/types';
import {
  ShieldAlert,
  Sparkles,
  Lock,
  Globe,
  Save,
  Check,
  Eye,
  EyeOff,
  Sliders,
  CheckCircle2,
  Key
} from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>({
    dailyVisitLimit: 20,
    dailyMessageLimit: 10,
    smartDelayMin: 2,
    smartDelayMax: 8,
    safeMode: true,
    geminiApiKey: 'AIzaSyD-MOCK_KEY_FOR_PROSPIO_2026',
    aiPersona: "Fondateur SaaS B2B spécialisé dans l'automatisation de la prospection commerciale pour les leaders tech africains.",
    aiTone: 'Professionnel',
    linkedinEmail: 'prospio.user@techafrica.io',
    linkedinPassword: '••••••••••••',
    appName: 'Prospio',
    timezone: 'Africa/Porto-Novo'
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [showLinkedinPassword, setShowLinkedinPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      setIsSaving(false);
      showToast('Paramètres sauvegardés avec succès !');
    }, 800);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Paramètres</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configurez vos limites de sécurité LinkedIn, les accès API Gemini et les identifiants.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center space-x-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Enregistrement...' : 'Sauvegarder'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. LinkedIn Safety Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Sécurité & Limites LinkedIn</h2>
              <p className="text-xs text-gray-500">
                Protégez votre compte contre les restrictions grâce à nos algorithmes de temporisation humaine.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Daily Visit Limit */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <label className="text-gray-700 uppercase">Visites de profil max par jour</label>
                <span className="px-2 py-0.5 bg-sky-50 text-sky-700 font-bold rounded">
                  {settings.dailyVisitLimit} / jour
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={settings.dailyVisitLimit}
                onChange={(e) =>
                  setSettings({ ...settings, dailyVisitLimit: Number(e.target.value) })
                }
                className="w-full accent-sky-600 cursor-pointer"
              />
              <p className="text-[11px] text-gray-400">Recommandé: 20-30 pour un compte standard.</p>
            </div>

            {/* Daily Message Limit */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <label className="text-gray-700 uppercase">Messages max par jour</label>
                <span className="px-2 py-0.5 bg-sky-50 text-sky-700 font-bold rounded">
                  {settings.dailyMessageLimit} / jour
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={settings.dailyMessageLimit}
                onChange={(e) =>
                  setSettings({ ...settings, dailyMessageLimit: Number(e.target.value) })
                }
                className="w-full accent-sky-600 cursor-pointer"
              />
              <p className="text-[11px] text-gray-400">Recommandé: 10-15 invitations quotidiennes max.</p>
            </div>
          </div>

          {/* Smart Delay Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <label className="text-gray-700 uppercase">Délai intelligent min (minutes)</label>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-800 font-bold rounded">
                  {settings.smartDelayMin} min
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                value={settings.smartDelayMin}
                onChange={(e) =>
                  setSettings({ ...settings, smartDelayMin: Number(e.target.value) })
                }
                className="w-full accent-gray-600 cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <label className="text-gray-700 uppercase">Délai intelligent max (minutes)</label>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-800 font-bold rounded">
                  {settings.smartDelayMax} min
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="30"
                value={settings.smartDelayMax}
                onChange={(e) =>
                  setSettings({ ...settings, smartDelayMax: Number(e.target.value) })
                }
                className="w-full accent-gray-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Safe Mode Toggle */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-900">Mode Sécurité Renforcé (Safe Mode)</p>
              <p className="text-xs text-gray-500">
                Interrompt automatiquement la séquence si LinkedIn détecte une activité inhabituelle.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSettings({ ...settings, safeMode: !settings.safeMode })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.safeMode ? 'bg-sky-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.safeMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 2. AI Configuration Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Configuration IA Gemini</h2>
              <p className="text-xs text-gray-500">
                Clé d'API Google Gemini et paramétrage du comportement de génération.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Gemini API Key */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Clé d'API Gemini
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={settings.geminiApiKey}
                  onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                  placeholder="AIzaSy..."
                  className="w-full pr-10 pl-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-gray-900 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Persona Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Description du Persona
              </label>
              <textarea
                rows={3}
                value={settings.aiPersona}
                onChange={(e) => setSettings({ ...settings, aiPersona: e.target.value })}
                className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-gray-900"
              />
            </div>

            {/* Tone Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Ton par défaut
              </label>
              <select
                value={settings.aiTone}
                onChange={(e) =>
                  setSettings({ ...settings, aiTone: e.target.value as SettingsState['aiTone'] })
                }
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-gray-900"
              >
                <option value="Professionnel">Professionnel</option>
                <option value="Amical">Amical</option>
                <option value="Direct">Direct</option>
                <option value="Persuasif">Persuasif</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. LinkedIn Credentials Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
            <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Identifiants LinkedIn</h2>
              <p className="text-xs text-gray-500">
                Identifiants chiffrés utilisés par le robot de visite et d'envoi.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Adresse e-mail LinkedIn
              </label>
              <input
                type="email"
                value={settings.linkedinEmail}
                onChange={(e) => setSettings({ ...settings, linkedinEmail: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Mot de passe LinkedIn
              </label>
              <div className="relative">
                <input
                  type={showLinkedinPassword ? 'text' : 'password'}
                  value={settings.linkedinPassword}
                  onChange={(e) => setSettings({ ...settings, linkedinPassword: e.target.value })}
                  className="w-full pr-10 pl-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-gray-900"
                />
                <button
                  type="button"
                  onClick={() => setShowLinkedinPassword(!showLinkedinPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showLinkedinPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4. General Settings Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Général & Fuseau Horaire</h2>
              <p className="text-xs text-gray-500">Nom de l'application et créneau horaire des campagnes.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Nom de l'application
              </label>
              <input
                type="text"
                value={settings.appName}
                onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-gray-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Fuseau Horaire
              </label>
              <select
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-gray-900"
              >
                <option value="Africa/Porto-Novo">Africa/Porto-Novo (GMT+1)</option>
                <option value="Africa/Abidjan">Africa/Abidjan (GMT)</option>
                <option value="Africa/Dakar">Africa/Dakar (GMT)</option>
                <option value="Africa/Lagos">Africa/Lagos (GMT+1)</option>
                <option value="Europe/Paris">Europe/Paris (GMT+2)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Footer */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Enregistrement en cours...' : 'Enregistrer tous les paramètres'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
