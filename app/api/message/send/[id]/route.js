import prisma from "@/db";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Receiver ID is required" }, { status: 400 });
    }

    const session = await auth();

    if(!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const content = await req.json()
    const message = prisma.message.create({
        data: {
            content,
            receiverId: id,
            senderId: session.user.id
        },
    })

    // send message to the user if they are online

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}