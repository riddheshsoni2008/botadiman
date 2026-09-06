import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|_next/data|favicon\\.ico|icon\\.svg|login|.*\\..*).*)",
  ],
};
