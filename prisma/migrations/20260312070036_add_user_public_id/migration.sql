/*
  Warnings:

  - Added the required column `public_id` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "public_id" TEXT NOT NULL,
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
INSERT INTO "new_user" ("created_at", "email", "firstname_en", "firstname_th", "google_id", "id", "last_login_at", "lastname_en", "lastname_th", "mobile", "password_hash", "position", "public_id", "role_id", "thumbnail_photo_url", "updated_at", "user_status_id") SELECT "created_at", "email", "firstname_en", "firstname_th", "google_id", "id", "last_login_at", "lastname_en", "lastname_th", "mobile", "password_hash", "position", lower(hex(randomblob(16))), "role_id", "thumbnail_photo_url", "updated_at", "user_status_id" FROM "user";
DROP TABLE "user";
ALTER TABLE "new_user" RENAME TO "user";
CREATE UNIQUE INDEX "user_public_id_key" ON "user"("public_id");
CREATE UNIQUE INDEX "user_google_id_key" ON "user"("google_id");
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
