export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    let setting = await prisma.setting.findFirst()
    if (!setting) {
      setting = await prisma.setting.create({
        data: { id: "1" }
      })
    }
    return NextResponse.json(setting)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar configurações' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const { storeName, whatsappNumber, pixKey, pixName, isOpen, closedMessage } = data

    const setting = await prisma.setting.upsert({
      where: { id: "1" },
      update: {
        storeName,
        whatsappNumber,
        pixKey,
        pixName,
        isOpen,
        closedMessage
      },
      create: {
        id: "1",
        storeName,
        whatsappNumber,
        pixKey,
        pixName,
        isOpen,
        closedMessage
      }
    })
    return NextResponse.json(setting)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao salvar configurações' }, { status: 500 })
  }
}
