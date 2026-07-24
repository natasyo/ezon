/*
  Warnings:

  - A unique constraint covering the columns `[ean]` on the table `products` will be added.
  - A unique constraint covering the columns `[asin]` on the table `products` will be added.

*/
-- First, clean up any existing duplicates (keep the first one, mark others)
DELETE FROM products a USING (
  SELECT MIN(id) as id, ean FROM products WHERE ean IS NOT NULL GROUP BY ean HAVING COUNT(*) > 1
) b WHERE a.ean = b.ean AND a.id != b.id;

DELETE FROM products a USING (
  SELECT MIN(id) as id, asin FROM products WHERE asin IS NOT NULL GROUP BY asin HAVING COUNT(*) > 1
) b WHERE a.asin = b.asin AND a.id != b.id;

-- CreateIndex
CREATE UNIQUE INDEX "products_ean_key" ON "products"("ean");

-- CreateIndex
CREATE UNIQUE INDEX "products_asin_key" ON "products"("asin");
