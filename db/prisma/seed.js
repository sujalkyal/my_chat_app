const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");

async function main() {
    // Hash passwords
    const hashedPassword1 = await bcrypt.hash("Alice123", 10);
    const hashedPassword2 = await bcrypt.hash("Bob123", 10);

    // Upsert users (create if not exists, otherwise update)
    const user1 = await prisma.user.upsert({
        where: { email: "alice@example.com" },
        update: {},
        create: { name: "Alice", email: "alice@example.com", password: hashedPassword1 },
    });

    const user2 = await prisma.user.upsert({
        where: { email: "bob@example.com" },
        update: {},
        create: { name: "Bob", email: "bob@example.com", password: hashedPassword2 },
    });

    // Find or create chat room
    let chatRoom = await prisma.chatRoom.findFirst({
        where: { name: "General" },
    });

    if (!chatRoom) {
        chatRoom = await prisma.chatRoom.create({
            data: { name: "General" },
        });
    }

    // Insert messages only if they don't exist
    const messages = await prisma.message.findMany({ where: { chatRoomId: chatRoom.id } });
    if (messages.length === 0) {
        await prisma.message.createMany({
            data: [
                { content: "Hello, Bob!", senderId: user1.id, chatRoomId: chatRoom.id },
                { content: "Hello, Alice!", senderId: user2.id, chatRoomId: chatRoom.id },
            ],
        });
    }

    console.log("Database seeded successfully.");
}

main()
    .catch(async e => {
        console.error(e);
        await prisma.$disconnect();
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
