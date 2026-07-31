import { NextRequest, NextResponse } from 'next/server';
import { generateMessage } from '@/lib/ai';

/**
 * POST /api/messages/generate - Génère un message IA personnalisé
 * Utilise Groq (Llama 3.3 70B) par défaut, Gemini en fallback.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prospect, persona, tone } = body;

    if (!prospect || !prospect.name) {
      return NextResponse.json({ error: 'Informations du prospect requises' }, { status: 400 });
    }

    const defaultPersona =
      persona ||
      `Fondateur de DocEngine (SaaS boilerplate Next.js) et iAfriShip (logistique + mobile money en Afrique). Basé à Cotonou, Bénin. Passionné par la tech africaine et l'entrepreneuriat.`;

    const message = await generateMessage(prospect, defaultPersona, tone || 'Amical');

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Erreur génération message:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la génération';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
