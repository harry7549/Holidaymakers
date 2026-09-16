import type { Package } from "../data/types"

export function getPackageBySlug(list: Package[], slug: string) {
  return list.find((p) => p.slug === slug)
}

export function getPackageById(list: Package[], id: string) {
  return list.find((p) => p.id === id)
}

export function getPackagesByDestination(list: Package[], destinationId: string) {
  return list.filter((p) => p.destinationId === destinationId)
}

export function getRelatedPackages(list: Package[], pkg: Package, count = 4) {
  return list
    .filter((p) => p.id !== pkg.id && (p.destinationId === pkg.destinationId || p.category.some((c) => pkg.category.includes(c))))
    .slice(0, count)
}
