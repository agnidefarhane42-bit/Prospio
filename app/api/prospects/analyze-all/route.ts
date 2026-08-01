import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { analyzeProspectSignals, SignalAnalysisResult } from '@/lib/intentSignals';

// POST /api/prospects/analyze-all - Analyse tous les prospects par lots de 5
export async function POST(request: NextRequest) {
  try {
    const prospects = await prisma.prospect.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const BATCH_SIZE = 5;
    const results: SignalAnalysisResult[] = [];

    for (let i = 0; i < prospects.length; i += BATCH_SIZE) {
      const batch = prospects.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map((p) => analyzeProspectSignals(p))
      );
      results.push(...batchResults);
    }

    const total = results.length;
    const averageScore =
      total > 0
        ? Math.round(results.reduce((acc, r) => acc + r.score, 0) / total)
        : 0;

    return NextResponse.json({
      message: `Analyse terminée pour ${total} prospects`,
      total,
      averageScore,
      results,
    });
  } catch (error) {
    console.error('Erreur POST analyze-all:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'analyse de tous les prospects' },
      { status: 500 }
    );
  }
}
