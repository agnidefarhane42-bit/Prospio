'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Sparkles,
  Globe,
  Save,
  Check,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        setSettings(data);
      } catch (e) {
        console.error('Erreur fetch settings:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      showToast('Paramètres sauvegardés !');
    } catch {
      showToast('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const getVal = (key: string, fallback: string) => settings[key] || fallback;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2 text-sm">Chargement des paramètres...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Paramètres</h1>
          <p className="text-sm text-gray-500 mt-1">Configurez vos limites, le persona IA et les informations de compte.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center space-x-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Enregistrement...' : 'Sauvegarder'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Sécurité LinkedIn */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-lg"><ShieldAlert className="w-5 h-5" /></div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Sécurité & Limites LinkedIn</h2>
              <p className="text-xs text-gray-500">Protégez votre compte contre les restrictions.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <label className="text-gray-700 uppercase">Visites max / jour</label>
                <span className="px-2 py-0.5 bg-sky-50 text-sky-700 font-bold rounded">
                  {getVal('dailyVisitLimit', '20')} / jour
                </span>
              </div>
              <input
                type="range" min="1" max="50"
                value={getVal('dailyVisitLimit', '20')}
                onChange={(e) => setSettings({ ...settings, dailyVisitLimit: e.target.value })}
                className="w-full accent-sky-600 cursor-pointer"
              />
              <p className="text-[11px] text-gray-400">Recommandé: 20-30 pour un compte standard.</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <label className="text-gray-700 uppercase">Messages max / jour</label>
                <span className="px-2 py-0.5 bg-sky-50 text-sky-700 font-bold rounded">
                  {getVal('dailyMessageLimit', '10')} / jour
                </span>
              </div>
              <input
                type="range" min="1" max="20"
                value={getVal('dailyMessageLimit', '10')}
                onChange={(e) => setSettings({ ...settings, dailyMessageLimit: e.target.value })}
                className="w-full accent-sky-600 cursor-pointer"
              />
              <p className="text-[11px] text-gray-400">Recommandé: 10-15 invitations quotidiennes max.</p>
            </div>
          </div>
        </div>

        {/* IA Gemini */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Sparkles className="w-5 h-5" /></div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Configuration IA Gemini</h2>
              <p className="text-xs text-gray-500">Persona et ton des messages générés.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Persona de l'expéditeur</label>
              <textarea
                rows={4}
                value={getVal('aiPersona', 'Fondateur de DocEngine et iAfriShip. Basé à Cotonou, Bénin. Passionné par la tech africaine.')}
                onChange={(e) => setSettings({ ...settings, aiPersona: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                placeholder="Décrivez votre persona..."
              />
              <p className="text-[11px] text-gray-400 mt-1">Ce persona est utilisé par Gemini pour personnaliser les messages.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Ton du message</label>
              <select
                value={getVal('aiTone', 'Amical')}
                onChange={(e) => setSettings({ ...settings, aiTone: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="Professionnel">Professionnel</option>
                <option value="Amical">Amical</option>
                <option value="Direct">Direct</option>
                <option value="Persuasif">Persuasif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Infos compte */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
            <div className="p-2 bg-gray-50 text-gray-600 rounded-lg"><Globe className="w-5 h-5" /></div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Informations de compte</h2>
              <p className="text-xs text-gray-500">Email LinkedIn et timezone.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Email LinkedIn</label>
              <input
                type="email"
                value={getVal('linkedinEmail', '')}
                onChange={(e) => setSettings({ ...settings, linkedinEmail: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                placeholder="agnide@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Timezone</label>
              <input
                type="text"
                value={getVal('timezone', 'Africa/Porto-Novo')}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                placeholder="Africa/Porto-Novo"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center space-x-2 px-6 py-3 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-xl shadow-sm"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Enregistrement...' : 'Sauvegarder les paramètres'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
