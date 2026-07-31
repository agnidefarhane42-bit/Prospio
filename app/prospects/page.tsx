'use client';

import React, { useState, useMemo } from 'react';
import { mockProspects } from '@/data/mockData';
import { Prospect, ProspectStatus, ProfileType } from '@/types';
import { ProspectModal } from '@/components/ProspectModal';
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
  X,
  Check
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProspectsPage() {
  const router = useRouter();
  const [prospects, setProspects] = useState<Prospect[]>(mockProspects);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedProfileType, setSelectedProfileType] = useState<string>('all');
  
  // Modal states
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Add prospect form state
  const [newProspect, setNewProspect] = useState({
    name: '',
    headline: '',
    company: '',
    location: '',
    profileType: 'Founder' as ProfileType,
    linkedinUrl: '',
    intentScore: 75
  });

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered prospects
  const filteredProspects = useMemo(() => {
    return prospects.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.headline.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.company.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        selectedStatus === 'all'
          ? true
          : selectedStatus === 'new'
          ? p.status === 'new'
          : selectedStatus === 'visited'
          ? p.status === 'visited'
          : selectedStatus === 'messaged'
          ? p.status === 'messaged' || p.status === 'replied'
          : selectedStatus === 'connected'
          ? p.status === 'connected'
          : true;

      const matchesProfileType =
        selectedProfileType === 'all' ? true : p.profileType === selectedProfileType;

      return matchesSearch && matchesStatus && matchesProfileType;
    });
  }, [prospects, searchTerm, selectedStatus, selectedProfileType]);

  const handleUpdateStatus = (id: string, newStatus: ProspectStatus) => {
    setProspects((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    if (selectedProspect && selectedProspect.id === id) {
      setSelectedProspect((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    showToast('Statut du prospect mis à jour avec succès');
  };

  const handleDeleteProspect = (id: string, name: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${name} ?`)) {
      setProspects((prev) => prev.filter((p) => p.id !== id));
      showToast(`${name} a été supprimé des prospects`);
    }
  };

  const handleGenerateMessageRedirect = (prospect: Prospect) => {
    router.push(`/messages?prospectId=${prospect.id}`);
  };

  const handleAddProspectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProspect.name || !newProspect.headline) return;

    const initials = newProspect.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'PR';

    const created: Prospect = {
      id: `p_${Date.now()}`,
      name: newProspect.name,
      avatarInitials: initials,
      headline: newProspect.headline,
      company: newProspect.company || 'Indépendant',
      location: newProspect.location || 'Afrique',
      profileType: newProspect.profileType,
      status: 'new',
      intentScore: newProspect.intentScore,
      linkedinUrl: newProspect.linkedinUrl || 'https://linkedin.com',
      timeline: {}
    };

    setProspects((prev) => [created, ...prev]);
    setIsAddModalOpen(false);
    setNewProspect({
      name: '',
      headline: '',
      company: '',
      location: '',
      profileType: 'Founder',
      linkedinUrl: '',
      intentScore: 75
    });
    showToast('Nouveau prospect ajouté !');
  };

  const getStatusBadge = (status: ProspectStatus) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 border border-gray-200">Nouveau</span>;
      case 'visited':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">Visité</span>;
      case 'messaged':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">Message</span>;
      case 'replied':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Répondu</span>;
      case 'connected':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-700 border border-green-200">Connecté</span>;
      default:
        return null;
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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Prospects</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gérez vos cibles LinkedIn, suivez les statuts d'engagement et générez des accroches IA.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter</span>
        </button>
      </div>

      {/* Stats Quick Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center space-x-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Prospects</p>
            <p className="text-lg font-bold text-gray-900">{prospects.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center space-x-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Contactés</p>
            <p className="text-lg font-bold text-gray-900">
              {prospects.filter((p) => p.status === 'messaged' || p.status === 'replied').length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Connectés</p>
            <p className="text-lg font-bold text-gray-900">
              {prospects.filter((p) => p.status === 'connected' || p.status === 'replied').length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Score Moyen</p>
            <p className="text-lg font-bold text-gray-900">
              {Math.round(
                prospects.reduce((acc, p) => acc + p.intentScore, 0) / (prospects.length || 1)
              )}
              %
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom, titre ou entreprise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-gray-900 placeholder-gray-400"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center space-x-2 text-xs font-semibold text-gray-500 uppercase shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtres:</span>
          </div>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-gray-700"
          >
            <option value="all">Tous les statuts</option>
            <option value="new">Nouveaux</option>
            <option value="visited">Visités</option>
            <option value="messaged">Messages</option>
            <option value="connected">Connectés</option>
          </select>

          {/* Profile Type Dropdown */}
          <select
            value={selectedProfileType}
            onChange={(e) => setSelectedProfileType(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-gray-700"
          >
            <option value="all">Tous les profils</option>
            <option value="Founder">Fondateur</option>
            <option value="CEO">CEO</option>
            <option value="CTO">CTO</option>
            <option value="Investor">Investisseur</option>
            <option value="Product Manager">Product Manager</option>
            <option value="Developer">Développeur</option>
          </select>
        </div>
      </div>

      {/* Table / Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-3.5">Nom & Titre</th>
                <th scope="col" className="px-6 py-3.5">Type & Entreprise</th>
                <th scope="col" className="px-6 py-3.5">Statut</th>
                <th scope="col" className="px-6 py-3.5">Score d'Intérêt</th>
                <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProspects.length > 0 ? (
                filteredProspects.map((prospect) => (
                  <tr
                    key={prospect.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => {
                      setSelectedProspect(prospect);
                      setIsDetailModalOpen(true);
                    }}
                  >
                    {/* Name & Avatar */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-600 to-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                          {prospect.avatarInitials}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-sky-600 transition-colors">
                            {prospect.name}
                          </p>
                          <p className="text-xs text-gray-500 line-clamp-1 max-w-xs mt-0.5">
                            {prospect.headline}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Type & Company */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 text-xs">{prospect.company}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3" />
                          {prospect.profileType} • {prospect.location}
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      {getStatusBadge(prospect.status)}
                    </td>

                    {/* Intent Score */}
                    <td className="px-6 py-4">
                      <div className="w-36">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="font-semibold text-gray-700">{prospect.intentScore}%</span>
                          <span className="text-gray-400 text-[10px]">Score</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              prospect.intentScore >= 80
                                ? 'bg-emerald-500'
                                : prospect.intentScore >= 60
                                ? 'bg-sky-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${prospect.intentScore}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td
                      className="px-6 py-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          title="Voir détails"
                          onClick={() => {
                            setSelectedProspect(prospect);
                            setIsDetailModalOpen(true);
                          }}
                          className="p-1.5 text-gray-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          title="Générer message IA"
                          onClick={() => handleGenerateMessageRedirect(prospect)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>

                        <button
                          title="Supprimer"
                          onClick={() => handleDeleteProspect(prospect.id, prospect.name)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <p className="text-base font-semibold">Aucun prospect trouvé</p>
                    <p className="text-xs text-gray-400 mt-1">Essayez de modifier vos filtres ou d'ajouter un nouveau prospect.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Prospect Detail Modal */}
      <ProspectModal
        prospect={selectedProspect}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onUpdateStatus={handleUpdateStatus}
        onGenerateMessage={handleGenerateMessageRedirect}
      />

      {/* Add Prospect Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-lg p-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Ajouter un Prospect</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProspectSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Nom Complet *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Jean-Luc Mensah"
                  value={newProspect.name}
                  onChange={(e) => setNewProspect({ ...newProspect, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Titre / Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Fondateur & CEO @ TechAfrica"
                  value={newProspect.headline}
                  onChange={(e) => setNewProspect({ ...newProspect, headline: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Entreprise
                  </label>
                  <input
                    type="text"
                    placeholder="ex: TechAfrica"
                    value={newProspect.company}
                    onChange={(e) => setNewProspect({ ...newProspect, company: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Type de Profil
                  </label>
                  <select
                    value={newProspect.profileType}
                    onChange={(e) =>
                      setNewProspect({
                        ...newProspect,
                        profileType: e.target.value as ProfileType
                      })
                    }
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-gray-900"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Localisation
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Abidjan, Côte d'Ivoire"
                    value={newProspect.location}
                    onChange={(e) => setNewProspect({ ...newProspect, location: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Score d'Intérêt (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newProspect.intentScore}
                    onChange={(e) =>
                      setNewProspect({ ...newProspect, intentScore: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  URL LinkedIn
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={newProspect.linkedinUrl}
                  onChange={(e) => setNewProspect({ ...newProspect, linkedinUrl: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-gray-900"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors shadow-sm"
                >
                  Ajouter le prospect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
