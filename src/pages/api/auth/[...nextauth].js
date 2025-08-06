// src/pages/api/auth/[...nextauth].js
import NextAuth from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import { sql } from '@vercel/postgres'

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST || 'smtp.sendgrid.net',
        port: process.env.EMAIL_SERVER_PORT || 587,
        auth: {
          user: process.env.EMAIL_SERVER_USER || 'apikey',
          pass: process.env.SENDGRID_API_KEY,
        },
      },
      from: process.env.FROM_EMAIL,
      maxAge: 24 * 60 * 60, // 24 hours
    }),
  ],

  // Database adapter for NextAuth
  adapter: {
    async createUser(user) {
      const result = await sql`
        INSERT INTO users (name, email, email_verified, image)
        VALUES (${user.name}, ${user.email}, ${user.emailVerified}, ${user.image})
        RETURNING *;
      `;
      return result.rows[0];
    },

    async getUser(id) {
      const result = await sql`
        SELECT * FROM users WHERE id = ${id};
      `;
      return result.rows[0] || null;
    },

    async getUserByEmail(email) {
      const result = await sql`
        SELECT * FROM users WHERE email = ${email};
      `;
      return result.rows[0] || null;
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const result = await sql`
        SELECT u.* FROM users u
        JOIN accounts a ON u.id = a.user_id
        WHERE a.provider_account_id = ${providerAccountId} AND a.provider = ${provider};
      `;
      return result.rows[0] || null;
    },

    async updateUser(user) {
      const result = await sql`
        UPDATE users 
        SET name = ${user.name}, email = ${user.email}, 
            email_verified = ${user.emailVerified}, image = ${user.image},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${user.id}
        RETURNING *;
      `;
      return result.rows[0];
    },

    async deleteUser(userId) {
      await sql`DELETE FROM accounts WHERE user_id = ${userId};`;
      await sql`DELETE FROM sessions WHERE user_id = ${userId};`;
      await sql`DELETE FROM users WHERE id = ${userId};`;
    },

    async linkAccount(account) {
      await sql`
        INSERT INTO accounts (
          user_id, type, provider, provider_account_id, 
          refresh_token, access_token, expires_at, token_type, 
          scope, id_token, session_state
        )
        VALUES (
          ${account.userId}, ${account.type}, ${account.provider}, 
          ${account.providerAccountId}, ${account.refresh_token}, 
          ${account.access_token}, ${account.expires_at}, 
          ${account.token_type}, ${account.scope}, 
          ${account.id_token}, ${account.session_state}
        );
      `;
    },

    async unlinkAccount({ providerAccountId, provider }) {
      await sql`
        DELETE FROM accounts 
        WHERE provider_account_id = ${providerAccountId} AND provider = ${provider};
      `;
    },

    async createSession({ sessionToken, userId, expires }) {
      const result = await sql`
        INSERT INTO sessions (session_token, user_id, expires)
        VALUES (${sessionToken}, ${userId}, ${expires})
        RETURNING *;
      `;
      return result.rows[0];
    },

    async getSessionAndUser(sessionToken) {
      const result = await sql`
        SELECT s.*, u.* FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.session_token = ${sessionToken} AND s.expires > NOW();
      `;
      
      if (!result.rows[0]) return null;
      
      const row = result.rows[0];
      return {
        session: {
          sessionToken: row.session_token,
          userId: row.user_id,
          expires: row.expires,
        },
        user: {
          id: row.id,
          name: row.name,
          email: row.email,
          image: row.image,
          emailVerified: row.email_verified,
        }
      };
    },

    async updateSession({ sessionToken, expires }) {
      const result = await sql`
        UPDATE sessions 
        SET expires = ${expires}, updated_at = CURRENT_TIMESTAMP
        WHERE session_token = ${sessionToken}
        RETURNING *;
      `;
      return result.rows[0] || null;
    },

    async deleteSession(sessionToken) {
      await sql`DELETE FROM sessions WHERE session_token = ${sessionToken};`;
    },

    async createVerificationToken({ identifier, expires, token }) {
      await sql`
        INSERT INTO verification_tokens (identifier, token, expires)
        VALUES (${identifier}, ${token}, ${expires});
      `;
      return { identifier, token, expires };
    },

    async useVerificationToken({ identifier, token }) {
      const result = await sql`
        DELETE FROM verification_tokens 
        WHERE identifier = ${identifier} AND token = ${token} AND expires > NOW()
        RETURNING *;
      `;
      return result.rows[0] || null;
    },
  },

  // Pages configuration
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
  },

  // Session configuration
  session: {
    strategy: 'database',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  // Callbacks
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      return true;
    },

    async session({ session, user }) {
      session.user.id = user.id;
      session.user.stripeCustomerId = user.stripe_customer_id;
      return session;
    },

    async jwt({ token, user, account, profile, isNewUser }) {
      if (user) {
        token.userId = user.id;
        token.stripeCustomerId = user.stripe_customer_id;
      }
      return token;
    },
  },

  // Events
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('User signed in:', user.email);
    },
  },

  // Debug mode in development
  debug: process.env.NODE_ENV === 'development',
}

export default NextAuth(authOptions)