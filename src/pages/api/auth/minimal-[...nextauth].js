// Minimal NextAuth configuration that won't break without full auth setup
import NextAuth from 'next-auth'

export const authOptions = {
  // Minimal configuration to prevent errors
  providers: [],
  
  // Disable database adapter to prevent connection issues
  adapter: undefined,
  
  // Simple session strategy
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  // Basic callbacks
  callbacks: {
    async jwt({ token, user }) {
      return token;
    },
    async session({ session, token }) {
      return session;
    },
  },

  // Disable pages to prevent auth redirects
  pages: undefined,

  // Essential settings
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
  debug: false,
}

export default NextAuth(authOptions)