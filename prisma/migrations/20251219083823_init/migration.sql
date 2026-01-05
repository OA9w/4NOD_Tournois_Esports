/*
  Warnings:

  - You are about to drop the `Booking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Game` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Station` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Booking";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Game";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Station";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Tournament" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "game" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "maxParticipants" INTEGER NOT NULL,
    "prizePool" REAL NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "organizerId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Tournament_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Team" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "captainId" INTEGER NOT NULL,
    CONSTRAINT "Team_captainId_fkey" FOREIGN KEY ("captainId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Registration" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tournamentId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "registeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" DATETIME,
    "playerId" INTEGER,
    "teamId" INTEGER,
    CONSTRAINT "Registration_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Registration_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Registration_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PLAYER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "teamId" INTEGER,
    CONSTRAINT "User_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("createdAt", "email", "id", "password", "role", "updatedAt", "username") SELECT "createdAt", "email", "id", "password", "role", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Team_name_key" ON "Team"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Team_tag_key" ON "Team"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "Team_captainId_key" ON "Team"("captainId");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_tournamentId_playerId_key" ON "Registration"("tournamentId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_tournamentId_teamId_key" ON "Registration"("tournamentId", "teamId");
