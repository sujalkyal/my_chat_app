const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");

async function main() {
    // Hash passwords
    const hashedPassword1 = await bcrypt.hash("Alice123", 10);
    const hashedPassword2 = await bcrypt.hash("Bob123", 10);
    const hashedPassword3 = await bcrypt.hash("Jack123", 10);

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

    const user3 = await prisma.user.upsert({
        where: { email: "jack@example.com" },
        update: {},
        create: { name: "Jack", email: "jack@example.com", password: hashedPassword3 },
    });

    // Find or create group
    let chatRoom = await prisma.group.findFirst({
        where: { name: "General" },
    });

    if (!chatRoom) {
        chatRoom = await prisma.group.create({
            data: { name: "General",
                members: [user1.id, user2.id, user3.id]
             },
        });
    }

    // Insert messages only if they don't exist
    const messages = await prisma.message.findMany({ where: { senderId: user1.id } });
    messages.push(...await prisma.message.findMany({ where: { senderId: user2.id } }));
    messages.push(...await prisma.message.findMany({ where: { senderId: user3.id } }));

    if (messages.length === 0) {
        await prisma.message.createMany({
            data: [
                { content: "Hello, Bob!", senderId: user1.id, receiverId: user2.id },
                { content: "Hello, Alice!", senderId: user2.id, receiverId: user1.id },
                { content: "Hello, Jack!", senderId: user2.id, receiverId: user3.id },
                { content: "Hello, Alice!", senderId: user3.id, receiverId: user1.id },
            ],
        });
    }

    const groupMessages = prisma.groupMessages.findMany({ where: { groupId: chatRoom.id } });

    if(groupMessages.length === 0) {
        await prisma.groupMessages.createMany({
            data: [
                { content: "Hello, everyone!", senderId: user1.id, groupId: chatRoom.id },
                { content: "Hello, Alice!", senderId: user2.id, groupId: chatRoom.id },
                { content: "Hello, Bob!", senderId: user3.id, groupId: chatRoom.id },
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
