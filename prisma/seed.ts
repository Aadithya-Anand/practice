import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: "driver@vandi.demo" },
  });
  if (existing) {
    console.log("Demo driver already exists: driver@vandi.demo");
    return;
  }

  const passwordHash = bcrypt.hashSync("driver123", 10);
  const user = await prisma.user.create({
    data: {
      email: "driver@vandi.demo",
      passwordHash,
      role: "driver",
    },
  });

  await prisma.driverProfile.create({
    data: {
      userId: user.id,
      name: "Demo Driver",
      phone: "+91 98765 43210",
      vehicleType: "SEDAN",
      vehicleNumber: "KA 01 AB 1234",
      licenseNumber: "DL1234567890123",
      isOnline: false,
      rating: 4.8,
    },
  });

  console.log("Demo driver created: driver@vandi.demo / driver123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
