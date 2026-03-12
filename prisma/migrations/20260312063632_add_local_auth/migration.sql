/*
  Warnings:

  - You are about to drop the column `refresh_token` on the `user_token` table. All the data in the column will be lost.
  - Added the required column `password_hash` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hashed_refresh_token` to the `user_token` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "google_id" TEXT,
    "firstname_th" TEXT NOT NULL,
    "lastname_th" TEXT NOT NULL,
    "firstname_en" TEXT NOT NULL,
    "lastname_en" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "mobile" TEXT,
    "thumbnail_photo_url" TEXT,
    "position" TEXT,
    "user_status_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,
    "last_login_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "user_user_status_id_fkey" FOREIGN KEY ("user_status_id") REFERENCES "status" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_user" ("created_at", "email", "firstname_en", "firstname_th", "google_id", "id", "lastname_en", "lastname_th", "mobile", "password_hash", "position", "role_id", "thumbnail_photo_url", "updated_at", "user_status_id") SELECT "created_at", "email", "firstname_en", "firstname_th", "google_id", "id", "lastname_en", "lastname_th", "mobile", '$2b$10$VbJTg4miQLrL6iqCi4zVG.sBzbht7SfQv8gpYgkBw6JNWH7rwxUk2', "position", "role_id", "thumbnail_photo_url", "updated_at", "user_status_id" FROM "user";
DROP TABLE "user";
ALTER TABLE "new_user" RENAME TO "user";
CREATE UNIQUE INDEX "user_google_id_key" ON "user"("google_id");
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
CREATE TABLE "new_user_token" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "hashed_refresh_token" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "user_token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_user_token" ("created_at", "expires_at", "hashed_refresh_token", "id", "is_revoked", "updated_at", "user_id") SELECT "created_at", "expires_at", "refresh_token", "id", "is_revoked", "updated_at", "user_id" FROM "user_token";
DROP TABLE "user_token";
ALTER TABLE "new_user_token" RENAME TO "user_token";
CREATE UNIQUE INDEX "user_token_user_id_key" ON "user_token"("user_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
