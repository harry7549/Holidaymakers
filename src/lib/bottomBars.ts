export function isPackageDetailRoute(pathname: string) {
  return pathname.startsWith("/package/")
}

export function shouldShowCompareBar(pathname: string, compareCount: number) {
  if (compareCount === 0) return false
  if (pathname === "/compare") return false
  if (isPackageDetailRoute(pathname)) return false
  if (pathname.startsWith("/checkout/")) return false
  return true
}
