"use client"

import { cn } from "@/lib/utils"

interface AppHeaderProps {
  title: string
  onBack?: () => void
  className?: string
}

export function AppHeader({ title, onBack, className }: AppHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex items-center gap-3 px-4 py-3",
        "bg-primary text-primary-foreground shadow-lg border-b border-primary/30",
        className
      )}
    >
      {onBack ? (
        <button
          onClick={onBack}
          aria-label="Назад"
          className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-foreground/15 active:bg-primary-foreground/25 transition-colors border border-primary-foreground/20"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      ) : (
        <div
          className="w-9 h-9 rounded-lg bg-primary-foreground/15 flex items-center justify-center border border-primary-foreground/20"
          aria-hidden="true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
      )}
      <h1 className="text-base font-bold tracking-wide uppercase">{title}</h1>
    </header>
  )
}
