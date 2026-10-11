/**
 * The case's four views below the summary: Overview, Messages, History and
 * Tasks, with counts. The page owns which is open (it lives in the URL). Every
 * panel stays mounted and is only hidden when inactive, so a half-written
 * review or a scrolled history survives a switch.
 */

import type { ReactNode } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type CaseView = 'overview' | 'messages' | 'history' | 'tasks'
export const CASE_VIEWS: readonly CaseView[] = ['overview', 'messages', 'history', 'tasks']

const LABELS: Record<CaseView, string> = {
  overview: 'Overview',
  messages: 'Messages',
  history: 'History',
  tasks: 'Tasks'
}

export function CaseViews({
  value,
  onValueChange,
  counts,
  panels
}: {
  value: CaseView
  onValueChange: (view: CaseView) => void
  counts: Partial<Record<CaseView, number>>
  panels: Record<CaseView, ReactNode>
}) {
  return (
    <Tabs id="case-views" value={value} onValueChange={(v) => onValueChange(v as CaseView)} className="scroll-mt-14">
      <div className="sticky top-14 z-20 border-b border-border bg-background">
        <TabsList variant="line" aria-label="Case Views" className="h-12 w-full justify-start gap-4 md:h-14 md:gap-6">
          {CASE_VIEWS.map((view) => (
            <TabsTrigger key={view} value={view} className="h-full flex-none px-0 text-[13px] md:text-sm">
              {LABELS[view]}
              {counts[view] !== undefined ? (
                <span className="text-xs tabular-nums text-muted-foreground">{counts[view]}</span>
              ) : null}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {CASE_VIEWS.map((view) => (
        <TabsContent key={view} value={view} forceMount className="mt-6 data-[state=inactive]:hidden">
          {panels[view]}
        </TabsContent>
      ))}
    </Tabs>
  )
}
