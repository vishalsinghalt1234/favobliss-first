import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  privateRoutes,
} from "@/routes";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // --- User-Agent bot filtering (keep it cheap + predictable) ---
  const ua = (req.headers.get("user-agent") || "").toLowerCase();

  // NOTE:
  // 1) Do NOT block ALL bots blindly, otherwise Google indexing breaks.
  // 2) Block the worst scrapers + headless tools. Keep allowlist for major search bots.
  const goodBots = ["googlebot", "bingbot", "duckduckbot", "slurp", "yandex"];
  const badBots = [
    // "ahrefsbot",
    // "semrushbot",
    "mj12bot",
    "dotbot",
    "petalbot",
    "bytespider",
    // "gptbot",
    "claudebot",
    "anthropic",
    "ccbot",
    "omgili",
    "omgilibot",
    "scrapy",
    "python",
    "curl",
    "wget",
    "headlesschrome",
    // "lighthouse",
  ];

  const isGoodBot = goodBots.some((b) => ua.includes(b));
  const isBadBot = badBots.some((b) => ua.includes(b));

  if (isBadBot && !isGoodBot) {
    return new Response("Forbidden - Bot access denied", { status: 403 });
  }

  // --- Auth logic ---
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = pathname.startsWith(apiAuthPrefix);
  const isAuthRoute = authRoutes.includes(pathname);
  const isPrivateRoute = privateRoutes.some((route) => pathname.startsWith(route));

  // Allow NextAuth internal/api routes to continue
  if (isApiAuthRoute) return null;

  // If already logged in, prevent going back to auth pages
  if (isAuthRoute && isLoggedIn) {
    return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
  }

  // Redirect unauth users away from private pages
  if (isPrivateRoute && !isLoggedIn) {
    const callbackUrl = pathname + nextUrl.search;
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", callbackUrl);
    return Response.redirect(loginUrl);
  }

  return null;
});

export const config = {
  matcher: [
    /**
     * IMPORTANT:
     * Middleware on Vercel runs at the edge. Keep matcher narrow to avoid
     * running on static assets and internal Vercel endpoints.
     *
     * We explicitly exclude:
     * - Next.js internals (_next)
     * - common static files
     * - Vercel analytics/insights endpoints
     * - public assets paths
     */
    "/((?!_next/static|_next/image|_next/webpack-hmr|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|site.webmanifest|assets/|images/|icons/|fonts/|uploads/|api/health|_vercel/insights|_vercel/speed-insights).*)",
  ],
};