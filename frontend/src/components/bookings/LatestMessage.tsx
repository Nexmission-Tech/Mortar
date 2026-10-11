/**
 * Latest Message — the newest message on the case in its original words, with
 * who sent it and when, and a way to every message and Mortar AI's readings.
 */

import type { Message } from '@mortar/core'
import { ChevronRight } from 'lucide-react'
import { SENDER_ROLE_LABELS, formatDateTime } from './labels'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function LatestMessage({ messages, onViewAll }: { messages: Message[]; onViewAll: () => void }) {
  const latest = [...messages].sort((a, b) => b.sentAt.localeCompare(a.sentAt))[0]
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4 md:p-6">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold leading-6 tracking-[-0.01em]">Latest Message</h2>
          {messages.length > 0 ? (
            <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-[13px]" onClick={onViewAll}>
              View All {messages.length}
              <ChevronRight aria-hidden="true" />
            </Button>
          ) : null}
        </div>
        {latest ? (
          <div className="flex flex-col gap-2">
            <p className="text-[13px] leading-[18px] text-muted-foreground">
              <span className="font-medium text-foreground">{latest.senderName}</span>
              {' · '}
              {SENDER_ROLE_LABELS[latest.senderRole]} · {formatDateTime(latest.sentAt)}
            </p>
            <p className="whitespace-pre-wrap text-sm">{latest.body}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No Messages Yet.</p>
        )}
      </CardContent>
    </Card>
  )
}
