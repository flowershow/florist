import NextAuth, { type NextAuthConfig } from "next-auth"
import GitHub from "next-auth/providers/github"

export const authConfig = {
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
            // @ts-expect-error - accessToken is not typed in default session
            session.accessToken = token.accessToken
            return session
        },
    },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
