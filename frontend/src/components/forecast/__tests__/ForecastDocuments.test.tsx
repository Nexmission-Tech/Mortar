import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ForecastDocuments, type ForecastDocument } from '../ForecastDocuments'

function documentFixture(id: string, title = id): ForecastDocument {
  return {
    id,
    title,
    summary: `${title} summary`,
    motif: '/forecast/test.webp',
    question: `Ask about ${title}`,
    content: <p>{title} details</p>
  }
}

function slide(title: string) {
  return screen.getByRole('article', { name: new RegExp(`: ${title}$`) })
}

function pointer(type: string, pointerId: number, clientX: number, clientY: number) {
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.assign(event, { pointerId, pointerType: 'touch', clientX, clientY })
  return event
}

function mockReducedMotionPreference(initial: boolean) {
  const original = Object.getOwnPropertyDescriptor(window, 'matchMedia')
  let matches = initial
  const listeners = new Set<(event: { matches: boolean }) => void>()
  const mediaQuery = {
    get matches() {
      return matches
    },
    media: '(prefers-reduced-motion: reduce)',
    addEventListener: (_type: string, listener: (event: { matches: boolean }) => void) => listeners.add(listener),
    removeEventListener: (_type: string, listener: (event: { matches: boolean }) => void) => listeners.delete(listener)
  }

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: () => mediaQuery
  })

  return {
    set(value: boolean) {
      matches = value
      for (const listener of listeners) listener({ matches })
    },
    restore() {
      if (original) Object.defineProperty(window, 'matchMedia', original)
      else Reflect.deleteProperty(window, 'matchMedia')
    }
  }
}

let restoreMotionPreference: (() => void) | undefined

afterEach(() => {
  restoreMotionPreference?.()
  restoreMotionPreference = undefined
})

