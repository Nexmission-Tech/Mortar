import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { summarizeCases } from '@mortar/core'
import { PersonaProvider } from '@/lib/persona'
import { SnapshotProvider } from '@/lib/data'
import { BookingDetailPage } from '@/pages/BookingDetailPage'
import { buildSnapshot } from '@/components/bookings/__tests__/snapshotFixture'
import {
  fetchSignals,
  fetchSnapshot,
  postApplication,
  postEvent,
  postMessage,
  reviewEvent,
  updateTask
} from '@/lib/api'

vi.mock('@/lib/api', async () => {
  const fixture = await import('@/components/bookings/__tests__/snapshotFixture')
  const snapshot = fixture.buildSnapshot()
  return {
    fetchSnapshot: vi.fn(async () => snapshot),
    fetchSignals: vi.fn(async () => fixture.SIGNALS_9001),
    fetchPlaybooks: vi.fn(async () => fixture.RANKING_9001),
    reviewEvent: vi.fn(async () => ({})),
    extractMessage: vi.fn(async () => ({})),
    postMessage: vi.fn(async () => ({ message: {}, extraction: fixture.EXTRACTION_9001, event: null })),
    postEvent: vi.fn(async () => ({})),
    postApplication: vi.fn(async () => ({})),
    updateTask: vi.fn(async () => ({}))
  }
})

// The date fields open inline: Radix's popover positioning stalls jsdom (see inlinePopover).
vi.mock('@/components/ui/popover', () => import('@/components/bookings/__tests__/inlinePopover'))

// Radix places the select menu with floating-ui, which needs observers,
// pointer capture and scrolling that jsdom lacks.
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
Element.prototype.scrollIntoView = () => {}
Element.prototype.hasPointerCapture = () => false
Element.prototype.releasePointerCapture = () => {}

/** Opens a Mortar Select by its label and picks an option. */
async function choose(label: string, option: string | RegExp) {
  fireEvent.click(screen.getByRole('combobox', { name: label }))
  fireEvent.click(await screen.findByRole('option', { name: option }))
}

/** Opens a date field by its label and picks a day, named as the calendar reads it. */
async function pickDay(label: string, day: string) {
  fireEvent.click(screen.getByLabelText(label, { selector: 'button' }))
  fireEvent.click(await screen.findByLabelText(day, { selector: 'button' }))
}

/** Completes the open task through its close-out: what happened, then Recorded An Update. */
function closeOutTask(result = 'Payslips received, update recorded') {
  fireEvent.click(screen.getByRole('button', { name: 'Complete' }))
  fireEvent.change(screen.getByLabelText('What Happened'), { target: { value: result } })
  fireEvent.click(screen.getByRole('radio', { name: 'Recorded An Update' }))
  fireEvent.click(screen.getByRole('button', { name: 'Close Task' }))
}

/** Opens Record An Update in the case panel, which the page keeps closed until asked. */
async function openRecordUpdate() {
  fireEvent.click(await screen.findByRole('button', { name: 'Record An Update' }))
}

function renderDetail(id = 'BK-9001') {
  return render(
    <MemoryRouter initialEntries={[`/bookings/${id}`]}>
      <PersonaProvider>
        <SnapshotProvider>
          <Routes>
            <Route path="/bookings/:id" element={<BookingDetailPage />} />
          </Routes>
        </SnapshotProvider>
      </PersonaProvider>
    </MemoryRouter>
  )
}

