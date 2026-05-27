import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'

export default fp(async (app: FastifyInstance) => {
  app.decorate('authenticate', async (req: any, reply: any) => {
    try {
      await req.jwtVerify()
    } catch {
      reply.status(401).send({ error: 'Não autorizado' })
    }
  })
})
