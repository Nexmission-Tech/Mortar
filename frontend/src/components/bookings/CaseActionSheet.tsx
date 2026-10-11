/**
 * The case's action panel: Record An Update, Paste A Message or What To Do in
 * the floating case panel, over the case they belong to. The page owns which
 * one is open and passes the form or guidance in as children; closing returns
 * focus to the button that opened it.
 */

import type { ReactNode } from 'react'
import type { Booking } from '@mortar/core'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'

export type CaseAction = 'record' | 'message' | 'guidance'

const TITLES: Record<CaseAction, string> = {
  record: 'Record An Update',
  message: 'Paste A Message',
  guidance: 'What To Do'
}

export function CaseActionSheet({
  action,
  booking,
  onClose,
  children
}: {
  action: CaseAction | null
  booking: Booking
  onClose: () => void
  children: ReactNode
}) {
  return (
    <Sheet open={action !== null} onOpenChange={(open) => (open ? undefined : onClose())}>
      {action ? (
        <SheetContent side="floating" className="gap-5 p-4 md:p-6">
          <SheetHeader>
            <SheetTitle className="text-base leading-6">{TITLES[action]}</SheetTitle>
            <SheetDescription className="text-[13px] leading-[18px]">
              <span className="font-mono font-medium text-foreground">{booking.unit}</span> · {booking.buyer.name}
            </SheetDescription>
          </SheetHeader>
          {children}
        </SheetContent>
      ) : null}
    </Sheet>
  )
}
