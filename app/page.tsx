import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { authOptions } from "@/lib/auth";
import App from "./App";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    const requestHeaders = headers();
    const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
    const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
    const fallbackUrl =
      process.env.NEXTAUTH_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
      "http://localhost:3000";
    const callbackUrl = host
      ? `${protocol}://${host}/`
      : `${fallbackUrl.replace(/\/$/, "")}/`;

    redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  return <App />;
}
