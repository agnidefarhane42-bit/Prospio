'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Prospect, ProspectStatus, getInitials } from '@/types';
import {
  Search,
  Plus,
  Filter,
  Eye,
  Sparkles,
  Trash2,
  Users,
  Building,
  UserCheck,
  TrendingUp,
  Check,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProspectsPage() {
  const router = useRouter();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedProfileType, setSelectedProfileType] = useState<string>('all');

  // Modal ajout prospect
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProspect, setNewProspect] = useState({
    name: '',
    headline: '',
    company: '',
    location: '',
    profileType: 'Founder' as string,
    profileUrl: '',
    intentScore: 75,
  });

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // --- Fetch prospects depuis l'API ---
  const fetchProspects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/prospects');
      if (!res.ok) throw new Error('Erreur API');
      const data = await res.json();
      setProspects(data);
    } catch (e) {
      console.error('Erreur fetch prospects:', e);
      showToast('Erreur de chargement des prospects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProspects();
  }, []);

  // --- Filtrage ---
  const filteredProspects = useMemo(() => {
    return prospects.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.headline || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.company || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        selectedStatus === 'all' ? true : p.status === selectedStatus;

      const matchesProfileType =
        selectedProfileType === 'all' ? true : p.profileType === selectedProfileType;

      return matchesSearch && matchesStatus && matchesProfileType;
    });
  }, [prospects, searchTerm, selectedStatus, selectedProfileType]);

  // --- Actions API ---
  const handleUpdateStatus = async (id: number, newStatus: ProspectStatus) => {
    try {
      await fetch(`/api/prospects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setProspects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
      );
      showToast('Statut mis à jour');
    } catch {
      showToast('Erreur lors de la mise à jour');
    }
  };

  const handleDeleteProspect = async (id: number, name: string) => {
    if (!confirm(`Supprimer ${name} ?`)) return;
    try {
      await fetch(`/api/prospects/${id}`, { method: 'DELETE' });
      setProspects((prev) => prev.filter((p) => p.id !== id));
      showToast(`${name} supprimé`);
    } catch {
      showToast('Erreur lors de la suppression');
    }
  };

  const handleAddProspect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProspect.name || !newProspect.profileUrl) return;

    try {
      const res = await fetch('/api/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProspect.name,
          profileUrl: newProspect.profileUrl,
          profileType: newProspect.profileType,
          headline: newProspect.headline || null,
          company: newProspect.company || null,
          location: newProspect.location || null,
          intentScore: newProspect.intentScore,
        }),
      });

      if (!res.ok) throw new Error('Erreur création');
      const created = await res.json();
      setProspects((prev) => [created, ...prev]);
      setIsAddModalOpen(false);
      setNewProspect({ name: '', headline: '', company: '', location: '', profileType: 'Founder', profileUrl: '', intentScore: 75 });
      showToast('Prospect ajouté !');
    } catch {
      showToast('Erreur lors de l\'ajout');
    }
  };

  const getStatusBadge = (status: ProspectStatus) => {
    const badges: Record<string, { label: string; className: string }> = {
      new: { label: 'Nouveau', className: 'bg-gray-100 text-gray-700 border border-gray-200' },
      visited: { label: 'Visité', className: 'bg-blue-50 text-blue-700 border border-blue-200' },
      messaged: { label: 'Message', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
      replied: { label: 'Répondu', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
      connected: { label: 'Connecté', className: 'bg-green-50 text-green-700 border border-green-200' },
    };
    const badge = badges[status] || badges.new;
    return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${badge.className}`}>{badge.label}</span>;
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Prospects</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez vos cibles LinkedIn et générez des messages IA.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center space-x-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg"><Users className="w-5 h-5" /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total</p>
            <p className="text-lg font-bold text-gray-900">{prospects.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center space-x-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg"><Sparkles className="w-5 h-5" /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Contactés</p>
            <p className="text-lg font-bold text-gray-900">
              {prospects.filter((p) => p.status === 'messaged' || p.status === 'replied').length}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg"><UserCheck className="w-5 h-5" /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Connectés</p>
            <p className="text-lg font-bold text-gray-900">
              {prospects.filter((p) => p.status === 'connected' || p.status === 'replied').length}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Score Moyen</p>
            <p className="text-lg font-bold text-gray-900">
              {prospects.length > 0
                ? Math.round(prospects.reduce((acc, p) => acc + (p.intentScore || 0), 0) / prospects.length)
                : 0}
              %
            </p>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom, titre ou entreprise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-gray-900 placeholder-gray-400"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-2 text-xs font-semibold text-gray-500 uppercase shrink-0">
            <Filter className="w-3.5 h-3.5" /><span>Filtres:</span>
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="all">Tous les statuts</option>
            <option value="new">Nouveau</option>
            <option value="visited">Visité</option>
            <option value="messaged">Message envoyé</option>
            <option value="replied">Répondu</option>
            <option value="connected">Connecté</option>
          </select>
          <select
            value={selectedProfileType}
            onChange={(e) => setSelectedProfileType(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="all">Tous types</option>
            <option value="Founder">Fondateur</option>
            <option value="CEO">CEO</option>
            <option value="CTO">CTO</option>
            <option value="Investor">Investisseur</option>
            <option value="Product Manager">Product Manager</option>
            <option value="Developer">Développeur</option>
          </select>
        </div>
      </div>

      {/* Liste des prospects */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2 text-sm">Chargement des prospects...</span>
        </div>
      ) : filteredProspects.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">Aucun prospect trouvé. Ajoutez-en un pour commencer !</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Prospect</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3 hidden md:table-cell">Titre</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3 hidden lg:table-cell">Entreprise</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Statut</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3 hidden sm:table-cell">Score</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProspects.map((prospect) => (
                <tr key={prospect.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-600 to-blue-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {getInitials(prospect.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{prospect.name}</p>
                        <p className="text-xs text-gray-400 truncate">{prospect.location || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-sm text-gray-600 truncate max-w-xs">{prospect.headline || '—'}</p>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <p className="text-sm text-gray-600">{prospect.company || '—'}</p>
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(prospect.status)}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${prospect.intentScore || 0}%` }} />
                      </div>
                      <span className="text-xs font-bold text-gray-700">{prospect.intentScore || 0}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => router.push(`/messages?prospectId=${prospect.id}`)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Générer un message IA"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                      <a
                        href={prospect.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                        title="Voir le profil LinkedIn"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleUpdateStatus(prospect.id, 'visited')}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Marquer comme visité"
                      >
                        <UserCheck className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProspect(prospect.id, prospect.name)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Ajout */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Ajouter un prospect</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleAddProspect} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">Nom complet *</label>
                  <input
                    type="text" required
                    value={newProspect.name}
                    onChange={(e) => setNewProspect({ ...newProspect, name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    placeholder="ex: Kofi Mensah"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">URL LinkedIn *</label>
                  <input
                    type="url" required
                    value={newProspect.profileUrl}
                    onChange={(e) => setNewProspect({ ...newProspect, profileUrl: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">Titre / Headline</label>
                  <input
                    type="text"
                    value={newProspect.headline}
                    onChange={(e) => setNewProspect({ ...newProspect, headline: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    placeholder="CEO @ PayAfrik"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">Entreprise</label>
                  <input
                    type="text"
                    value={newProspect.company}
                    onChange={(e) => setNewProspect({ ...newProspect, company: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    placeholder="PayAfrik"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">Localisation</label>
                  <input
                    type="text"
                    value={newProspect.location}
                    onChange={(e) => setNewProspect({ ...newProspect, location: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    placeholder="Accra, Ghana"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">Type de profil</label>
                  <select
                    value={newProspect.profileType}
                    onChange={(e) => setNewProspect({ ...newProspect, profileType: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  >
                    <option value="Founder">Fondateur</option>
                    <option value="CEO">CEO</option>
                    <option value="CTO">CTO</option>
                    <option value="Investor">Investisseur</option>
                    <option value="Product Manager">Product Manager</option>
                    <option value="Developer">Développeur</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">Score d'intention: {newProspect.intentScore}%</label>
                <input
                  type="range" min="0" max="100"
                  value={newProspect.intentScore}
                  onChange={(e) => setNewProspect({ ...newProspect, intentScore: Number(e.target.value) })}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
