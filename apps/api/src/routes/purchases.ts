import { FastifyPluginAsync } from 'fastify'
import { prisma } from '../server'

const purchasesRoutes: FastifyPluginAsync = async (app) => {
  const auth = { onRequest: [app.authenticate] }

  app.get('/', auth, async (req, reply) => {
    const { companyId } = req.user as any
    const purchases = await prisma.purchase.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    })
    return reply.send(purchases)
  })

  app.get('/:id', auth, async (req, reply) => {
    const { id } = req.params as any
    const { companyId } = req.user as any
    const purchase = await prisma.purchase.findFirst({ where: { id, companyId } })
    if (!purchase) return reply.status(404).send({ error: 'Compra não encontrada' })
    return reply.send(purchase)
  })

  app.post('/', auth, async (req, reply) => {
    const { companyId, userId } = req.user as any
    const { originalText, destinations } = req.body as any
    const purchase = await prisma.purchase.create({
      data: { companyId, createdById: userId, originalText, destinations },
    })
    return reply.status(201).send(purchase)
  })

  app.patch('/:id', auth, async (req, reply) => {
    const { id } = req.params as any
    const { companyId } = req.user as any
    const { status } = req.body as any
    await prisma.purchase.updateMany({ where: { id, companyId }, data: { status } })
    return reply.send({ ok: true })
  })
}

export default purchasesRoutes
