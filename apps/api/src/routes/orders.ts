import { FastifyPluginAsync } from 'fastify'
import { prisma } from '../server'

const ordersRoutes: FastifyPluginAsync = async (app) => {
  const auth = { onRequest: [app.authenticate] }

  // Listar pedidos da empresa
  app.get('/', auth, async (req, reply) => {
    const { companyId } = req.user as any
    const orders = await prisma.order.findMany({
      where: { companyId },
      include: { blocks: true, driver: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return reply.send(orders)
  })

  // Buscar pedido específico
  app.get('/:id', auth, async (req, reply) => {
    const { id } = req.params as any
    const { companyId } = req.user as any
    const order = await prisma.order.findFirst({
      where: { id, companyId },
      include: { blocks: true, driver: { select: { id: true, name: true } }, createdBy: { select: { id: true, name: true } } },
    })
    if (!order) return reply.status(404).send({ error: 'Pedido não encontrado' })
    return reply.send(order)
  })

  // Criar pedido
  app.post('/', auth, async (req, reply) => {
    const { companyId, userId } = req.user as any
    const { clientName, originalText, blocks } = req.body as any

    const order = await prisma.order.create({
      data: {
        clientName,
        originalText,
        companyId,
        createdById: userId,
        blocks: {
          create: blocks.map((b: any) => ({
            supplierName: b.supplierName || 'Fornecedor Não Identificado',
            clientName,
            companyId,
            items: b.items,
            pickerId: b.pickerId || null,
          })),
        },
      },
      include: { blocks: true },
    })
    return reply.status(201).send(order)
  })

  // Atualizar status do pedido
  app.patch('/:id', auth, async (req, reply) => {
    const { id } = req.params as any
    const { companyId } = req.user as any
    const data = req.body as any

    const order = await prisma.order.updateMany({
      where: { id, companyId },
      data,
    })
    return reply.send(order)
  })

  // Deletar pedido
  app.delete('/:id', auth, async (req, reply) => {
    const { id } = req.params as any
    const { companyId } = req.user as any
    await prisma.order.deleteMany({ where: { id, companyId } })
    return reply.send({ ok: true })
  })
}

export default ordersRoutes
