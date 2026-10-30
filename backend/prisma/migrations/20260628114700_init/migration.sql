/*
  Warnings:

  - You are about to drop the column `cell` on the `products` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'EMPLOYEE');

-- DropIndex
DROP INDEX "products_cell_idx";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "cell",
ADD COLUMN     "cell_id" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'EMPLOYEE';

-- CreateTable
CREATE TABLE "settings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT '',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "cells" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cells_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_field_configs" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "category_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_field_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "sid" TEXT NOT NULL,
    "sess" JSONB NOT NULL,
    "expire" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("sid")
);

-- CreateIndex
CREATE UNIQUE INDEX "cells_name_key" ON "cells"("name");

-- CreateIndex
CREATE UNIQUE INDEX "custom_field_configs_key_category_id_key" ON "custom_field_configs"("key", "category_id");

-- CreateIndex
CREATE INDEX "user_sessions_expire_idx" ON "user_sessions"("expire");

-- CreateIndex
CREATE INDEX "products_cell_id_idx" ON "products"("cell_id");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_cell_id_fkey" FOREIGN KEY ("cell_id") REFERENCES "cells"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_field_configs" ADD CONSTRAINT "custom_field_configs_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
