import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const produtos = await prisma.product.findMany({
      orderBy: { order: 'asc' }
    })
    return NextResponse.json(produtos)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { name, price, description, image } = data
    // Fetch a default category to link the product to
    let category = await prisma.category.findFirst()
    if (!category) {
      category = await prisma.category.create({ data: { name: 'Geral' } })
    }
    
    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        description: description || '',
        image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300',
        categoryId: category.id
      }
    })
    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao salvar produto' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const { id, price, name, description, image } = data
    
    // Only update fields that are provided
    const updateData: any = {}
    if (price !== undefined) updateData.price = parseFloat(price)
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (image !== undefined) updateData.image = image

    const product = await prisma.product.update({
      where: { id },
      data: updateData
    })
    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 })
  }
}
