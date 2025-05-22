
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { login } from "@/services/backendApi/authService";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        try {
          const response = await login(credentials.username, credentials.password);
          if (response.status === 'success' && response.data.token) {
            return {
              id: response.data.user.id.toString(),
              name: response.data.user.username,
              role: response.data.user.role,
              token: response.data.token
            };
          }
          return null;
        } catch (error) {
          throw new Error("Invalid credentials");
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.token = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.token = token.token;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt"
  }
};

export const auth = authOptions;
