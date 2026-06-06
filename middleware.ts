import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pages exclues de la protection
  if (pathname.startsWith("/pin") || pathname.startsWith("/_next") || pathname.startsWith("/planches")) {
    return NextResponse.next();
  }

  // Vérifie le cookie d'auth
  const auth = request.cookies.get("md_auth");
  if (!auth || auth.value !== "true") {
    return NextResponse.redirect(new URL("/pin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|planches).*)"],
};