describe('ForecastDocuments', () => {
  it('shows a finding as readable information under the document summary', () => {
    const document = {
      ...documentFixture('waiting', 'Where Bookings Are Waiting'),
      finding: { value: 'RM 1.2m', label: 'Awaiting loan approval', detail: 'Across 8 bookings' }
    }

    render(<ForecastDocuments documents={[document]} />)

    const current = slide('Where Bookings Are Waiting')
    expect(within(current).getByText('Where Bookings Are Waiting summary')).toBeTruthy()
    const finding = within(current).getByText('RM 1.2m')
    expect(finding.className).toContain('text-3xl')
    expect(finding.className).toContain('leading-9')
    expect(finding.className).toContain('tabular-nums')
    expect(within(current).getByText('Awaiting loan approval')).toBeTruthy()
    expect(within(current).getByText('Across 8 bookings')).toBeTruthy()
  })

  it('keeps the selected document by id when the document list is reordered', async () => {
    const first = documentFixture('first', 'First Document')
    const selected = documentFixture('selected', 'Selected Document')
    const last = documentFixture('last', 'Last Document')
    const view = render(<ForecastDocuments documents={[first, selected, last]} />)

    fireEvent.click(screen.getByRole('button', { name: 'Selected Document' }))
    view.rerender(<ForecastDocuments documents={[last, first, selected]} />)

    await waitFor(() =>
      expect(slide('Selected Document').getAttribute('aria-label')).toBe('Document 3 of 3: Selected Document')
    )
  })

  it('uses the first available document when the selected identity is removed', async () => {
    const view = render(
      <ForecastDocuments documents={[documentFixture('first', 'First Document'), documentFixture('selected')]} />
    )

    fireEvent.click(screen.getByRole('button', { name: 'selected' }))
    view.rerender(
      <ForecastDocuments
        documents={[documentFixture('replacement', 'Replacement Document'), documentFixture('last')]}
      />
    )

    await waitFor(() =>
      expect(slide('Replacement Document').getAttribute('aria-label')).toBe('Document 1 of 2: Replacement Document')
    )
  })

  it('keeps only one noninteractive outgoing sheet while rapid navigation selects the latest target', () => {
    render(
      <ForecastDocuments
        documents={[documentFixture('one', 'One'), documentFixture('two', 'Two'), documentFixture('three', 'Three')]}
      />
    )
    const next = screen.getAllByRole('button', { name: 'Next document' })[0]!

    fireEvent.click(next)
    fireEvent.click(next)
    fireEvent.click(next)
    fireEvent.click(next)

    expect(slide('Two').getAttribute('aria-label')).toBe('Document 2 of 3: Two')
    const exitingSlides = document.querySelectorAll('article[aria-hidden="true"][inert]')
    expect(exitingSlides).toHaveLength(1)
    expect(exitingSlides[0]?.className).toContain('pointer-events-none')
    expect(screen.getAllByRole('button', { name: 'Next document' })[0]?.hasAttribute('disabled')).toBe(false)
  })

  it('starts a shuffle with opaque sheets and the outgoing sheet above the selected sheet', () => {
    render(<ForecastDocuments documents={[documentFixture('one', 'One'), documentFixture('two', 'Two')]} />)

    fireEvent.click(screen.getAllByRole('button', { name: 'Next document' })[0]!)

    const outgoing = document.querySelector('article[aria-hidden="true"][inert]') as HTMLElement
    const selected = slide('Two') as HTMLElement
    expect(outgoing.style.opacity).toBe('1')
    expect(selected.style.opacity).toBe('1')
    expect(outgoing.style.zIndex).toBe('20')
    expect(selected.style.zIndex).toBe('10')
  })

  it('changes stacking order when the lift animation completes', async () => {
    render(<ForecastDocuments documents={[documentFixture('one', 'One'), documentFixture('two', 'Two')]} />)

    fireEvent.click(screen.getAllByRole('button', { name: 'Next document' })[0]!)

    const outgoing = document.querySelector('article[aria-hidden="true"][inert]') as HTMLElement
    const selected = slide('Two') as HTMLElement
    await waitFor(() => expect(outgoing.style.zIndex).toBe('5'))
    expect(selected.style.zIndex).toBe('15')
    expect(outgoing.style.opacity).toBe('1')
    expect(selected.style.opacity).toBe('1')
  })

  it('does not let an older phase completion clear the latest navigation', async () => {
    render(
      <ForecastDocuments
        documents={[documentFixture('one', 'One'), documentFixture('two', 'Two'), documentFixture('three', 'Three')]}
      />
    )
    const next = screen.getAllByRole('button', { name: 'Next document' })[0]!

    fireEvent.click(next)
    const firstOutgoing = document.querySelector('article[aria-hidden="true"][inert]') as HTMLElement
    await waitFor(() => expect(firstOutgoing.style.zIndex).toBe('5'))

    fireEvent.click(next)
    expect(slide('Three').getAttribute('aria-label')).toBe('Document 3 of 3: Three')
    const latestOutgoing = document.querySelector('article[aria-hidden="true"][inert]') as HTMLElement
    expect(latestOutgoing).not.toBe(firstOutgoing)
    expect(latestOutgoing.textContent).toContain('Two')

    await waitFor(() => expect(latestOutgoing.style.zIndex).toBe('5'))
    expect(latestOutgoing.isConnected).toBe(true)
  })

  it('uses opacity-only motion in reduced mode and returns to normal motion on the next navigation', async () => {
    const preference = mockReducedMotionPreference(true)
    restoreMotionPreference = preference.restore
    render(
      <ForecastDocuments
        documents={[documentFixture('one', 'One'), documentFixture('two', 'Two'), documentFixture('three', 'Three')]}
      />
    )
    const next = screen.getAllByRole('button', { name: 'Next document' })[0]!

    fireEvent.click(next)
    const outgoing = document.querySelector('article[aria-hidden="true"][inert]') as HTMLElement
    expect((slide('Two') as HTMLElement).style.transform).toBe('none')
    await waitFor(() => expect(outgoing.isConnected).toBe(false))

    await act(async () => preference.set(false))
    fireEvent.click(next)
    const nextOutgoing = document.querySelector('article[aria-hidden="true"][inert]') as HTMLElement
    await waitFor(() => expect(nextOutgoing.style.transform).not.toBe('none'))
  })

  it('resets both sheets when reduced motion turns on during a shuffle', async () => {
    const preference = mockReducedMotionPreference(false)
    restoreMotionPreference = preference.restore
    render(<ForecastDocuments documents={[documentFixture('one', 'One'), documentFixture('two', 'Two')]} />)

    fireEvent.click(screen.getAllByRole('button', { name: 'Next document' })[0]!)
    const outgoing = document.querySelector('article[aria-hidden="true"][inert]') as HTMLElement
    const selected = slide('Two') as HTMLElement
    await waitFor(() => expect(outgoing.style.transform).not.toBe('none'))

    await act(async () => preference.set(true))

    await waitFor(() => expect(outgoing.style.transform).toBe('none'))
    expect(selected.style.transform).toBe('none')
    await waitFor(() => expect(outgoing.isConnected).toBe(false))
  })

  it('jumps directly to a chip selection without rendering intermediate documents', () => {
    render(
      <ForecastDocuments
        documents={[documentFixture('one', 'One'), documentFixture('two', 'Two'), documentFixture('three', 'Three')]}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Three' }))

    expect(slide('Three').getAttribute('aria-label')).toBe('Document 3 of 3: Three')
    expect(screen.getByText('Document 1 Of 3')).toBeTruthy()
    expect(screen.queryByText('Document 2 Of 3')).toBeNull()
  })

  it('wraps navigation and ignores modified arrows and arrows from a card action', () => {
    render(<ForecastDocuments documents={[documentFixture('one', 'One'), documentFixture('two', 'Two')]} />)
    const stack = screen.getByRole('group', { name: 'Forecast documents' })

    fireEvent.keyDown(stack, { key: 'ArrowLeft' })
    expect(slide('Two').getAttribute('aria-label')).toBe('Document 2 of 2: Two')
    fireEvent.keyDown(stack, { key: 'ArrowRight', ctrlKey: true })
    fireEvent.keyDown(screen.getByRole('button', { name: 'Open Document' }), { key: 'ArrowRight' })
    expect(slide('Two').getAttribute('aria-label')).toBe('Document 2 of 2: Two')

    fireEvent.keyDown(stack, { key: 'ArrowRight' })
    expect(slide('One').getAttribute('aria-label')).toBe('Document 1 of 2: One')
  })

  it('selects only horizontal swipes from the active pointer and cancels vertical or cancelled gestures', () => {
    render(
      <ForecastDocuments
        documents={[documentFixture('one', 'One'), documentFixture('two', 'Two'), documentFixture('three', 'Three')]}
      />
    )
    const stack = screen.getByRole('group', { name: 'Forecast documents' })

    fireEvent(stack, pointer('pointerdown', 7, 200, 100))
    fireEvent(stack, pointer('pointerup', 8, 80, 104))
    expect(slide('One').getAttribute('aria-label')).toBe('Document 1 of 3: One')
    fireEvent(stack, pointer('pointercancel', 8, 80, 104))
    fireEvent(stack, pointer('pointercancel', 7, 80, 104))
    expect(slide('One').getAttribute('aria-label')).toBe('Document 1 of 3: One')

    fireEvent(stack, pointer('pointerdown', 7, 200, 100))
    fireEvent(stack, pointer('pointercancel', 7, 90, 100))
    expect(slide('One').getAttribute('aria-label')).toBe('Document 1 of 3: One')

    fireEvent(stack, pointer('pointerdown', 7, 200, 100))
    fireEvent(stack, pointer('pointerup', 7, 190, 180))
    expect(slide('One').getAttribute('aria-label')).toBe('Document 1 of 3: One')

    fireEvent(stack, pointer('pointerdown', 7, 200, 100))
    fireEvent(stack, pointer('pointerup', 7, 110, 108))
    expect(slide('Two').getAttribute('aria-label')).toBe('Document 2 of 3: Two')
  })

  it('does not open a card action when a horizontal swipe ends on it', () => {
    render(<ForecastDocuments documents={[documentFixture('one', 'One'), documentFixture('two', 'Two')]} />)
    const stack = screen.getByRole('group', { name: 'Forecast documents' })
    const openButton = screen.getByRole('button', { name: 'Open Document' })

    fireEvent(openButton, pointer('pointerdown', 3, 180, 120))
    fireEvent(openButton, pointer('pointerup', 3, 100, 122))
    fireEvent.click(screen.getByRole('button', { name: 'Open Document' }), { detail: 1 })

    expect(slide('Two').getAttribute('aria-label')).toBe('Document 2 of 2: Two')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(stack).toBeTruthy()
  })

  it('does not show navigation arrows for a single document and renders nothing for an empty list', () => {
    const single = render(<ForecastDocuments documents={[documentFixture('only', 'Only Document')]} />)
    expect(slide('Only Document')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Previous document' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Next document' })).toBeNull()

    single.rerender(<ForecastDocuments documents={[]} />)
    expect(screen.queryByRole('group', { name: 'Forecast documents' })).toBeNull()
  })

  it('opens the selected document, sends its question, and restores focus after Escape', async () => {
    const asked: string[] = []
    const listen = (event: Event) => asked.push((event as CustomEvent<{ question: string }>).detail.question)
    window.addEventListener('mortar:ask', listen)
    render(<ForecastDocuments documents={[documentFixture('one', 'One'), documentFixture('two', 'Two')]} />)

    fireEvent.click(screen.getByRole('button', { name: 'Two' }))
    fireEvent.click(screen.getByRole('button', { name: 'Ask Mortar AI' }))
    expect(asked).toEqual(['Ask about Two'])
    const openButton = screen.getByRole('button', { name: 'Open Document' })
    openButton.focus()
    fireEvent.click(openButton)
    expect(within(screen.getByRole('dialog')).getByText('Two details')).toBeTruthy()
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(document.activeElement).toBe(openButton)
    window.removeEventListener('mortar:ask', listen)
  })
})
