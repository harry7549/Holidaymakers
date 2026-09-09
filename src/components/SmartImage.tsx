import { useState } from "react"
import { ImageOff } from "lucide-react"
import { cn } from "../lib/utils"

export function SmartImage({
  src,
  alt,
  className,
  imgClassName,
}: {
  src: string
  alt: string
  className?: string
  imgClassName?: string
}) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-ocean-200 via-ocean-100 to-sunset-100 text-ocean-700",
          className,
        )}
      >
        <div className="flex flex-col items-center gap-2 px-4 text-center">
          <ImageOff size={22} className="opacity-60" />
          <span className="text-xs font-medium opacity-70">{alt}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("overflow-hidden", className)}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className={cn("h-full w-full object-cover", imgClassName)}
      />
    </div>
  )
}
