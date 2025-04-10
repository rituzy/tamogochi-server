-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "telegramId" TEXT NOT NULL,
    "username" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "photoUrl" TEXT,
    "language" TEXT NOT NULL DEFAULT 'ru',
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "coins" INTEGER NOT NULL DEFAULT 0,
    "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Питомец',
    "level" INTEGER NOT NULL DEFAULT 1,
    "hunger" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "happiness" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "energy" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "health" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "knowledge" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "feedBonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "happyBonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastFeed" TIMESTAMP(3),
    "lastPlay" TIMESTAMP(3),
    "lastSleep" TIMESTAMP(3),
    "lastEducate" TIMESTAMP(3),
    "accessories" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");

-- CreateIndex
CREATE UNIQUE INDEX "Pet_ownerId_key" ON "Pet"("ownerId");

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
