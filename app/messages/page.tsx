'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { mockProspects } from '@/data/mockData';
import { Prospect, AISettings } from '@/types';
import {
  Sparkles,
  Copy,
  Check,
  User,
  Building,
  Sliders,
  AlertCircle,
  RefreshCw,
  Send,
  MessageSquare,
  Search,
  CheckCircle2,
  Info
} from 'lucide-react';

function MessageGeneratorContent() {
  const searchParams = useSearchParams();
  const initialProspectId = searchParams.get('prospectId');

  const [prospects] = useState<Prospect[]>(mockProspects);
  const [selectedProspect, setSelectedProspect] = useState<Prospect>(
    prospects.find((p) => p.id === initialProspectId) || prospects[0]
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // AI Settings State
  const [aiSettings, setAiSettings] = useState<AISettings>({
    tone: 'Professionnel',
    length: 'Moyen',
    persona: "Fondateur SaaS B2B spécialisé dans l'automatisation de la prospection commerciale pour les leaders tech africains."
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Set initial generated message on prospect change
  useEffect(() => {
    if (selectedProspect) {
      if (selectedProspect.generatedMessage) {
        setGeneratedMessage(selectedProspect.generatedMessage);
      } else {
        generateMockMessage(selectedProspect, aiSettings);
      }
    }
  }, [selectedProspect]);

  const generateMockMessage = (prospect: Prospect, settings: AISettings) => {
    setIsGenerating(true);

    setTimeout(() => {
      let msg = '';
      const firstName = prospect.name.split(' ')[0];

      if (settings.tone === 'Professionnel') {
        if (settings.length === 'Court') {
          msg = `Bonjour ${firstName}, j'ai été très impressionné par vos réalisations chez ${prospect.company}. Seriez-vous disponible pour un bref échange sur l'accélération de votre prospection B2B ?`;
        } else if (settings.length === 'Moyen') {
          msg = `Bonjour ${firstName}, ravi de découvrir votre parcours en tant que ${prospect.headline}. Chez Prospio, nous aidons les dirigeants tech comme vous à automatiser leur prospection LinkedIn de manière fluide et sécurisée. Seriez-vous ouvert à échanger quelques minutes ?`;
        } else {
          msg = `Bonjour ${firstName},\n\nJ'ai suivi avec attention le développement de ${prospect.company} à ${prospect.location}. Votre rôle en tant que ${prospect.headline} est crucial dans ce secteur en pleine mutation.\n\nNous avons conçu Prospio pour simplifier l'acquisition B2B avec l'IA Gemini. Seriez-vous disponible cette semaine pour une courte démonstration ?`;
        }
      } else if (settings.tone === 'Amical') {
        msg = `Salut ${firstName} ! Superbe travail avec ${prospect.company}. Je serais ravi de me connecter avec vous et d'échanger sur la croissance SaaS en Afrique. Au plaisir !`;
      } else if (settings.tone === 'Direct') {
        msg = `Bonjour ${firstName}, nous aidons les décideurs chez ${prospect.company} à générer 3x plus de rendez-vous qualifiés sur LinkedIn. Intéressé par une démo de 5 minutes ?`;
      } else {
        // Persuasif
        msg = `Bonjour ${firstName}, saviez-vous que 80% des opportunités B2B africaines se concrétisent sur LinkedIn ? Votre profil chez ${prospect.company} correspond exactement aux décideurs que nous accompagnons vers un scaling automatisé. Échangeons !`;
      }

      setGeneratedMessage(msg);
      setIsGenerating(false);
      showToast('Message IA généré avec succès !');
    }, 1200);
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
      p.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const charCount = generatedMessage.length;
  const isOverLimit = charCount > 300;

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Générateur de Messages IA</h1>
        <p className="text-sm text-gray-500 mt-1">
          Rédigez des invitations et messages LinkedIn hyper-personnalisés en un clic grâce à l'IA Gemini.
        </p>
      </div>

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Prospect Selector (3 Cols) */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <User className="w-4 h-4 text-sky-600" />
              Sélection Prospect
            </h3>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">
              {filteredProspects.length}
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Chercher un prospect..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-gray-900"
            />
          </div>

          {/* Prospect List */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredProspects.map((prospect) => {
              const isSelected = selectedProspect.id === prospect.id;
              return (
                <div
                  key={prospect.id}
                  onClick={() => setSelectedProspect(prospect)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                    isSelected
                      ? 'bg-sky-50/80 border-sky-300 shadow-sm'
                      : 'bg-white border-gray-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {prospect.avatarInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-900 truncate">{prospect.name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{prospect.headline}</p>
                    <span className="inline-block mt-1 text-[10px] font-medium text-sky-700 bg-sky-100/60 px-1.5 py-0.5 rounded">
                      {prospect.company}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Panel: Message Editor & Gemini Generation (6 Cols) */}
        <div className="lg:col-span-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
          {/* Selected Prospect Card Banner */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-sky-600 text-white font-bold text-sm flex items-center justify-center">
                {selectedProspect.avatarInitials}
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">{selectedProspect.name}</h4>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Building className="w-3 h-3 text-sky-600" />
                  {selectedProspect.headline}
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Score: {selectedProspect.intentScore}%
            </span>
          </div>

          {/* Editor Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-gray-900">Message Généré</h3>
            </div>
            <span className="text-xs text-gray-400 font-medium">Modèle Gemini Pro</span>
          </div>

          {/* Message Textarea */}
          <div className="relative">
            <textarea
              rows={8}
              value={generatedMessage}
              onChange={(e) => setGeneratedMessage(e.target.value)}
              placeholder="Cliquez sur 'Générer' pour créer un message IA..."
              className="w-full p-4 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-gray-900 leading-relaxed resize-none"
            />

            {isGenerating && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center space-y-2">
                <RefreshCw className="w-6 h-6 text-sky-600 animate-spin" />
                <span className="text-xs font-semibold text-gray-700">
                  Rédaction par l'IA Gemini en cours...
                </span>
              </div>
            )}
          </div>

          {/* Character Counter & Warning */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-gray-500">
                Limite recommandée LinkedIn: <strong className="text-gray-900">300 caractères</strong>
              </span>
              <span className={isOverLimit ? 'text-rose-600 font-bold' : 'text-emerald-600'}>
                {charCount} / 300
              </span>
            </div>

            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isOverLimit
                    ? 'bg-rose-500'
                    : charCount > 250
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, (charCount / 300) * 100)}%` }}
              />
            </div>

            {isOverLimit && (
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Attention: Les invitations LinkedIn sont limitées à 300 caractères.
              </p>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
            <button
              onClick={() => generateMockMessage(selectedProspect, aiSettings)}
              disabled={isGenerating}
              className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Génération...' : 'Générer'}</span>
            </button>

            <button
              onClick={handleCopy}
              className="inline-flex items-center space-x-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-gray-500" />
                  <span>Copier le texte</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Panel: AI Settings (3 Cols) */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-5">
          <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
            <Sliders className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-bold text-gray-900">Paramètres IA</h3>
          </div>

          {/* Tone Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700 uppercase">
              Ton du message
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Professionnel', 'Amical', 'Direct', 'Persuasif'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setAiSettings({ ...aiSettings, tone: t })}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    aiSettings.tone === t
                      ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Length Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700 uppercase">
              Longueur souhaitée
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['Court', 'Moyen', 'Détaillé'] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setAiSettings({ ...aiSettings, length: l })}
                  className={`px-2 py-1.5 text-xs font-semibold rounded-lg border text-center transition-all ${
                    aiSettings.length === l
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Persona Textarea */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700 uppercase">
              Description de votre Persona
            </label>
            <textarea
              rows={4}
              value={aiSettings.persona}
              onChange={(e) => setAiSettings({ ...aiSettings, persona: e.target.value })}
              className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-gray-900 leading-normal"
            />
          </div>

          {/* Advice Box */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start space-x-2 text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Les accroches les plus courtes (&lt; 200 caractères) avec une question ouverte obtiennent 40% de réponses en plus.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Chargement...</div>}>
      <MessageGeneratorContent />
    </Suspense>
  );
}
