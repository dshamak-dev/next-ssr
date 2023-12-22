import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
      profile(profile) {
        return profile;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
      profile({ sub, name, email }) {
        return {
          name,
          email,
          id: sub,
        };
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      const searchParams = url ? new URL(url).searchParams : null;
      const redirectUrl = searchParams?.get("callbackUrl");

      if (redirectUrl) {
        return redirectUrl;
      }

      if (url.startsWith(baseUrl)) {
        return url;
      }

      return baseUrl;
    },
    session: async ({ session, token }: any) => {
      if (session?.user) {
        session.user.id = token.uid;
      }
      return session;
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/signin",
    signOut: "/auth/signout",
    error: "/", // Error code passed in query string as ?error=
    verifyRequest: "/auth/verify-request", // (used for check email message)
    newUser: "/profile", // New users will be directed here on first sign in (leave the property out if not of interest)
  },
};
