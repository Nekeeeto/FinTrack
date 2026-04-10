import {
  Wallet, Briefcase, Home, Banknote, Tag,
  Utensils, Car, ShoppingBag, HeartPulse, Music,
  TrendingUp, ArrowDownCircle, Bus, Smile, Monitor, Landmark,
  type LucideIcon
} from "lucide-react"

const iconMap: Record<string, LucideIcon> = {
  wallet: Wallet,
  briefcase: Briefcase,
  home: Home,
  banknote: Banknote,
  tag: Tag,
  utensils: Utensils,
  car: Car,
  "shopping-bag": ShoppingBag,
  "heart-pulse": HeartPulse,
  music: Music,
  "trending-up": TrendingUp,
  "arrow-down-circle": ArrowDownCircle,
  bus: Bus,
  smile: Smile,
  monitor: Monitor,
  landmark: Landmark,
}

export function getIcon(name: string): LucideIcon {
  return iconMap[name] || Tag
}
