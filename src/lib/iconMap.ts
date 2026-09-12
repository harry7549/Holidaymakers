import {
  Award,
  BadgeCheck,
  Calendar,
  Clock4,
  Compass,
  Globe2,
  Headset,
  Heart,
  Mail,
  MapPin,
  MapPinned,
  MessageCircle,
  Mountain,
  Percent,
  Phone,
  Plane,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react"

export const ICONS: Record<string, LucideIcon> = {
  Award,
  BadgeCheck,
  Calendar,
  Clock4,
  Compass,
  Globe2,
  Headset,
  Heart,
  Mail,
  MapPin,
  MapPinned,
  MessageCircle,
  Mountain,
  Percent,
  Phone,
  Plane,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Users,
  Wallet,
}

export const ICON_NAMES = Object.keys(ICONS)

export function getIcon(name: string | undefined): LucideIcon {
  return (name && ICONS[name]) || Sparkles
}