describe('BookingDetailPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.clearAllMocks()
  })

  it('draws the illustrated journey with You Are Here on the awaited stop', async () => {
    renderDetail('BK-9002')
    const list = await screen.findByRole('list', { name: /Booking journey/ })
    expect(within(list).getAllByRole('listitem')).toHaveLength(5)
    expect(list.querySelector('[aria-current="step"]')?.getAttribute('aria-label')).toMatch(/^Loan Approved/)
    expect(screen.getByText('You Are Here')).toBeTruthy()
  })
  it('says who holds the case once, in the summary, with the team in Case Details', async () => {
    renderDetail('BK-9002')

    await screen.findByText('B-08-05')
    expect(document.querySelector('[data-tour="case-status"]')?.textContent).toContain('No Update For 8 Days')
    expect(document.querySelector('[data-tour="case-message"]')?.textContent).toBe('Paste A Message')
    // The header no longer repeats the wait as a sentence or the owners as a line.
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Mohd Hafiz bin Razak')
    expect(screen.queryByText(/Waiting On Bank · 17 Days Old/)).toBeNull()
    expect(screen.queryByText(/Nurul Aina \(Sales\)/)).toBeNull()
    const team = screen.getByText('Assigned Team').closest('section')!
    expect(team.textContent).toContain('Nurul Aina')
    expect(screen.queryByText('Up To Date')).toBeNull()
    expect(screen.queryByText(/Your Desk/)).toBeNull()
  })

  it('renders the case header, the four views and the applications', async () => {
    renderDetail()

    expect(await screen.findByText('A-12-03')).toBeTruthy()
    expect(screen.getAllByText('Raymond Tan Wei Hong').length).toBeGreaterThan(0)
    expect(screen.getByText(/RM 550,000/)).toBeTruthy()
    for (const view of [/^Overview/, /^Messages/, /^History/, /^Tasks/])
      expect(screen.getByRole('tab', { name: view })).toBeTruthy()
    expect(screen.getByRole('tab', { name: /^Overview/ }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('button', { name: /^Legal/ })).toBeTruthy()
    expect(within(screen.getByRole('tabpanel', { name: /^Overview/ })).getByText('Apex Bank')).toBeTruthy()
  })

  it("shows the banker's message with Jev's proposal and confirms it", async () => {
    renderDetail()

    // Shown twice: as the latest message on Overview, and in full on Messages.
    expect((await screen.findAllByText(/Still need latest 3 months slip gaji/)).length).toBeGreaterThan(0)
    // One line, built from three spans, so match the block that holds them.
    const line = [...document.body.querySelectorAll('p')]
      .map((p) => p.textContent)
      .find((t) => t?.startsWith('Mortar AI Suggests:'))
    expect(line).toContain('Documents Requested')
    expect(line).toContain('Payslip')
    expect(line).toContain('Mortar AI Is Sure')
    // The probability bar and the percentage went; confidence reads in words.
    expect(screen.queryByText(/Confidence \d+%/)).toBeNull()
    // The bank the proposal will update is named before anyone confirms.
    expect(screen.getByRole('button', { name: 'Confirm' }).parentElement?.textContent).toContain('Updates Apex Bank')

    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() =>
      expect(vi.mocked(reviewEvent)).toHaveBeenCalledWith('EV-9001-J1', {
        decision: 'confirm',
        reviewer: 'Nurul Aina'
      })
    )
  })

  it('ranks the missing-documents playbook first by Jev fit', async () => {
    renderDetail()

    fireEvent.click(await screen.findByRole('button', { name: 'What To Do' }))
    expect(await screen.findByText(/Missing Income Documents/)).toBeTruthy()
    expect(screen.getAllByText('Applies').length).toBeGreaterThan(0)
  })

  it('lists the open task and completes it', async () => {
    renderDetail()

    expect(await screen.findByText('Request Latest Three Months Payslips From Buyer')).toBeTruthy()
    closeOutTask()

    await waitFor(() =>
      expect(vi.mocked(updateTask)).toHaveBeenCalledWith('TSK-9001-1', 'done', {
        result: 'Payslips received, update recorded'
      })
    )
  })

  it('keeps the case on screen with a Try Again notice when the save lands but the refresh after it fails', async () => {
    renderDetail()

    expect(await screen.findByText('Request Latest Three Months Payslips From Buyer')).toBeTruthy()
    // The task update itself succeeds; only the follow-up snapshot read fails.
    vi.mocked(fetchSnapshot).mockRejectedValueOnce(new Error('network down'))
    closeOutTask()

    expect(await screen.findByText('Could Not Refresh. Showing The Last Loaded Data.')).toBeTruthy()
    // The case stays on screen — it does not vanish behind a blocking error.
    expect(screen.getByText('A-12-03')).toBeTruthy()
    expect(screen.getByRole('tab', { name: /^History/ })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }))
    await waitFor(() => expect(screen.queryByText('Could Not Refresh. Showing The Last Loaded Data.')).toBeNull())
  })

  it('shows Jev’s alternative in Waiting On, as Today does', async () => {
    // The page used to pass no suggestion, so "Jev Suggests" only ever
    // appeared on Today. One cached answer, differing from the rule, must
    // reach the panel here too.
    const fixture = await import('@/components/bookings/__tests__/snapshotFixture')
    const base = fixture.buildSnapshot()
    vi.mocked(fetchSnapshot).mockResolvedValueOnce({
      ...base,
      nextActions: [
        {
          bookingId: 'BK-9001',
          // The rule says chase the banker; Jev says ring the buyer.
          action: { value: 'call_buyer', probabilities: { call_buyer: 0.9 }, confidence: 0.9 },
          owner: { value: 'sales', probabilities: { sales: 0.9 }, confidence: 0.9 },
          urgency: { score: 2, confidence: 0.9 },
          meta: { source: 'cache', stale: false, latencyMs: null }
        }
      ]
    })
    renderDetail('BK-9001')

    expect(await screen.findByText('Waiting On')).toBeTruthy()
    expect(screen.getByText('Mortar AI Suggests: Call The Buyer')).toBeTruthy()
  })

  it('keeps Record An Update and Paste A Message closed on load and opens each in the case panel', async () => {
    renderDetail()

    expect(await screen.findByRole('button', { name: 'Paste A Message' })).toBeTruthy()
    expect(screen.queryByLabelText('Sender Role')).toBeNull()
    expect(screen.queryByLabelText('What Happened')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Paste A Message' }))
    const paste = screen.getByRole('dialog', { name: 'Paste A Message' })
    expect(within(paste).getByLabelText('Sender Role')).toBeTruthy()
    expect(within(paste).getByRole('button', { name: 'Add Message' })).toBeTruthy()
    fireEvent.keyDown(paste, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())

    fireEvent.click(screen.getByRole('button', { name: 'Record An Update' }))
    const record = screen.getByRole('dialog', { name: 'Record An Update' })
    expect(within(record).getByLabelText('What Happened')).toBeTruthy()
    expect(within(record).getByRole('button', { name: 'Record Update' })).toBeTruthy()
  })

  it('names the bank and banker the case is waiting on, with the live bank first', async () => {
    renderDetail('BK-9002')
    const summary = await screen.findByText('Crestline Bank’s Decision')
    expect(summary.closest('[data-tour="case-status"]')?.textContent).toContain('Bernard Lim · Banker')
    const banks = screen.getByText('Bank Applications').closest('div.shadow-card, .shadow-card')!.textContent!
    expect(banks.indexOf('Crestline Bank')).toBeLessThan(banks.indexOf('Malayan Trust Bank'))
  })

  it('says how many Mortar AI readings wait for review, and opens them', async () => {
    renderDetail()
    fireEvent.click(await screen.findByRole('button', { name: /^1 Mortar AI Reading To Review/ }))
    expect(screen.getByRole('tab', { name: /^Messages/ }).getAttribute('aria-selected')).toBe('true')
  })

  it('returns focus to the button that opened the case panel', async () => {
    renderDetail()
    const paste = await screen.findByRole('button', { name: 'Paste A Message' })
    paste.focus()
    fireEvent.click(paste)
    fireEvent.keyDown(screen.getByRole('dialog', { name: 'Paste A Message' }), { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    await waitFor(() => expect(document.activeElement).toBe(paste))
  })

  it('sends a pasted message’s reading to Messages for review', async () => {
    vi.mocked(postMessage).mockResolvedValueOnce({
      message: {},
      extraction: (await import('@/components/bookings/__tests__/snapshotFixture')).EXTRACTION_9001,
      event: { id: 'EV-NEW' }
    } as never)
    renderDetail()
    fireEvent.click(await screen.findByRole('button', { name: 'Paste A Message' }))
    const dialog = screen.getByRole('dialog', { name: 'Paste A Message' })
    fireEvent.change(within(dialog).getByLabelText('Message'), { target: { value: 'Need the payslip please' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add Message' }))
    fireEvent.click(await within(dialog).findByRole('button', { name: 'Review It In Messages' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(screen.getByRole('tab', { name: /^Messages/ }).getAttribute('aria-selected')).toBe('true')
  })

  it('keeps What To Do on a closed case', async () => {
    const snapshot = buildSnapshot()
    const closed = summarizeCases(snapshot, snapshot.meta.referenceDate).find(
      (c) => c.stage === 'cancelled' || c.stage === 'lapsed'
    )!
    renderDetail(closed.bookingId)
    expect(await screen.findByRole('button', { name: 'What To Do' })).toBeTruthy()
  })

  it('opens on the view a link names', async () => {
    renderDetail('BK-9001?view=messages')
    expect((await screen.findByRole('tab', { name: /^Messages/ })).getAttribute('aria-selected')).toBe('true')
  })

  it('opens the loan history from the journey’s bank detour', async () => {
    renderDetail('BK-9002')

    fireEvent.click(await screen.findByRole('button', { name: /View loan history/ }))
    expect(screen.getByRole('tab', { name: /^History/ }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('button', { name: /^Loan \d+$/ }).getAttribute('aria-pressed')).toBe('true')
  })

  it('does not dress an extraction in the status of an event recording a different claim', async () => {
    renderDetail('BK-9002')

    // MSG-9002-1: Jev read documents_received, but the message only carries the confirmed `booked`.
    const body = await screen.findByText(/Passing my payslips and bank statement/)
    const item = body.closest('li')!
    const line = [...item.querySelectorAll('p')]
      .map((p) => p.textContent)
      .find((t) => t?.startsWith('Mortar AI Suggests:'))
    expect(line).toContain('Documents Received')
    expect(line).toContain('Payslip')
    expect(within(item).queryByText('Confirmed')).toBeNull()
    expect(within(item).queryByRole('button', { name: 'Confirm' })).toBeNull()
  })

  it('shows no status pill for a no_update read beside a confirmed event', async () => {
    renderDetail('BK-9001')

    // MSG-9001-3: the linked buyer_contacted is confirmed, but Jev read no update.
    const body = await screen.findByText(/Very keen to sign once the loan is approved/)
    const item = body.closest('li')!
    expect(within(item).getByText('No Case Update In This Message.')).toBeTruthy()
    // The no-update read collapses to one muted line — no proposal panel.
    expect(within(item).queryByText('Mortar AI Suggests')).toBeNull()
    expect(within(item).queryByText('Confirmed')).toBeNull()
  })

  it('asks Jev for signals once the buyer has messaged', async () => {
    renderDetail('BK-9001')

    expect(await screen.findByText('Prompt Replies')).toBeTruthy()
    await waitFor(() => expect(vi.mocked(fetchSignals)).toHaveBeenCalledWith('BK-9001'))
  })

  it('never asks Jev for signals when the buyer has not messaged', async () => {
    renderDetail('BK-0001')

    expect(await screen.findByText('No Buyer Messages Have Arrived Yet.')).toBeTruthy()
    await waitFor(() => expect(vi.mocked(fetchSignals)).not.toHaveBeenCalled())
  })

  it('does not fetch signals for a booking missing from the snapshot', async () => {
    renderDetail('BK-9999')

    expect(await screen.findByText('Booking Not Found')).toBeTruthy()
    await waitFor(() => expect(vi.mocked(fetchSignals)).not.toHaveBeenCalled())
  })

  describe('Record An Update', () => {
    it('records Loan Approved against its bank on the day chosen, then re-reads the case', async () => {
      renderDetail()
      await openRecordUpdate()

      await choose('What Happened', 'Loan Approved')
      // Apex Bank holds the one open application, so it is chosen already.
      expect(screen.getByRole('combobox', { name: 'Which Bank' }).textContent).toContain('Apex Bank')
      await pickDay('When It Happened', 'Wednesday, September 16th, 2026')
      fireEvent.change(screen.getByLabelText('Note'), { target: { value: 'LO received by email' } })
      fireEvent.click(screen.getByRole('button', { name: 'Record Update' }))

      await waitFor(() =>
        expect(vi.mocked(postEvent)).toHaveBeenCalledWith({
          bookingId: 'BK-9001',
          track: 'loan',
          kind: 'loan_approved',
          applicationId: 'APP-9001-1',
          occurredOn: '2026-09-16',
          note: 'LO received by email',
          reportedBy: 'Nurul Aina'
        })
      )
      await waitFor(() => expect(vi.mocked(fetchSnapshot)).toHaveBeenCalledTimes(2))
      expect(vi.mocked(postApplication)).not.toHaveBeenCalled()
    })

    it('writes an SPA appointment into the note the Legal desk reads', async () => {
      renderDetail()
      await openRecordUpdate()

      await choose('What Happened', 'SPA Appointment Set')
      // The appointment day is required.
      const record = screen.getByRole('button', { name: 'Record Update' }) as HTMLButtonElement
      expect(record.disabled).toBe(true)
      await pickDay('Appointment Date', 'Friday, September 25th, 2026')
      fireEvent.click(record)

      await waitFor(() =>
        expect(vi.mocked(postEvent)).toHaveBeenCalledWith({
          bookingId: 'BK-9001',
          track: 'legal',
          kind: 'spa_appointment_set',
          occurredOn: '2026-09-18',
          note: 'Appointment On 2026-09-25',
          reportedBy: 'Nurul Aina'
        })
      )
    })

    it('records Submitted To A Bank as a new application', async () => {
      renderDetail()
      await openRecordUpdate()

      await choose('What Happened', 'Submitted To A Bank')
      fireEvent.change(screen.getByLabelText('Bank'), { target: { value: 'Harbour Bank' } })
      fireEvent.change(screen.getByLabelText('Banker'), { target: { value: 'Lim Wei Jie' } })
      fireEvent.click(screen.getByRole('button', { name: 'Record Update' }))

      await waitFor(() =>
        expect(vi.mocked(postApplication)).toHaveBeenCalledWith({
          bookingId: 'BK-9001',
          bank: 'Harbour Bank',
          banker: 'Lim Wei Jie',
          occurredOn: '2026-09-18',
          reportedBy: 'Nurul Aina'
        })
      )
      expect(vi.mocked(postEvent)).not.toHaveBeenCalled()
    })

    it('asks before recording a cancellation, with Cancel focused', async () => {
      renderDetail()
      await openRecordUpdate()

      await choose('What Happened', 'Cancelled')
      fireEvent.click(screen.getByRole('button', { name: 'Record Update' }))
      let dialog = await screen.findByRole('dialog')
      expect(within(dialog).getByText('Record This Booking As Cancelled?')).toBeTruthy()
      await waitFor(() => expect(document.activeElement).toBe(within(dialog).getByRole('button', { name: 'Cancel' })))

      // Backing out records nothing.
      fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
      await waitFor(() => expect(screen.queryByText('Record This Booking As Cancelled?')).toBeNull())
      // The case panel stays open under it, with the form as it was.
      expect(screen.getByRole('dialog', { name: 'Record An Update' })).toBeTruthy()
      expect(vi.mocked(postEvent)).not.toHaveBeenCalled()

      fireEvent.click(screen.getByRole('button', { name: 'Record Update' }))
      dialog = await screen.findByRole('dialog')
      fireEvent.click(within(dialog).getByRole('button', { name: 'Record Cancellation' }))
      await waitFor(() =>
        expect(vi.mocked(postEvent)).toHaveBeenCalledWith({
          bookingId: 'BK-9001',
          track: 'sales',
          kind: 'cancelled',
          occurredOn: '2026-09-18',
          reportedBy: 'Nurul Aina'
        })
      )
    })

    it('is not offered on a closed case', async () => {
      const snapshot = buildSnapshot()
      const closed = summarizeCases(snapshot, snapshot.meta.referenceDate).find(
        (c) => c.stage === 'cancelled' || c.stage === 'lapsed'
      )
      expect(closed).toBeTruthy()
      renderDetail(closed!.bookingId)

      expect(await screen.findByRole('tab', { name: /^History/ })).toBeTruthy()
      // Messages can still be logged; only updates stop.
      expect(screen.getByRole('button', { name: 'Paste A Message' })).toBeTruthy()
      expect(screen.queryByRole('button', { name: 'Record An Update' })).toBeNull()
    })
  })

  describe('Add Message Sent At', () => {
    it('sends the day and time the message was sent', async () => {
      renderDetail()

      fireEvent.click(await screen.findByRole('button', { name: 'Paste A Message' }))
      fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Payslip sent last night' } })
      await pickDay('Message Sent On', 'Thursday, September 17th, 2026')
      fireEvent.change(screen.getByLabelText('Message Sent Time'), { target: { value: '21:05' } })
      fireEvent.click(screen.getByRole('button', { name: 'Add Message' }))

      await waitFor(() =>
        expect(vi.mocked(postMessage)).toHaveBeenCalledWith({
          bookingId: 'BK-9001',
          senderRole: 'buyer',
          senderName: 'Raymond Tan Wei Hong',
          body: 'Payslip sent last night',
          sentAt: '2026-09-17T21:05:00+08:00'
        })
      )
    })

    it('defaults to now on the desks’ today', async () => {
      renderDetail()

      fireEvent.click(await screen.findByRole('button', { name: 'Paste A Message' }))
      fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Noted, thanks' } })
      expect(screen.getByLabelText('Message Sent On, 18 Sep 2026')).toBeTruthy()
      // Issue #75: the time is when the message was sent, since the proposal is dated from it.
      expect(screen.getByLabelText('Message Sent Time').getAttribute('aria-describedby')).toBe('add-message-sent-hint')
      expect(document.getElementById('add-message-sent-hint')?.textContent).toBe(
        'Use The Original Message Time. If The Event Happened Earlier, Dismiss The Proposal And Use Record An Update.'
      )
      fireEvent.click(screen.getByRole('button', { name: 'Add Message' }))

      await waitFor(() => expect(vi.mocked(postMessage)).toHaveBeenCalledTimes(1))
      expect(vi.mocked(postMessage).mock.calls[0][0].sentAt).toMatch(/^2026-09-18T\d{2}:\d{2}:00\+08:00$/)
    })

    it('will not send a time that is not a time', async () => {
      renderDetail()

      fireEvent.click(await screen.findByRole('button', { name: 'Paste A Message' }))
      fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Noted, thanks' } })
      fireEvent.change(screen.getByLabelText('Message Sent Time'), { target: { value: '25:00' } })
      fireEvent.click(screen.getByRole('button', { name: 'Add Message' }))

      expect(await screen.findByText('Enter The Time As HH:MM, For Example 09:30.')).toBeTruthy()
      expect(vi.mocked(postMessage)).not.toHaveBeenCalled()
    })
  })
})
