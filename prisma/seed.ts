import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ROOMS = [
  { name: "Drawing Room", slug: "drawing" },
  { name: "Work Room 1", slug: "work1" },
  { name: "Work Room 2", slug: "work2" },
];

const FAN_WATTAGE = 60;
const LIGHT_WATTAGE = 15;

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.usageLog.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.device.deleteMany();
  await prisma.room.deleteMany();

  for (const room of ROOMS) {
    const createdRoom = await prisma.room.create({ data: room });

    // 2 fans
    await prisma.device.create({
      data: {
        roomId: createdRoom.id,
        name: "Fan 1",
        type: "fan",
        status: false,
        powerDraw: FAN_WATTAGE,
      },
    });
    await prisma.device.create({
      data: {
        roomId: createdRoom.id,
        name: "Fan 2",
        type: "fan",
        status: false,
        powerDraw: FAN_WATTAGE,
      },
    });

    // 3 lights
    for (let i = 1; i <= 3; i++) {
      await prisma.device.create({
        data: {
          roomId: createdRoom.id,
          name: `Light ${i}`,
          type: "light",
          status: false,
          powerDraw: LIGHT_WATTAGE,
        },
      });
    }
  }

  const deviceCount = await prisma.device.count();
  const roomCount = await prisma.room.count();
  console.log(`Seeded ${roomCount} rooms and ${deviceCount} devices.`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
