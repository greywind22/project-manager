import { PrismaClient, AssetType, CustomFieldType } from '@prisma/client';

// This seed file populates the DB with sample data for development.
// Run with: npm run db:seed
// SHORTCUT: Custom fields are seeded rather than user-created via UI.

const prisma = new PrismaClient();

async function main() {
  // Clean slate
  await prisma.asset.deleteMany();
  await prisma.customField.deleteMany();
  await prisma.project.deleteMany();

  const project1 = await prisma.project.create({
    data: {
      title: 'King St Commercial Fit-out',
      status: 'In Progress',
      bookedDate: new Date('2021-10-12'),
      bookingId: '10092',
      customerRef: 'SG10092',
      address: '5 King St, Sydney, NSW',
      description:
        'Post-flood damage assessment for a commercial tenancy on King St. ' +
        'Drone capture and 3D Matterport walkthrough completed on site. ' +
        'Digital twin model under review by the insurer for structural loss estimation.',
      customFields: {
        create: [
          { key: 'Internal', value: 'TYPE 4', valueType: CustomFieldType.TEXT },
          { key: 'External', value: 'Commercial', valueType: CustomFieldType.TEXT },
          { key: 'Cat', value: false, valueType: CustomFieldType.BOOLEAN },
          { key: 'Post', value: false, valueType: CustomFieldType.BOOLEAN },
        ],
      },
      assets: {
        create: [
          {
            type: AssetType.LINK,
            name: 'pix4d',
            thumbnailUrl: '/thumbnails/link.png',
            assetLink: { create: { url: 'https://pix4d.com', label: 'pix4d' } },
          },
          {
            type: AssetType.LINK,
            name: 'Matterport walkthrough',
            thumbnailUrl: '/thumbnails/link.png',
            assetLink: {
              create: {
                url: 'https://my.matterport.com/show/?m=YdG9cgxNPGc',
                label: 'https://my.matterport.com/show/?m=YdG9cgxNPGc',
              },
            },
          },
        ],
      },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      title: 'Harbour Bridge Inspection',
      status: 'Complete',
      bookedDate: new Date('2021-08-03'),
      bookingId: '10087',
      customerRef: 'SG10087',
      address: 'Sydney Harbour Bridge, NSW',
      description:
        'Annual structural inspection conducted via drone survey and photogrammetry. ' +
        'High-resolution 3D point cloud delivered to the insurer for asset condition reporting. ' +
        'No material damage identified during this inspection cycle.',
      customFields: {
        create: [
          { key: 'Internal', value: 'TYPE 2', valueType: CustomFieldType.TEXT },
          { key: 'External', value: 'Government', valueType: CustomFieldType.TEXT },
          { key: 'Cat', value: true, valueType: CustomFieldType.BOOLEAN },
          { key: 'Post', value: true, valueType: CustomFieldType.BOOLEAN },
        ],
      },
    },
  });

  console.log('Seeded projects:', project1.id, project2.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());