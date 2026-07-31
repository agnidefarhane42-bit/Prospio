'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Prospect, getInitials } from '@/types';
import {
  Sparkles,
  Copy,
  Check,
  User,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
} from 'lucide-react';

function MessageGeneratorContent() {
  const searchParams = useSearchParams();
  const initialProspectId = searchParams.get('prospectId');

  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Settings IA
  const [tone, setTone] = useState<string>('Amical');
  const [persona, setPersona] = useState(
    "Fondateur de DocEngine (SaaS boilerplate Next.js) et iAfriShip (logistique + mobile money en Afrique). Basé à Cotonou, Bénin. Passionné par la tech africaine et l'entrepreneuriat."
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // --- Fetch prospects depuis l'API ---
  useEffect(() => {
    const fetchProspects = async () => {
      try {
        const res = await fetch('/api/prospects');
        const data = await res.json();
        setProspects(data);
        // Sélectionner le prospect depuis l'URL ou le premier
        if (initialProspectId) {
          const found = data.find((p: Prospect) => p.id === parseInt(initialProspectId));
          if (found) setSelectedProspect(found);
        }
        if (data.length > 0 && !selectedProspect) {
          setSelectedProspect(data[0]);
        }
      } catch (e) {
        console.error('Erreur fetch prospects:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchProspects();
  }, []);

  // Charger le message existant si présent
  useEffect(() => {
    if (selectedProspect?.messageText) {
      setGeneratedMessage(selectedProspect.messageText);
    } else {
      setGeneratedMessage('');
    }
  }, [selectedProspect]);

  // --- Génération via l'API Gemini ---
  const handleGenerate = async () => {
    if (!selectedProspect) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/messages/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospect: {
            name: selectedProspect.name,
            headline: selectedProspect.headline,
            company: selectedProspect.company,
            location: selectedProspect.location,
          },
          persona,
          tone,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur génération');
      }

      const data = await res.json();
      setGeneratedMessage(data.message);
      showToast('Message IA généré !');

      // Sauvegarder le message sur le prospect
      await fetch(`/api/prospects/${selectedProspect.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageText: data.message }),
      });
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Erreur de génération');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    showToast('Copié dans le presse-papier !');
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredProspects = prospects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.company || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const charCount = generatedMessage.length;
  const isOverLimit = charCount > 300;

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Générateur de Messages IA</h1>
        <p className="text-sm text-gray-500 mt-1">Messages LinkedIn personnalisés via Gemini 1.5 Flash.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Liste des prospects */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <User className="w-4 h-4 text-sky-600" /> Prospect
            </h3>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">
              {filteredProspects.length}
            </span>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Chercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {loading ? (
              <div className="flex items-center justify-center py-8 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : filteredProspects.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">Aucun prospect</p>
            ) : (
              filteredProspects.map((prospect) => {
                const isSelected = selectedProspect?.id === prospect.id;
                return (
                  <div
                    key={prospect.id}
                    onClick={() => setSelectedProspect(prospect)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                      isSelected ? 'bg-sky-50/80 border-sky-300 shadow-sm' : 'bg-white border-gray-100 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {getInitials(prospect.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-gray-900 truncate">{prospect.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{prospect.headline || '—'}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Zone de génération */}
        <div className="lg:col-span-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
          {selectedProspect ? (
            <>
              {/* Prospect sélectionné */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-sky-600 text-white font-bold text-sm flex items-center justify-center">
                    {getInitials(selectedProspect.name)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{selectedProspect.name}</h4>
                    <p className="text-xs text-gray-500">{selectedProspect.headline || '—'}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Score: {selectedProspect.intentScore || 0}%
                </span>
              </div>

              {/* Controls */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">Ton du message</label>
                  <div className="flex gap-2 mt-1.5">
                    {['Professionnel', 'Amical', 'Direct', 'Persuasif'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTone(t)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                          tone === t
                            ? 'bg-sky-600 text-white border-sky-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">Persona</label>
                  <textarea
                    rows={3}
                    value={persona}
                    onChange={(e) => setPersona(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              </div>

              {/* Génération */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-gray-900">Message généré</h3>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  <span>{isGenerating ? 'Génération...' : 'Générer'}</span>
                </button>
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  rows={8}
                  value={generatedMessage}
                  onChange={(e) => setGeneratedMessage(e.target.value)}
                  placeholder="Cliquez sur 'Générer' pour créer un message IA..."
                  className="w-full p-4 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-gray-900 resize-none"
                />
                <div className={`absolute bottom-3 right-3 text-xs font-medium ${isOverLimit ? 'text-red-500' : 'text-gray-400'}`}>
                  {charCount} / 300
                </div>
              </div>

              {isOverLimit && (
                <div className="flex items-center space-x-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                  <AlertCircle className="w-4 h-4" />
                  <span>Message trop long pour LinkedIn (max 300 caractères)</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleCopy}
                  disabled={!generatedMessage}
                  className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Sélectionnez un prospect pour générer un message</p>
            </div>
          )}
        </div>

        {/* Panel droit — Infos */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
          <h3 className="text-sm font-bold text-gray-900">À propos</h3>
          <div className="space-y-2 text-xs text-gray-600">
            <p>
              <strong className="text-gray-900">Modèle:</strong> Gemini 1.5 Flash
            </p>
            <p>
              <strong className="text-gray-900">Limite LinkedIn:</strong> 300 caractères
            </p>
            <p>
              <strong className="text-gray-900">Langue:</strong> Français
            </p>
            <p>
              <strong className="text-gray-900">Personnalisation:</strong> Basée sur le titre, l'entreprise et la localisation du prospect
            </p>
          </div>
          <div className="pt-3 border-t border-gray-100">
            <p className="text-[11px] text-gray-400">
              Les messages générés sont automatiquement sauvegardés sur le prospect dans la base de données.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>}>
      <MessageGeneratorContent />
    </Suspense>
  );
}
