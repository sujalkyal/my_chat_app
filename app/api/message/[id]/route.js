import prisma from "@/db";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const messages = await prisma.message.findMany({
      where: { senderId: id },
    });

    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
