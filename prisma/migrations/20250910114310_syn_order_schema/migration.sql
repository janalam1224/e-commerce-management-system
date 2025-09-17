/*
  Warnings:

  - You are about to drop the column `serviceType` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `customerId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the `Customer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_customerId_fkey";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "serviceType";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "customerId",
DROP COLUMN "status";

-- DropTable
DROP TABLE "Customer";

-- DropEnum
DROP TYPE "OrderStatus";

-- DropEnum
DROP TYPE "ServiceType";
