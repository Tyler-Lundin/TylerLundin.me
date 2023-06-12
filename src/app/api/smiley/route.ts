import { prisma } from "@/server/db";
import { NextResponse } from "next/server";


export async function GET() {
  const smileyCounter = await prisma.smileyCounter.findFirst({
    select: { count: true }
  })
  return NextResponse.json({ count: smileyCounter?.count ?? 0 })
}

export async function POST(req: Request) {

  const { addToCount } = await req.json()

  if (typeof addToCount !== 'number') return NextResponse.error();

  const smileyCounter = await prisma.smileyCounter.findFirst()

  if (smileyCounter) {
    await prisma.smileyCounter.update({
      where: { id: smileyCounter.id },
      data: { count: smileyCounter.count + addToCount },
    })
  }
  else {
    await prisma.smileyCounter.create({
      data: { count: 1 }
    })
  }

  return NextResponse.json({ count: smileyCounter?.count ?? 0 })
}
