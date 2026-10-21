"use client"

import { useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { AppHeader } from "@/components/app-header"
import {
  marchChecklist,
  checklistCategories,
  type Checklist,
  type RichChecklist,
  type ChecklistCategory,
} from "@/lib/data"

const CIVIL_SCOPE_TEXT =
  "Базовая первая помощь для гражданского сценария: безопасность, вызов 112/103, помощь в пределах подготовки и навыков по 323-ФЗ ст. 31 и приказу Минздрава N 220н. Не выполняйте инвазивные вмешательства, инъекции, инфузии, декомпрессию, установку воздуховодов и применение чужих/неназначенных лекарств."

const TACTICAL_SCOPE_TEXT =
  "Расширенный тактический уровень: для обученных военнослужащих, санитарных инструкторов и подготовленных лиц по приказу МО N 760, приказу N 340, ведомственному стандарту и локальному протоколу. Наличие изделия или лекарства в укладке не дает права применять его без допуска, показаний и тренировки."

// ─── MARCH detail data ────────────────────────────────────────────────────────

const marchDetails: Record<string, {
  title: string
  goal: string
  lookFor: string[]
  actions: string[]
  resultCheck: string[]
  mistakes: string[]
}> = {
  "massive-bleeding": {
    title: "M — Массивное кровотечение",
    goal: "Немедленно остановить наружное кровотечение, угрожающее жизни, в первые секунды/минуты.",
    lookFor: [
      "Пульсирующее или непрерывное обильное кровотечение из раны",
      "Быстро пропитывающаяся кровью одежда/бинты",
      "Ампутация или почти ампутация конечности",
      "Кровь на земле/снаряжении в большом объеме",
    ],
    actions: [
      "Обеспечить безопасность себе и пострадавшему",
      "Быстро визуально проверить конечности и зоны массивного кровотечения",
      "Наложить жгут максимально высоко и туго на поврежденную конечность",
      "Если кровотечение сохраняется — наложить второй жгут выше/рядом с первым",
      "Для паха/подмышки/шеи — плотная тампонада раны гемостатиком/марлей + сильная компрессия только при отработанном навыке",
      "Наложить давящую повязку поверх тампонады",
      "Зафиксировать время наложения жгута",
      "Проверить, что активного кровотечения нет",
    ],
    resultCheck: [
      "Активного кровотечения нет",
      "Повязка не промокает кровью",
      "Жгут держит кровотечение под контролем",
    ],
    mistakes: [
      "Слабая затяжка жгута",
      "Потеря времени на мелкие раны до контроля массивного кровотечения",
      "Снятие/ослабление жгута без показаний",
    ],
  },
  "airway": {
    title: "A — Проходимость дыхательных путей",
    goal: "Обеспечить проходимость дыхательных путей и предотвратить асфиксию.",
    lookFor: [
      "Отсутствие/затруднение речи",
      "Хрип, бульканье, стридор",
      "Западение языка, кровь/рвота/инородные массы во рту",
      "Снижение сознания",
    ],
    actions: [
      "Оценить сознание и способность говорить",
      "Очистить ротоглотку от видимых препятствий (кровь, рвота, слизь)",
      "Выполнить маневр открытия дыхательных путей",
      "Установить назофарингеальный воздуховод только при подготовке, показаниях и допуске",
      "При критической обструкции — продвинутый протокол обеспечения дыхательных путей",
    ],
    resultCheck: [
      "Пострадавший дышит, воздух проходит свободнее",
      "Нет признаков нарастающей обструкции",
      "Сатурация/клиника не ухудшается",
    ],
    mistakes: [
      "Отсутствие повторной проверки после манипуляций",
      "Игнорирование загрязнения ротоглотки",
      "Неправильный размер/установка воздуховода",
    ],
  },
  "respiration": {
    title: "R — Дыхание",
    goal: "Выявить и устранить угрожающие дыхательные нарушения, прежде всего при травме грудной клетки.",
    lookFor: [
      "Ранения грудной клетки (вход/выход)",
      "Одышка, учащенное/поверхностное дыхание",
      "Асимметрия экскурсии грудной клетки",
      "Признаки напряженного пневмоторакса",
    ],
    actions: [
      "Осмотреть грудную клетку спереди, с боков и со спины",
      "На открытые раны грудной клетки наложить окклюзионные наклейки",
      "Контролировать частоту и качество дыхания",
      "При признаках напряженного пневмоторакса — вызвать/передать подготовленному персоналу; декомпрессия только по допуску",
      "Повторно оценивать состояние после каждого вмешательства",
    ],
    resultCheck: [
      "Дыхание стало эффективнее/стабильнее",
      "Нет нарастания признаков дыхательной недостаточности",
      "После вмешательств есть клиническое улучшение",
    ],
    mistakes: [
      "Пропуск раны на спине/боковой поверхности",
      "Отсутствие повторной оценки после окклюзии",
      "Запоздалое распознавание ухудшения",
    ],
  },
  "circulation": {
    title: "C — Кровообращение",
    goal: "Поддержать перфузию, выявить шок, предотвратить дальнейшую кровопотерю.",
    lookFor: [
      "Признаки шока: слабый/частый пульс, бледность, холодная кожа, спутанность",
      "Дополнительные источники кровотечения",
      "Признаки внутреннего кровотечения",
    ],
    actions: [
      "Повторно проверить все зоны возможного кровотечения",
      "Убедиться, что жгуты/повязки работают и не ослабли",
      "Венозный/внутрикостный доступ — только подготовленный персонал по локальному протоколу",
      "Инфузионная/медикаментозная поддержка — только по допуску, показаниям и протоколу",
      "Контролировать пульс, уровень сознания, капиллярное наполнение",
      "Подготовить к максимально ранней эвакуации",
    ],
    resultCheck: [
      "Нет прогрессии шока",
      "Гемодинамика стабильнее по клинике",
      "Источники кровопотери контролируются",
    ],
    mistakes: [
      "Фокус только на инфузии без полноценного контроля кровотечения",
      "Недооценка внутреннего кровотечения",
      "Отсутствие динамического мониторинга",
    ],
  },
  "hypothermia": {
    title: "H — Гипотермия и травма головы",
    goal: "Предотвратить гипотермию и вторичное повреждение мозга.",
    lookFor: [
      "Охлаждение даже в умеренной температуре (влажная одежда, ветер, кровопотеря)",
      "Признаки ЧМТ: изменение сознания, рвота, анизокория",
    ],
    actions: [
      "Изолировать пострадавшего от земли и холода",
      "Укрыть термоодеялом/сухими слоями, закрыть голову при возможности",
      "Снять мокрую одежду (если безопасно), обеспечить сухое утепление",
      "Поддерживать адекватную оксигенацию и перфузию",
      "Проводить регулярную переоценку сознания (AVPU/GCS)",
      "Минимизировать задержку эвакуации",
    ],
    resultCheck: [
      "Температурные потери уменьшены",
      "Неврологический статус без быстрого ухудшения",
      "Подготовка к транспортировке завершена",
    ],
    mistakes: [
      "Игнорирование гипотермии при кровопотере",
      "Недостаточная защита от холода/влаги",
      "Отсутствие повторной оценки неврологии",
    ],
  },
}

// ─── MARCH detail view ────────────────────────────────────────────────────────

// ─── S-MARCH-PAWS Interactive Wizard ─────────────────────────────────────────

type SMarchStep =
  | { id: "s-safety" }
  | { id: "m-hemorrhage" }
  | { id: "a-airway" }
  | { id: "r-respiration" }
  | { id: "c-circulation" }
  | { id: "h-hypothermia" }
  | { id: "p-pain" }
  | { id: "a2-antibiotics" }
  | { id: "w-wounds"; woundType?: string }
  | { id: "s2-splinting" }
  | { id: "final" }

const ALL_SMARCH_STEPS: SMarchStep["id"][] = [
  "s-safety",
  "m-hemorrhage",
  "a-airway",
  "r-respiration",
  "c-circulation",
  "h-hypothermia",
  "p-pain",
  "a2-antibiotics",
  "w-wounds",
  "s2-splinting",
  "final",
]

const STEP_LABELS: Record<string, string> = {
  "s-safety": "S",
  "m-hemorrhage": "M",
  "a-airway": "A",
  "r-respiration": "R",
  "c-circulation": "C",
  "h-hypothermia": "H",
  "p-pain": "P",
  "a2-antibiotics": "A",
  "w-wounds": "W",
  "s2-splinting": "S",
  "final": "✓",
}

function SMarchPawsWizard({ onBack }: { onBack: () => void }) {
  const [history, setHistory] = useState<SMarchStep[]>([{ id: "s-safety" }])
  const current = history[history.length - 1]

  function go(next: SMarchStep) {
    setHistory((h) => [...h, next])
  }

  function goBack() {
    if (history.length <= 1) {
      onBack()
      return
    }
    setHistory((h) => h.slice(0, -1))
  }

  function restart() {
    setHistory([{ id: "s-safety" }])
  }

  const stepIndex = ALL_SMARCH_STEPS.indexOf(current.id)
  const progress = Math.round(((stepIndex) / (ALL_SMARCH_STEPS.length - 1)) * 100)

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={goBack}
          className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 hover:bg-muted/80 transition-colors"
          aria-label="Назад"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-foreground" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground leading-tight truncate">Алгоритм S-MARCH PAWS</p>
          <p className="text-xs text-muted-foreground">Тактическая медицина</p>
        </div>
        <button
          onClick={restart}
          className="text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg px-2.5 py-1.5 transition-colors"
        >
          Сбросить
        </button>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-secondary">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <main className="flex-1 px-4 py-5 pb-28 overflow-y-auto">
        <div className="mb-4">
          <ScopeNotice tone="tactical" compact />
        </div>
        <SMarchStepScreen current={current} go={go} restart={restart} />
      </main>
    </div>
  )
}

