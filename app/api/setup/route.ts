import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/setup - Crée les tables dans la base Neon
export async function GET() {
  if (!prisma) {
    return NextResponse.json({ error: 'Prisma non initialisé' }, { status: 500 });
  }

  const results: string[] = [];

  try {
    // Créer les tables avec raw SQL
    const queries = [
      `CREATE TABLE IF NOT EXISTS "prospects" (
        "id" SERIAL NOT NULL,
        "name" TEXT NOT NULL,
        "email" TEXT,
        "profile_url" TEXT NOT NULL,
        "profile_type" TEXT,
        "headline" TEXT,
        "company" TEXT,
        "location" TEXT,
        "status" TEXT NOT NULL DEFAULT 'new',
        "message_text" TEXT,
        "message_sent" BOOLEAN NOT NULL DEFAULT false,
        "visit_date" TIMESTAMP(3),
        "notes" TEXT,
        "intent_score" INTEGER,
        "signals" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "prospects_pkey" PRIMARY KEY ("id")
      );`,
      `ALTER TABLE "prospects" ADD COLUMN IF NOT EXISTS "email" TEXT;`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "prospects_profile_url_key" ON "prospects"("profile_url");`,
      `CREATE TABLE IF NOT EXISTS "email_logs" (
        "id" SERIAL NOT NULL,
        "prospect_id" INTEGER NOT NULL,
        "subject" TEXT NOT NULL,
        "body" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'sent',
        "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
      );`,
      `CREATE TABLE IF NOT EXISTS "conversations" (
        "id" SERIAL NOT NULL,
        "prospect_id" INTEGER NOT NULL,
        "channel" TEXT NOT NULL,
        "direction" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'sent',
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
      );`,
      `CREATE TABLE IF NOT EXISTS "campaigns" (
        "id" SERIAL NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "status" TEXT NOT NULL DEFAULT 'draft',
        "channel" TEXT NOT NULL DEFAULT 'linkedin',
        "daily_visit_limit" INTEGER NOT NULL DEFAULT 20,
        "daily_message_limit" INTEGER NOT NULL DEFAULT 10,
        "smart_delay_min" INTEGER NOT NULL DEFAULT 30,
        "smart_delay_max" INTEGER NOT NULL DEFAULT 120,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
      );`,
      `CREATE TABLE IF NOT EXISTS "steps" (
        "id" SERIAL NOT NULL,
        "campaign_id" INTEGER NOT NULL,
        "order" INTEGER NOT NULL,
        "type" TEXT NOT NULL,
        "channel" TEXT NOT NULL,
        "delay_days" INTEGER NOT NULL DEFAULT 0,
        "template" TEXT,
        "email_subject" TEXT,
        "email_body" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "steps_pkey" PRIMARY KEY ("id")
      );`,
      `ALTER TABLE "steps" ADD COLUMN IF NOT EXISTS "email_subject" TEXT;`,
      `ALTER TABLE "steps" ADD COLUMN IF NOT EXISTS "email_body" TEXT;`,
      `CREATE TABLE IF NOT EXISTS "campaign_prospects" (
        "id" SERIAL NOT NULL,
        "campaign_id" INTEGER NOT NULL,
        "prospect_id" INTEGER NOT NULL,
        "current_step" INTEGER NOT NULL DEFAULT 0,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "campaign_prospects_pkey" PRIMARY KEY ("id")
      );`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "campaign_prospects_campaign_id_prospect_id_key" ON "campaign_prospects"("campaign_id", "prospect_id");`,
      `CREATE TABLE IF NOT EXISTS "activities" (
        "id" SERIAL NOT NULL,
        "type" TEXT,
        "prospect_id" INTEGER,
        "campaign_id" INTEGER,
        "status" TEXT NOT NULL,
        "message" TEXT,
        "screenshot" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
      );`,
      `CREATE TABLE IF NOT EXISTS "settings" (
        "id" SERIAL NOT NULL,
        "key" TEXT NOT NULL,
        "value" TEXT,
        "updated_at" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
      );`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "settings_key_key" ON "settings"("key");`,
    ];

    for (const sql of queries) {
      await prisma.$executeRawUnsafe(sql);
      results.push('OK: ' + sql.substring(0, 50) + '...');
    }

    // Ajouter les foreign keys
    const fkQueries = [
      `ALTER TABLE "email_logs" ADD CONSTRAINT IF NOT EXISTS "email_logs_prospect_id_fkey" FOREIGN KEY ("prospect_id") REFERENCES "prospects"("id") ON DELETE CASCADE ON UPDATE CASCADE;`,
      `ALTER TABLE "conversations" ADD CONSTRAINT IF NOT EXISTS "conversations_prospect_id_fkey" FOREIGN KEY ("prospect_id") REFERENCES "prospects"("id") ON DELETE CASCADE ON UPDATE CASCADE;`,
      `ALTER TABLE "steps" ADD CONSTRAINT IF NOT EXISTS "steps_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;`,
      `ALTER TABLE "campaign_prospects" ADD CONSTRAINT IF NOT EXISTS "campaign_prospects_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;`,
      `ALTER TABLE "campaign_prospects" ADD CONSTRAINT IF NOT EXISTS "campaign_prospects_prospect_id_fkey" FOREIGN KEY ("prospect_id") REFERENCES "prospects"("id") ON DELETE CASCADE ON UPDATE CASCADE;`,
      `ALTER TABLE "activities" ADD CONSTRAINT IF NOT EXISTS "activities_prospect_id_fkey" FOREIGN KEY ("prospect_id") REFERENCES "prospects"("id") ON DELETE SET NULL ON UPDATE CASCADE;`,
      `ALTER TABLE "activities" ADD CONSTRAINT IF NOT EXISTS "activities_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;`,
    ];

    for (const sql of fkQueries) {
      try {
        await prisma.$executeRawUnsafe(sql);
        results.push('FK OK');
      } catch {
        results.push('FK déjà existant, ignoré');
      }
    }

    return NextResponse.json({ success: true, message: 'Base de données initialisée', details: results });
  } catch (error) {
    console.error('Erreur setup:', error);
    return NextResponse.json({ error: 'Erreur lors du setup', details: String(error) }, { status: 500 });
  }
}
