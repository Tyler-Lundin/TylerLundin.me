import { prisma } from "@/server/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { name, email, message } = await req.json();

  try {
    await prisma.message.create({
      data: { name, email, message },
    });
    return NextResponse.json({ message: "Message sent" });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ message: "Error sending Message" });
  }
}
