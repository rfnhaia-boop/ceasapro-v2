import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

const app = Fastify({ logger: true })

app.register(cors, { origin: process.env.WEB_URL || 'http://localhost:3000' })
app.register(jwt, { secret: process.env.JWT_SECRET || 'dev-secret-change-in-prod' })

// Routes
import authRoutes from './routes/auth'
import ordersRoutes from './routes/orders'
import blocksRoutes from './routes/blocks'
import companiesRoutes from './routes/companies'
import usersRoutes from './routes/users'
import aiRoutes from './routes/ai'
import purchasesRoutes from './routes/purchases'

app.register(authRoutes, { prefix: '/auth' })
app.register(ordersRoutes, { prefix: '/orders' })
app.register(blocksRoutes, { prefix: '/blocks' })
app.register(companiesRoutes, { prefix: '/companies' })
app.register(usersRoutes, { prefix: '/users' })
app.register(aiRoutes, { prefix: '/ai' })
app.register(purchasesRoutes, { prefix: '/purchases' })

app.get('/health', async () => ({ status: 'ok' }))

const start = async () => {
  try {
    await app.listen({ port: Number(process.env.PORT) || 4000, host: '0.0.0.0' })
    console.log('API rodando na porta 4000')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
