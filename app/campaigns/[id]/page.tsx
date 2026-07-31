'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Campaign } from '@/types';
import {
  ArrowLeft,
  Play,
  Pause,
  Plus,
  Users,
  CheckCircle2,
  TrendingUp,
  Check,
  Loader2,
  Eye,
  UserPlus,
  Send,
  MessageSquare,
  Sparkles,
  Clock,
} from 'lucide-react';

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = Number(params.id);

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const res = await fetch('/api/campaigns');
        const data = await res.json();
        const found = data.find((c: Campaign) => c.id === campaignId);
        if (found) setCampaign(found);
      } catch (e) {
        console.error('Erreur fetch campaign:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [campaignId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2 text-sm">Chargement...</span>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 mb-4">Campagne introuvable</p>
        <button onClick={() => router.push('/campaigns')} className="text-sky-600 font-semibold text-sm">← Retour aux campagnes</button>
      </div>
    );
  }

  const handleToggleStatus = () => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    setCampaign({ ...campaign, status: newStatus as Campaign['status'] });
    showToast(`Campagne ${newStatus === 'active' ? 'activée' : 'mise en pause'}`);
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'visit': return <Eye className="w-5 h-5 text-sky-600" />;
      case 'connect': return <UserPlus className="w-5 h-5 text-indigo-600" />;
      case 'message': return <Send className="w-5 h-5 text-emerald-600" />;
      case 'followup': return <MessageSquare className="w-5 h-5 text-amber-600" />;
      default: return <Sparkles className="w-5 h-5 text-sky-600" />;
    }
  };

  const prospectCount = campaign.prospects?.length || 0;

  return (
    <div className="space-y-6 pb-12">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      <div>
        <button
          onClick={() => router.push('/campaigns')}
          className="inline-flex items-center space-x-2 text-sm font-semibold text-gray-500 hover:text-sky-600 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux campagnes</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
              campaign.status === 'active'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {campaign.status === 'active' ? 'Active' : 'En pause'}
            </span>
          </div>
          <button
            onClick={handleToggleStatus}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm ${
              campaign.status === 'active'
                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {campaign.status === 'active' ? (
              <><Pause className="w-4 h-4" /><span>Mettre en pause</span></>
            ) : (
              <><Play className="w-4 h-4" /><span>Activer</span></>
            )}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center space-x-4">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl"><Users className="w-6 h-6" /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Prospects</p>
            <p className="text-2xl font-bold text-gray-900">{prospectCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 className="w-6 h-6" /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Étapes</p>
            <p className="text-2xl font-bold text-gray-900">{campaign.steps?.length || 0}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><TrendingUp className="w-6 h-6" /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Limites / jour</p>
            <p className="text-2xl font-bold text-gray-900">{campaign.dailyVisitLimit} vis.</p>
          </div>
        </div>
      </div>

      {/* Séquence */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Séquence Automatisée</h2>
          <p className="text-xs text-gray-500">Les étapes d'engagement de cette campagne.</p>
        </div>

        <div className="space-y-4">
          {(campaign.steps || []).map((step, idx) => (
            <div
              key={step.id}
              className="relative p-4 bg-slate-50/70 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm font-bold text-xs text-gray-700">
                  {step.order}
                </div>
                <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm shrink-0">
                  {getStepIcon(step.type)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-gray-900 capitalize">{step.type}</h4>
                    {step.delayDays > 0 && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        +{step.delayDays} jour{step.delayDays > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {step.channel === 'linkedin' ? 'LinkedIn' : step.channel}
                    {step.template ? ` — ${step.template.substring(0, 60)}...` : ''}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prospects assignés */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Prospects assignés ({prospectCount})</h2>
        {prospectCount === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Aucun prospect assigné à cette campagne.</p>
        ) : (
          <div className="space-y-2">
            {campaign.prospects?.map((cp) => (
              <div key={cp.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{cp.prospect?.name || 'Inconnu'}</p>
                  <p className="text-xs text-gray-500">{cp.prospect?.headline || '—'}</p>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                  Étape {cp.currentStep} — {cp.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
