import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { type Snapshot } from '@mortar/core'
import { PersonaProvider, PERSONAS } from '@/lib/persona'
import { booking, snapshot } from './mockSnapshot'

const SNAP: Snapshot = snapshot({
  bookings: [
    booking('BK-9001'),
    booking('BK-0040', { unit: 'A-15-05', priceRm: 756000 }),
    booking('BK-0001', { unit: 'B-01-01', priceRm: 480000, bookingDate: '2026-07-10' })
  ],
  events: [
    {
      id: 'EV-1',
      bookingId: 'BK-0001',
      applicationId: null,
      track: 'loan',
      kind: 'booked',
      occurredAt: '2026-07-10T10:00:00+08:00',
      recordedAt: '2026-07-10T10:05:00+08:00',
      reportedBy: 'Fixture',
      verifiedBy: 'Nurul Aina',
      status: 'confirmed',
      source: 'generator',
      messageId: null,
      document: null,
      note: null
    },
    {
      id: 'EV-2',
      bookingId: 'BK-0001',
      applicationId: null,
      track: 'legal',
      kind: 'spa_signed',
      occurredAt: '2026-07-28T10:00:00+08:00',
      recordedAt: '2026-07-28T10:05:00+08:00',
      reportedBy: 'Fixture',
      verifiedBy: 'Nurul Aina',
      status: 'confirmed',
      source: 'generator',
      messageId: null,
      document: null,
      note: null
    }
  ]
})

let current: Snapshot | null = SNAP
let currentError: string | null = null
let refreshCalls = 0

vi.mock('@/lib/data', () => ({
  useSnapshot: () => ({
    snapshot: current,
    loading: false,
    error: currentError,
    refresh: async () => {
      refreshCalls += 1
    }
  }),
  useCases: () => []
}))

import { ForecastPage } from '@/pages/ForecastPage'

for (const observer of ['ResizeObserver', 'IntersectionObserver'] as const) {
  vi.stubGlobal(
    observer,
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  )
}

function renderPage(profile = 'sales-nurul-aina') {
  window.localStorage.setItem('mortar.profile', profile)
  return render(
    <MemoryRouter>
      <PersonaProvider>
        <ForecastPage />
      </PersonaProvider>
    </MemoryRouter>
  )
}

const documentTitles = [
  'Signing Outlook',
  'Approved, Awaiting SPA',
  'Where Bookings Are Waiting',
  'Conversion And Turnaround',
  'Lost Bookings'
]

const canonicalQuestions = [
  'Explain the SPA signing outlook and its booking-day-30 deadline.',
  'Which approved bookings are still awaiting their SPA?',
  'Where are our unsigned bookings waiting, including older bookings?',
  'What do our recorded conversion rates and completed signing times show?',
  'What do our cancelled or lapsed bookings and second-bank follow-ups show?'
]

