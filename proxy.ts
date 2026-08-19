import { clerkMiddleware } from "@clerk/nextjs/server";

const publicRoutes = [
  process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "/sign-in",
  process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? "/sign-up",
];

export default clerkMiddleware((auth, request) => {
  const isPublicRoute = publicRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (!isPublicRoute) {
    auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
