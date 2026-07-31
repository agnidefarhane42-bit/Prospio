'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockCampaigns, mockProspects } from '@/data/mockData';
import { Campaign, SequenceStep, Prospect } from '@/types';
import {
  ArrowLeft,
  Play,
  Pause,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Clock,
  Users,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  Eye,
  UserPlus,
  Send,
  MessageSquare,
  Check,
  Building
} from 'lucide-react';

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [steps, setSteps] = useState<SequenceStep[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Step Modal/Form state
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [newStepType, setNewStepType] = useState<SequenceStep['type']>('followup');
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepDesc, setNewStepDesc] = useState('');
  const [newStepDelay, setNewStepDelay] = useState(24);

  useEffect(() => {
    const found = mockCampaigns.find((c) => c.id === campaignId) || mockCampaigns[0];
    if (found) {
      setCampaign(found);
      setSteps(found.steps);
    }
  }, [campaignId]);

  if (!campaign) {
    return (
      <div className="p-8 text-center text-gray-500">
        Chargement de la campagne...
      </div>
    );
  }

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleStatus = () => {
    const updatedStatus = campaign.status === 'active' ? 'paused' : 'active';
    setCampaign({ ...campaign, status: updatedStatus });
    showToast(`Campagne ${updatedStatus === 'active' ? 'activée' : 'mise en pause'}`);
  };

  // Step reordering
  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === steps.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedSteps = [...steps];
    const temp = updatedSteps[index];
    updatedSteps[index] = updatedSteps[targetIndex];
    updatedSteps[targetIndex] = temp;

    // re-assign step numbers
    const renumbered = updatedSteps.map((step, idx) => ({
      ...step,
      stepNumber: idx + 1
    }));

    setSteps(renumbered);
    showToast('Ordre des étapes mis à jour');
  };

  const handleDeleteStep = (id: string) => {
    if (steps.length <= 1) {
      showToast('Une campagne doit contenir au moins une étape');
      return;
    }
    const filtered = steps.filter((s) => s.id !== id);
    const renumbered = filtered.map((step, idx) => ({
      ...step,
      stepNumber: idx + 1
    }));
    setSteps(renumbered);
    showToast('Étape supprimée');
  };

  const handleAddStepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepTitle) return;

    const newStep: SequenceStep = {
      id: `s_${Date.now()}`,
      stepNumber: steps.length + 1,
      type: newStepType,
      title: newStepTitle,
      description: newStepDesc || 'Étape personnalisée',
      delayHours: newStepDelay
    };

    setSteps([...steps, newStep]);
    setIsAddingStep(false);
    setNewStepTitle('');
    setNewStepDesc('');
    setNewStepDelay(24);
    showToast('Nouvelle étape ajoutée à la séquence');
  };

  const getStepIcon = (type: SequenceStep['type']) => {
    switch (type) {
      case 'visit':
        return <Eye className="w-5 h-5 text-sky-600" />;
      case 'connect':
        return <UserPlus className="w-5 h-5 text-indigo-600" />;
      case 'message':
        return <Send className="w-5 h-5 text-emerald-600" />;
      case 'followup':
        return <MessageSquare className="w-5 h-5 text-amber-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-sky-600" />;
    }
  };

  const assignedProspects = mockProspects.filter(
    (p) => p.campaignId === campaign.id || p.campaignId === undefined
  );

  const completionRate = Math.round(
    (campaign.completedProspects / (campaign.totalProspects || 1)) * 100
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 border border-slate-700 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Back button & Header */}
      <div>
        <button
          onClick={() => router.push('/campaigns')}
          className="inline-flex items-center space-x-2 text-sm font-semibold text-gray-500 hover:text-sky-600 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux campagnes</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{campaign.name}</h1>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                campaign.status === 'active'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {campaign.status === 'active' ? 'Active' : 'En pause'}
            </span>
          </div>

          <button
            onClick={handleToggleStatus}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
              campaign.status === 'active'
                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {campaign.status === 'active' ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Mettre en pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Activer la campagne</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center space-x-4">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Prospects Engagés</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{campaign.totalProspects}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Taux de Complétion</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{completionRate}%</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Taux de Réponse</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{campaign.responseRate}%</p>
          </div>
        </div>
      </div>

      {/* Visual Sequence Flow & Step Editor Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Séquence Automatisée</h2>
            <p className="text-xs text-gray-500">
              Définissez les étapes d'engagement et les delais d'attente entre chaque action.
            </p>
          </div>
          <button
            onClick={() => setIsAddingStep(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg text-xs font-semibold border border-sky-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une étape</span>
          </button>
        </div>

        {/* Steps Flow Timeline */}
        <div className="space-y-4">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              className="relative p-4 bg-slate-50/70 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-sky-300 hover:bg-slate-50"
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm font-bold text-xs text-gray-700">
                  {step.stepNumber}
                </div>

                <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm shrink-0">
                  {getStepIcon(step.type)}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-gray-900">{step.title}</h4>
                    {step.delayHours > 0 && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3" />
                        <span>Délai: +{step.delayHours}h</span>
                      </span>
                    )}
                    {step.delayHours === 0 && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span>Action immédiate</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                </div>
              </div>

              {/* Step Controls (Reorder & Delete) */}
              <div className="flex items-center space-x-1 self-end md:self-center">
                <button
                  onClick={() => handleMoveStep(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1.5 text-gray-500 hover:text-sky-600 disabled:opacity-30 hover:bg-white rounded-lg transition-colors"
                  title="Déplacer vers le haut"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleMoveStep(idx, 'down')}
                  disabled={idx === steps.length - 1}
                  className="p-1.5 text-gray-500 hover:text-sky-600 disabled:opacity-30 hover:bg-white rounded-lg transition-colors"
                  title="Déplacer vers le bas"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteStep(step.id)}
                  className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
                  title="Supprimer l'étape"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Step Form Inline */}
        {isAddingStep && (
          <form
            onSubmit={handleAddStepSubmit}
            className="p-4 bg-sky-50/50 border border-sky-200 rounded-xl space-y-4 animate-fade-in"
          >
            <h4 className="text-sm font-bold text-sky-900">Ajouter une nouvelle étape</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Type d'action
                </label>
                <select
                  value={newStepType}
                  onChange={(e) => setNewStepType(e.target.value as SequenceStep['type'])}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg text-gray-900"
                >
                  <option value="visit">Visite de profil</option>
                  <option value="connect">Demande de connexion</option>
                  <option value="message">Premier message</option>
                  <option value="followup">Message de relance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Titre de l'étape
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Relance J+3"
                  value={newStepTitle}
                  onChange={(e) => setNewStepTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Délai (heures après l'étape précédente)
                </label>
                <input
                  type="number"
                  min="0"
                  max="168"
                  value={newStepDelay}
                  onChange={(e) => setNewStepDelay(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Description / Instruction
              </label>
              <input
                type="text"
                placeholder="ex: Relance polie si pas de réponse"
                value={newStepDesc}
                onChange={(e) => setNewStepDesc(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg text-gray-900"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingStep(false)}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-medium bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors"
              >
                Sauvegarder l'étape
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Assigned Prospects Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Prospects Assignés</h2>
          <p className="text-xs text-gray-500">
            Aperçu des prospects intégrés dans cette campagne et leur avancement.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3">Prospect</th>
                <th className="px-4 py-3">Entreprise</th>
                <th className="px-4 py-3">Étape Actuelle</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {assignedProspects.map((prospect) => (
                <tr key={prospect.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-sky-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {prospect.avatarInitials}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-xs">{prospect.name}</p>
                        <p className="text-[11px] text-gray-500 line-clamp-1">{prospect.headline}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Building className="w-3.5 h-3.5 text-gray-400" />
                      <span>{prospect.company}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-sky-700">
                    Étape {prospect.currentCampaignStep || 1} sur {steps.length}
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-gray-600">
                    <span className="capitalize">{prospect.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
