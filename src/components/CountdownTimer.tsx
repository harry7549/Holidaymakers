import { useEffect, useState } from "react"

function getTimeLeft(target: string) {
  const diff = Math.max(0, new Date(target).getTime() - Date.now())
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)
  return { days, hours, minutes, seconds }
}

export function CountdownTimer({ target, className }: { target: string; className?: string }) {
  const [time, setTime] = useState(() => getTimeLeft(target))

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  const units = [
    { label: "Days", value: time.days },
    { label: "Hrs", value: time.hours },
    { label: "Min", value: time.minutes },
    { label: "Sec", value: time.seconds },
  ]

  return (
    <div className={className}>
      <div className="flex gap-2">
        {units.map((u) => (
          <div key={u.label} className="flex min-w-12 flex-col items-center rounded-lg bg-ocean-950 px-2 py-1.5 text-white">
            <span className="font-display text-lg font-bold leading-none tabular-nums">{String(u.value).padStart(2, "0")}</span>
            <span className="mt-0.5 text-[9px] uppercase tracking-wide text-white/60">{u.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
