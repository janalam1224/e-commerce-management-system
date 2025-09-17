-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'manager';
ALTER TYPE "Role" ADD VALUE 'staff';

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "paymentMethod" SET DEFAULT 'cash';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
