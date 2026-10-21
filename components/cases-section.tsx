"use client"
// v3
import { useState } from "react"
import { cn } from "@/lib/utils"
import { AppHeader } from "@/components/app-header"
import { caseCampaigns, type CaseCampaign, type CaseScenario } from "@/lib/data"

const campaignIcons: Record<string, React.ReactNode> = {
  building: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  ),
  wrench: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  thermometer: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
    </svg>
  ),
  "alert-triangle": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
}

interface ScenarioDetailProps {
  scenario: CaseScenario
  onBack: () => void
}

function ScenarioDetail({ scenario, onBack }: ScenarioDetailProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedDecision, setSelectedDecision] = useState<number | null>(null)
  const steps = ["brief", "timeline", "branches", "debrief"] as const
  const stepLabels = ["Бриф", "Таймлайн", "Развилки", "Дебриф"]

  return (
    <div className="flex flex-col min-h-full">
      <AppHeader title={scenario.title} onBack={onBack} />
      <main className="flex-1 px-4 py-5 pb-28 overflow-y-auto">
        {/* Step tabs */}
        <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
          {steps.map((step, idx) => (
            <button
              key={step}
              onClick={() => setCurrentStep(idx)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors",
                currentStep === idx
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {stepLabels[idx]}
            </button>
          ))}
        </div>

        {/* Brief */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <section className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <h3 className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Цель миссии</h3>
              <p className="text-sm text-foreground leading-relaxed">{scenario.goal}</p>
            </section>

            <section className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Контекст</h3>
              <p className="text-sm text-foreground leading-relaxed">{scenario.context}</p>
            </section>

            {scenario.legalBoundaries && scenario.legalBoundaries.length > 0 && (
              <section className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
                <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wide mb-2">Ограничение по подготовке</h3>
                <p className="text-sm text-amber-950 leading-relaxed">
                  Сценарий учебный. До начала распределите роли и исключите действия, на которые у участника нет подготовки, допуска или правового основания.
                </p>
              </section>
            )}

            {scenario.brief && scenario.brief.length > 0 && (
              <section className="bg-card border border-border rounded-2xl p-4 shadow-sm">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Бриф</h3>
                <ul className="space-y-1">
                  {scenario.brief.map((item, idx) => (
                    <li key={idx} className="text-sm text-foreground flex gap-2">
                      <span className="text-primary">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {scenario.roles && scenario.roles.length > 0 && (
              <section className="bg-card border border-border rounded-2xl p-4 shadow-sm">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Роли команды</h3>
                <ul className="space-y-1">
                  {scenario.roles.map((role, idx) => (
                    <li key={idx} className="text-sm text-foreground flex gap-2">
                      <span className="text-primary">•</span>
                      <span>{role}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {scenario.equipment && scenario.equipment.length > 0 && (
              <section className="bg-card border border-border rounded-2xl p-4 shadow-sm">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Оснащение</h3>
                <ul className="space-y-1">
                  {scenario.equipment.map((item, idx) => (
                    <li key={idx} className="text-sm text-foreground flex gap-2">
                      <span className="text-primary">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        {/* Timeline */}
        {currentStep === 1 && (
          <div className="space-y-3">
            {scenario.timeline.map((event, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  {idx < scenario.timeline.length - 1 && (
                    <div className="w-0.5 flex-1 bg-border mt-1" />
                  )}
                </div>
                <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex-1 mb-1">
                  <p className="text-sm text-foreground leading-relaxed">{event}</p>
                </div>
              </div>
            ))}

            {scenario.criticalErrors && scenario.criticalErrors.length > 0 && (
              <section className="bg-red-50 border border-red-200 rounded-2xl p-4 mt-4">
                <h3 className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">Критические ошибки</h3>
                <ul className="space-y-1">
                  {scenario.criticalErrors.map((error, idx) => (
                    <li key={idx} className="text-sm text-red-800 flex gap-2">
                      <span>✗</span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <h3 className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">Критерии успеха</h3>
              <ul className="space-y-1">
                {scenario.successCriteria.map((criterion, idx) => (
                  <li key={idx} className="text-sm text-green-800 flex gap-2">
                    <span>✓</span>
                    <span>{criterion}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}

        {/* Branches */}
        {currentStep === 2 && (
          <div className="space-y-3">
            {scenario.decisionOptions && scenario.decisionOptions.length > 0 && (
              <section className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">Выберите решение и разберите последствие.</p>
                {scenario.decisionOptions.map((option, idx) => {
                  const tone = option.tone ?? "warning"
                  const isSelected = selectedDecision === idx
                  const toneClasses = {
                    success: "border-green-200 bg-green-50 text-green-900",
                    warning: "border-amber-200 bg-amber-50 text-amber-950",
                    danger: "border-red-200 bg-red-50 text-red-900",
                  }[tone]

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedDecision(isSelected ? null : idx)}
                      className={cn(
                        "w-full text-left border rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-transform",
                        toneClasses
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-background/80 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold leading-snug">{option.decision}</p>
                          {isSelected && (
                            <p className="text-sm leading-relaxed mt-2 opacity-90">{option.consequence}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </section>
            )}

            {scenario.branches && scenario.branches.length > 0 && (
              <section className="space-y-3">
                {scenario.branches.map((branch, idx) => (
                  <div key={idx} className="bg-card border border-border rounded-2xl p-4 shadow-sm">
                    <div className="flex gap-2 items-start">
                      <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-primary" aria-hidden="true">
                          <path d="M6 3v12" />
                          <circle cx="18" cy="6" r="3" />
                          <circle cx="6" cy="18" r="3" />
                          <path d="M18 9a9 9 0 0 1-9 9" />
                        </svg>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{branch}</p>
                    </div>
                  </div>
                ))}
              </section>
            )}

            {(!scenario.decisionOptions || scenario.decisionOptions.length === 0) && (!scenario.branches || scenario.branches.length === 0) && (
              <div className="bg-muted rounded-2xl p-6 text-center">
                <p className="text-sm text-muted-foreground">Развилки не указаны для этого сценария</p>
              </div>
            )}
          </div>
        )}

        {/* Debrief */}
        {currentStep === 3 && (
          <div className="space-y-4">
            {scenario.debriefQuestions && scenario.debriefQuestions.length > 0 ? (
              <section className="bg-card border border-border rounded-2xl p-4 shadow-sm">
                <h3 className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">Вопросы для разбора</h3>
                <ul className="space-y-3">
                  {scenario.debriefQuestions.map((question, idx) => (
                    <li key={idx} className="text-sm text-foreground flex gap-3">
                      <span className="w-5 h-5 rounded-full bg-accent text-primary flex items-center justify-center flex-shrink-0 text-xs font-bold">{idx + 1}</span>
                      <span className="leading-relaxed">{question}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : (
              <div className="bg-muted rounded-2xl p-6 text-center">
                <p className="text-sm text-muted-foreground">Вопросы для дебрифа не указаны</p>
              </div>
            )}

            {scenario.legalBoundaries && scenario.legalBoundaries.length > 0 && (
              <section className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <h3 className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Правовые границы</h3>
                <ul className="space-y-1">
                  {scenario.legalBoundaries.map((boundary, idx) => (
                    <li key={idx} className="text-sm text-blue-900 flex gap-2">
                      <span>•</span>
                      <span>{boundary}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="bg-accent border border-border rounded-2xl p-4">
              <h3 className="text-xs font-semibold text-accent-foreground uppercase tracking-wide mb-2">Метрики оценки</h3>
              <ul className="space-y-1 text-sm text-foreground">
                <li className="flex gap-2"><span className="text-primary">•</span>Безопасность: контроль сцены, СИЗ</li>
                <li className="flex gap-2"><span className="text-primary">•</span>Клинический приоритет: верный порядок действий</li>
                <li className="flex gap-2"><span className="text-primary">•</span>Время: скорость до ключевого вмешательства</li>
                <li className="flex gap-2"><span className="text-primary">•</span>Командная работа: распределение ролей</li>
                <li className="flex gap-2"><span className="text-primary">•</span>Передача: полнота и ясность handoff</li>
              </ul>
            </section>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-6">
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep((p) => p - 1)}
              className="flex-1 py-3 rounded-2xl border border-border text-sm text-muted-foreground font-medium active:scale-[0.98] transition-transform bg-card"
            >
              Назад
            </button>
          )}
          {currentStep < steps.length - 1 && (
            <button
              onClick={() => setCurrentStep((p) => p + 1)}
              className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold active:scale-[0.98] transition-transform shadow-sm"
            >
              Далее
            </button>
          )}
        </div>
      </main>
    </div>
  )
}

interface ScenarioListProps {
  campaign: CaseCampaign
  onBack: () => void
  onSelectScenario: (scenario: CaseScenario) => void
}

function ScenarioList({ campaign, onBack, onSelectScenario }: ScenarioListProps) {
  return (
    <div className="flex flex-col min-h-full">
      <AppHeader title={campaign.title} onBack={onBack} />
      <main className="flex-1 px-4 py-5 pb-28 overflow-y-auto">
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{campaign.scenarios.length} сценариев</p>
        <div className="flex flex-col gap-3">
          {campaign.scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => onSelectScenario(scenario)}
              className="w-full text-left bg-card border border-border rounded-2xl px-4 py-4 shadow-sm active:scale-[0.98] transition-transform"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-foreground block leading-snug">{scenario.title}</span>
                  <span className="text-xs text-muted-foreground mt-1 block line-clamp-2">{scenario.goal}</span>
                </div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}

interface CasesSectionProps {
  onBack: () => void
}

export function CasesSection({ onBack }: CasesSectionProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<CaseCampaign | null>(null)
  const [selectedScenario, setSelectedScenario] = useState<CaseScenario | null>(null)

  if (selectedScenario) {
    return <ScenarioDetail scenario={selectedScenario} onBack={() => setSelectedScenario(null)} />
  }

  if (selectedCampaign) {
    return (
      <ScenarioList
        campaign={selectedCampaign}
        onBack={() => setSelectedCampaign(null)}
        onSelectScenario={setSelectedScenario}
      />
    )
  }

  return (
    <div className="flex flex-col min-h-full">
      <AppHeader title="Кейсы" onBack={onBack} />
      <main className="flex-1 px-4 py-5 pb-28 overflow-y-auto">
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">Сценарные миссии с таймлайном, ролями и дебрифом</p>
        <div className="flex flex-col gap-3">
          {caseCampaigns.map((campaign) => (
            <button
              key={campaign.id}
              onClick={() => setSelectedCampaign(campaign)}
              className="w-full text-left bg-card border border-border rounded-2xl px-4 py-4 shadow-sm active:scale-[0.98] transition-transform flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0 text-primary group-active:bg-primary group-active:text-primary-foreground transition-colors">
                {campaignIcons[campaign.icon]}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-foreground block">{campaign.title}</span>
                <span className="text-xs text-muted-foreground mt-0.5 block">{campaign.scenarios.length} сценариев</span>
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
