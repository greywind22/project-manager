import { PrismaClient } from '@prisma/client';

export const testPrisma = new PrismaClient();

// Truncate all tables in dependency order.
// asset.deleteMany() cascades to assetLink, assetFile, assetVideo
// at the database level via onDelete: Cascade in the schema.
export async function truncateTables() {
  await testPrisma.customField.deleteMany();
  await testPrisma.asset.deleteMany();
  await testPrisma.project.deleteMany();
}

export async function createTestProject() {
  return testPrisma.project.create({
    data: {
      title: 'Test Project',
      status: 'In Progress',
      address: '1 Test St, Sydney NSW',
    },
  });
}