'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  Send,
  Search,
  Filter,
  Users,
  Mail,
  Linkedin,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Loader2,
  Check,
  X,
  ExternalLink,
  ArrowDownLeft,
  ArrowUpRight,
  MessageCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Prospect, Conversation } from '@/types';

export default function CRMPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProspectId, setSelectedProspectId] = useState<number | null>(null);

  // Filters
  const [channelFilter, setChannelFilter] = useState<'all' | 'linkedin' | 'email'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'sent' | 'replied'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Toast / Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Composer for selected prospect
  const [composerChannel, setComposerChannel] = useState<'linkedin' | 'email'>('linkedin');
  const [composerDirection, setComposerDirection] = useState<'outbound' | 'inbound'>('outbound');
  const [composerContent, setComposerContent] = useState('');
  const [composerStatus, setComposerStatus] = useState<string>('sent');
  const [submitting, setSubmitting] = useState(false);

  // Modal for new conversation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProspectId, setModalProspectId] = useState<string>('');
  const [modalChannel, setModalChannel] = useState<'linkedin' | 'email'>('linkedin');
  const [modalDirection, setModalDirection] = useState<'outbound' | 'inbound'>('outbound');
  const [modalContent, setModalContent] = useState('');
  const [modalStatus, setModalStatus] = useState<string>('sent');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [convRes, prospectRes] = await Promise.all([
        fetch('/api/conversations'),
        fetch('/api/prospects'),
      ]);

      if (convRes.ok) {
        const convData = await convRes.ok ? await convRes.json() : [];
        setConversations(Array.isArray(convData) ? convData : []);
      }
      if (prospectRes.ok) {
        const prospectData = await prospectRes.json();
        setProspects(Array.isArray(prospectData) ? prospectData : []);
      }
    } catch (err) {
      console.error('Erreur de chargement:', err);
      showToast('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Map conversations to prospects
  const prospectsWithConversations = useMemo(() => {
    // Map of prospectId -> conversations
    const map = new Map<number, Conversation[]>();
    conversations.forEach((conv) => {
      const existing = map.get(conv.prospectId) || [];
      existing.push(conv);
      map.set(conv.prospectId, existing);
    });

    // Merge prospects list with conversation data
    return prospects.map((p) => {
      const prospectConvs = map.get(p.id) || [];
      // Sort conversations ascending for timeline
      const sortedConvs = [...prospectConvs].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      const hasReplied =
        p.status === 'replied' ||
        prospectConvs.some(
          (c) => c.direction === 'inbound' || c.status === 'replied'
        );

      const lastConv = prospectConvs.length > 0 ? prospectConvs[0] : null;

      return {
        ...p,
        conversations: sortedConvs,
        hasReplied,
        conversationCount: prospectConvs.length,
        lastConvDate: lastConv ? lastConv.createdAt : p.createdAt,
      };
    });
  }, [prospects, conversations]);

  // Auto select first prospect if none selected
  useEffect(() => {
    if (prospectsWithConversations.length > 0 && selectedProspectId === null) {
      // Pick first prospect that has conversations or first prospect
      const withConvs = prospectsWithConversations.find((p) => p.conversationCount > 0);
      if (withConvs) {
        setSelectedProspectId(withConvs.id);
      } else if (prospectsWithConversations[0]) {
        setSelectedProspectId(prospectsWithConversations[0].id);
      }
    }
  }, [prospectsWithConversations, selectedProspectId]);

  // Filter prospects list based on search and filters
  const filteredProspects = useMemo(() => {
    return prospectsWithConversations.filter((p) => {
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.company || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.conversations.some((c) =>
          c.content.toLowerCase().includes(searchQuery.toLowerCase())
        );

      if (!matchesSearch) return false;

      // Status filter
      if (statusFilter === 'replied' && !p.hasReplied) return false;
      if (statusFilter === 'sent' && p.hasReplied) return false;

      // Channel filter
      if (channelFilter !== 'all') {
        const hasChannelMsg = p.conversations.some((c) => c.channel === channelFilter);
        if (!hasChannelMsg && p.conversationCount > 0) return false;
      }

      return true;
    });
  }, [prospectsWithConversations, searchQuery, statusFilter, channelFilter]);

  // Selected prospect data
  const selectedProspect = useMemo(() => {
    return prospectsWithConversations.find((p) => p.id === selectedProspectId) || null;
  }, [prospectsWithConversations, selectedProspectId]);

  // Filtered timeline messages for selected prospect
  const selectedTimelineMessages = useMemo(() => {
    if (!selectedProspect) return [];
    return selectedProspect.conversations.filter((c) => {
      if (channelFilter !== 'all' && c.channel !== channelFilter) return false;
      if (statusFilter === 'replied' && c.direction !== 'inbound' && c.status !== 'replied') {
        return false;
      }
      if (statusFilter === 'sent' && (c.direction === 'inbound' || c.status === 'replied')) {
        return false;
      }
      return true;
    });
  }, [selectedProspect, channelFilter, statusFilter]);

  // Handle adding a new conversation for selected prospect
  const handleAddConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProspectId || !composerContent.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospectId: selectedProspectId,
          channel: composerChannel,
          direction: composerDirection,
          content: composerContent.trim(),
          status: composerDirection === 'inbound' ? 'replied' : composerStatus,
        }),
      });

      if (res.ok) {
        showToast('Message enregistré dans la conversation !');
        setComposerContent('');
        await fetchData();
      } else {
        const data = await res.json();
        showToast(`Erreur: ${data.error || 'Impossible de créer le message'}`);
      }
    } catch (err) {
      console.error(err);
      showToast('Erreur serveur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle adding from modal
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalProspectId || !modalContent.trim()) {
      showToast('Veuillez sélectionner un prospect et entrer un message');
      return;
    }

    setSubmitting(true);
    try {
      const targetProspectId = parseInt(modalProspectId, 10);
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospectId: targetProspectId,
          channel: modalChannel,
          direction: modalDirection,
          content: modalContent.trim(),
          status: modalDirection === 'inbound' ? 'replied' : modalStatus,
        }),
      });

      if (res.ok) {
        showToast('Nouvelle conversation ajoutée !');
        setIsModalOpen(false);
        setModalContent('');
        setSelectedProspectId(targetProspectId);
        await fetchData();
      } else {
        const data = await res.json();
        showToast(`Erreur: ${data.error || 'Création échouée'}`);
      }
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de l\'enregistrement');
    } finally {
      setSubmitting(false);
    }
  };

  // Update conversation status
  const handleUpdateStatus = async (convId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/conversations/${convId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        showToast(`Statut mis à jour (${newStatus})`);
        fetchData();
      } else {
        showToast('Erreur mise à jour statut');
      }
    } catch {
      showToast('Erreur réseau');
    }
  };

  // Delete conversation
  const handleDeleteConversation = async (convId: number) => {
    if (!confirm('Voulez-vous vraiment supprimer ce message ?')) return;

    try {
      const res = await fetch(`/api/conversations/${convId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        showToast('Message supprimé');
        fetchData();
      } else {
        showToast('Erreur suppression');
      }
    } catch {
      showToast('Erreur réseau');
    }
  };

  // Stats calculation
  const totalConversations = conversations.length;
  const prospectsReplied = prospectsWithConversations.filter((p) => p.hasReplied).length;
  const linkedinCount = conversations.filter((c) => c.channel === 'linkedin').length;
  const emailCount = conversations.filter((c) => c.channel === 'email').length;
  const replyRate =
    prospects.length > 0
      ? Math.round((prospectsReplied / prospects.length) * 100)
      : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-indigo-600" />
            CRM & Suivi des Conversations
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gérez vos échanges multi-canaux (LinkedIn & Email) et suivez les réponses de vos prospects.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData()}
            className="p-2 text-gray-600 hover:text-indigo-600 bg-white border border-gray-200 rounded-xl hover:bg-indigo-50 transition-colors"
            title="Rafraîchir"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              if (selectedProspectId) setModalProspectId(String(selectedProspectId));
              setIsModalOpen(true);
            }}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-xl hover:bg-indigo-700 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Conversation</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle className="w-4 h-4 text-indigo-600" />
            <span className="text-xs text-gray-500 font-medium">Total Messages</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalConversations}</p>
          <p className="text-[11px] text-gray-400 mt-1">
            {linkedinCount} LinkedIn · {emailCount} Email
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-sky-600" />
            <span className="text-xs text-gray-500 font-medium">Prospects Engagés</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {prospectsWithConversations.filter((p) => p.conversationCount > 0).length}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">sur {prospects.length} prospects au total</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-xs text-gray-500 font-medium">Réponses Reçues</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{prospectsReplied}</p>
          <p className="text-[11px] text-gray-400 mt-1">Prospects ayant répondu</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-gray-500 font-medium">Taux de Réponse</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{replyRate}%</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Objectif &gt; 15%</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom, entreprise ou message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-gray-900"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Channel Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium border border-slate-200">
            <button
              onClick={() => setChannelFilter('all')}
              className={`px-3 py-1 rounded-md transition-all ${
                channelFilter === 'all'
                  ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tous canaux
            </button>
            <button
              onClick={() => setChannelFilter('linkedin')}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 ${
                channelFilter === 'linkedin'
                  ? 'bg-white text-sky-700 shadow-2xs font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Linkedin className="w-3.5 h-3.5 text-sky-600" />
              <span>LinkedIn</span>
            </button>
            <button
              onClick={() => setChannelFilter('email')}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 ${
                channelFilter === 'email'
                  ? 'bg-white text-emerald-700 shadow-2xs font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-emerald-600" />
              <span>Email</span>
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium border border-slate-200">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-md transition-all ${
                statusFilter === 'all'
                  ? 'bg-white text-gray-900 shadow-2xs font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tous statuts
            </button>
            <button
              onClick={() => setStatusFilter('sent')}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 ${
                statusFilter === 'sent'
                  ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
              <span>Envoyés</span>
            </button>
            <button
              onClick={() => setStatusFilter('replied')}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 ${
                statusFilter === 'replied'
                  ? 'bg-white text-emerald-700 shadow-2xs font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
              <span>Répondus</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main CRM Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Prospects list */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
          <div className="p-3.5 border-b border-gray-100 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Prospects ({filteredProspects.length})
            </span>
            <span className="text-[11px] text-gray-500">
              {prospectsReplied} réponses reçues
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400 space-x-2">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              <span className="text-xs font-medium">Chargement des prospects...</span>
            </div>
          ) : filteredProspects.length === 0 ? (
            <div className="text-center py-16 px-4 text-gray-400">
              <Filter className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-xs font-semibold text-gray-600">Aucun prospect correspondant</p>
              <p className="text-[11px] text-gray-400 mt-1">Essayez de modifier vos filtres de recherche.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[650px] overflow-y-auto">
              {filteredProspects.map((prospect) => {
                const isSelected = prospect.id === selectedProspectId;
                const lastMsg =
                  prospect.conversations.length > 0
                    ? prospect.conversations[prospect.conversations.length - 1]
                    : null;

                return (
                  <button
                    key={prospect.id}
                    onClick={() => setSelectedProspectId(prospect.id)}
                    className={`w-full text-left p-3.5 transition-all flex items-start gap-3 relative ${
                      isSelected
                        ? 'bg-indigo-50/70 border-l-4 border-indigo-600'
                        : 'hover:bg-slate-50 border-l-4 border-transparent'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                        {prospect.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      {prospect.hasReplied && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" title="Réponse reçue" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p className={`text-xs font-semibold truncate ${isSelected ? 'text-indigo-950' : 'text-gray-900'}`}>
                          {prospect.name}
                        </p>

                        {/* Visual Badge for replied prospects */}
                        {prospect.hasReplied && (
                          <span className="shrink-0 inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Répondu
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-gray-500 truncate mb-1">
                        {prospect.company ? prospect.company : prospect.headline || 'Pas d\'entreprise'}
                      </p>

                      {/* Last Message Snippet */}
                      {lastMsg ? (
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-600 bg-white/60 p-1 rounded border border-gray-100">
                          {lastMsg.channel === 'linkedin' ? (
                            <Linkedin className="w-3 h-3 text-sky-600 shrink-0" />
                          ) : (
                            <Mail className="w-3 h-3 text-emerald-600 shrink-0" />
                          )}
                          <span className="truncate italic">
                            {lastMsg.direction === 'inbound' ? 'Prospect: ' : 'Vous: '}
                            {lastMsg.content}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">
                          Aucun message archivé
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Timeline & Conversation panel */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
          {selectedProspect ? (
            <div className="flex flex-col h-[700px]">
              {/* Prospect Header Card */}
              <div className="p-4 bg-slate-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-700 text-white font-extrabold text-sm flex items-center justify-center shadow-xs">
                    {selectedProspect.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-gray-900">
                        {selectedProspect.name}
                      </h2>
                      {selectedProspect.hasReplied ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Prospect à chaud (A répondu)
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200">
                          {selectedProspect.status || 'En cours'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {selectedProspect.headline || selectedProspect.company || 'Sans titre'}
                      {selectedProspect.location ? ` · ${selectedProspect.location}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {selectedProspect.email && (
                    <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-mono flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {selectedProspect.email}
                    </span>
                  )}
                  {selectedProspect.profileUrl && (
                    <a
                      href={selectedProspect.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-sky-700 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-lg border border-sky-200 transition-colors font-medium"
                    >
                      <Linkedin className="w-3 h-3" />
                      <span>Profil</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Timeline Feed Container */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
                {selectedTimelineMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-12">
                    <MessageSquare className="w-12 h-12 text-gray-300 mb-2" />
                    <p className="text-sm font-semibold text-gray-700">Aucune conversation enregistrée</p>
                    <p className="text-xs text-gray-400 max-w-xs mt-1">
                      Commencez par consigner un premier message ou une réponse pour ce prospect ci-dessous.
                    </p>
                  </div>
                ) : (
                  <div className="relative pl-4 border-l-2 border-indigo-100 space-y-4">
                    {selectedTimelineMessages.map((msg) => {
                      const isInbound = msg.direction === 'inbound';
                      const isEmail = msg.channel === 'email';

                      return (
                        <div
                          key={msg.id}
                          className={`relative group rounded-xl p-4 transition-all shadow-2xs border ${
                            isInbound
                              ? 'bg-emerald-50/80 border-emerald-200 ml-2'
                              : 'bg-white border-gray-200 mr-2'
                          }`}
                        >
                          {/* Timeline Node Point */}
                          <div
                            className={`absolute -left-[23px] top-4 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs flex items-center justify-center ${
                              isInbound ? 'bg-emerald-500' : 'bg-indigo-600'
                            }`}
                          />

                          {/* Message Header */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              {/* Channel Badge */}
                              <span
                                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                                  isEmail
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                    : 'bg-sky-100 text-sky-800 border-sky-200'
                                }`}
                              >
                                {isEmail ? (
                                  <Mail className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Linkedin className="w-3 h-3 text-sky-600" />
                                )}
                                <span className="capitalize">{msg.channel}</span>
                              </span>

                              {/* Direction Indicator */}
                              {isInbound ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-200/60 px-2 py-0.5 rounded-md">
                                  <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                                  Réponse du prospect
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                  <ArrowUpRight className="w-3 h-3 text-slate-500" />
                                  Envoyé par nous
                                </span>
                              )}
                            </div>

                            {/* Status & Actions */}
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(msg.createdAt).toLocaleString('fr-FR', {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>

                              <select
                                value={msg.status}
                                onChange={(e) => handleUpdateStatus(msg.id, e.target.value)}
                                className="text-[10px] bg-white border border-gray-200 rounded px-1.5 py-0.5 text-gray-700 focus:outline-none"
                              >
                                <option value="sent">Sent</option>
                                <option value="delivered">Delivered</option>
                                <option value="read">Read</option>
                                <option value="replied">Replied</option>
                              </select>

                              <button
                                onClick={() => handleDeleteConversation(msg.id)}
                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-opacity p-1"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Message Body */}
                          <p className="text-xs text-gray-800 whitespace-pre-wrap leading-relaxed font-sans">
                            {msg.content}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Message Composer Box */}
              <div className="p-4 bg-white border-t border-gray-200 shrink-0">
                <form onSubmit={handleAddConversation} className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-700">
                        Ajouter un message :
                      </span>

                      {/* Select Channel */}
                      <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-slate-50 text-xs">
                        <button
                          type="button"
                          onClick={() => setComposerChannel('linkedin')}
                          className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                            composerChannel === 'linkedin'
                              ? 'bg-white text-sky-700 font-semibold shadow-2xs'
                              : 'text-gray-600'
                          }`}
                        >
                          <Linkedin className="w-3 h-3 text-sky-600" />
                          LinkedIn
                        </button>
                        <button
                          type="button"
                          onClick={() => setComposerChannel('email')}
                          className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                            composerChannel === 'email'
                              ? 'bg-white text-emerald-700 font-semibold shadow-2xs'
                              : 'text-gray-600'
                          }`}
                        >
                          <Mail className="w-3 h-3 text-emerald-600" />
                          Email
                        </button>
                      </div>

                      {/* Select Direction */}
                      <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-slate-50 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setComposerDirection('outbound');
                            setComposerStatus('sent');
                          }}
                          className={`px-2.5 py-1 rounded-md transition-all ${
                            composerDirection === 'outbound'
                              ? 'bg-white text-indigo-700 font-semibold shadow-2xs'
                              : 'text-gray-600'
                          }`}
                        >
                          Outbound (Envoyé)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setComposerDirection('inbound');
                            setComposerStatus('replied');
                          }}
                          className={`px-2.5 py-1 rounded-md transition-all ${
                            composerDirection === 'inbound'
                              ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
                              : 'text-gray-600'
                          }`}
                        >
                          Inbound (Réponse)
                        </button>
                      </div>
                    </div>

                    <span className="text-[11px] text-gray-400 italic">
                      {composerDirection === 'inbound'
                        ? 'Consigner la réponse du prospect'
                        : 'Consigner un message envoyé'}
                    </span>
                  </div>

                  {/* Content Area */}
                  <div className="relative">
                    <textarea
                      rows={3}
                      placeholder={
                        composerDirection === 'inbound'
                          ? 'Saisissez le texte de la réponse reçue du prospect...'
                          : 'Saisissez le message que vous avez envoyé au prospect...'
                      }
                      value={composerContent}
                      onChange={(e) => setComposerContent(e.target.value)}
                      className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-gray-900 bg-slate-50/50"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-500">Statut:</span>
                      <select
                        value={composerStatus}
                        onChange={(e) => setComposerStatus(e.target.value)}
                        className="text-xs bg-slate-50 border border-gray-200 rounded-lg px-2 py-1 text-gray-700"
                      >
                        <option value="sent">sent (envoyé)</option>
                        <option value="delivered">delivered (délivré)</option>
                        <option value="read">read (lu)</option>
                        <option value="replied">replied (répondu)</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || !composerContent.trim()}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition-all ${
                        submitting || !composerContent.trim()
                          ? 'bg-gray-300 cursor-not-allowed'
                          : composerDirection === 'inbound'
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      {submitting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Enregistrer le message</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[600px] text-center p-8 text-gray-400">
              <Users className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-sm font-semibold text-gray-700">Aucun prospect sélectionné</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">
                Sélectionnez un prospect dans la liste de gauche pour consulter sa timeline de conversation.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: New Conversation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                Consigner une conversation
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              {/* Select Prospect */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Prospect *
                </label>
                <select
                  value={modalProspectId}
                  onChange={(e) => setModalProspectId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-gray-900"
                  required
                >
                  <option value="">-- Choisir un prospect --</option>
                  {prospects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.company ? `(${p.company})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Channel */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Canal *
                  </label>
                  <select
                    value={modalChannel}
                    onChange={(e) => setModalChannel(e.target.value as 'linkedin' | 'email')}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-gray-900"
                  >
                    <option value="linkedin">LinkedIn</option>
                    <option value="email">Email</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Direction *
                  </label>
                  <select
                    value={modalDirection}
                    onChange={(e) => {
                      const dir = e.target.value as 'outbound' | 'inbound';
                      setModalDirection(dir);
                      if (dir === 'inbound') setModalStatus('replied');
                    }}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-gray-900"
                  >
                    <option value="outbound">Outbound (Envoyé par nous)</option>
                    <option value="inbound">Inbound (Réponse du prospect)</option>
                  </select>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-gray-900"
                >
                  <option value="sent">sent (envoyé)</option>
                  <option value="delivered">delivered (délivré)</option>
                  <option value="read">read (lu)</option>
                  <option value="replied">replied (répondu)</option>
                </select>
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Contenu du message *
                </label>
                <textarea
                  rows={4}
                  value={modalContent}
                  onChange={(e) => setModalContent(e.target.value)}
                  placeholder="Écrivez le contenu du message ici..."
                  className="w-full text-xs p-3 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-gray-900"
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Créer la conversation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
