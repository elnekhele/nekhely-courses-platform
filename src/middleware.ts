import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const studentOnly = ["/dashboard", "/learn", "/cart", "/checkout"];
const instructorOnly = ["/instructor"];
const adminOnly = ["/admin"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const needsAuth =
    studentOnly.some((p) => pathname.startsWith(p)) ||
    instructorOnly.some((p) => pathname.startsWith(p)) ||
    adminOnly.some((p) => pathname.startsWith(p));

  if (!needsAuth) return NextResponse.next();

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  });

  if (!token) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  const role = (token.role as string) || "STUDENT";

  if (instructorOnly.some((p) => pathname.startsWith(p))) {
    if (role !== "INSTRUCTOR" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }
  if (adminOnly.some((p) => pathname.startsWith(p))) {
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/learn/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/instructor/:path*",
    "/admin/:path*",
  ],
};
