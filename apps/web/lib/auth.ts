import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { api } from './api'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          const res = await api.post('/auth/google', {
            googleId: account.providerAccountId,
            email: user.email,
            name: user.name,
            avatar: user.image,
          })
          // Salva token e dados do usuário na sessão
          ;(user as any).apiToken = res.token
          ;(user as any).apiUser = res.user
        } catch (e) {
          console.error('Erro no login via API:', e)
          return false
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.apiToken = (user as any).apiToken
        token.apiUser = (user as any).apiUser
      }
      return token
    },
    async session({ session, token }) {
      session.apiToken = token.apiToken as string
      session.user = { ...session.user, ...(token.apiUser as any) }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
})

declare module 'next-auth' {
  interface Session {
    apiToken: string
    user: {
      id: string
      name: string
      email: string
      image?: string
      role: 'ADMIN' | 'PICKER' | 'DRIVER'
      companyId: string
      company?: { id: string; name: string; inviteCode: string }
    }
  }
}
