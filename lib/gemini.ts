import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Génère un message personnalisé pour un prospect LinkedIn via Gemini 1.5 Flash.
 * @param prospect - Infos du prospect (nom, headline, company, etc.)
 * @param persona - Description du persona de l'expéditeur (Farhane Agnide)
 * @param tone - Ton du message (Professionnel, Amical, Direct, Persuasif)
 * @returns Message personnalisé (max 300 caractères pour LinkedIn)
 */
export async function generateMessage(
  prospect: { name: string; headline?: string; company?: string; location?: string; bio?: string },
  persona: string,
  tone: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY non configurée');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Tu es un assistant qui rédige des messages de prospection LinkedIn ultra-personnalisés.

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

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return text.trim().slice(0, 300);
}