describe('ForecastPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    current = SNAP
    currentError = null
    refreshCalls = 0
  })

  it('shows the dataset cutoff, three forecast tiles, and five fixed documents', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1, name: 'Forecast' })).toBeTruthy()
    expect(screen.getByText('SPA signing outlook from recorded bookings as of 18 Sep 2026.')).toBeTruthy()
    expect(screen.getAllByText('Estimated SPAs By Booking Day 30').length).toBeGreaterThan(0)
    expect(screen.getByText('Estimated Signing Range')).toBeTruthy()
    expect(screen.getByText('Bookings In The Estimate')).toBeTruthy()
    expect(screen.queryByText('Eligible bookings')).toBeNull()

    const chips = screen.getByRole('group', { name: 'Choose a forecast document' })
    expect(
      within(chips)
        .getAllByRole('button')
        .map((button) => button.textContent)
    ).toEqual(documentTitles)
    expect(screen.getByRole('group', { name: 'Forecast documents' })).toBeTruthy()
    expect(screen.queryByRole('tab')).toBeNull()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('keeps all five reports available to every forecast persona', () => {
    for (const { id } of PERSONAS) {
      const { unmount } = renderPage(id)
      const chips = screen.getByRole('group', { name: 'Choose a forecast document' })
      expect(
        within(chips)
          .getAllByRole('button')
          .map((button) => button.textContent)
      ).toEqual(documentTitles)
      unmount()
    }
  })

  it('uses the booking snapshot date and names project history separately from accessible cases', () => {
    current = snapshot({
      ...SNAP,
      forecastModel: {
        version: 1,
        asOf: '2026-09-16',
        refreshedAt: '2026-09-16T09:00:00+08:00',
        nextRefreshAt: '2026-09-23T09:00:00+08:00',
        groups: {},
        stages: [],
        overall: { signed: 3, resolved: 8 }
      }
    })

    renderPage()
    expect(screen.getByText('SPA signing outlook from recorded bookings as of 18 Sep 2026.')).toBeTruthy()
    const scope = screen.getByText(
      (_, element) =>
        element?.tagName === 'P' &&
        element.textContent?.includes('Your accessible bookings appear in the report case rows.') === true &&
        element.textContent.includes('Project-wide historical rates use records through 16 Sep 2026.')
    )
    const reports = screen.getByRole('group', { name: 'Forecast documents' })
    expect(scope.compareDocumentPosition(reports) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy()
  })

  it('shows unavailable forecast figures without hiding operational reports', () => {
    current = snapshot({ bookings: [booking('BK-NO-HISTORY')], applications: [], events: [] })

    renderPage()
    expect(screen.getByRole('status').textContent).toMatch(/estimate is unavailable/i)
    expect(screen.getByRole('button', { name: 'Signing Outlook' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Approved, Awaiting SPA' })).toBeTruthy()
  })

  it('keeps supported zero separate from unavailable history', () => {
    current = snapshot({
      bookings: [booking('BK-SIGNED', { bookingDate: '2026-07-01' })],
      events: [
        {
          id: 'EV-SIGNED',
          bookingId: 'BK-SIGNED',
          applicationId: null,
          track: 'legal',
          kind: 'spa_signed',
          occurredAt: '2026-07-20T10:00:00+08:00',
          recordedAt: '2026-07-20T10:05:00+08:00',
          reportedBy: 'Fixture',
          verifiedBy: 'Nurul Aina',
          status: 'confirmed',
          source: 'generator',
          messageId: null,
          document: null,
          note: null
        }
      ]
    })

    renderPage()
    expect(screen.queryByRole('status')).toBeNull()
    expect(screen.getAllByText('Estimated SPAs By Booking Day 30')[0]?.parentElement?.textContent).toContain('0')
    expect(screen.getByText('Estimated Signing Range').parentElement?.textContent).toContain('0 – 0')
  })

  it('opens a report in the document dialog and restores focus after Escape', async () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Conversion And Turnaround' }))
    const trigger = screen.getByRole('button', { name: 'Open Document' })
    trigger.focus()
    fireEvent.click(trigger)
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('heading', { name: 'Conversion And Turnaround' })).toBeTruthy()
    expect(within(dialog).getByText('Signed / Known Outcome')).toBeTruthy()
    fireEvent.keyDown(dialog, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(document.activeElement).toBe(trigger)
  })

  it('moves through all five reports with the stack buttons and arrow keys', () => {
    renderPage()
    const stack = screen.getByRole('group', { name: 'Forecast documents' })
    expect(within(stack).getByText('Document 1 Of 5')).toBeTruthy()
    fireEvent.click(screen.getAllByRole('button', { name: 'Next document' })[0]!)
    expect(within(stack).getByText('Document 2 Of 5')).toBeTruthy()
    fireEvent.keyDown(stack, { key: 'ArrowLeft' })
    fireEvent.keyDown(stack, { key: 'ArrowLeft' })
    expect(within(stack).getByText('Document 5 Of 5')).toBeTruthy()
  })

  it('sends each fixed document to its canonical Ask MortarAI question', () => {
    const asked: string[] = []
    const listen = (event: Event) => asked.push((event as CustomEvent<{ question: string }>).detail.question)
    window.addEventListener('mortar:ask', listen)
    renderPage()

    for (let index = 0; index < documentTitles.length; index += 1) {
      fireEvent.click(screen.getByRole('button', { name: documentTitles[index]! }))
      fireEvent.click(screen.getAllByRole('button', { name: 'Ask Mortar AI' })[0]!)
    }

    window.removeEventListener('mortar:ask', listen)
    expect(asked).toEqual(canonicalQuestions)
  })

  it('keeps reports visible after refresh failure and retries the snapshot', () => {
    currentError = 'The server could not be reached.'
    renderPage()
    expect(screen.getByRole('alert').textContent).toMatch(/showing the last loaded data/i)
    expect(screen.getByRole('button', { name: 'Lost Bookings' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }))
    expect(refreshCalls).toBe(1)
  })

  it('shows an empty state and retry after the first snapshot load fails', () => {
    current = null
    currentError = 'The server could not be reached.'

    renderPage()
    expect(screen.getByText('Could Not Load Your Bookings')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }))
    expect(refreshCalls).toBe(1)
  })
})
