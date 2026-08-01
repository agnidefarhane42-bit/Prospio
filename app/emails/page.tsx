'use client';

import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  Sparkles,
  Loader2,
  Check,
  X,
  Search,
  Inbox,
  ArrowRight,
  Users,
} from 'lucide-react';

interface Prospect {
  id: number;
  name: string;
  email?: string | null;
  headline?: string | null;
  company?: string | null;
  location?: string | null;
  status: string;
  intentScore?: number | null;
  notes?: string | null;
}

interface EmailLog {
  id: number;
  prospectId: number;
  subject: string;
  body: string;
  status: string;
  sentAt: string;
  prospect: Prospect;
}

export default function EmailsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sending, setSending] = useState(false);
  const [generating, setGenerating] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prospectsRes, emailsRes] = await Promise.all([
        fetch('/api/prospects'),
        fetch('/api/emails'),
      ]);
      const prospectsData = await prospectsRes.json();
      const emailsData = await emailsRes.json();
      setProspects(prospectsData);
      setEmailLogs(emailsData);
    } catch (e) {
      console.error('Erreur:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEmailModal = (prospect: Prospect) => {
    setSelectedProspect(prospect);
    setEmailSubject('');
    setEmailBody('');
    setIsModalOpen(true);
  };

  const handleGenerate = async () => {
    if (!selectedProspect) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/emails/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospect: selectedProspect,
          persona: 'Fondateur de DocEngine et iAfriShip, expert en IA et automatisation',
          tone: 'Professionnel et direct',
        }),
      });
      const data = await res.json();
      if (data.subject) setEmailSubject(data.subject);
      if (data.body) setEmailBody(data.body);
      showToast('Email généré par IA !');
    } catch {
      showToast('Erreur génération IA');
    } finally {
      setGenerating(false);
    }
  };

  const handleSend = async () => {
    if (!selectedProspect || !emailSubject || !emailBody) return;
    if (!selectedProspect.email) {
      showToast("Ce prospect n'a pas d'email");
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospectId: selectedProspect.id,
          subject: emailSubject,
          body: emailBody,
          from: 'Prospio <onboarding@resend.dev>',
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Email envoyé à ${selectedProspect.name} !`);
        setIsModalOpen(false);
        fetchData();
      } else {
        showToast('Erreur envoi: ' + (data.error || 'inconnue'));
      }
    } catch {
      showToast('Erreur envoi');
    } finally {
      setSending(false);
    }
  };

  const filteredProspects = prospects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.company || '').toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: prospects.length,
    withEmail: prospects.filter((p) => p.email).length,
    sent: emailLogs.filter((e) => e.status === 'sent').length,
    opened: emailLogs.filter((e) => e.status === 'opened').length,
  };

  return (
    <div className="space-y-6 pb-12">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Emails</h1>
          <p className="text-sm text-gray-500 mt-1">Envoyez des emails personnalisés générés par IA à vos prospects.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-sky-500" />
            <span className="text-xs text-gray-500 font-medium">Total Prospects</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-gray-500 font-medium">Avec Email</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.withEmail}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Send className="w-4 h-4 text-indigo-500" />
            <span className="text-xs text-gray-500 font-medium">Envoyés</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.sent}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Inbox className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-gray-500 font-medium">Ouverts</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.opened}</p>
        </div>
      </div>

      {/* Two columns: Prospects list + Recent emails */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prospects list */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher un prospect..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="ml-2 text-sm">Chargement...</span>
              </div>
            ) : filteredProspects.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Mail className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Aucun prospect trouvé</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                {filteredProspects.map((prospect) => (
                  <div key={prospect.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center text-sm font-bold">
                        {prospect.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{prospect.name}</p>
                        <p className="text-xs text-gray-500">
                          {prospect.company || prospect.headline || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {prospect.email ? (
                        <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                          {prospect.email}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                          Pas d'email
                        </span>
                      )}
                      <button
                        onClick={() => openEmailModal(prospect)}
                        disabled={!prospect.email}
                        className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          prospect.email
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            : 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'
                        }`}
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Envoyer</span></button>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent emails */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Inbox className="w-4 h-4 text-emerald-600" />
                Emails récents
              </h3>
            </div>
            {emailLogs.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Send className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-xs">Aucun email envoyé</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                {emailLogs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{log.prospect.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        log.status === 'sent' ? 'bg-emerald-50 text-emerald-600' :
                        log.status === 'opened' ? 'bg-blue-50 text-blue-600' :
                        log.status === 'failed' ? 'bg-red-50 text-red-600' :
                        'bg-gray-50 text-gray-500'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 truncate">{log.subject}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(log.sentAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {isModalOpen && selectedProspect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center text-sm font-bold">
                  {selectedProspect.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selectedProspect.name}</h2>
                  <p className="text-xs text-gray-500">{selectedProspect.email}</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-5 space-y-4">
              {/* From/To */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-gray-400 font-medium mb-1">De</p>
                  <p className="font-semibold text-gray-700">Prospio &lt;onboarding@resend.dev&gt;</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-gray-400 font-medium mb-1">À</p>
                  <p className="font-semibold text-gray-700">{selectedProspect.email}</p>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">Sujet</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Objet de l'email..."
                  className="w-full mt-1 px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Body */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase">Message</label>
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                  >
                    {generating ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Génération...</span></>
                    ) : (
                      <><Sparkles className="w-3.5 h-3.5" /><span>Générer avec IA</span></button>
                    )}
                  </button>
                </div>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Votre message..."
                  rows={10}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                />
              </div>

              {/* Info note */}
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-700">
                ℹ️ Les emails sont envoyés via Resend. Vérifiez votre domaine dans les paramètres Resend pour utiliser votre propre adresse d'envoi.
              </div>
            </div>

            {/* Modal footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex items-center justify-between">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={handleSend}
                disabled={!emailSubject || !emailBody || sending}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /><span>Envoi...</span></>
                ) : (
                  <><Send className="w-4 h-4" /><span>Envoyer</span></button>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
