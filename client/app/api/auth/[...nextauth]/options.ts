import { NextAuthOptions } from "next-auth";
import { postAuth } from "../../../../modules/profile/profile.api";
import Credentials from "next-auth/providers/credentials";

// import GithubProvider from "next-auth/providers/github";
// import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    // GithubProvider({
    //   clientId: process.env.GITHUB_ID || "",
    //   clientSecret: process.env.GITHUB_SECRET || "",
    //   profile(profile) {
    //     return profile;
    //   },
    // }),
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID || "",
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    //   authorization: {
    //     params: {
    //       prompt: "consent",
    //       access_type: "offline",
    //       response_type: "code",
    //     },
    //   },
    //   profile({ sub, name, email }) {
    //     return {
    //       name,
    //       email,
    //       id: sub,
    //     };
    //   },
    // }),
    Credentials({
      name: "Credentials",
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: { label: "Email", type: "email", placeholder: "Enter Email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        // You need to provide your own logic here that takes the credentials
        // submitted and returns either a object representing a user or value
        // that is false/null if the credentials are invalid.
        // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
        // You can also use the `req` object to obtain additional parameters
        // (i.e., the request IP address)
        const user = await postAuth(credentials);

        if (user) {
          return user;
        }
        // Return null if user data could not be retrieved
        return null;
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
      if (session?.user && token) {
        session.user.email = token.email;
        session.user.id = token.id;
      }

      return session;
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.email = user.email;
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    // signIn: "/signin",
    signOut: "/auth/signout",
    error: "/", // Error code passed in query string as ?error=
    verifyRequest: "/auth/verify-request", // (used for check email message)
    newUser: "/profile", // New users will be directed here on first sign in (leave the property out if not of interest)
  },
};
