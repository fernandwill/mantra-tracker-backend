import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import { createUser, getUserByEmail } from '@/lib/database'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
    }),
  ],
  
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (!user.email) return false
        
        // Check if user exists
        const existingUser = await getUserByEmail(user.email)
        
        if (!existingUser) {
          // Create new user
          await createUser({
            email: user.email,
            name: user.name || 'Unknown',
            password: '', // No password for OAuth users
            provider: account?.provider || 'unknown',
            providerId: account?.providerAccountId || user.id,
            avatar: user.image || undefined
          })
        }
        
        return true
      } catch (error) {
        console.error('SignIn error:', error)
        return false
      }
    },
    
    async session({ session, token }) {
      if (session.user?.email) {
        const dbUser = await getUserByEmail(session.user.email)
        if (dbUser) {
          session.user.id = dbUser.id
        }
      }
      return session
    },
    
    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await getUserByEmail(user.email)
        if (dbUser) {
          token.userId = dbUser.id
        }
      }
      return token
    },
  },
  
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
  
  session: {
    strategy: 'jwt',
  },
  
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }