import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.id = profile.sub;
        token.name = profile.name;
        token.email = profile.email;
        token.picture = profile.picture;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.name = token.name;
      session.user.email = token.email as string;
      session.user.image = token.picture;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
