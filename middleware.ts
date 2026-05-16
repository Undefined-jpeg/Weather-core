import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PROTECTED_PATHS = [/^\/settings(\/.*)?$/];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (PROTECTED_PATHS.some((re) => re.test(pathname)) && !req.auth) {
    const signinUrl = new URL("/signin", req.url);
    signinUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signinUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js).*)"],
};
