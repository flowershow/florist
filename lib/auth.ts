import NextAuth, { type NextAuthConfig } from "next-auth"
import GitHub from "next-auth/providers/github"

export const authConfig = {
    trustHost: true,
    providers: [
        GitHub({
            authorization: { params: { scope: "repo" } }, // Request full repo access
        }),
    ],
    callbacks: {
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.access_token
            }
            return token
        },
        async session({ session, token }) {
            session.accessToken = token.accessToken as string
            return session
        },
    },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
