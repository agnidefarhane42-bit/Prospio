'use client';

import React, { useState } from 'react';
import { Prospect, ProspectStatus } from '@/types';
import {
  X,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  UserCheck,
  Copy,
  Check,
  Building2,
  MapPin,
  TrendingUp,
  MessageSquare
} from 'lucide-react';

interface ProspectModalProps {
  prospect: Prospect | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (id: string, newStatus: ProspectStatus) => void;
  onGenerateMessage?: (prospect: Prospect) => void;
}

export const ProspectModal: React.FC<ProspectModalProps> = ({
  prospect,
  isOpen,
  onClose,
  onUpdateStatus,
  onGenerateMessage
}) => {
  const [copied, setCopied] = useState(false);
  const [localStatus, setLocalStatus] = useState<ProspectStatus | null>(null);

  if (!isOpen || !prospect) return null;

  const currentStatus = localStatus || prospect.status;

  const getStatusBadge = (status: ProspectStatus) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">Nouveau</span>;
      case 'visited':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">Visité</span>;
      case 'messaged':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">Envoyé</span>;
      case 'replied':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">Répondu</span>;
      case 'connected':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Connecté</span>;
      default:
        return null;
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMarkConnected = () => {
    setLocalStatus('connected');
    if (onUpdateStatus) {
      onUpdateStatus(prospect.id, 'connected');
    }
  };

  // Status timeline steps
  const isVisited = currentStatus === 'visited' || currentStatus === 'messaged' || currentStatus === 'replied' || currentStatus === 'connected';
  const isMessaged = currentStatus === 'messaged' || currentStatus === 'replied' || currentStatus === 'connected';
  const isConnected = currentStatus === 'connected' || currentStatus === 'replied';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-sky-600 to-blue-700 text-white font-bold text-xl flex items-center justify-center shadow-md">
              {prospect.avatarInitials}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-gray-900">{prospect.name}</h2>
                {getStatusBadge(currentStatus)}
              </div>
              <p className="text-sm text-gray-600 mt-0.5">{prospect.headline}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center space-x-3">
              <Building2 className="w-5 h-5 text-sky-600 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Entreprise</p>
                <p className="text-sm font-semibold text-gray-900">{prospect.company}</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-sky-600 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Localisation</p>
                <p className="text-sm font-semibold text-gray-900">{prospect.location}</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center space-x-3">
              <TrendingUp className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="w-full">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500 font-medium">Score d'Intérêt</p>
                  <span className="text-xs font-bold text-emerald-600">{prospect.intentScore}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${prospect.intentScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bio / Summary */}
          {prospect.bio && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                À propos du profil
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">{prospect.bio}</p>
            </div>
          )}

          {/* Status Timeline */}
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-600" />
              Chronologie de Prospection
            </h4>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {/* Timeline Item 1: Visited */}
              <div className="relative flex items-start space-x-3">
                <div className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center ${
                  isVisited ? 'bg-sky-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Profil visité</p>
                  <p className="text-xs text-gray-500">
                    {prospect.timeline.visitedAt ? `Visité le ${prospect.timeline.visitedAt}` : 'En attente de visite'}
                  </p>
                </div>
              </div>

              {/* Timeline Item 2: Messaged */}
              <div className="relative flex items-start space-x-3">
                <div className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center ${
                  isMessaged ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Message / Invitation envoyé</p>
                  <p className="text-xs text-gray-500">
                    {prospect.timeline.messagedAt ? `Envoyé le ${prospect.timeline.messagedAt}` : 'Pas encore contacté'}
                  </p>
                </div>
              </div>

              {/* Timeline Item 3: Connected */}
              <div className="relative flex items-start space-x-3">
                <div className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center ${
                  isConnected ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Réseau / Connecté</p>
                  <p className="text-xs text-gray-500">
                    {prospect.timeline.connectedAt ? `Connecté le ${prospect.timeline.connectedAt}` : 'Invitation non acceptée pour le moment'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Message Preview Section */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-semibold text-gray-900">Aperçu du message AI</span>
              </div>
              {prospect.generatedMessage && (
                <button
                  onClick={() => handleCopy(prospect.generatedMessage || '')}
                  className="flex items-center space-x-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copié !' : 'Copier'}</span>
                </button>
              )}
            </div>

            {prospect.generatedMessage ? (
              <div className="bg-white p-3.5 rounded-lg border border-gray-200 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                {prospect.generatedMessage}
              </div>
            ) : (
              <div className="text-xs text-gray-500 italic bg-white p-3 rounded-lg border border-gray-200">
                Aucun message généré pour le moment. Cliquez sur "Générer message" ci-dessous.
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <a
            href={prospect.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors shadow-sm"
          >
            <ExternalLink className="w-4 h-4 text-sky-600" />
            <span>Visiter profil</span>
          </a>

          <div className="flex items-center space-x-2">
            {onGenerateMessage && (
              <button
                onClick={() => {
                  onGenerateMessage(prospect);
                  onClose();
                }}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Générer message</span>
              </button>
            )}

            <button
              onClick={handleMarkConnected}
              disabled={currentStatus === 'connected'}
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm ${
                currentStatus === 'connected'
                  ? 'bg-emerald-100 text-emerald-800 cursor-default'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>{currentStatus === 'connected' ? 'Déjà connecté' : 'Marquer comme connecté'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
