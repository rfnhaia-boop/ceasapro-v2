import { FastifyPluginAsync } from 'fastify'
import { prisma } from '../server'

const usersRoutes: FastifyPluginAsync = async (app) => {
  const auth = { onRequest: [app.authenticate] }

  app.get('/', auth, async (req, reply) => {
    const { companyId } = req.user as any
    const users = await prisma.user.findMany({
      where: { companyId },
      select: { id: true, name: true, email: true, role: true, avatar: true },
    })
    return reply.send(users)
  })
}

export default usersRoutes
