"use client"

import { useState } from "react"
import { HomeScreen } from "@/components/home-screen"
import { ReferenceSection } from "@/components/reference-section"
import { ChecklistsSection } from "@/components/checklists-section"
import { CasesSection } from "@/components/cases-section"
import { BottomNav } from "@/components/bottom-nav"

type Section = "home" | "reference" | "checklists" | "cases"

export default function Page() {
  const [section, setSection] = useState<Section>("home")

  function goBack() {
    setSection("home")
  }

  const isHome = section === "home"

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      <div className="flex-1 overflow-y-auto">
        {isHome && (
          <HomeScreen onNavigate={(s) => setSection(s)} />
        )}
        {section === "reference" && (
          <ReferenceSection onBack={goBack} />
        )}
        {section === "checklists" && (
          <ChecklistsSection onBack={goBack} />
        )}
        {section === "cases" && (
          <CasesSection onBack={goBack} />
        )}
      </div>

      {/* Bottom nav only shown inside sections */}
      {!isHome && (
        <BottomNav
          active={section as "reference" | "checklists" | "cases"}
          onNavigate={setSection}
        />
      )}
    </div>
  )
}
