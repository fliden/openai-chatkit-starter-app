import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // If it's a relative URL starting with /
      if (url.startsWith("/")) {
        // Don't redirect to signin page - extract callbackUrl if present
        if (url.startsWith("/api/auth/signin")) {
          const urlObj = new URL(url, baseUrl);
          const callbackUrl = urlObj.searchParams.get("callbackUrl");
          return callbackUrl || baseUrl;
        }
        return `${baseUrl}${url}`;
      }

      // If it's an absolute URL
      try {
        const targetUrl = new URL(url);
        if (targetUrl.origin === baseUrl) {
          return url;
        }
      } catch {
        // ignore malformed target URLs
      }

      return baseUrl;
    },
  },
};