// ─── Step Renderer ────────────────────────────────────────────────────────────

function SMarchStepScreen({
  current,
  go,
  restart,
}: {
  current: SMarchStep
  go: (s: SMarchStep) => void
  restart: () => void
}) {
  console.log("[v0] SMarchStepScreen rendering with current.id:", current.id)
  
  switch (current.id) {

    // S — SAFETY
    case "s-safety":
      console.log("[v0] Rendering s-safety step")
      return (
        <WizardScreen
          title="S — Обстановка"
          subtitle="Безопасна ли обстановка?"
          stepLabel="Шаг 1 / 11"
        >
          <WizardButtonRow
            yes={{ label: "Да", onClick: () => go({ id: "m-hemorrhage" }) }}
            no={{ label: "Нет", sub: "Укрыться, устранить угрозу", onClick: () => go({ id: "m-hemorrhage" }) }}
          />
          <ActionCard title="Быстрая оценка:" items={[
            "Проверить окружающую обстановку",
            "Определить угрозы",
            "Обеспечить безопасность команды",
            "Зафиксировать время начала помощи",
          ]} />
          <NextButton label="Далее → M (Кровотечение)" onClick={() => go({ id: "m-hemorrhage" })} />
        </WizardScreen>
      )

    // M — MASSIVE HEMORRHAGE
    case "m-hemorrhage":
      return (
        <WizardScreen
          title="M — Кровотечение"
          subtitle="Есть массивное кровотечение?"
          stepLabel="Шаг 2 / 11"
        >
          <WizardButtonRow
            yes={{ label: "Да", onClick: () => go({ id: "a-airway" }) }}
            no={{ label: "Нет", onClick: () => go({ id: "a-airway" }) }}
          />
          <ActionCard title="При кровотечении:" items={[
            "Быстро найти источник крови",
            "Осмотреть конечности",
            "Осмотреть пах и подмышки",
            "Наложить турникет выше раны на 5–8 см или high and tight, если источник не виден",
            "Проверить эффективность",
            "При необходимости второй турникет",
            "Гемостатик и тампонада — только при отработанном навыке и показаниях",
            "Отметить время наложения",
          ]} />
          <WarningCard text="Критическая ошибка: слабый жгут или неостановленное кровотечение" />
          <NextButton label="Далее → A (Дыхательные пути)" onClick={() => go({ id: "a-airway" })} />
        </WizardScreen>
      )

    // A — AIRWAY
    case "a-airway":
      return (
        <WizardScreen
          title="A — Дыхательные пути"
          subtitle="Дыхательные пути проходимы?"
          stepLabel="Шаг 3 / 11"
        >
          <WizardButtonRow
            yes={{ label: "Да", onClick: () => go({ id: "r-respiration" }) }}
            no={{ label: "Нет", onClick: () => go({ id: "r-respiration" }) }}
          />
          <ActionCard title="При нарушении проходимости:" items={[
            "Оценить сознание",
            "Очистить рот от крови и посторонних предметов",
            "Запрокинуть голову (если нет травмы шеи)",
            "Выдвинуть нижнюю челюсть",
            "Воздуховод — только при подготовке, показаниях и допуске",
            "Уложить в боковое восстановительное положение",
          ]} />
          <WarningCard text="Критическая ошибка: оставить без контроля дыхательных путей" />
          <NextButton label="Далее → R (Дыхание)" onClick={() => go({ id: "r-respiration" })} />
        </WizardScreen>
      )

    // R — RESPIRATION
    case "r-respiration":
      return (
        <WizardScreen
          title="R — Дыхание"
          subtitle="Есть нарушение дыхания или ранение груди?"
          stepLabel="Шаг 4 / 11"
        >
          <WizardButtonRow
            yes={{ label: "Да", onClick: () => go({ id: "c-circulation" }) }}
            no={{ label: "Нет", onClick: () => go({ id: "c-circulation" }) }}
          />
          <ActionCard title="При ранении грудной клетки:" items={[
            "Осмотреть грудную клетку спереди и сзади",
            "Найти проникающие раны",
            "Закрыть рану рукой (временно)",
            "Наложить герметичную повязку",
            "Проверить оба стороны (вход и выход)",
            "Контролировать дыхание",
            "При ухудшении — переоценить повязку",
          ]} />
          <WarningCard text="При нарастающей одышке после повязки — подозрение на напряжённый пневмоторакс (только подготовленный персонал)" />
          <NextButton label="Далее → C (Кровообращение)" onClick={() => go({ id: "c-circulation" })} />
        </WizardScreen>
      )

    // C — CIRCULATION
    case "c-circulation":
      return (
        <WizardScreen
          title="C — Кровообращение"
          subtitle="Есть признаки шока или скрытого кровотечения?"
          stepLabel="Шаг 5 / 11"
        >
          <WizardButtonRow
            yes={{ label: "Да", onClick: () => go({ id: "h-hypothermia" }) }}
            no={{ label: "Нет", onClick: () => go({ id: "h-hypothermia" }) }}
          />
          <ActionCard title="При признаках шока:" items={[
            "Проверить пульс",
            "Оценить кожные покровы (холодные, бледные)",
            "Проверить сознание",
            "Искать скрытое кровотечение в животе, тазу",
            "Повторить проверку ранее наложенных жгутов",
            "Контролировать общее состояние",
            "Подготовить к срочной эвакуации",
          ]} />
          <WarningCard text="Критическая ошибка: пропустить внутреннее кровотечение" />
          <NextButton label="Далее → H (Гипотермия)" onClick={() => go({ id: "h-hypothermia" })} />
        </WizardScreen>
      )

    // H — HYPOTHERMIA
    case "h-hypothermia":
      return (
        <WizardScreen
          title="H — Гипотермия / Голова"
          subtitle="Есть риск переохлаждения или травмы головы?"
          stepLabel="Шаг 6 / 11"
        >
          <WizardButtonRow
            yes={{ label: "Да", onClick: () => go({ id: "p-pain" }) }}
            no={{ label: "Нет", onClick: () => go({ id: "p-pain" }) }}
          />
          <ActionCard title="Профилактика гипотермии:" items={[
            "Укрыть пострадавшего термоодеялом",
            "Убрать мокрую одежду по возможности",
            "Изолировать от холодной поверхности",
            "Использовать подручные средства для утепления",
            "Контролировать температуру тела",
            "Защитить голову",
          ]} />
          <ActionCard title="При травме головы:" items={[
            "Оценить уровень сознания (GCS)",
            "Следить за ухудшением состояния",
            "Контролировать дыхание и пульс",
            "Минимизировать лишние движения",
            "Подготовить к срочной эвакуации",
          ]} />
          <NextButton label="Далее → P (Боль)" onClick={() => go({ id: "p-pain" })} />
        </WizardScreen>
      )

    // P — PAIN
    case "p-pain":
      return (
        <WizardScreen
          title="P — Боль"
          subtitle="Есть выраженная боль?"
          stepLabel="Шаг 7 / 11"
        >
          <WizardButtonRow
            yes={{ label: "Да", onClick: () => go({ id: "a2-antibiotics" }) }}
            no={{ label: "Нет", onClick: () => go({ id: "a2-antibiotics" }) }}
          />
          <ActionCard title="При выраженной боли:" items={[
            "Оценить интенсивность боли",
            "Обезболивание применять только по назначенному/локальному протоколу и уровню допуска",
            "Шприц-тюбик или инъекция — только для обученного военнослужащего/персонала по допуску",
            "После любого протокольного препарата контролировать дыхание",
            "Повторно оценить эффект боли",
            "Зафиксировать препарат и время",
          ]} />
          <InfoCard text="В гражданском сценарии не давайте чужие лекарства; можно помочь принять только препарат, ранее назначенный пострадавшему врачом." />
          <NextButton label="Далее → A (Антибиотик)" onClick={() => go({ id: "a2-antibiotics" })} />
        </WizardScreen>
      )

    // A2 — ANTIBIOTICS
    case "a2-antibiotics":
      return (
        <WizardScreen
          title="A — Антибиотик"
          subtitle="Есть проникающее ранение?"
          stepLabel="Шаг 8 / 11"
        >
          <WizardButtonRow
            yes={{ label: "Да", onClick: () => go({ id: "w-wounds" }) }}
            no={{ label: "Нет", onClick: () => go({ id: "w-wounds" }) }}
          />
          <ActionCard title="Антибиотикопрофилактика:" items={[
            "Проверить показания, аллергию и уровень допуска",
            "Если раненый в сознании и может глотать — применить только протокольный препарат по допуску",
            "Зафиксировать препарат, дозу и время",
            "Контролировать аллергические реакции",
          ]} />
          <WarningCard text="Антибиотики не относятся к гражданскому базовому сценарию; не давать внутрь при нарушении сознания или риске аспирации" />
          <NextButton label="Далее → W (Раны)" onClick={() => go({ id: "w-wounds" })} />
        </WizardScreen>
      )

    // W — WOUNDS
    case "w-wounds":
      return (
        <WizardScreen
          title="W — Раны"
          subtitle="Все ли раны закрыты?"
          stepLabel="Шаг 9 / 11"
        >
          <WizardButtonRow
            yes={{ label: "Да", onClick: () => go({ id: "s2-splinting" }) }}
            no={{ label: "Нет", onClick: () => go({ id: "s2-splinting" }) }}
          />
          <ActionCard title="Вторичный осмотр и обработка ран:" items={[
            "Осмотреть голову и шею",
            "Осмотреть грудь и живот",
            "Осмотреть все конечности",
            "Осмотреть спину и пах (по возможности)",
            "Закрыть все открытые раны повязками",
            "Не вправлять выпавшие органы — накрыть влажной повязкой",
            "Повторить гемостаз при необходимости",
          ]} />
          <NextButton label="Далее → S (Иммобилизация)" onClick={() => go({ id: "s2-splinting" })} />
        </WizardScreen>
      )

    // S2 — SPLINTING
    case "s2-splinting":
      return (
        <WizardScreen
          title="S — Иммобилизация"
          subtitle="Есть переломы или нестабильные травмы?"
          stepLabel="Шаг 10 / 11"
        >
          <WizardButtonRow
            yes={{ label: "Да", onClick: () => go({ id: "final" }) }}
            no={{ label: "Нет", onClick: () => go({ id: "final" }) }}
          />
          <ActionCard title="Иммобилизация поврежденных сегментов:" items={[
            "Использовать стандартные шины или подручные средства",
            "Фиксировать суставы выше и ниже места повреждения",
            "Придать максимально физиологичное положение",
            "Не вправлять кости и костные отломки",
            "Проверить дистальный пульс и чувствительность",
            "Контролировать боль при иммобилизации",
          ]} />
          <WarningCard text="Критическая ошибка: транспортировка без фиксации перелома" />
          <NextButton label="Далее → Финал" onClick={() => go({ id: "final" })} />
        </WizardScreen>
      )

    // FINAL
    case "final":
      return (
        <WizardScreen
          title="Алгоритм завершён"
          subtitle="Пострадавший готов к эвакуации"
          stepLabel="Шаг 11 / 11"
        >
          <div className="bg-card border border-border rounded-xl p-4 mb-4 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-sm font-bold text-foreground mb-1">Готово</p>
            <p className="text-xs text-muted-foreground leading-relaxed">Выполнены жизнеспасающие действия. Пострадавший готов к передаче и эвакуации.</p>
          </div>

          <ActionCard title="Перед эвакуацией проверить:" items={[
            "Все жгуты затянуты и время отмечено",
            "Все раны закрыты повязками",
            "Пострадавший утеплён",
            "Протокольные препараты выполнены только при допуске и показаниях",
            "Подготовлена информация для передающей бригады",
          ]} />

          <InfoCard text="Продолжать контроль дыхания, пульса и сознания каждые 10–15 минут. При любом ухудшении — вернуться к шагу S" />

          <NextButton label="Начать заново" onClick={restart} />
        </WizardScreen>
      )

    default:
      console.log("[v0] Unknown step in SMarchStepScreen:", current)
      return null
  }
}

