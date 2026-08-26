const { PrismaClient, UserRole } = require('@prisma/client');
const readline = require('readline/promises');
const { stdin: input, stdout: output } = require('process');
const { hashPassword } = require('../shared/helpers/hash.helper');

const prisma = new PrismaClient();

async function runSeed() {
  const adminPlainPassword = await readPassword(
    'SEED_ADMIN_PASSWORD',
    'Password para el usuario admin: ',
  );
  const sellerPlainPassword = await readPassword(
    'SEED_SELLER_PASSWORD',
    'Password para el usuario vendedor1: ',
  );

  const adminPassword = await hashPassword(adminPlainPassword);
  const sellerPassword = await hashPassword(sellerPlainPassword);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@ferreteriajuly.local',
      fullName: 'Administrador General',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { username: 'vendedor1' },
    update: {},
    create: {
      username: 'vendedor1',
      email: 'vendedor1@ferreteriajuly.local',
      fullName: 'Vendedor Principal',
      passwordHash: sellerPassword,
      role: UserRole.SELLER,
      isActive: true,
    },
  });

  console.log('Seed ejecutado correctamente: usuarios base creados.');
}

async function readPassword(envKey, promptText) {
  if (process.env[envKey]) {
    return process.env[envKey];
  }

  if (!process.stdin.isTTY) {
    throw new Error(`Missing required environment variable: ${envKey}`);
  }

  const rl = readline.createInterface({ input, output });
  try {
    const value = await rl.question(promptText);
    if (!value) {
      throw new Error(`Missing required password for ${envKey}`);
    }
    return value;
  } finally {
    rl.close();
  }
}

runSeed()
  .catch((error) => {
    console.error('Error ejecutando seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
