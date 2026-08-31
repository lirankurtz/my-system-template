import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data (for development only)
  await prisma.message.deleteMany();
  await prisma.roomMember.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();

  // Create seed users
  const user1 = await prisma.user.create({
    data: {
      id: "user-1",
      email: "alice@example.com",
      displayName: "Alice",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      id: "user-2",
      email: "bob@example.com",
      displayName: "Bob",
    },
  });

  const user3 = await prisma.user.create({
    data: {
      id: "user-3",
      email: "charlie@example.com",
      displayName: "Charlie",
    },
  });

  // Create seed rooms
  const room1 = await prisma.room.create({
    data: {
      name: "General",
    },
  });

  const room2 = await prisma.room.create({
    data: {
      name: "Random",
    },
  });

  // Add room members
  await prisma.roomMember.createMany({
    data: [
      { userId: user1.id, roomId: room1.id },
      { userId: user2.id, roomId: room1.id },
      { userId: user3.id, roomId: room1.id },
      { userId: user1.id, roomId: room2.id },
      { userId: user2.id, roomId: room2.id },
    ],
  });

  // Add seed messages
  await prisma.message.createMany({
    data: [
      {
        roomId: room1.id,
        userId: user1.id,
        content: "Hello everyone!",
      },
      {
        roomId: room1.id,
        userId: user2.id,
        content: "Hi Alice!",
      },
      {
        roomId: room1.id,
        userId: user3.id,
        content: "Hey team!",
      },
      {
        roomId: room2.id,
        userId: user1.id,
        content: "Check this out",
      },
    ],
  });

  console.log("✅ Seed data created successfully");
  console.log(`Created ${3} users, ${2} rooms, and ${4} messages`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
