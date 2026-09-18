import type { ComponentType, ReactNode } from "react"
import { AlertTriangle, Inbox, Search } from "lucide-react"
import { cn } from "../../lib/utils"

/** Icon badge + title + subtitle + optional action, used at the top of every admin page. */
export function AdminPageHeader({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon: ComponentType<{ size?: number | string; className?: string }>
  title: string
  subtitle: string
  action?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-ocean-500 to-ocean-800 text-white shadow-[0_4px_14px_-4px_rgba(50,69,119,0.55)]">
          <Icon size={20} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold text-ocean-950">{title}</h1>
          <p className="text-sm text-ocean-950/60">{subtitle}</p>
        </div>
      </div>
      {action}
    </div>
  )
}

/** Small colored status/feature pill, e.g. "Featured", "Verified", "New". */
export function Badge({ children, tone = "ocean" }: { children: ReactNode; tone?: "ocean" | "sunset" | "gold" | "neutral" }) {
  const tones: Record<string, string> = {
    ocean: "bg-ocean-50 text-ocean-700",
    sunset: "bg-sunset-50 text-sunset-600",
    gold: "bg-gold-400/20 text-gold-700",
    neutral: "bg-sand-100 text-ocean-950/60",
  }
  return <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", tones[tone])}>{children}</span>
}

/** Skeleton placeholder cards shown while an admin resource list is loading. */
export function AdminSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-sand-200 bg-white p-4">
          <div className="mb-3 h-28 rounded-xl bg-sand-100" />
          <div className="mb-2 h-4 w-2/3 rounded bg-sand-100" />
          <div className="h-3 w-1/2 rounded bg-sand-100" />
        </div>
      ))}
    </div>
  )
}

/** Pulsing placeholder rows for a card-list loading state (title/meta on the left, an action on the right) — used by inbox-style admin pages instead of card grids. */
export function AdminSkeletonRows({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-sand-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="w-2/3 space-y-2">
              <div className="h-4 w-1/2 rounded bg-sand-100" />
              <div className="h-3 w-3/4 rounded bg-sand-100" />
            </div>
            <div className="h-7 w-20 shrink-0 rounded-full bg-sand-100" />
          </div>
        </div>
      ))}
    </div>
  )
}

/** A few pulsing bars of decreasing width — a generic loading placeholder for small embedded lists, forms, and table rows. */
export function AdminSkeletonLines({ count = 3 }: { count?: number }) {
  return (
    <div className="animate-pulse space-y-2.5 py-1">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-4 rounded bg-sand-100" style={{ width: `${85 - i * 14}%` }} />
      ))}
    </div>
  )
}

/** Friendly error panel for a failed admin resource load, with a hint pointing at the likely cause. */
export function AdminErrorNotice({ resource, message }: { resource: string; message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-sunset-200 bg-sunset-50 p-4">
      <AlertTriangle size={18} className="mt-0.5 shrink-0 text-sunset-600" />
      <div>
        <p className="text-sm font-semibold text-sunset-700">Couldn't load {resource}</p>
        <p className="mt-0.5 text-xs text-sunset-600/80">{message}</p>
        <p className="mt-1.5 text-xs text-ocean-950/50">
          This usually means Supabase isn't wired up on the server yet — check that{" "}
          <code className="rounded bg-white/60 px-1 py-0.5 font-mono">SUPABASE_SERVICE_ROLE_KEY</code> is set in Vercel's environment variables.
        </p>
      </div>
    </div>
  )
}

/** A search box for filtering a resource list client-side, with a live result count. */
export function AdminSearchBar({
  value,
  onChange,
  placeholder,
  resultCount,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  resultCount?: number
}) {
  return (
    <div className="mb-4 flex items-center gap-2 rounded-2xl border border-sand-200 bg-white px-3 py-2">
      <Search size={15} className="shrink-0 text-ocean-950/40" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Search..."}
        className="w-full bg-transparent text-sm outline-none"
      />
      {value && resultCount !== undefined && <span className="shrink-0 text-xs text-ocean-950/40">{resultCount} found</span>}
    </div>
  )
}

/** Empty-state placeholder for a resource list with zero items. */
export function AdminEmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-sand-300 p-10 text-center">
      <Inbox size={22} className="text-ocean-950/25" />
      <p className="text-sm text-ocean-950/50">{label}</p>
    </div>
  )
}
