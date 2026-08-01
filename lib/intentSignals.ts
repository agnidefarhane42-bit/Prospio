import { prisma } from '@/lib/prisma';
import { Prospect } from '@prisma/client';

export interface SignalAnalysisResult {
  score: number;
  signals: string[];
  prospect: Prospect;
}

/**
 * Clean up JSON blocks if AI surrounds response with markdown backticks
 */
function parseAiJsonResponse(content: string): { score: number; signals: string[] } | null {
  try {
    const cleaned = content
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/, '')
      .replace(/\s*```$/, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    if (typeof parsed.score === 'number' && Array.isArray(parsed.signals)) {
      return {
        score: Math.min(100, Math.max(0, Math.round(parsed.score))),
        signals: parsed.signals.map((s: unknown) => String(s)),
      };
    }
  } catch (e) {
    console.error('Failed to parse AI JSON response:', e);
  }
  return null;
}

/**
 * Fallback scoring logic based on profileType, headline, company, and notes
 * when GROQ_API_KEY is not provided or API call fails.
 */
export function computeFallbackSignals(prospect: {
  profileType?: string | null;
  headline?: string | null;
  company?: string | null;
  notes?: string | null;
}): { score: number; signals: string[] } {
  let score = 50;
  const signalsSet = new Set<string>();

  const profileType = (prospect.profileType || '').toLowerCase();
  const headline = (prospect.headline || '').toLowerCase();
  const notes = (prospect.notes || '').toLowerCase();
  const company = prospect.company || '';

  // 1. Role-based scoring & signals
  if (
    profileType.includes('founder') ||
    profileType.includes('ceo') ||
    profileType.includes('fondateur')
  ) {
    score += 25;
    signalsSet.add('Fondateur / Décideur clé');
  } else if (
    profileType.includes('cto') ||
    profileType.includes('investor') ||
    profileType.includes('investisseur')
  ) {
    score += 20;
    signalsSet.add('Décideur technique / Investisseur');
  } else if (
    profileType.includes('product manager') ||
    profileType.includes('head') ||
    profileType.includes('director')
  ) {
    score += 15;
    signalsSet.add('Poste de management');
  } else if (profileType.includes('developer') || profileType.includes('développeur')) {
    score += 5;
    signalsSet.add('Profil technique');
  }

  // 2. Keyword detection in headline & notes
  if (
    headline.includes('hiring') ||
    headline.includes('recrute') ||
    headline.includes('recrutement') ||
    notes.includes('recrutement')
  ) {
    score += 15;
    signalsSet.add('Recrutement actif');
  }

  if (
    headline.includes('fund') ||
    headline.includes('levée') ||
    headline.includes('raise') ||
    headline.includes('seed') ||
    headline.includes('series') ||
    headline.includes('invest')
  ) {
    score += 20;
    signalsSet.add('Levée de fonds');
  }

  if (
    headline.includes('growth') ||
    headline.includes('croissance') ||
    headline.includes('scaling')
  ) {
    score += 10;
    signalsSet.add('Croissance équipe');
  }

  if (
    headline.includes('ex-') ||
    headline.includes('new') ||
    headline.includes('nouveau') ||
    headline.includes('recently')
  ) {
    score += 10;
    signalsSet.add('Changement de poste récent');
  }

  // Ensure signals set is not empty
  if (signalsSet.size === 0) {
    if (company) {
      signalsSet.add('Entreprise B2B ciblée');
    } else {
      signalsSet.add('Intérêt commercial potentiel');
    }
  }

  // Bound score between 0 and 100
  score = Math.min(100, Math.max(0, score));

  return {
    score,
    signals: Array.from(signalsSet),
  };
}

/**
 * Analyzes a prospect's intent signals using Groq (Llama 3.3 70B) or fallback,
 * updates the database, and returns the result.
 */
export async function analyzeProspectSignals(
  prospectOrId: number | Prospect
): Promise<SignalAnalysisResult> {
  let prospect: Prospect | null = null;

  if (typeof prospectOrId === 'number') {
    prospect = await prisma.prospect.findUnique({
      where: { id: prospectOrId },
    });
  } else {
    prospect = prospectOrId;
  }

  if (!prospect) {
    throw new Error('Prospect introuvable');
  }

  let score: number;
  let signals: string[];

  const apiKey = process.env.GROQ_API_KEY;

  if (apiKey) {
    try {
      const userPrompt = `Prospect LinkedIn:
- Nom: ${prospect.name || 'Inconnu'}
- Titre / Headline: ${prospect.headline || 'Non spécifié'}
- Entreprise: ${prospect.company || 'Non spécifiée'}
- Type de profil: ${prospect.profileType || 'Non spécifié'}
- Notes: ${prospect.notes || 'Aucune'}`;

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content:
                'Tu es un expert en sales intelligence B2B. Analyse ce prospect LinkedIn et attribue un score d\'intent (0-100) basé sur des signaux d\'achat. Réponds en JSON: {"score": number, "signals": ["signal1", "signal2"]}',
            },
            {
              role: 'user',
              content: userPrompt,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const contentStr = json.choices?.[0]?.message?.content || '';
        const parsed = parseAiJsonResponse(contentStr);

        if (parsed) {
          score = parsed.score;
          signals = parsed.signals;
        } else {
          const fallback = computeFallbackSignals(prospect);
          score = fallback.score;
          signals = fallback.signals;
        }
      } else {
        console.warn(`Groq API returned status ${res.status}, using fallback.`);
        const fallback = computeFallbackSignals(prospect);
        score = fallback.score;
        signals = fallback.signals;
      }
    } catch (err) {
      console.error('Groq API call error:', err);
      const fallback = computeFallbackSignals(prospect);
      score = fallback.score;
      signals = fallback.signals;
    }
  } else {
    const fallback = computeFallbackSignals(prospect);
    score = fallback.score;
    signals = fallback.signals;
  }

  const updatedProspect = await prisma.prospect.update({
    where: { id: prospect.id },
    data: {
      intentScore: score,
      signals: JSON.stringify(signals),
    },
  });

  return {
    score,
    signals,
    prospect: updatedProspect,
  };
}
