"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { AppHeader } from "@/components/app-header"
import { referenceCategories, type ReferenceCategory, type ReferenceSection as RefSection } from "@/lib/data"

const categoryIcons: Record<string, React.ReactNode> = {
  "shield-plus": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  "file-text": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  "briefcase-medical": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <line x1="12" y1="12" x2="12" y2="16" />
      <line x1="10" y1="14" x2="14" y2="14" />
    </svg>
  ),
  syringe: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <path d="m18 2 4 4" />
      <path d="m17 7 3-3" />
      <path d="M19 9 8.7 19.3a2.4 2.4 0 0 1-3.4 0l-.6-.6a2.4 2.4 0 0 1 0-3.4L15 5" />
      <path d="m9 11 4 4" />
      <path d="m5 19-3 3" />
      <path d="m14 6 4 4" />
    </svg>
  ),
  mountain: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <polygon points="3 20 9 4 15 16 18 12 22 20" />
    </svg>
  ),
  waves: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
    </svg>
  ),
  activity: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  thermometer: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <path d="M14 14.8V5a4 4 0 0 0-8 0v9.8a6 6 0 1 0 8 0z" />
      <line x1="10" y1="9" x2="10" y2="17" />
    </svg>
  ),
  bug: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <path d="m8 2 1.8 2h4.4L16 2" />
      <path d="M9 8h6" />
      <path d="M6 13H2" />
      <path d="M22 13h-4" />
      <path d="m5 19 3-2" />
      <path d="m19 19-3-2" />
      <path d="M12 4a6 6 0 0 0-6 6v3a6 6 0 0 0 12 0v-3a6 6 0 0 0-6-6z" />
    </svg>
  ),
  utensils: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <path d="M4 2v8" />
      <path d="M8 2v8" />
      <path d="M6 2v20" />
      <path d="M4 10h4" />
      <path d="M17 2v20" />
      <path d="M17 2c2 1.8 3 4 3 7s-1 5.2-3 7" />
    </svg>
  ),
  plane: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <path d="M17.8 19.2 16 11l3.5-3.5a2.1 2.1 0 0 0-3-3L13 8 4.8 6.2 3.5 7.5l6.2 3.6-3.2 3.2-2.7-.4-.8.8 3.6 2 2 3.6.8-.8-.4-2.7 3.2-3.2 3.6 6.2z" />
    </svg>
  ),
  biohazard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <circle cx="12" cy="11.9" r="2" />
      <path d="M6.7 3.4c-.9 2.5 0 5.2 2.2 6.7C7.3 11 5.1 13.2 5 16" />
      <path d="m10.9 21.7 1-3.8" />
      <path d="M17.3 3.4c.9 2.5 0 5.2-2.2 6.7 1.6.9 3.8 3.1 3.9 5.9" />
      <path d="m13.1 21.7-1-3.8" />
      <path d="M11 20a2 2 0 1 0 2 0" />
      <path d="M5 16a2 2 0 1 0-1.8-3" />
      <path d="M19 16a2 2 0 1 0 1.8-3" />
      <path d="M8 3.5a2 2 0 1 0 2-1.5" />
      <path d="M14 3.5a2 2 0 1 0-2-1.5" />
    </svg>
  ),
}

interface ArticleViewProps {
  article: any
  sectionTitle: string
  onBack: () => void
}

