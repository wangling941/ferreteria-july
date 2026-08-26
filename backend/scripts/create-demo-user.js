const { PrismaClient, UserRole } = require("@prisma/client");
const readline = require("readline/promises");
const { stdin: input, stdout: output } = require("process");

const { hashPassword } = require("../src/shared/helpers/hash.helper");

const prisma = new PrismaClient();

const demoUser = {
  username: "demo.vendedor",
  email: "demo.vendedor@ferreteriajuly.example",
  fullName: "Vendedor Demo",
  role: UserRole.SELLER,
  isActive: true,
};

async function main() {
  const plainPassword = await readDemoPassword();
  const passwordHash = await hashPassword(plainPassword);

  const user = await prisma.user.upsert({
    where: { username: demoUser.username },
    update: {
      email: demoUser.email,
      fullName: demoUser.fullName,
      passwordHash,
      role: demoUser.role,
      isActive: demoUser.isActive,
    },
    create: {
      ...demoUser,
      passwordHash,
    },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
    },
  });

  console.log("Usuario demo preparado correctamente:");
  console.log({
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    isActive: user.isActive,
  });
}

async function readDemoPassword() {
  if (process.env.DEMO_USER_PASSWORD) {
    return process.env.DEMO_USER_PASSWORD;
  }

  if (!process.stdin.isTTY) {
    throw new Error("Missing required environment variable: DEMO_USER_PASSWORD");
  }

  const rl = readline.createInterface({ input, output });
  try {
    const value = await rl.question("Password para usuario demo SELLER: ");
    if (!value) {
      throw new Error("Demo user password is required");
    }
    return value;
  } finally {
    rl.close();
  }
}

main()
  .catch((error) => {
    console.error("Error preparando usuario demo:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
