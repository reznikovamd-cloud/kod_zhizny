"use client"
// v2
import { cn } from "@/lib/utils"

interface BottomNavProps {
  active: "reference" | "checklists" | "cases"
  onNavigate: (section: "reference" | "checklists" | "cases") => void
}

const navItems = [
  {
    id: "reference" as const,
    label: "Справочник",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    id: "checklists" as const,
    label: "Чек-листы",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    id: "cases" as const,
    label: "Кейсы",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
]

export function BottomNav({ active, onNavigate }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around pb-safe border-t-2"
      style={{ backgroundColor: "var(--nav-bg)", borderColor: "var(--nav-border)" }}
      aria-label="Основная навигация"
    >
      {navItems.map((item) => {
        const isActive = active === item.id
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2.5 min-w-[60px] transition-all",
              isActive ? "text-primary-foreground" : "text-muted-foreground"
            )}
            aria-current={isActive ? "page" : undefined}
            aria-label={item.label}
          >
            <div className={cn(
              "p-1.5 rounded-lg transition-colors",
              isActive ? "bg-primary" : "bg-transparent"
            )}>
              {item.icon}
            </div>
            <span className={cn(
              "text-[9px] font-bold leading-tight uppercase tracking-wider",
              isActive ? "text-primary" : "text-muted-foreground"
            )}>
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
