'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Campaign, Step } from '@/types';
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
  Linkedin,
  Mail,
  Trash2,
  Layers,
} from 'lucide-react';

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = Number(params.id);

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- Form state pour nouvelle étape ---
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [stepChannel, setStepChannel] = useState<'linkedin' | 'email'>('linkedin');
  const [stepType, setStepType] = useState<string>('message');
  const [stepDelayDays, setStepDelayDays] = useState<number>(1);
  const [stepTemplate, setStepTemplate] = useState<string>('');
  const [stepEmailSubject, setStepEmailSubject] = useState<string>('');
  const [stepEmailBody, setStepEmailBody] = useState<string>('');
  const [submittingStep, setSubmittingStep] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchCampaign = async () => {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`);
      if (!res.ok) {
        // Fallback sur /api/campaigns si besoin
        const resAll = await fetch('/api/campaigns');
        const dataAll = await resAll.json();
        const found = dataAll.find((c: Campaign) => c.id === campaignId);
        if (found) setCampaign(found);
        return;
      }
      const data = await res.json();
      setCampaign(data);
    } catch (e) {
      console.error('Erreur fetch campaign:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
  }, [campaignId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2 text-sm">Chargement de la campagne...</span>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 mb-4">Campagne introuvable</p>
        <button onClick={() => router.push('/campaigns')} className="text-sky-600 font-semibold text-sm hover:underline">
          ← Retour aux campagnes
        </button>
      </div>
    );
  }

  const handleToggleStatus = async () => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setCampaign({ ...campaign, status: newStatus as Campaign['status'] });
        showToast(`Campagne ${newStatus === 'active' ? 'activée' : 'mise en pause'}`);
      }
    } catch {
      showToast('Erreur lors du changement de statut');
    }
  };

  const handleAddStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingStep(true);

    try {
      const payload = {
        channel: stepChannel,
        type: stepChannel === 'email' ? 'email' : stepType,
        delayDays: Number(stepDelayDays),
        template: stepTemplate || null,
        emailSubject: stepChannel === 'email' ? stepEmailSubject : null,
        emailBody: stepChannel === 'email' ? stepEmailBody : null,
      };

      const res = await fetch(`/api/campaigns/${campaignId}/steps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Erreur');

      showToast('Étape ajoutée avec succès !');
      // Réinitialiser formulaire
      setStepTemplate('');
      setStepEmailSubject('');
      setStepEmailBody('');
      setIsAddingStep(false);
      await fetchCampaign();
    } catch {
      showToast("Erreur lors de l'ajout de l'étape");
    } finally {
      setSubmittingStep(false);
    }
  };

  const handleDeleteStep = async (stepId: number) => {
    if (!confirm('Voulez-vous vraiment supprimer cette étape ?')) return;

    try {
      const res = await fetch(`/api/campaigns/${campaignId}/steps?stepId=${stepId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Erreur');
      showToast('Étape supprimée');
      await fetchCampaign();
    } catch {
      showToast('Erreur lors de la suppression');
    }
  };

  const getStepIcon = (step: Step) => {
    if (step.channel === 'email' || step.type === 'email') {
      return <Mail className="w-5 h-5 text-emerald-600" />;
    }
    switch (step.type) {
      case 'visit':
        return <Eye className="w-5 h-5 text-sky-600" />;
      case 'connect':
        return <UserPlus className="w-5 h-5 text-indigo-600" />;
      case 'message':
        return <Send className="w-5 h-5 text-sky-600" />;
      case 'followup':
        return <MessageSquare className="w-5 h-5 text-amber-600" />;
      default:
        return <Linkedin className="w-5 h-5 text-sky-600" />;
    }
  };

  const prospectCount = campaign.prospects?.length || 0;
  const steps = campaign.steps || [];

  // Vérifier si la campagne est multichannel
  const hasLinkedin = steps.some((s) => s.channel?.toLowerCase() === 'linkedin') || campaign.channel?.toLowerCase() === 'linkedin';
  const hasEmail = steps.some((s) => s.channel?.toLowerCase() === 'email') || campaign.channel?.toLowerCase() === 'email';
  const isMultichannel = hasLinkedin && hasEmail;

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
          className="inline-flex items-center space-x-2 text-sm font-semibold text-gray-500 hover:text-sky-600 mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux campagnes</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center flex-wrap gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                campaign.status === 'active'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {campaign.status === 'active' ? 'Active' : 'En pause'}
            </span>

            {isMultichannel ? (
              <span className="inline-flex items-center space-x-1 px-3 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Multichannel</span>
              </span>
            ) : hasEmail ? (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Mail className="w-3.5 h-3.5" />
                <span>Email</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                <Linkedin className="w-3.5 h-3.5" />
                <span>LinkedIn</span>
              </span>
            )}
          </div>

          <button
            onClick={handleToggleStatus}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-colors ${
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
                <span>Activer</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center space-x-4">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Prospects ciblés</p>
            <p className="text-2xl font-bold text-gray-900">{prospectCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Étapes dans la séquence</p>
            <p className="text-2xl font-bold text-gray-900">{steps.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Limites quotidiennes</p>
            <p className="text-2xl font-bold text-gray-900">{campaign.dailyVisitLimit} vis. / {campaign.dailyMessageLimit} msg.</p>
          </div>
        </div>
      </div>

      {/* Timeline Séquence Multichannel */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <Layers className="w-5 h-5 text-sky-600" />
              <span>Séquence d’engagement</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Enchaînement chronologique des actions automatisées (LinkedIn & Email).
            </p>
          </div>

          <button
            onClick={() => setIsAddingStep(!isAddingStep)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-sm active:scale-95 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{isAddingStep ? 'Masquer le formulaire' : 'Ajouter une étape'}</span>
          </button>
        </div>

        {/* Formulaire ajout nouvelle étape */}
        {isAddingStep && (
          <form onSubmit={handleAddStep} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
              <Plus className="w-4 h-4 text-sky-600" />
              <span>Créer une nouvelle étape dans la séquence</span>
            </h3>

            {/* Choix du canal (LinkedIn vs Email) */}
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase block mb-2">Canal d’action *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStepChannel('linkedin');
                    setStepType('message');
                  }}
                  className={`flex items-center justify-center space-x-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                    stepChannel === 'linkedin'
                      ? 'bg-sky-50 text-sky-800 border-sky-500 ring-2 ring-sky-500/20'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Linkedin className="w-4 h-4 text-sky-600" />
                  <span>LinkedIn</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStepChannel('email');
                    setStepType('email');
                  }}
                  className={`flex items-center justify-center space-x-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                    stepChannel === 'email'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Mail className="w-4 h-4 text-emerald-600" />
                  <span>Email</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type d'action si LinkedIn */}
              {stepChannel === 'linkedin' && (
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase block mb-1">Action LinkedIn</label>
                  <select
                    value={stepType}
                    onChange={(e) => setStepType(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  >
                    <option value="visit">Visite du profil</option>
                    <option value="connect">Demande de connexion</option>
                    <option value="message">Message direct</option>
                    <option value="followup">Message de relance</option>
                  </select>
                </div>
              )}

              {/* Délai d'attente */}
              <div className={stepChannel === 'email' ? 'md:col-span-2' : ''}>
                <label className="text-xs font-semibold text-gray-600 uppercase block mb-1">
                  Délai après l’étape précédente (jours)
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={stepDelayDays}
                  onChange={(e) => setStepDelayDays(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>

            {/* Champs spécifiques Email */}
            {stepChannel === 'email' ? (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase block mb-1">Objet de l’email *</label>
                  <input
                    type="text"
                    required
                    value={stepEmailSubject}
                    onChange={(e) => setStepEmailSubject(e.target.value)}
                    placeholder="ex: Proposition de collaboration pour {{company}}"
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase block mb-1">Corps de l’email *</label>
                  <textarea
                    rows={4}
                    required
                    value={stepEmailBody}
                    onChange={(e) => setStepEmailBody(e.target.value)}
                    placeholder="Bonjour {{firstName}},&#10;&#10;J'ai remarqué votre travail chez {{company}}..."
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase block mb-1">Modèle / Template (optionnel)</label>
                  <input
                    type="text"
                    value={stepTemplate}
                    onChange={(e) => setStepTemplate(e.target.value)}
                    placeholder="ex: Email Outbound Cold V1"
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            ) : (
              /* Champ spécifique LinkedIn */
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase block mb-1">
                  Message / Modèle de texte (template)
                </label>
                <textarea
                  rows={3}
                  value={stepTemplate}
                  onChange={(e) => setStepTemplate(e.target.value)}
                  placeholder="ex: Bonjour {{firstName}}, j'aimerais échanger au sujet de..."
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingStep(false)}
                className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-xl"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submittingStep}
                className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm disabled:opacity-50"
              >
                {submittingStep ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>Ajouter cette étape</span>
              </button>
            </div>
          </form>
        )}

        {/* Timeline des étapes */}
        {steps.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Clock className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Aucune étape définie dans cette séquence.</p>
            <p className="text-xs text-gray-400 mt-1">Cliquez sur "Ajouter une étape" ci-dessus pour la créer.</p>
          </div>
        ) : (
          <div className="relative pl-4 md:pl-8 space-y-6 before:absolute before:left-3 md:before:left-7 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
            {steps.map((step, idx) => {
              const isEmail = step.channel?.toLowerCase() === 'email' || step.type?.toLowerCase() === 'email';

              return (
                <div key={step.id} className="relative flex items-start space-x-4 group">
                  {/* Puce timeline visuelle */}
                  <div
                    className={`absolute -left-4 md:-left-8 top-1 w-8 h-8 rounded-xl border-2 flex items-center justify-center shrink-0 shadow-sm z-10 transition-all ${
                      isEmail
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                        : 'bg-sky-50 border-sky-500 text-sky-700'
                    }`}
                  >
                    {getStepIcon(step)}
                  </div>

                  {/* Carte Étape */}
                  <div
                    className={`flex-1 p-4 rounded-2xl border transition-all shadow-sm hover:shadow-md ${
                      isEmail
                        ? 'bg-emerald-50/30 border-emerald-200/80 hover:border-emerald-300'
                        : 'bg-sky-50/30 border-sky-200/80 hover:border-sky-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="text-xs font-bold text-gray-500 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                          Étape {step.order || idx + 1}
                        </span>

                        {/* Badge Canal coloré (Sky = LinkedIn, Emerald = Email) */}
                        {isEmail ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <Mail className="w-3 h-3 text-emerald-600" />
                            <span>Email</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 text-xs font-bold rounded-full bg-sky-100 text-sky-800 border border-sky-300">
                            <Linkedin className="w-3 h-3 text-sky-600" />
                            <span>LinkedIn</span>
                          </span>
                        )}

                        <span className="text-xs font-bold text-gray-900 capitalize">
                          {step.type === 'visit'
                            ? 'Visite de profil'
                            : step.type === 'connect'
                            ? 'Demande de connexion'
                            : step.type === 'message'
                            ? 'Message direct'
                            : step.type === 'followup'
                            ? 'Relance LinkedIn'
                            : step.type === 'email'
                            ? 'Envoi d’Email'
                            : step.type}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center space-x-1 text-xs text-gray-500 font-medium bg-white px-2.5 py-1 rounded-full border border-gray-200">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span>{step.delayDays === 0 ? 'Jour J' : `+${step.delayDays} jour${step.delayDays > 1 ? 's' : ''}`}</span>
                        </span>

                        <button
                          onClick={() => handleDeleteStep(step.id)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer cette étape"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Contenu spécifique selon canal */}
                    {isEmail ? (
                      <div className="space-y-1.5 mt-2 bg-white/80 p-3 rounded-xl border border-emerald-100/80 text-xs">
                        {step.emailSubject && (
                          <p className="font-semibold text-emerald-950">
                            <span className="text-emerald-700 font-bold uppercase tracking-wider text-[10px] mr-1">Objet :</span>
                            {step.emailSubject}
                          </p>
                        )}
                        {step.emailBody && (
                          <p className="text-gray-700 whitespace-pre-wrap line-clamp-3">
                            <span className="text-emerald-700 font-bold uppercase tracking-wider text-[10px] block mb-0.5">Corps de l’email :</span>
                            {step.emailBody}
                          </p>
                        )}
                        {step.template && (
                          <p className="text-gray-500 italic text-[11px] pt-1">
                            Template : {step.template}
                          </p>
                        )}
                      </div>
                    ) : (
                      step.template && (
                        <div className="mt-2 bg-white/80 p-3 rounded-xl border border-sky-100/80 text-xs text-gray-700">
                          <span className="text-sky-700 font-bold uppercase tracking-wider text-[10px] block mb-0.5">Message / Instruction :</span>
                          <p className="whitespace-pre-wrap line-clamp-3">{step.template}</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Prospects assignés */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Users className="w-5 h-5 text-sky-600" />
          <span>Prospects assignés ({prospectCount})</span>
        </h2>

        {prospectCount === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Aucun prospect assigné à cette campagne pour le moment.</p>
        ) : (
          <div className="space-y-2">
            {campaign.prospects?.map((cp) => (
              <div
                key={cp.id}
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">{cp.prospect?.name || 'Prospect anonyme'}</p>
                  <p className="text-xs text-gray-500">{cp.prospect?.headline || cp.prospect?.email || '—'}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                    Étape {cp.currentStep} — {cp.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
