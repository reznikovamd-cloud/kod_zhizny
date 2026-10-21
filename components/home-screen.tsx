"use client"

import { caseCampaigns, referenceCategories } from "@/lib/data"

interface HomeScreenProps {
  onNavigate: (section: "reference" | "checklists" | "cases") => void
}

const cards = [
  {
    id: "reference" as const,
    title: "Справочник",
    description: "Первая помощь, право, вакцинация и отдельные материалы расширенного тактического уровня",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8" aria-hidden="true">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <line x1="12" y1="7" x2="16" y2="7" />
        <line x1="12" y1="11" x2="16" y2="11" />
        <line x1="8" y1="7" x2="8.01" y2="7" />
        <line x1="8" y1="11" x2="8.01" y2="11" />
      </svg>
    ),
    badge: `${Math.min(referenceCategories.length, 5) + Number(referenceCategories.length > 5)} разделов`,
  },
  {
    id: "checklists" as const,
    title: "Чек-листы",
    description: "Базовая первая помощь отдельно от протоколов для подготовленных военнослужащих",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8" aria-hidden="true">
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    badge: "10 категорий",
  },
  {
    id: "cases" as const,
    title: "Кейсы",
    description: "Гражданские и тактические сценарии с правовыми границами и уровнем допуска",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8" aria-hidden="true">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
    badge: `${caseCampaigns.length} кампаний`,
  },
]

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  return (
    <main className="flex flex-col min-h-full px-4 py-6 gap-5">
      <div className="flex flex-col items-center text-center py-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-balance text-foreground uppercase">КОД ЖИЗНИ</h2>
        </div>
      </div>

      {/* Navigation Cards - Tactical Style */}
      <div className="flex flex-col gap-3" role="list">
        {cards.map((card) => (
          <button
            key={card.id}
            role="listitem"
            onClick={() => onNavigate(card.id)}
            className="w-full text-left bg-card border-2 border-border rounded-lg p-4 shadow-sm active:scale-[0.98] transition-all flex items-start gap-4 group hover:border-primary/50"
            aria-label={card.title}
          >
            <div className="w-14 h-14 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0 text-primary group-active:bg-primary group-active:text-primary-foreground transition-colors">
              {card.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-base font-bold text-foreground uppercase tracking-wide">{card.title}</span>
                <span className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-1 rounded flex-shrink-0 uppercase tracking-wide">{card.badge}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed text-pretty">{card.description}</p>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-primary flex-shrink-0 mt-1" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        ))}
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-muted-foreground mt-4 leading-relaxed text-pretty px-4 font-medium">
        Материал носит образовательный характер. Выбирайте гражданский или тактический уровень по своей подготовке и допуску; справочник не заменяет очное обучение и локальный протокол.
      </p>
    </main>
  )
}
