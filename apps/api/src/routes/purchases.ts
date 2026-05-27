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
    const data = req.body as any

    const exists = await prisma.purchase.findFirst({ where: { id, companyId } })
    if (!exists) return reply.status(404).send({ error: 'Compra não encontrada' })

    const purchase = await prisma.purchase.update({ where: { id }, data })
    return reply.send(purchase)
  })
}

export default purchasesRoutes
