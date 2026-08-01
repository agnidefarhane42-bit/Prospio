import { NextRequest, NextResponse } from 'next/server';
import { analyzeProspectSignals } from '@/lib/intentSignals';

// POST /api/prospects/[id]/signals - Analyse un prospect et met à jour son score/signaux
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prospectId = parseInt(params.id, 10);
    if (isNaN(prospectId)) {
      return NextResponse.json({ error: 'ID prospect invalide' }, { status: 400 });
    }

    const result = await analyzeProspectSignals(prospectId);
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Erreur POST prospect signals:', error);
    const message =
      error instanceof Error ? error.message : 'Erreur lors de l\'analyse des signaux';
    const status = message === 'Prospect introuvable' ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
