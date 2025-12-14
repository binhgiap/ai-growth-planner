/**
 * Application routes configuration
 * Centralized routing for navigation
 */

export const ROUTES = {
  HOME: "/",
  SETUP: "/setup",
  DASHBOARD: "/dashboard",
  PLAN: "/plan",
  DAILY: "/daily",
  REPORTS: "/reports",
} as const;

export const NAVIGATION = [
  { label: "Dashboard", href: ROUTES.DASHBOARD, icon: "📊" },
  { label: "Growth Plan", href: ROUTES.PLAN, icon: "📈" },
  { label: "Daily Tasks", href: ROUTES.DAILY, icon: "✓" },
  { label: "Reports", href: ROUTES.REPORTS, icon: "📉" },
] as const;

export const PUBLIC_ROUTES = [ROUTES.HOME, ROUTES.SETUP] as const;

export const PROTECTED_ROUTES = [ROUTES.DASHBOARD, ROUTES.PLAN, ROUTES.DAILY, ROUTES.REPORTS] as const;

/**
 * Check if route requires authentication
 */
export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Check if route is public
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}
