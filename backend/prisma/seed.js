const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Début du remplissage de la base de données...');

  // 1. Création des Avions
  const c172 = await prisma.aircraft.upsert({
    where: { registration: 'F-GMOD' },
    update: {},
    create: {
      registration: 'F-GMOD',
      type: 'C172',
    },
  });

  const dr400 = await prisma.aircraft.upsert({
    where: { registration: 'F-HBLF' },
    update: {},
    create: {
      registration: 'F-HBLF',
      type: 'DR400',
    },
  });

  // 2. Création d'une Licence exemple
  await prisma.license.create({
    data: {
      name: 'PPL(A) SEP',
      expiryDate: new Date('2026-12-31'),
    },
  });

  // 3. Création du certificat Médical
  await prisma.medical.create({
    data: {
      class: 2,
      expiryDate: new Date('2026-06-15'),
    },
  });

  console.log({ c172, dr400 });
  console.log('Seed terminé avec succès !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });