-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "telegramId" TEXT NOT NULL,
    "username" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "photoUrl" TEXT,
    "language" TEXT NOT NULL DEFAULT 'ru',
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "coins" INTEGER NOT NULL DEFAULT 0,
    "lastActive" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Pet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT 'Питомец',
    "level" INTEGER NOT NULL DEFAULT 1,
    "hunger" REAL NOT NULL DEFAULT 100,
    "happiness" REAL NOT NULL DEFAULT 100,
    "energy" REAL NOT NULL DEFAULT 100,
    "health" REAL NOT NULL DEFAULT 100,
    "knowledge" REAL NOT NULL DEFAULT 0,
    "feedBonus" REAL NOT NULL DEFAULT 0,
    "happyBonus" REAL NOT NULL DEFAULT 0,
    "lastFeed" DATETIME,
    "lastPlay" DATETIME,
    "lastSleep" DATETIME,
    "lastEducate" DATETIME,
    "accessories" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Pet_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");

-- CreateIndex
CREATE UNIQUE INDEX "Pet_ownerId_key" ON "Pet"("ownerId");
