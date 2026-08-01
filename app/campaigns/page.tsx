'use client';

import React, { useState, useEffect } from 'react';
import { Campaign } from '@/types';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Play,
  Pause,
  Linkedin,
  Users,
  CheckCircle2,
  ExternalLink,
  Check,
  Loader2,
} from 'lucide-react';

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newVisitLimit, setNewVisitLimit] = useState(20);
  const [newMessageLimit, setNewMessageLimit] = useState(10);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // --- Fetch campaigns ---
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/campaigns');
      const data = await res.json();
      setCampaigns(data);
    } catch (e) {
      console.error('Erreur fetch campaigns:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // --- Toggle status ---
  const handleToggleStatus = async (id: number) => {
    const campaign = campaigns.find((c) => c.id === id);
    if (!campaign) return;
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';

    try {
      const res = await fetch(, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) }); if (!res.ok) throw new Error('Erreur');
      setCampaigns((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus as Campaign['status'] } : c))
      );
      showToast(`Campagne ${newStatus === 'active' ? 'activée' : 'mise en pause'}`);
    } catch {
      showToast('Erreur');
    }
  };

  // --- Create campaign ---
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          channel: 'linkedin',
          dailyVisitLimit: newVisitLimit,
          dailyMessageLimit: newMessageLimit,
          steps: [
            { order: 1, type: 'visit', channel: 'linkedin', delayDays: 0 },
            { order: 2, type: 'connect', channel: 'linkedin', delayDays: 1 },
            { order: 3, type: 'message', channel: 'linkedin', delayDays: 2 },
          ],
        }),
      });

      if (!res.ok) throw new Error('Erreur');
      const created = await res.json();
      setCampaigns((prev) => [created, ...prev]);
      setIsNewModalOpen(false);
      setNewName('');
      showToast(`Campagne "${created.name}" créée !`);
    } catch {
      showToast('Erreur lors de la création');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active</span>
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>En pause</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>Terminée</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-50 text-gray-700 border border-gray-200">
            Brouillon
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Campagnes</h1>
          <p className="text-sm text-gray-500 mt-1">Créez et automatisez vos séquences de prospection LinkedIn.</p>
        </div>
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="inline-flex items-center justify-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle campagne</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2 text-sm">Chargement...</span>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Linkedin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">Aucune campagne. Créez-en une pour commencer !</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => {
            const prospectCount = campaign.prospects?.length || 0;
            return (
              <div
                key={campaign.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg">
                        <Linkedin className="w-4 h-4" />
                      </div>
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-sky-600 transition-colors">
                        {campaign.name}
                      </h3>
                    </div>
                    {getStatusBadge(campaign.status)}
                  </div>

                  {campaign.description && (
                    <p className="text-xs text-gray-500 mb-4">{campaign.description}</p>
                  )}

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                    <div className="flex justify-between items-center text-xs text-gray-600 font-semibold mb-2">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-sky-600" />
                        Prospects
                      </span>
                      <span className="text-gray-900 font-bold">{prospectCount}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 mb-6">
                    <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-gray-400 font-medium">Limites / jour</p>
                      <p className="font-bold text-gray-900 mt-0.5">
                        {campaign.dailyVisitLimit} vis. / {campaign.dailyMessageLimit} msg.
                      </p>
                    </div>
                    <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-gray-400 font-medium">Étapes</p>
                      <p className="font-bold text-gray-900 mt-0.5">{campaign.steps?.length || 0} étapes</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleStatus(campaign.id)}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      campaign.status === 'active'
                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    {campaign.status === 'active' ? (
                      <><Pause className="w-3.5 h-3.5" /><span>Pause</span></>
                    ) : (
                      <><Play className="w-3.5 h-3.5" /><span>Activer</span></>
                    )}
                  </button>
                  <button
                    onClick={() => router.push(`/campaigns/${campaign.id}`)}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg text-xs font-semibold border border-sky-200"
                  >
                    <span>Détails</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal création */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Nouvelle campagne</h2>
              <button onClick={() => setIsNewModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">Nom de la campagne *</label>
                <input
                  type="text" required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  placeholder="ex: Fondateurs SaaS Afrique"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">Visites/jour: {newVisitLimit}</label>
                  <input type="range" min="1" max="50" value={newVisitLimit}
                    onChange={(e) => setNewVisitLimit(Number(e.target.value))}
                    className="w-full accent-sky-600" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">Messages/jour: {newMessageLimit}</label>
                  <input type="range" min="1" max="20" value={newMessageLimit}
                    onChange={(e) => setNewMessageLimit(Number(e.target.value))}
                    className="w-full accent-sky-600" />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setIsNewModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
