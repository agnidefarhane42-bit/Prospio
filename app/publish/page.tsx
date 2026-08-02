"use client";

import { useState, useEffect, useCallback } from "react";
import { Sparkles, Send, Clock, Trash2, RefreshCw, Image as ImageIcon, Loader2 } from "lucide-react";

interface Post {
  id: number;
  content: string;
  mediaUrl: string | null;
  status: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  aiGenerated: boolean;
  theme: string | null;
  hashtags: string | null;
  error: string | null;
  createdAt: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: "Brouillon", color: "bg-gray-100 text-gray-700 border-gray-200" },
  scheduled: { label: "Programmé", color: "bg-blue-100 text-blue-700 border-blue-200" },
  publishing: { label: "Publication…", color: "bg-amber-100 text-amber-700 border-amber-200" },
  published: { label: "Publié", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  failed: { label: "Échec", color: "bg-red-100 text-red-700 border-red-200" },
};

export default function PublishPage() {
  const [theme, setTheme] = useState("");
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishingId, setPublishingId] = useState<number | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      setPosts(data.posts || []);
    } catch {
      setError("Erreur lors du chargement des posts");
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleGenerate = async () => {
    if (!theme.trim()) {
      setError("Entre un thème d'abord");
      return;
    }
    setGenerating(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/posts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur génération");
      setContent(data.content);
      setSuccess("Post généré par l'IA ! Tu peux l'éditer avant publication.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur génération IA");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async (status: "draft" | "scheduled") => {
    if (!content.trim()) {
      setError("Le contenu est vide");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          mediaUrl: mediaUrl || null,
          status,
          scheduledAt: status === "scheduled" ? scheduledAt : null,
          aiGenerated: true,
          theme: theme || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur sauvegarde");
      setSuccess(status === "scheduled" ? "Post programmé !" : "Brouillon sauvegardé.");
      setContent("");
      setTheme("");
      setMediaUrl("");
      setScheduledAt("");
      loadPosts();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handlePublishNow = async () => {
    if (!content.trim()) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          mediaUrl: mediaUrl || null,
          status: "publishing",
          aiGenerated: true,
          theme: theme || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess("Post envoyé pour publication immédiate sur LinkedIn !");
      setContent("");
      setTheme("");
      setMediaUrl("");
      loadPosts();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (id: number) => {
    setPublishingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/posts/${id}/publish`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setSuccess("Post envoyé pour publication sur LinkedIn…");
      loadPosts();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setPublishingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/posts/${id}`, { method: "DELETE" });
      loadPosts();
    } catch {
      setError("Erreur suppression");
    }
  };

  const statusInfo = (status: string) => STATUS_LABELS[status] || { label: status, color: "bg-gray-100 text-gray-700" };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Composer un post LinkedIn</h1>
          <p className="text-sm text-gray-500 mt-1">Génère ton contenu avec l'IA, programme ou publie immédiatement.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-sky-700 bg-sky-50 px-3 py-1.5 rounded-full border border-sky-100">
          <Sparkles className="w-3.5 h-3.5" /> IA Gemini Flash
        </div>
      </div>

      {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}
      {success && <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-600">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Éditeur */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Thème / Sujet</label>
            <div className="flex gap-2">
              <input type="text" value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="Ex: l'avenir du SaaS en Afrique francophone" className="flex-1 rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none" />
              <button onClick={handleGenerate} disabled={generating} className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 transition disabled:opacity-60">
                {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Génération…</> : <><Sparkles className="w-4 h-4" /> Générer</>}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Contenu du post</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={10} placeholder="Génère avec l'IA ou écris directement ton post…" className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm leading-relaxed focus:ring-2 focus:ring-sky-500 outline-none resize-y" />
            <p className="text-xs text-gray-400 mt-1">{content.length} caractères{content.length > 3000 && <span className="text-amber-600"> (recommandé: max 3000)</span>}</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block flex items-center gap-1.5"><ImageIcon className="w-4 h-4 text-gray-400" /> Image (URL) — optionnel</label>
            <input type="url" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder="https://exemple.com/image.jpg" className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block flex items-center gap-1.5"><Clock className="w-4 h-4 text-gray-400" /> Programmer pour (optionnel)</label>
            <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button onClick={() => handleSave("draft")} disabled={saving || !content.trim()} className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 disabled:opacity-60">Sauver brouillon</button>
            {scheduledAt && <button onClick={() => handleSave("scheduled")} disabled={saving || !content.trim()} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"><Clock className="w-4 h-4" />Programmer</button>}
            <button onClick={handlePublishNow} disabled={saving || !content.trim()} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"><Send className="w-4 h-4" />Publier maintenant</button>
          </div>
        </div>

        {/* Aperçu */}
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-bold text-gray-700 mb-3">Aperçu LinkedIn</h3>
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-start gap-3 p-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 text-white text-sm font-bold flex items-center justify-center shrink-0">AF</div>
              <div><p className="text-sm font-bold text-gray-900">Farhane Agnide</p><p className="text-xs text-gray-500">Entrepreneur tech • DocEngine & iAfriShip</p><p className="text-xs text-gray-400">À l'instant</p></div>
            </div>
            <div className="px-4 pb-3">
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{content || <span className="text-gray-300 italic">Ton post apparaîtra ici…</span>}</p>
            </div>
            {mediaUrl && <div className="px-4 pb-3"><img src={mediaUrl} alt="Aperçu" className="w-full rounded-lg max-h-64 object-cover border border-gray-100" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} /></div>}
            <div className="border-t border-gray-100 px-4 py-2 flex justify-around text-xs text-gray-500"><span>👍 J'aime</span><span>💬 Commenter</span><span>↗️ Partager</span></div>
          </div>
        </div>
      </div>

      {/* Historique */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Historique</h2>
          <button onClick={loadPosts} className="text-sm text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5" />Actualiser</button>
        </div>
        {loadingPosts ? <div className="text-center py-8 text-gray-400 text-sm">Chargement…</div> : posts.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-white border border-gray-200"><p className="text-gray-400 text-sm">Aucun post. Génère ton premier post ci-dessus !</p></div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => {
              const si = statusInfo(post.status);
              return (
                <div key={post.id} className="rounded-xl bg-white border border-gray-200 shadow-sm p-4 flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${si.color}`}>{si.label}</span>
                      {post.aiGenerated && <span className="text-xs text-sky-600 font-medium flex items-center gap-0.5"><Sparkles className="w-3 h-3" />IA</span>}
                      {post.theme && <span className="text-xs text-gray-400">Thème: {post.theme}</span>}
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-3 whitespace-pre-wrap">{post.content}</p>
                    {post.error && <p className="text-xs text-red-500 mt-1">Erreur: {post.error}</p>}
                    {post.scheduledAt && <p className="text-xs text-blue-500 mt-1">Programmé: {new Date(post.scheduledAt).toLocaleString("fr-FR")}</p>}
                    {post.publishedAt && <p className="text-xs text-emerald-500 mt-1">Publié: {new Date(post.publishedAt).toLocaleString("fr-FR")}</p>}
                  </div>
                  <div className="flex sm:flex-col gap-2 sm:items-end shrink-0">
                    {(post.status === "draft" || post.status === "failed") && <button onClick={() => handlePublish(post.id)} disabled={publishingId === post.id} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">{publishingId === post.id ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Envoi…</> : <><Send className="w-3.5 h-3.5" />Publier</>}</button>}
                    <button onClick={() => handleDelete(post.id)} className="text-xs font-semibold text-red-500 hover:text-red-600 flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" />Suppr.</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
