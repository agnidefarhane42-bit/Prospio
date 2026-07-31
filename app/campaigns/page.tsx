'use client';

import React, { useState } from 'react';
import { mockCampaigns } from '@/data/mockData';
import { Campaign } from '@/types';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Play,
  Pause,
  Linkedin,
  Layers,
  Users,
  CheckCircle2,
  Edit3,
  ExternalLink,
  Zap,
  Clock,
  Check,
  X
} from 'lucide-react';

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal for new campaign
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newVisitLimit, setNewVisitLimit] = useState(20);
  const [newMessageLimit, setNewMessageLimit] = useState(10);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleStatus = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updatedStatus = c.status === 'active' ? 'paused' : 'active';
          showToast(
            `Campagne "${c.name}" ${updatedStatus === 'active' ? 'activée' : 'mise en pause'}`
          );
          return { ...c, status: updatedStatus };
        }
        return c;
      })
    );
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName) return;

    const created: Campaign = {
      id: `c_${Date.now()}`,
      name: newCampaignName,
      status: 'active',
      channel: 'linkedin',
      completedProspects: 0,
      totalProspects: 20,
      dailyVisitLimit: newVisitLimit,
      dailyMessageLimit: newMessageLimit,
      stepCount: 3,
      responseRate: 0,
      steps: [
        {
          id: `s_1`,
          stepNumber: 1,
          type: 'visit',
          title: 'Visite automatique',
          description: 'Visite du profil LinkedIn',
          delayHours: 0
        },
        {
          id: `s_2`,
          stepNumber: 2,
          type: 'connect',
          title: 'Demande de connexion',
          description: 'Envoi invitation',
          delayHours: 24
        },
        {
          id: `s_3`,
          stepNumber: 3,
          type: 'message',
          title: 'Message personnalisé',
          description: 'Premier message IA',
          delayHours: 48
        }
      ],
      prospects: []
    };

    setCampaigns((prev) => [created, ...prev]);
    setIsNewCampaignModalOpen(false);
    setNewCampaignName('');
    showToast(`Nouvelle campagne "${created.name}" créée !`);
  };

  const getStatusBadge = (status: Campaign['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Active</span>
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>En pause</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <span>Terminée</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-50 text-gray-700 border border-gray-200">
            <span>Brouillon</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 border border-slate-700 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Campagnes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Créez et automatisez vos séquences de prospection LinkedIn multi-étapes.
          </p>
        </div>
        <button
          onClick={() => setIsNewCampaignModalOpen(true)}
          className="inline-flex items-center justify-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle campagne</span>
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => {
          const progressPercent = Math.round(
            (campaign.completedProspects / (campaign.totalProspects || 1)) * 100
          );

          return (
            <div
              key={campaign.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between hover:shadow-md transition-all duration-200 group"
            >
              <div>
                {/* Top header: name + status badge */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg">
                        <Linkedin className="w-4 h-4" />
                      </div>
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-sky-600 transition-colors">
                        {campaign.name}
                      </h3>
                    </div>
                  </div>
                  {getStatusBadge(campaign.status)}
                </div>

                {/* Progress bar */}
                <div className="my-5 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center text-xs text-gray-600 font-semibold mb-2">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-sky-600" />
                      Progression
                    </span>
                    <span className="text-gray-900 font-bold">
                      {campaign.completedProspects} / {campaign.totalProspects} ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Stats & Limits */}
                <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 mb-6">
                  <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-gray-400 font-medium">Limites quotidiennes</p>
                    <p className="font-bold text-gray-900 mt-0.5">
                      {campaign.dailyVisitLimit} vis. / {campaign.dailyMessageLimit} msg.
                    </p>
                  </div>

                  <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-gray-400 font-medium">Séquence & Taux</p>
                    <p className="font-bold text-gray-900 mt-0.5">
                      {campaign.stepCount} étapes • {campaign.responseRate}% rép.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
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
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Activer</span>
                    </>
                  )}
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => router.push(`/campaigns/${campaign.id}`)}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg text-xs font-semibold border border-sky-200 transition-colors"
                  >
                    <span>Voir détails</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => router.push(`/campaigns/${campaign.id}`)}
                    title="Éditer la séquence"
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Campaign Modal */}
      {isNewCampaignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md p-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Nouvelle Campagne</h3>
              <button
                onClick={() => setIsNewCampaignModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Nom de la campagne *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Directeurs Innovation Abidjan"
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Limite quotidienne de visites ({newVisitLimit})
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={newVisitLimit}
                  onChange={(e) => setNewVisitLimit(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Limite quotidienne de messages ({newMessageLimit})
                </label>
                <input
                  type="range"
                  min="2"
                  max="25"
                  value={newMessageLimit}
                  onChange={(e) => setNewMessageLimit(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsNewCampaignModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors shadow-sm"
                >
                  Créer la campagne
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
