-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ARRIVAL', 'IN_STOCK', 'PLACED', 'SOLD', 'WRITTEN_OFF');

-- CreateEnum
CREATE TYPE "ShowcaseStatus" AS ENUM ('VISIBLE', 'HIDDEN');

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "ean" TEXT,
    "asin" TEXT,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "condition" TEXT,
    "purchase_price" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "sale_price" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "status" "ProductStatus" NOT NULL DEFAULT 'ARRIVAL',
    "cell" TEXT,
    "showcase_statuses" JSONB NOT NULL DEFAULT '{}',
    "arrival_date" TIMESTAMP(3),
    "images" TEXT[],
    "custom_fields" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE INDEX "products_name_idx" ON "products"("name");

-- CreateIndex
CREATE INDEX "products_sku_idx" ON "products"("sku");

-- CreateIndex
CREATE INDEX "products_ean_idx" ON "products"("ean");

-- CreateIndex
CREATE INDEX "products_category_idx" ON "products"("category");

-- CreateIndex
CREATE INDEX "products_status_idx" ON "products"("status");

-- CreateIndex
CREATE INDEX "products_cell_idx" ON "products"("cell");
