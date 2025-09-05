import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { NextAuthOptions } from "next-auth"
import bcrypt from "bcryptjs"
import { JWT } from "next-auth/jwt"
import { Session } from "next-auth"

// Database connection (placeholder - replace with actual DB)
const getUserByEmail = async (email: string) => {
  // This would connect to your PostgreSQL database
  // For now, returning mock data structure
  return null
}

const getUserById = async (id: string) => {
  // This would connect to your PostgreSQL database
  return null
}

const createUser = async (userData: any) => {
  // This would create user in PostgreSQL database
  return null
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        churchId: { label: "Church ID", type: "text" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required")
        }

        try {
          const user = await getUserByEmail(credentials.email)
          
          if (!user) {
            throw new Error("User not found")
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            throw new Error("Invalid password")
          }

          // Check if user belongs to the correct church (multi-tenant)
          if (credentials.churchId && user.churchId !== credentials.churchId) {
            throw new Error("Access denied for this church")
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            churchId: user.churchId,
            churchName: user.church?.name,
            isActive: user.isActive,
            permissions: user.permissions || [],
            lastLogin: new Date().toISOString()
          }
        } catch (error) {
          console.error("Authentication error:", error)
          return null
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user, account }: { token: JWT; user?: any; account?: any }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = user.role
        token.churchId = user.churchId
        token.churchName = user.churchName
        token.permissions = user.permissions
        token.isActive = user.isActive
        token.provider = account?.provider
      }

      // Check if user is still active on subsequent requests
      if (token.id) {
        const currentUser = await getUserById(token.id as string)
        if (!currentUser || !currentUser.isActive) {
          return {}
        }
        
        // Update token with latest user data
        token.role = currentUser.role
        token.permissions = currentUser.permissions
        token.isActive = currentUser.isActive
      }

      return token
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.churchId = token.churchId as string
        session.user.churchName = token.churchName as string
        session.user.permissions = token.permissions as string[]
        session.user.isActive = token.isActive as boolean
        session.user.provider = token.provider as string
      }
      return session
    },

    async signIn({ user, account, profile }) {
      // Handle Google OAuth sign in
      if (account?.provider === "google" && profile?.email) {
        try {
          let existingUser = await getUserByEmail(profile.email)
          
          if (!existingUser) {
            // Create new user for Google OAuth
            existingUser = await createUser({
              email: profile.email,
              name: profile.name,
              image: profile.picture,
              provider: "google",
              googleId: profile.sub,
              role: "member", // Default role
              isActive: true,
              emailVerified: new Date(),
              createdAt: new Date(),
              updatedAt: new Date()
            })
          }

          // Update user object with database info
          user.id = existingUser.id
          user.role = existingUser.role
          user.churchId = existingUser.churchId
          user.churchName = existingUser.church?.name
          user.permissions = existingUser.permissions
          user.isActive = existingUser.isActive

          return true
        } catch (error) {
          console.error("Google sign in error:", error)
          return false
        }
      }

      // Handle credentials sign in
      if (account?.provider === "credentials") {
        return user?.isActive === true
      }

      return true
    },

    async redirect({ url, baseUrl }) {
      // Handle multi-tenant redirects
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }
      
      // Handle subdomain redirects for church-specific access
      if (url.startsWith(baseUrl)) {
        return url
      }
      
      return baseUrl
    }
  },

  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/new-user"
  },

  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`User ${user.email} signed in with ${account?.provider}`)
      
      // Log sign in event for audit trail (LGPD compliance)
      // await logUserActivity({
      //   userId: user.id,
      //   action: 'SIGN_IN',
      //   provider: account?.provider,
      //   timestamp: new Date(),
      //   ipAddress: '', // Get from request
      //   userAgent: '' // Get from request
      // })
    },

    async signOut({ token }) {
      console.log(`User ${token?.email} signed out`)
      
      // Log sign out event for audit trail
      // await logUserActivity({
      //   userId: token?.id,
      //   action: 'SIGN_OUT',
      //   timestamp: new Date()
      // })
    },

    async createUser({ user }) {
      console.log(`New user created: ${user.email}`)
    },

    async updateUser({ user }) {
      console.log(`User updated: ${user.email}`)
    },

    async linkAccount({ user, account, profile }) {
      console.log(`Account ${account.provider} linked to user ${user.email}`)
    },

    async session({ session, token }) {
      // Update last seen timestamp
      if (token?.id) {
        // await updateUserLastSeen(token.id as string)
      }
    }
  },

  debug: process.env.NODE_ENV === "development",

  secret: process.env.NEXTAUTH_SECRET,

  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 // 30 days
      }
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === "production"
      }
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === "production"
      }
    }
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }