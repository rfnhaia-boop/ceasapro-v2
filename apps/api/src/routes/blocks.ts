import { FastifyPluginAsync } from 'fastify'
import { prisma } from '../server'

const blocksRoutes: FastifyPluginAsync = async (app) => {
  const auth = { onRequest: [app.authenticate] }

  // Listar blocos (picker vê os da sua empresa)
  app.get('/', auth, async (req, reply) => {
    const { companyId, userId, role } = req.user as any
    const where: any = { companyId }
    if (role === 'PICKER') where.OR = [{ pickerId: userId }, { pickerId: null }]

    const blocks = await prisma.orderBlock.findMany({
      where,
      include: { picker: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return reply.send(blocks)
  })

  // Buscar bloco específico
  app.get('/:id', auth, async (req, reply) => {
    const { id } = req.params as any
    const { companyId } = req.user as any
    const block = await prisma.orderBlock.findFirst({
      where: { id, companyId },
      include: { picker: { select: { id: true, name: true } }, order: true },
    })
    if (!block) return reply.status(404).send({ error: 'Bloco não encontrado' })
    return reply.send(block)
  })

  // Atualizar bloco (status, items, picker)
  app.patch('/:id', auth, async (req, reply) => {
    const { id } = req.params as any
    const { companyId } = req.user as any
    const data = req.body as any

    const block = await prisma.orderBlock.updateMany({
      where: { id, companyId },
      data,
    })

    // Verificar se todos os blocos do pedido estão completos
    const updatedBlock = await prisma.orderBlock.findUnique({ where: { id } })
    if (updatedBlock?.status === 'COMPLETED') {
      const allBlocks = await prisma.orderBlock.findMany({ where: { orderId: updatedBlock.orderId } })
      const allDone = allBlocks.every(b => b.status === 'COMPLETED')
      if (allDone) {
        await prisma.order.update({ where: { id: updatedBlock.orderId }, data: { status: 'READY' } })
      }
    }

    return reply.send(block)
  })
}

export default blocksRoutes
