-- CreateTable
CREATE TABLE "prospects" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
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
);

-- CreateTable
CREATE TABLE "campaigns" (
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
);

-- CreateTable
CREATE TABLE "steps" (
    "id" SERIAL NOT NULL,
    "campaign_id" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "delay_days" INTEGER NOT NULL DEFAULT 0,
    "template" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_prospects" (
    "id" SERIAL NOT NULL,
    "campaign_id" INTEGER NOT NULL,
    "prospect_id" INTEGER NOT NULL,
    "current_step" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_prospects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" SERIAL NOT NULL,
    "type" TEXT,
    "prospect_id" INTEGER,
    "campaign_id" INTEGER,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "screenshot" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "prospects_profile_url_key" ON "prospects"("profile_url");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_prospects_campaign_id_prospect_id_key" ON "campaign_prospects"("campaign_id", "prospect_id");

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");

-- AddForeignKey
ALTER TABLE "steps" ADD CONSTRAINT "steps_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_prospects" ADD CONSTRAINT "campaign_prospects_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_prospects" ADD CONSTRAINT "campaign_prospects_prospect_id_fkey" FOREIGN KEY ("prospect_id") REFERENCES "prospects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_prospect_id_fkey" FOREIGN KEY ("prospect_id") REFERENCES "prospects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;
