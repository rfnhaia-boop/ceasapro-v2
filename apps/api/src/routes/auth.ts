import { FastifyPluginAsync } from 'fastify'
import { prisma } from '../server'
import { z } from 'zod'

const authRoutes: FastifyPluginAsync = async (app) => {
  // Google OAuth callback — recebe o id_token do frontend e cria/retorna o usuário
  app.post('/google', async (req, reply) => {
    const { googleId, email, name, avatar } = req.body as any

    if (!googleId || !email) {
      return reply.status(400).send({ error: 'googleId e email são obrigatórios' })
    }

    let user = await prisma.user.findUnique({ where: { googleId }, include: { company: true } })

    if (!user) {
      user = await prisma.user.create({
        data: { googleId, email, name, avatar, role: 'ADMIN' },
        include: { company: true },
      })
    }

    // Se admin sem empresa, cria automaticamente
    if (user.role === 'ADMIN' && !user.companyId) {
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()
      const company = await prisma.company.create({
        data: {
          name: name || email.split('@')[0],
          inviteCode,
          users: { connect: { id: user.id } },
        },
      })
      user = await prisma.user.update({
        where: { id: user.id },
        data: { companyId: company.id },
        include: { company: true },
      })
    }

    const token = app.jwt.sign({ userId: user.id, role: user.role, companyId: user.companyId }, { expiresIn: '30d' })

    return reply.send({ token, user })
  })

  // Join por código de convite
  app.post('/join', async (req, reply) => {
    const { code, googleId, email, name, avatar } = req.body as any

    const invite = await prisma.invite.findUnique({ where: { code: code.toUpperCase() } })
    if (!invite || invite.used) {
      return reply.status(400).send({ error: 'Convite inválido ou já utilizado' })
    }

    let user = await prisma.user.findUnique({ where: { googleId } })
    if (!user) {
      user = await prisma.user.create({
        data: { googleId, email, name, avatar, role: invite.role, companyId: invite.companyId },
      })
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: invite.role, companyId: invite.companyId, name },
      })
    }

    await prisma.invite.update({ where: { id: invite.id }, data: { used: true } })

    const token = app.jwt.sign({ userId: user.id, role: user.role, companyId: user.companyId }, { expiresIn: '30d' })
    return reply.send({ token, user })
  })

  // Retorna perfil atual
  app.get('/me', { onRequest: [app.authenticate] }, async (req, reply) => {
    const { userId } = req.user as any
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { company: true } })
    if (!user) return reply.status(404).send({ error: 'Usuário não encontrado' })
    return reply.send(user)
  })

  // Join via sessão já autenticada (usuário logado aceita convite)
  app.post('/join-session', { onRequest: [app.authenticate] }, async (req, reply) => {
    const { userId } = req.user as any
    const { code } = req.body as any

    if (!code) return reply.status(400).send({ error: 'Código obrigatório' })

    const invite = await prisma.invite.findUnique({ where: { code: String(code).toUpperCase() } })
    if (!invite || invite.used) {
      return reply.status(400).send({ error: 'Convite inválido ou já utilizado' })
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role: invite.role, companyId: invite.companyId },
    })
    await prisma.invite.update({ where: { id: invite.id }, data: { used: true } })

    return reply.send({ ok: true, message: 'Empresa associada com sucesso' })
  })
}

// Middleware de autenticação global
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: any
  }
}

export default authRoutes
