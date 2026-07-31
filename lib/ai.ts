/**
 * Module de génération de messages IA pour Prospio.
 * Supporte Groq (Llama) et Gemini (Google) — priorité à Groq si la clé est présente.
 *
 * @module lib/ai
 */

export interface ProspectInfo {
  name: string;
  headline?: string | null;
  company?: string | null;
  location?: string | null;
  bio?: string;
}

export interface GenerateOptions {
  prospect: ProspectInfo;
  persona: string;
  tone: string;
}

/**
 * Construit le prompt commun pour la génération de message LinkedIn.
 */
function buildPrompt(prospect: ProspectInfo, persona: string, tone: string): string {
  return `Tu es un assistant qui rédige des messages de prospection LinkedIn ultra-personnalisés.

PERSONA DE L'EXPÉDITEUR:
${persona}

PROSPECT CIBLE:
- Nom: ${prospect.name}
- Titre: ${prospect.headline || 'Non spécifié'}
- Entreprise: ${prospect.company || 'Non spécifié'}
- Localisation: ${prospect.location || 'Non spécifié'}
- Bio: ${prospect.bio || 'Non spécifié'}

INSTRUCTIONS:
1. Ton: ${tone}
2. Longueur: Maximum 300 caractères (obligatoire pour LinkedIn)
3. Personnalise en fonction du titre, de l'entreprise et du secteur
4. Mentionne un point commun ou un compliment sincère
5. Termine par une question ouverte pour inviter au dialogue
6. Pas de emojis excessifs (1 max)
7. Pas de jargon commercial agressif
8. Écris en français

Réponds UNIQUEMENT avec le message, sans guillemets ni explications.`;
}

/**
 * Génère un message via Groq (Llama 3.3 70B).
 * API: https://api.groq.com/openai/v1/chat/completions (compatible OpenAI)
 */
async function generateWithGroq(prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY non configurée');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error: ${err}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '';
  return text.trim().slice(0, 300);
}

/**
 * Génère un message via Gemini 1.5 Flash (fallback).
 */
async function generateWithGemini(prompt: string): Promise<string> {
  // Import dynamique pour éviter de charger le SDK si pas nécessaire
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY non configurée');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return text.trim().slice(0, 300);
}

/**
 * Génère un message personnalisé pour un prospect LinkedIn.
 * Priorité: Groq → Gemini → erreur.
 *
 * @param prospect - Infos du prospect
 * @param persona - Description du persona de l'expéditeur
 * @param tone - Ton du message (Professionnel, Amical, Direct, Persuasif)
 * @returns Message personnalisé (max 300 caractères)
 */
export async function generateMessage(
  prospect: ProspectInfo,
  persona: string,
  tone: string
): Promise<string> {
  const prompt = buildPrompt(prospect, persona, tone);

  // Priorité à Groq si la clé est disponible
  if (process.env.GROQ_API_KEY) {
    try {
      return await generateWithGroq(prompt);
    } catch (e) {
      console.warn('Groq a échoué, fallback vers Gemini:', e);
    }
  }

  // Fallback Gemini
  if (process.env.GEMINI_API_KEY) {
    return await generateWithGemini(prompt);
  }

  throw new Error('Aucune clé API IA configurée (GROQ_API_KEY ou GEMINI_API_KEY)');
}
