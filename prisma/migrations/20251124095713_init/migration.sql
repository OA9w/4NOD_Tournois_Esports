-- CreateTable
CREATE TABLE "Game" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "releaseYear" INTEGER,
    "minPlayers" INTEGER NOT NULL,
    "maxPlayers" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Station" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "cpu" TEXT NOT NULL,
    "gpu" TEXT NOT NULL,
    "ram" TEXT NOT NULL,
    "storage" TEXT NOT NULL,
    "monitor" TEXT NOT NULL,
    "keyboard" TEXT NOT NULL,
    "mouse" TEXT NOT NULL,
    "headset" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
