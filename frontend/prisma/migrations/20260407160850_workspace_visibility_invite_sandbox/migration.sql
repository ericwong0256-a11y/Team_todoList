-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Workspace" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "inviteCode" TEXT,
    "isSandbox" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Workspace" ("createdAt", "id", "name", "slug", "updatedAt") SELECT "createdAt", "id", "name", "slug", "updatedAt" FROM "Workspace";
DROP TABLE "Workspace";
ALTER TABLE "new_Workspace" RENAME TO "Workspace";
CREATE UNIQUE INDEX "Workspace_slug_key" ON "Workspace"("slug");
CREATE UNIQUE INDEX "Workspace_inviteCode_key" ON "Workspace"("inviteCode");
CREATE INDEX "Workspace_visibility_idx" ON "Workspace"("visibility");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