// ─── Wrapper Component ────────────────────────────────────────────────────────

function MarchDetail({ checklist, onBack }: { checklist: Checklist; onBack: () => void }) {
  return <SMarchPawsWizard onBack={onBack} />
}

// ─── Rich checklist detail view ───────────────────────────────────────────────

function RichSection({ label, items, type }: { label: string; items: string[]; type: "plain" | "bullet" | "numbered" | "check" | "warn" }) {
  const marker = (idx: number) => {
    if (type === "numbered") return <span className="flex-shrink-0 font-medium w-4">{idx + 1}.</span>
    if (type === "check") return <span className="flex-shrink-0">✓</span>
    if (type === "warn") return <span className="flex-shrink-0">⚠</span>
    if (type === "bullet") return <span className="flex-shrink-0">•</span>
    return null
  }

  return (
    <div className="pt-3">
      <h4 className="font-semibold text-foreground mb-1.5 text-xs uppercase tracking-wide">{label}</h4>
      {type === "plain" ? (
        <p className="text-xs text-muted-foreground leading-relaxed">{items[0]}</p>
      ) : (
        <ul className="space-y-1">
          {items.map((item, idx) => (
            <li key={idx} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
              {marker(idx)}
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function RichChecklistDetail({ cl, onBack }: { cl: RichChecklist; onBack: () => void }) {
  const allItems = cl.actions
  const [checked, setChecked] = useState<Set<number>>(new Set())

  function toggle(idx: number) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  function resetAll() {
    setChecked(new Set())
  }

  const doneCount = checked.size
  const totalCount = allItems.length

  return (
    <div className="flex flex-col min-h-full">
      <AppHeader title={cl.title} onBack={onBack} />
      <main className="flex-1 px-4 py-5 pb-28 overflow-y-auto">
        <div className="mb-4">
          <ScopeNotice tone="civil" compact />
        </div>

        {/* Goal */}
        <div className="bg-card border border-border rounded-lg px-4 py-3 mb-4">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Цель</p>
          <p className="text-sm text-foreground leading-relaxed">{cl.goal}</p>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Выполнено {doneCount} / {totalCount}
            </span>
            {doneCount > 0 && (
              <button
                onClick={resetAll}
                className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
              >
                Сбросить
              </button>
            )}
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${totalCount > 0 ? (doneCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Checklist items */}
        <div className="flex flex-col gap-2 mb-5">
          {allItems.map((action, idx) => {
            const isDone = checked.has(idx)
            return (
              <button
                key={idx}
                onClick={() => toggle(idx)}
                className={cn(
                  "w-full text-left flex items-start gap-3 bg-card border rounded-lg px-4 py-3 transition-all active:scale-[0.98]",
                  isDone ? "border-primary/40 bg-primary/5" : "border-border"
                )}
                aria-pressed={isDone}
              >
                {/* Custom checkbox */}
                <div className={cn(
                  "flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-colors",
                  isDone ? "bg-primary border-primary" : "border-muted-foreground/50"
                )}>
                  {isDone && (
                    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-primary-foreground" aria-hidden="true">
                      <polyline points="2 6 5 9 10 3" />
                    </svg>
                  )}
                </div>
                <span className={cn(
                  "text-sm leading-relaxed transition-all",
                  isDone ? "line-through text-muted-foreground" : "text-foreground"
                )}>
                  <span className="font-medium text-muted-foreground mr-1.5">{idx + 1}.</span>
                  {action}
                </span>
              </button>
            )
          })}
        </div>

        {/* Look for / Result / Mistakes as compact info blocks */}
        <div className="flex flex-col gap-2">
          <InfoBlock label="Что ищем" items={cl.lookFor} />
          <InfoBlock label="Контроль результата" items={cl.resultCheck} />
          <InfoBlock label="Частые ошибки" items={cl.mistakes} />
          <div className="bg-card border border-border rounded-lg px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Следующий шаг</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{cl.nextStep}</p>
          </div>
        </div>
      </main>
    </div>
  )
}

function InfoBlock({ label, items }: { label: string; items: string[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-4 py-3 flex items-center justify-between"
      >
        <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", open && "rotate-180")} aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <ul className="px-4 pb-3 space-y-1 border-t border-border">
          {items.map((item, i) => (
            <li key={i} className="text-xs text-muted-foreground leading-relaxed flex gap-2 pt-1">
              <span className="flex-shrink-0 mt-0.5">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── КУЛАК-БАРИН wizard ───────────────────────────────────────────────────────

type KulakoStep =
  | { id: "zone" }
  | { id: "red-fire" }
  | { id: "red-conscious" }
  | { id: "red-bleeding" }
  | { id: "red-evac" }
  | { id: "yellow-k" }
  | { id: "yellow-u" }
  | { id: "yellow-l" }
  | { id: "yellow-a" }
  | { id: "yellow-k2" }
  | { id: "yellow-b" }
  | { id: "yellow-a2" }
  | { id: "yellow-r" }
  | { id: "yellow-i" }
  | { id: "yellow-n" }
  | { id: "green" }
  | { id: "done" }

const TOTAL_YELLOW_STEPS = 9 // К У Л А К Б А Р И Н = 10 letters but К repeats; we show 9 steps
const ALL_STEPS: KulakoStep["id"][] = [
  "zone",
  "red-fire", "red-conscious", "red-bleeding", "red-evac",
  "yellow-k", "yellow-u", "yellow-l", "yellow-a", "yellow-k2",
  "yellow-b", "yellow-a2", "yellow-r", "yellow-i", "yellow-n",
  "green", "done",
]

function KulakoWizard({ onBack }: { onBack: () => void }) {
  const [history, setHistory] = useState<KulakoStep[]>([{ id: "zone" }])
  const current = history[history.length - 1]

  function go(next: KulakoStep) {
    setHistory((h) => [...h, next])
  }

  function goBack() {
    if (history.length <= 1) {
      onBack()
      return
    }
    setHistory((h) => h.slice(0, -1))
  }

  function restart() {
    setHistory([{ id: "zone" }])
  }

  const stepIndex = ALL_STEPS.indexOf(current.id)
  const progress = Math.round(((stepIndex) / (ALL_STEPS.length - 1)) * 100)

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={goBack}
          className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 hover:bg-muted/80 transition-colors"
          aria-label="Назад"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-foreground" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground leading-tight truncate">Алгоритм КУЛАК-БАРИН</p>
          <p className="text-xs text-muted-foreground">Тактическая медицина</p>
        </div>
        <button
          onClick={restart}
          className="text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg px-2.5 py-1.5 transition-colors"
        >
          Сбросить
        </button>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-secondary">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <main className="flex-1 px-4 py-5 pb-28 overflow-y-auto">
        <div className="mb-4">
          <ScopeNotice tone="tactical" compact />
        </div>
        <KulakoStep current={current} go={go} restart={restart} />      </main>
    </div>
  )
}

// ─── Step renderer ────────────────────────────────────────────────────────────

function KulakoStep({ current, go, restart }: {
  current: KulakoStep
  go: (s: KulakoStep) => void
  restart: () => void
}) {
  switch (current.id) {

    // ── ZONE SELECTION ──────────────────────────────────────────────────────
    case "zone":
      return (
        <WizardScreen
          title="Определите тактическую зону"
          subtitle="Выберите текущую обстановку"
        >
          <ZoneButton color="red" label="Красная зона" sub="Активный огонь / непосредственная угроза" onClick={() => go({ id: "red-fire" })} />
          <ZoneButton color="yellow" label="Жёлтая зона" sub="Огонь прекращён, относительно безопасно" onClick={() => go({ id: "yellow-k" })} />
          <ZoneButton color="green" label="Зелёная зона" sub="Безопасно, подготовка к эвакуации" onClick={() => go({ id: "green" })} />
        </WizardScreen>
      )

    // ── RED ZONE ────────────────────────────────────────────────────────────
    case "red-fire":
      return (
        <WizardScreen
          zone="red"
          title="Красная зона"
          subtitle="Есть огневой контакт?"
        >
          <ActionCard color="red" items={[
            "Укрыться за укрытием",
            "Открыть ответный огонь",
            "Доложить командиру",
            "Установить голосовой контакт с раненым",
          ]} />
          <WizardButtonRow
            yes={{ label: "Да, ведётся огонь", onClick: () => go({ id: "red-conscious" }) }}
            no={{ label: "Нет, огонь не ведётся", onClick: () => go({ id: "red-conscious" }) }}
          />
        </WizardScreen>
      )

    case "red-conscious":
      return (
        <WizardScreen
          zone="red"
          title="Красная зона"
          subtitle="Раненый отвечает на голос?"
        >
          <WizardButtonRow
            yes={{
              label: "Да — в сознании",
              sub: "Переместить в укрытие, самопомощь",
              onClick: () => go({ id: "red-bleeding" }),
            }}
            no={{
              label: "Нет — без сознания",
              sub: "Выдвижение к раненому, свой/чужой, обезопасить оружие",
              onClick: () => go({ id: "red-bleeding" }),
            }}
          />
        </WizardScreen>
      )

    case "red-bleeding":
      return (
        <WizardScreen
          zone="red"
          title="Красная зона"
          subtitle="Есть массивное кровотечение?"
        >
          <WizardButtonRow
            yes={{ label: "Да", onClick: () => go({ id: "red-evac" }) }}
            no={{ label: "Нет", onClick: () => go({ id: "red-evac" }) }}
          />
          <ActionCard color="red" title="При кровотечении — жгут ВЫСОКО И ТУГО" items={[
            "На одежду или подкладку",
            "Первый тур — остановка крови",
            "Проверить: кровотечение прекратилось?",
            "Зафиксировать время наложения",
            "Остальное — в жёлтой зоне",
          ]} />
        </WizardScreen>
      )

    case "red-evac":
      return (
        <WizardScreen
          zone="red"
          title="Красная зона"
          subtitle="Есть возможность эвакуации?"
        >
          <WizardButtonRow
            yes={{ label: "Да — можно эвакуировать", onClick: () => go({ id: "yellow-k" }) }}
            no={{ label: "Нет — ждём возможности", onClick: () => go({ id: "zone" }) }}
          />
          <InfoCard text="При переходе в жёлтую зону — полный алгоритм КУЛАК-БАРИН" />
        </WizardScreen>
      )

    // ── YELLOW ZONE — К ──────────────────────────────────────────────────────
    case "yellow-k":
      return (
        <WizardScreen
          zone="yellow"
          title="К — Кровотечение"
          subtitle="Есть продолжающееся кровотечение?"
          stepLabel="Шаг 1 / 9"
        >
          <WizardButtonRow
            yes={{ label: "Да", onClick: () => go({ id: "yellow-u" }) }}
            no={{ label: "Нет", onClick: () => go({ id: "yellow-u" }) }}
          />
          <ActionCard title="При кровотечении:" items={[
            "Осмотреть конечности, пах, подмышки",
            "Найти источник",
            "Жгут выше раны на 5–8 см",
            "Проверить эффективность",
            "При необходимости — второй жгут",
            "Отметить время",
          ]} />
          <NextButton label="Далее → У (Дыхательные пути)" onClick={() => go({ id: "yellow-u" })} />
        </WizardScreen>
      )

    case "yellow-u":
      return (
        <WizardScreen
          zone="yellow"
          title="У — Дыхательные пути"
          subtitle="Дыхательные пути проходимы?"
          stepLabel="Шаг 2 / 9"
        >
          <WizardButtonRow
            yes={{ label: "Да — проходимы", onClick: () => go({ id: "yellow-l" }) }}
            no={{ label: "Нет — нарушены", onClick: () => go({ id: "yellow-l" }) }}
          />
          <ActionCard title="При нарушении проходимости:" items={[
            "Очистить рот от крови/секрета",
            "Запрокинуть голову (если нет ЧМТ)",
            "Выдвинуть нижнюю челюсть",
            "Воздуховод — только при подготовке, показаниях и допуске",
            "Боковое восстановительное положение",
          ]} />
          <NextButton label="Далее → Л (Лёгкие)" onClick={() => go({ id: "yellow-l" })} />
        </WizardScreen>
      )

    case "yellow-l":
      return (
        <WizardScreen
          zone="yellow"
          title="Л — Лёгкие / Грудная клетка"
          subtitle="Есть ранение грудной клетки?"
          stepLabel="Шаг 3 / 9"
        >
          <WizardButtonRow
            yes={{ label: "Да", onClick: () => go({ id: "yellow-a" }) }}
            no={{ label: "Нет", onClick: () => go({ id: "yellow-a" }) }}
          />
          <ActionCard title="При ранении груди:" items={[
            "Закрыть рану рукой (временно)",
            "Наложить герметичную повязку",
            "Осмотреть все поверхности (вход и выход)",
            "Полусидячее положение",
          ]} />
          <WarningCard text="При ухудшении дыхания на фоне повязки — декомпрессия (только подготовленный персонал)" />
          <NextButton label="Далее → А (Кровообращение)" onClick={() => go({ id: "yellow-a" })} />
        </WizardScreen>
      )

    case "yellow-a":
      return (
        <WizardScreen
          zone="yellow"
          title="А — Кровообращение"
          subtitle="Есть продолжающееся кровотечение из раны?"
          stepLabel="Шаг 4 / 9"
        >
          <WizardButtonRow
            yes={{ label: "Да", onClick: () => go({ id: "yellow-k2" }) }}
            no={{ label: "Нет", onClick: () => go({ id: "yellow-k2" }) }}
          />
          <ActionCard title="При кровотечении (не конечность):" items={[
            "Гемостатическая тампонада раны — только при отработанном навыке",
            "Давящая повязка сверху",
            "Непрерывное давление 3+ минуты",
            "Если не помогает — жгут (для конечности)",
          ]} />
          <NextButton label="Далее → К (Переохлаждение)" onClick={() => go({ id: "yellow-k2" })} />
        </WizardScreen>
      )

    case "yellow-k2":
      return (
        <WizardScreen
          zone="yellow"
          title="К — Переохлаждение"
          subtitle="Есть риск гипотермии?"
          stepLabel="Шаг 5 / 9"
        >
          <WizardButtonRow
            yes={{ label: "Да — холодно/мокро", onClick: () => go({ id: "yellow-b" }) }}
            no={{ label: "Нет", onClick: () => go({ id: "yellow-b" }) }}
          />
          <ActionCard title="Профилактика гипотермии:" items={[
            "Укрыть термоодеялом/сухими слоями",
            "Снять мокрую одежду",
            "Изолировать от земли",
            "Закрыть голову",
          ]} />
          <NextButton label="Далее → Б (Боль)" onClick={() => go({ id: "yellow-b" })} />
        </WizardScreen>
      )

    case "yellow-b":
      return (
        <WizardScreen
          zone="yellow"
          title="Б — Боль"
          subtitle="Есть выраженная боль?"
          stepLabel="Шаг 6 / 9"
        >
          <WizardButtonRow
            yes={{ label: "Да", onClick: () => go({ id: "yellow-a2" }) }}
            no={{ label: "Нет", onClick: () => go({ id: "yellow-a2" }) }}
          />
          <ActionCard title="Обезболивание:" items={[
            "Анальгетик по протоколу — только при допуске и показаниях",
            "Шприц-тюбик/инъекция — не гражданский сценарий, требуется подготовка",
            "После введения — мониторинг дыхания и сознания",
            "Документировать препарат, дозу и время",
          ]} />
          <NextButton label="Далее → А (Антибиотик)" onClick={() => go({ id: "yellow-a2" })} />
        </WizardScreen>
      )

    case "yellow-a2":
      return (
        <WizardScreen
          zone="yellow"
          title="А — Антибиотик"
          subtitle="Раненый в сознании и может глотать?"
          stepLabel="Шаг 7 / 9"
        >
          <WizardButtonRow
            yes={{ label: "Да — в сознании", onClick: () => go({ id: "yellow-r" }) }}
            no={{ label: "Нет — без сознания / шок", onClick: () => go({ id: "yellow-r" }) }}
          />
          <ActionCard title="Антибиотик при открытой ране:" items={[
            "В сознании: протокольный пероральный препарат только при допуске",
            "Без сознания: парентеральный вариант (при допуске)",
            "Проверить аллергии",
            "Зафиксировать препарат и время",
          ]} />
          <NextButton label="Далее → Р (Раны)" onClick={() => go({ id: "yellow-r" })} />
        </WizardScreen>
      )

    case "yellow-r":
      return (
        <WizardScreen
          zone="yellow"
          title="Р — Раны"
          subtitle="Осмотреть и перевязать все раны"
          stepLabel="Шаг 8 / 9"
        >
          <ActionCard title="Вторичный осмотр ран:" items={[
            "Осмотреть голову, шею, грудь, живот, конечности",
            "Проверить спину, пах, подмышки",
            "Перевязать все незакрытые раны",
            "Повторить гемостаз при необходимости",
            "Не вправлять выпавшие органы — накрыть влажной повязкой",
          ]} />
          <NextButton label="Далее → И (Иммобилизация)" onClick={() => go({ id: "yellow-i" })} />
        </WizardScreen>
      )

    case "yellow-i":
      return (
        <WizardScreen
          zone="yellow"
          title="И — Иммобилизация"
          subtitle="Есть травма опорно-двигательного аппарата?"
          stepLabel="Шаг 9 / 9"
        >
          <WizardButtonRow
            yes={{ label: "Да — подозрение на перелом", onClick: () => go({ id: "yellow-n" }) }}
            no={{ label: "Нет", onClick: () => go({ id: "yellow-n" }) }}
          />
          <ActionCard title="Иммобилизация:" items={[
            "Фиксировать сустав выше и ниже перелома",
            "Шина до перемещения",
            "Не вправлять кости",
            "Проверить дистальный пульс, чувствительность",
          ]} />
          <NextButton label="Далее → Н (Эвакуация)" onClick={() => go({ id: "yellow-n" })} />
        </WizardScreen>
      )

    case "yellow-n":
      return (
        <WizardScreen
          zone="yellow"
          title="Н — Эвакуация"
          subtitle="Финальная проверка перед перемещением"
          stepLabel="Финал жёлтой зоны"
        >
          <ActionCard title="Проверить перед эвакуацией:" items={[
            "Все жгуты затянуты, время отмечено",
            "Все раны закрыты",
            "Раненый утеплён",
            "Препараты применены только при наличии показаний и допуска",
            "Документация заполнена",
          ]} />
          <NextButton label="Перейти в зелёную зону →" onClick={() => go({ id: "green" })} />
        </WizardScreen>
      )

    // ── GREEN ZONE ───────────────────────────────────────────────────────────
    case "green":
      return (
        <WizardScreen
          zone="green"
          title="Зелёная зона — эвакуация"
          subtitle="Контроль состояния и подготовка"
        >
          <ActionCard color="green" title="Действия в зелёной зоне:" items={[
            "Повторная оценка MARCH/XABCDE",
            "Контроль эффективности жгутов; конверсия/ослабление только по подготовке и протоколу",
            "Проверить повязки на промокание",
            "Мониторинг сознания, дыхания, пульса",
            "Проверка каждые 10–15 минут",
            "Подготовить устный/письменный отчёт для передающей бригады",
          ]} />
          <InfoCard text="Любое ухудшение = возврат к алгоритму с шага S (безопасность) → MARCH-БАРИН" />
          <NextButton label="Завершить алгоритм" onClick={() => go({ id: "done" })} />
        </WizardScreen>
      )

    case "done":
      return (
        <WizardScreen
          title="Алгоритм завершён"
          subtitle="Раненый подготовлен к передаче"
        >
          <div className="bg-card border border-border rounded-xl p-5 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-sm font-bold text-foreground mb-1">Готово</p>
            <p className="text-xs text-muted-foreground leading-relaxed">Все шаги алгоритма КУЛАК-БАРИН пройдены. Раненый готов к передаче.</p>
          </div>
          <NextButton label="Начать заново" onClick={restart} />
        </WizardScreen>
      )

    default:
      return null
  }
}

// ─── СБ-КАПОТ wizard ───────────────────────────────────────────────────────────

type SbKapotStep =
  | { id: "s-safety" }
  | { id: "b-help" }
  | { id: "k-bleeding" }
  | { id: "a-airway" }
  | { id: "p-pneumo" }
  | { id: "o-examine" }
  | { id: "t-transport" }
  | { id: "done" }

const SB_KAPOT_STEPS: SbKapotStep["id"][] = [
  "s-safety", "b-help", "k-bleeding", "a-airway", "p-pneumo", "o-examine", "t-transport", "done"
]

function SbKapotWizard({ onBack }: { onBack: () => void }) {
  const [history, setHistory] = useState<SbKapotStep[]>([{ id: "s-safety" }])
  const current = history[history.length - 1]

  function go(next: SbKapotStep) {
    setHistory((h) => [...h, next])
  }

  function goBack() {
    if (history.length <= 1) {
      onBack()
      return
    }
    setHistory((h) => h.slice(0, -1))
  }

  function restart() {
    setHistory([{ id: "s-safety" }])
  }

  const stepIndex = SB_KAPOT_STEPS.indexOf(current.id)
  const progress = Math.round(((stepIndex) / (SB_KAPOT_STEPS.length - 1)) * 100)

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={goBack}
          className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 hover:bg-muted/80 transition-colors"
          aria-label="Назад"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-foreground" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground leading-tight truncate">Алгоритм СБ-КАПОТ</p>
          <p className="text-xs text-muted-foreground">Тактическая медицина</p>
        </div>
        <button
          onClick={restart}
          className="text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg px-2.5 py-1.5 transition-colors"
        >
          Сбросить
        </button>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-secondary">
        <div
          className="h-full bg-yellow-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <main className="flex-1 px-4 py-5 pb-28 overflow-y-auto">
        <div className="mb-4">
          <ScopeNotice tone="tactical" compact />
        </div>
        <SbKapotStepScreen current={current} go={go} restart={restart} />
      </main>
    </div>
  )
}

function SbKapotStepScreen({ current, go, restart }: {
  current: SbKapotStep
  go: (s: SbKapotStep) => void
  restart: () => void
}) {
  switch (current.id) {

    // С — Собственная безопасность
    case "s-safety":
      return (
        <WizardScreen
          zone="red"
          title="С — Собственная безопасность"
          subtitle="Обстановка безопасна?"
          stepLabel="Шаг 1 / 7"
        >
          <WizardButtonRow
            yes={{ label: "Да — безопасно", onClick: () => go({ id: "b-help" }) }}
            no={{ label: "Нет — опасно", onClick: () => go({ id: "b-help" }) }}
          />
          <ActionCard color="red" title="Если НЕТ:" items={[
            "Укрыться за укрытием",
            "Устранить непосредственную угрозу",
            "Не начинать помощь в опасной зоне",
          ]} />
          <ActionCard title="Если ДА:" items={[
            "Оценить безопасность пострадавшего",
            "Вызвать помощь по связи",
            "Зафиксировать время начала помощи",
          ]} />
          <WarningCard text="Критическая ошибка: начать помощь в опасной зоне" />
          <NextButton label="Далее → Б (Безопасность / вызов помощи)" onClick={() => go({ id: "b-help" })} />
        </WizardScreen>
      )

    // Б — Безопасность / вызов помощи
    case "b-help":
      return (
        <WizardScreen
          zone="red"
          title="Б — Безопасность / вызов помощи"
          subtitle="Вызвана ли помощь?"
          stepLabel="Шаг 2 / 7"
        >
          <WizardButtonRow
            yes={{ label: "Да — помощь вызвана", onClick: () => go({ id: "k-bleeding" }) }}
            no={{ label: "Нет — ещё не вызвана", onClick: () => go({ id: "k-bleeding" }) }}
          />
          <ActionCard title="Если НЕТ:" items={[
            "Использовать средства связи",
            "Сообщить о пострадавшем",
            "Указать местоположение",
            "Сообщить о характере травм",
          ]} />
          <ActionCard color="green" title="Если ДА:" items={[
            "Продолжить алгоритм",
          ]} />
          <NextButton label="Далее → К (Кровотечение)" onClick={() => go({ id: "k-bleeding" })} />
        </WizardScreen>
      )

    // К — Кровотечение
    case "k-bleeding":
      return (
        <WizardScreen
          zone="red"
          title="К — Кровотечение"
          subtitle="Есть массивное кровотечение?"
          stepLabel="Шаг 3 / 7"
        >
          <WizardButtonRow
            yes={{ label: "Да — кровотечение", onClick: () => go({ id: "a-airway" }) }}
            no={{ label: "Нет", onClick: () => go({ id: "a-airway" }) }}
          />
          <ActionCard color="red" title="При кровотечении:" items={[
            "Пережать в точке прижатия",
            "Наложить жгут максимально высоко",
            "Проверить остановку крови",
            "Зафиксировать время наложения",
          ]} />
          <WarningCard text="Критическая ошибка: потеря времени без остановки кровотечения" />
          <NextButton label="Далее → А (Асфиксия)" onClick={() => go({ id: "a-airway" })} />
        </WizardScreen>
      )

    // А — Асфиксия / дыхательные пути
    case "a-airway":
      return (
        <WizardScreen
          zone="yellow"
          title="А — Асфиксия / дыхательные пути"
          subtitle="Дыхательные пути проходимы?"
          stepLabel="Шаг 4 / 7"
        >
          <WizardButtonRow
            yes={{ label: "Да — проходимы", onClick: () => go({ id: "p-pneumo" }) }}
            no={{ label: "Нет — нарушены", onClick: () => go({ id: "p-pneumo" }) }}
          />
          <ActionCard title="При нарушении проходимости:" items={[
            "Очистить дыхательные пути",
            "Воздуховод — только при подготовке, показаниях и допуске",
            "Запрокинуть голову (если нет травмы шеи)",
            "Выдвинуть нижнюю челюсть",
          ]} />
          <WarningCard text="Критическая ошибка: оставить без проходимости дыхательных путей" />
          <NextButton label="Далее → П (Пневмоторакс)" onClick={() => go({ id: "p-pneumo" })} />
        </WizardScreen>
      )

    // П — Пневмоторакс
    case "p-pneumo":
      return (
        <WizardScreen
          zone="yellow"
          title="П — Пневмоторакс"
          subtitle="Есть ранение грудной клетки?"
          stepLabel="Шаг 5 / 7"
        >
          <WizardButtonRow
            yes={{ label: "Да — есть ранение", onClick: () => go({ id: "o-examine" }) }}
            no={{ label: "Нет", onClick: () => go({ id: "o-examine" }) }}
          />
          <ActionCard title="При ранении груди:" items={[
            "Осмотреть грудную клетку и спину",
            "Наложить окклюзионную наклейку",
            "Контролировать дыхание",
            "При подозрении на напряжённый пневмоторакс — передать обученному персоналу; декомпрессия только по допуску",
          ]} />
          <WarningCard text="Критическая ошибка: открытая рана грудной клетки без герметизации" />
          <NextButton label="Далее → О (Осмотр + обезболивание)" onClick={() => go({ id: "o-examine" })} />
        </WizardScreen>
      )

    // О — Осмотр + обезболивание
    case "o-examine":
      return (
        <WizardScreen
          zone="yellow"
          title="О — Осмотр + обезболивание"
          subtitle="Есть другие повреждения или боль?"
          stepLabel="Шаг 6 / 7"
        >
          <WizardButtonRow
            yes={{ label: "Да — есть", onClick: () => go({ id: "t-transport" }) }}
            no={{ label: "Нет", onClick: () => go({ id: "t-transport" }) }}
          />
          <ActionCard title="Вторичный осмотр:" items={[
            "Осмотр «с головы до пят»",
            "Выявить скрытые травмы",
            "Проверить живот, таз, конечности",
            "Обезболивание — только по назначенному/локальному протоколу и допуску",
            "Зафиксировать все находки",
          ]} />
          <WarningCard text="Критическая ошибка: пропустить вторичные повреждения" />
          <NextButton label="Далее → Т (Транспортировка)" onClick={() => go({ id: "t-transport" })} />
        </WizardScreen>
      )

    // Т — Транспортировка + гипотермия
    case "t-transport":
      return (
        <WizardScreen
          zone="green"
          title="Т — Транспортировка + гипотермия"
          subtitle="Пострадавший готов к транспортировке?"
          stepLabel="Шаг 7 / 7"
        >
          <WizardButtonRow
            yes={{ label: "Да — готов", onClick: () => go({ id: "done" }) }}
            no={{ label: "Нет — не готов", onClick: () => go({ id: "done" }) }}
          />
          <ActionCard title="Если НЕТ — подготовить:" items={[
            "В/в или в/к доступ — только подготовленный персонал по протоколу",
            "Инфузионная терапия — только по допуску, показаниям и контролю",
            "Продолжить контроль кровотечения",
            "Иммобилизировать конечности",
            "Убрать с холодной поверхности",
            "Укрыть термоодеялом",
          ]} />
          <ActionCard color="green" title="Если ДА:" items={[
            "Подготовить к эвакуации",
            "Передать информацию бригаде",
          ]} />
          <WarningCard text="Критическая ошибка: оставить без защиты от гипотермии" />
          <NextButton label="Завершить алгоритм" onClick={() => go({ id: "done" })} />
        </WizardScreen>
      )

    // ФИНАЛ
    case "done":
      return (
        <WizardScreen
          title="Алгоритм завершён"
          subtitle="Пострадавший стабилизирован"
        >
          <div className="bg-card border border-border rounded-xl p-5 text-center">
            <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-600 flex items-center justify-center mx-auto mb-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-sm font-bold text-foreground mb-1">Готово</p>
            <p className="text-xs text-muted-foreground leading-relaxed">Жизнеугрожающие состояния устранены. Пострадавший стабилизирован и готов к эвакуации.</p>
          </div>
          <ActionCard color="green" title="Итог:" items={[
            "Жизнеугрожающие состояния устранены",
            "Пострадавший стабилизирован",
            "Требуется эвакуация",
          ]} />
          <InfoCard text="Продолжать контроль дыхания, пульса и сознания каждые 10–15 минут" />
          <NextButton label="Начать заново" onClick={restart} />
        </WizardScreen>
      )

    default:
      return null
  }
}

// ─── Wizard UI primitives ─────────────────────────────────────────────────────

function ScopeNotice({
  tone,
  compact = false,
}: {
  tone: "civil" | "tactical"
  compact?: boolean
}) {
  const isTactical = tone === "tactical"
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3",
        isTactical
          ? "border-destructive/40 bg-destructive/10"
          : "border-primary/35 bg-primary/10"
      )}
    >
      <p
        className={cn(
          "text-[11px] font-bold uppercase tracking-wide mb-1",
          isTactical ? "text-destructive" : "text-primary"
        )}
      >
        {isTactical ? "Расширенный уровень" : "Гражданский базовый уровень"}
      </p>
      <p className={cn("text-xs leading-relaxed", compact ? "text-muted-foreground" : "text-foreground")}>
        {isTactical ? TACTICAL_SCOPE_TEXT : CIVIL_SCOPE_TEXT}
      </p>
    </div>
  )
}

function WizardScreen({
  zone,
  title,
  subtitle,
  stepLabel,
  children,
}: {
  zone?: "red" | "yellow" | "green"
  title: string
  subtitle?: string
  stepLabel?: string
  children: ReactNode
}) {
  const zoneBadge = zone === "red"
    ? "bg-destructive/15 text-destructive border-destructive/30"
    : zone === "yellow"
    ? "bg-yellow-500/15 text-yellow-700 border-yellow-400/30"
    : zone === "green"
    ? "bg-green-500/15 text-green-700 border-green-400/30"
    : null

  return (
    <div className="flex flex-col gap-3">
      <div>
        {zone && (
          <span className={cn("inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full border mb-2", zoneBadge)}>
            {zone === "red" ? "Красная зона" : zone === "yellow" ? "Жёлтая зона" : "Зелёная зона"}
            {stepLabel && <span className="ml-2 opacity-70">{stepLabel}</span>}
          </span>
        )}
        <h2 className="text-lg font-bold text-foreground text-balance">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function ZoneButton({
  color,
  label,
  sub,
  onClick,
}: {
  color: "red" | "yellow" | "green"
  label: string
  sub?: string
  onClick: () => void
}) {
  const styles = {
    red: "border-destructive/40 bg-destructive/8 hover:bg-destructive/15",
    yellow: "border-yellow-400/40 bg-yellow-500/8 hover:bg-yellow-500/15",
    green: "border-green-400/40 bg-green-500/8 hover:bg-green-500/15",
  }
  const dot = {
    red: "bg-destructive",
    yellow: "bg-yellow-500",
    green: "bg-green-500",
  }
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left flex items-center gap-3 border rounded-xl px-4 py-4 active:scale-[0.98] transition-all",
        styles[color]
      )}
    >
      <div className={cn("w-3 h-3 rounded-full flex-shrink-0", dot[color])} />
      <div className="flex-1">
        <p className="text-sm font-bold text-foreground">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-muted-foreground flex-shrink-0" aria-hidden="true">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  )
}

function WizardButtonRow({
  yes,
  no,
}: {
  yes: { label: string; sub?: string; onClick: () => void }
  no: { label: string; sub?: string; onClick: () => void }
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        onClick={yes.onClick}
        className="text-left bg-primary/10 border border-primary/30 hover:bg-primary/20 rounded-xl px-3 py-3 active:scale-[0.98] transition-all"
      >
        <p className="text-xs font-bold text-primary">{yes.label}</p>
        {yes.sub && <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{yes.sub}</p>}
      </button>
      <button
        onClick={no.onClick}
        className="text-left bg-muted/60 border border-border hover:bg-muted rounded-xl px-3 py-3 active:scale-[0.98] transition-all"
      >
        <p className="text-xs font-bold text-foreground">{no.label}</p>
        {no.sub && <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{no.sub}</p>}
      </button>
    </div>
  )
}

function ActionCard({
  color,
  title,
  items,
}: {
  color?: "red" | "green"
  title?: string
  items: string[]
}) {
  const bg = color === "red"
    ? "bg-destructive/8 border-destructive/30"
    : color === "green"
    ? "bg-green-500/8 border-green-400/30"
    : "bg-card border-border"

  return (
    <div className={cn("rounded-xl border px-4 py-3", bg)}>
      {title && <p className="text-xs font-bold text-foreground uppercase tracking-wide mb-2">{title}</p>}
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-xs text-foreground leading-relaxed">
            <span className="flex-shrink-0 font-bold text-primary mt-0.5">{i + 1}.</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function WarningCard({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3 flex gap-2">
      <span className="text-destructive font-bold text-sm flex-shrink-0">!</span>
      <p className="text-xs text-destructive leading-relaxed font-medium">{text}</p>
    </div>
  )
}

function InfoCard({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 px-4 py-3">
      <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
    </div>
  )
}

function NextButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
    >
      {label}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  )
}

// ─── Category → checklist list ────────────────────────────────────────────────

function CategoryDetail({ category, onBack }: { category: ChecklistCategory; onBack: () => void }) {
  const [selected, setSelected] = useState<RichChecklist | null>(null)

  if (selected) {
    return <RichChecklistDetail cl={selected} onBack={() => setSelected(null)} />
  }

  return (
    <div className="flex flex-col min-h-full">
      <AppHeader title={category.title} onBack={onBack} />
      <main className="flex-1 px-4 py-5 pb-28 overflow-y-auto">
        <div className="mb-4">
          <ScopeNotice tone="civil" compact />
        </div>
        <div className="flex flex-col gap-2.5">
          {category.checklists.map((cl) => (
            <button
              key={cl.id}
              onClick={() => setSelected(cl)}
              className="w-full text-left bg-card border border-border rounded-2xl px-4 py-4 shadow-sm active:scale-[0.98] transition-transform flex items-center gap-3 group"
            >
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-foreground block text-pretty">{cl.title}</span>
                <span className="text-xs text-muted-foreground mt-0.5 block line-clamp-1">{cl.goal}</span>
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

// Root checklists screen

type View =
  | { type: "list" }
  | { type: "march" }
  | { type: "kulako" }
  | { type: "sb-kapot" }
  | { type: "category"; category: ChecklistCategory }

export function ChecklistsSection({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<View>({ type: "list" })

  if (view.type === "march") {
    return <MarchDetail checklist={marchChecklist} onBack={() => setView({ type: "list" })} />
  }

  if (view.type === "kulako") {
    return <KulakoWizard onBack={() => setView({ type: "list" })} />
  }

  if (view.type === "sb-kapot") {
    return <SbKapotWizard onBack={() => setView({ type: "list" })} />
  }

  if (view.type === "category") {
    return <CategoryDetail category={view.category} onBack={() => setView({ type: "list" })} />
  }

  return (
    <div className="flex flex-col min-h-full">
      <AppHeader title="Чек-листы" onBack={onBack} />
      <main className="flex-1 px-4 py-5 pb-28 overflow-y-auto">
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed font-medium">
          Учебная навигация по алгоритмам. В гражданском происшествии при угрозе жизни сначала безопасность и 112/103.
        </p>

        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wide text-foreground mb-2">Базовая первая помощь</h2>
          <ScopeNotice tone="civil" compact />
          <div className="flex flex-col gap-2.5 mt-3">
            {checklistCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setView({ type: "category", category: cat })}
                className="w-full text-left bg-card border border-border rounded-2xl px-4 py-4 shadow-sm active:scale-[0.98] transition-transform flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">
                  {cat.checklists.length}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-foreground block text-pretty">{cat.title}</span>
                  <span className="text-xs text-muted-foreground mt-0.5 block">{cat.checklists.length} {cat.checklists.length === 1 ? "чек-лист" : cat.checklists.length < 5 ? "чек-листа" : "чек-листов"}</span>
                </div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-muted-foreground flex-shrink-0" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xs font-bold uppercase tracking-wide text-foreground mb-2">Расширенный тактический уровень</h2>
          <ScopeNotice tone="tactical" compact />
          <div className="flex flex-col gap-2.5 mt-3">
          {/* MARCH pinned card */}
          <button
            onClick={() => setView({ type: "march" })}
            className="w-full text-left bg-primary text-primary-foreground rounded-2xl px-4 py-4 shadow-sm active:scale-[0.98] transition-transform flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 font-bold text-base">
              M
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-bold block">Протокол S-MARCH-PAWS</span>
              <span className="text-xs opacity-80 mt-0.5 block">Только для подготовленных по тактическому протоколу</span>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 opacity-70 flex-shrink-0" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* КУЛАК-БАРИН wizard card */}
          <button
            onClick={() => setView({ type: "kulako" })}
            className="w-full text-left bg-destructive text-destructive-foreground rounded-2xl px-4 py-4 shadow-sm active:scale-[0.98] transition-transform flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 font-bold text-xs leading-none text-center">
              К
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-bold block">Протокол КУЛАК-БАРИН</span>
              <span className="text-xs opacity-80 mt-0.5 block">Военно-тактические зоны и допуски по подготовке</span>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 opacity-70 flex-shrink-0" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* СБ-КАПОТ wizard card */}
          <button
            onClick={() => setView({ type: "sb-kapot" })}
            className="w-full text-left bg-yellow-500 text-yellow-950 rounded-2xl px-4 py-4 shadow-sm active:scale-[0.98] transition-transform flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 font-bold text-xs leading-none text-center">
              СБ
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-bold block">Протокол СБ-КАПОТ</span>
              <span className="text-xs opacity-80 mt-0.5 block">Расширенный осмотр и вмешательства по допуску</span>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 opacity-70 flex-shrink-0" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          </div>
        </section>
      </main>
    </div>
  )
}
