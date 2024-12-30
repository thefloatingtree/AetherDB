-- CreateTable
CREATE TABLE "Player" (
    "id" SERIAL NOT NULL,
    "steamId" TEXT NOT NULL,
    "steamAvatarIcon" TEXT,
    "steamAvatarMedium" TEXT,
    "steamAvatarFull" TEXT,
    "steamName" TEXT,
    "rankSamples" INTEGER[],
    "rankSamplesTimestamps" TIMESTAMP(3)[],
    "eloSamples" INTEGER[],
    "eloSamplesTimestamps" TIMESTAMP(3)[],

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_steamId_key" ON "Player"("steamId");