function ArticleView({ article, sectionTitle, onBack }: ArticleViewProps) {
  const visibleLinks = article.links?.filter((link: { href: string }) => !link.href.startsWith("/reference/")) ?? []

  return (
    <div className="flex flex-col min-h-full">
      <AppHeader title={article.title} onBack={onBack} />
      <main className="flex-1 px-4 py-5 pb-28 overflow-y-auto">
        <p className="text-xs text-muted-foreground mb-3 font-medium">{sectionTitle}</p>
        {article.meta?.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {article.meta.map((item: { label: string; value: string }) => (
              <div key={`${item.label}-${item.value}`} className="rounded-lg border border-border bg-muted/40 px-2.5 py-1.5">
                <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{item.label}</span>
                <span className="block text-xs font-semibold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        )}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <ul className="px-4 py-3 flex flex-col gap-3">
            {article.content.map((item: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-foreground leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        {visibleLinks.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {visibleLinks.map((link: { label: string; href: string }) => (
              <a
                key={`${link.label}-${link.href}`}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-primary shadow-sm transition-colors hover:bg-muted"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

// Glossary section with expandable individual terms
function GlossarySectionView({ section, onBack }: { section: RefSection; onBack: () => void }) {
  const [expandedSubsection, setExpandedSubsection] = useState<string | null>(section.subsections[0]?.id || null)
  const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set())

  function toggleTerm(termKey: string) {
    setExpandedTerms((prev) => {
      const next = new Set(prev)
      if (next.has(termKey)) next.delete(termKey)
      else next.add(termKey)
      return next
    })
  }

  return (
    <div className="flex flex-col min-h-full">
      <AppHeader title={section.title} onBack={onBack} />
      <main className="flex-1 px-4 py-5 pb-28 overflow-y-auto">
        <p className="text-xs text-muted-foreground mb-4 font-medium">{section.description}</p>

        <div className="flex flex-col gap-3">
          {section.subsections.map((subsection: any) => {
            const isExpanded = expandedSubsection === subsection.id
            const terms = subsection.terms || []

            return (
              <div key={subsection.id} className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                <button
                  onClick={() => setExpandedSubsection(isExpanded ? null : subsection.id)}
                  className="w-full text-left p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors active:scale-[0.98]"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 font-bold text-xs">
                    {terms.length}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground uppercase tracking-wide">{subsection.title}</p>
                  </div>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={cn("w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform", isExpanded && "rotate-180")}
                    aria-hidden="true"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="px-3 pb-3 pt-0 border-t border-border flex flex-col gap-1.5">
                    {terms.map((item: { term: string; definition: string }, idx: number) => {
                      const termKey = `${subsection.id}-${idx}`
                      const isTermExpanded = expandedTerms.has(termKey)

                      return (
                        <button
                          key={termKey}
                          onClick={() => toggleTerm(termKey)}
                          className="w-full text-left rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors overflow-hidden"
                        >
                          <div className="flex items-center justify-between px-3 py-2.5">
                            <span className="text-sm font-semibold text-foreground">{item.term}</span>
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className={cn("w-3.5 h-3.5 text-muted-foreground flex-shrink-0 transition-transform", isTermExpanded && "rotate-180")}
                              aria-hidden="true"
                            >
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </div>
                          {isTermExpanded && (
                            <div className="px-3 pb-3 pt-0">
                              <p className="text-xs text-muted-foreground leading-relaxed">{item.definition}</p>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}

interface SectionViewProps {
  section: RefSection
  categoryTitle: string
  onBack: () => void
  onSelectArticle: (article: any, title: string) => void
}

function SectionView({ section, categoryTitle, onBack, onSelectArticle }: SectionViewProps) {
  // Check if this is a glossary section
  if ((section as any).isGlossary) {
    return <GlossarySectionView section={section} onBack={onBack} />
  }

  const [expandedSubsection, setExpandedSubsection] = useState<string | null>(section.subsections[0]?.id || null)

  return (
    <div className="flex flex-col min-h-full">
      <AppHeader title={section.title} onBack={onBack} />
      <main className="flex-1 px-4 py-5 pb-28 overflow-y-auto">
        <p className="text-xs text-muted-foreground mb-4 font-medium">{section.description}</p>

        <div className="flex flex-col gap-2.5">
          {section.subsections.map((subsection) => {
            const isExpanded = expandedSubsection === subsection.id
            const articles = subsection.articles ?? []

            return (
              <div key={subsection.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setExpandedSubsection(isExpanded ? null : subsection.id)}
                  className="w-full text-left p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors active:scale-[0.98]"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 font-bold text-sm">
                    {articles.length}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{subsection.title}</p>
                  </div>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={cn("w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform", isExpanded && "rotate-180")}
                    aria-hidden="true"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-3 pt-0 border-t border-border flex flex-col gap-2">
                    {articles.map((article) => (
                      <button
                        key={article.id}
                        onClick={() => onSelectArticle(article, subsection.title)}
                        className="w-full text-left py-3 px-3 rounded-lg bg-muted/50 hover:bg-muted text-sm font-medium text-foreground active:scale-[0.98] transition-all text-pretty flex items-center gap-3"
                      >
                        <span className="flex-1 min-w-0">{article.title}</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-muted-foreground flex-shrink-0" aria-hidden="true">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}

interface CategoryViewProps {
  category: ReferenceCategory
  onBack: () => void
}

function CategoryView({ category, onBack }: CategoryViewProps) {
  const [selectedSection, setSelectedSection] = useState<RefSection | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<any>(null)
  const [articleSubsectionTitle, setArticleSubsectionTitle] = useState<string>("")

  if (selectedArticle) {
    return (
      <ArticleView
        article={selectedArticle}
        sectionTitle={articleSubsectionTitle}
        onBack={() => setSelectedArticle(null)}
      />
    )
  }

  if (selectedSection) {
    return (
      <SectionView
        section={selectedSection}
        categoryTitle={category.title}
        onBack={() => setSelectedSection(null)}
        onSelectArticle={(article, title) => {
          setSelectedArticle(article)
          setArticleSubsectionTitle(title)
        }}
      />
    )
  }

  return (
    <div className="flex flex-col min-h-full">
      <AppHeader title={category.title} onBack={onBack} />
      <main className="flex-1 px-4 py-5 pb-28 overflow-y-auto">
        <div className="flex flex-col gap-2.5">
          {category.sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setSelectedSection(section)}
              className="w-full text-left bg-card border border-border rounded-2xl px-4 py-4 shadow-sm active:scale-[0.98] transition-transform flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0 text-primary group-active:bg-primary group-active:text-primary-foreground transition-colors font-bold text-sm">
                {section.subsections.length}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-foreground block text-pretty">{section.title}</span>
                <span className="text-xs text-muted-foreground mt-0.5 block">{section.subsections.length} подразделов</span>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-muted-foreground flex-shrink-0" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}

export function ReferenceSection({ onBack }: { onBack: () => void }) {
  const [selectedCategory, setSelectedCategory] = useState<ReferenceCategory | null>(null)
  const [showOtherCategories, setShowOtherCategories] = useState(false)

  const primaryCategories = referenceCategories.slice(0, 5)
  const otherCategories = referenceCategories.slice(5)

  if (selectedCategory) {
    return (
      <CategoryView
        category={selectedCategory}
        onBack={() => setSelectedCategory(null)}
      />
    )
  }

  if (showOtherCategories) {
    return (
      <div className="flex flex-col min-h-full">
        <AppHeader title="Другие разделы" onBack={() => setShowOtherCategories(false)} />
        <main className="flex-1 px-4 py-5 pb-28 overflow-y-auto">
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">Горная, альпинистская, водолазная, температурная, туристическая медицина, авиа и РХБЗ</p>
          <div className="flex flex-col gap-2.5">
            {otherCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat)}
                className="w-full text-left bg-card border border-border rounded-2xl px-4 py-4 shadow-sm active:scale-[0.98] transition-transform flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0 text-primary group-active:bg-primary group-active:text-primary-foreground transition-colors">
                  {categoryIcons[cat.icon]}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-foreground block text-pretty">{cat.title}</span>
                  <span className="text-xs text-muted-foreground mt-0.5 block">{cat.sections.length} разделов</span>
                </div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-muted-foreground flex-shrink-0" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full">
      <AppHeader title="Справочник" onBack={onBack} />
      <main className="flex-1 px-4 py-5 pb-28 overflow-y-auto">
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">Выберите раздел для изучения</p>
        <div className="flex flex-col gap-2.5">
          {primaryCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat)}
              className="w-full text-left bg-card border border-border rounded-2xl px-4 py-4 shadow-sm active:scale-[0.98] transition-transform flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0 text-primary group-active:bg-primary group-active:text-primary-foreground transition-colors">
                {categoryIcons[cat.icon]}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-foreground block text-pretty">{cat.title}</span>
                <span className="text-xs text-muted-foreground mt-0.5 block">{cat.sections.length} разделов</span>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-muted-foreground flex-shrink-0" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          ))}
          <button
            onClick={() => setShowOtherCategories(true)}
            className="w-full text-left bg-card border border-border rounded-2xl px-4 py-4 shadow-sm active:scale-[0.98] transition-transform flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0 text-primary group-active:bg-primary group-active:text-primary-foreground transition-colors">
              {categoryIcons.activity}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-foreground block text-pretty">Другие разделы</span>
              <span className="text-xs text-muted-foreground mt-0.5 block">{otherCategories.length} разделов</span>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-muted-foreground flex-shrink-0" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </main>
    </div>
  )
}
