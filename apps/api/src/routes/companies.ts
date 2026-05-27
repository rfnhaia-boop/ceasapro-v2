import { FastifyPluginAsync } from 'fastify'
import { prisma } from '../server'

const companiesRoutes: FastifyPluginAsync = async (app) => {
  const auth = { onRequest: [app.authenticate] }

  // Dados da empresa
  app.get('/', auth, async (req, reply) => {
    const { companyId } = req.user as any
    const company = await prisma.company.findUnique({ where: { id: companyId } })
    return reply.send(company)
  })

  // Criar convite
  app.post('/invites', auth, async (req, reply) => {
    const { companyId } = req.user as any
    const { name, role } = req.body as any
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    const invite = await prisma.invite.create({
      data: { code, name, role, companyId },
    })
    return reply.status(201).send(invite)
  })

  // Listar membros da equipe
  app.get('/members', auth, async (req, reply) => {
    const { companyId } = req.user as any
    const members = await prisma.user.findMany({
      where: { companyId },
      select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true },
    })
    return reply.send(members)
  })

  // Atualizar role de membro
  app.patch('/members/:id/role', auth, async (req, reply) => {
    const { id } = req.params as any
    const { companyId } = req.user as any
    const { role } = req.body as any
    await prisma.user.updateMany({ where: { id, companyId }, data: { role } })
    return reply.send({ ok: true })
  })

  // Limpar dados de teste
  app.delete('/data', auth, async (req, reply) => {
    const { companyId } = req.user as any
    await prisma.orderBlock.deleteMany({ where: { companyId } })
    await prisma.order.deleteMany({ where: { companyId } })
    await prisma.purchase.deleteMany({ where: { companyId } })
    return reply.send({ ok: true })
  })
}

export default companiesRoutes
