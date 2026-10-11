import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'

describe('modal scrims', () => {
  it('dims and blurs the page behind dialogs with the shared scrim tokens', () => {
    render(
      <Dialog open>
        <DialogOverlay data-testid="dialog-overlay" />
        <DialogContent>Dialog content</DialogContent>
      </Dialog>
    )

    const overlay = screen.getByTestId('dialog-overlay')
    expect(overlay.className).toContain('bg-[var(--scrim)]')
    expect(overlay.className).toContain('backdrop-blur-[var(--scrim-blur)]')
  })

  it('dims and blurs the page behind sheets with the shared scrim tokens', () => {
    render(
      <Sheet open>
        <SheetContent>Sheet content</SheetContent>
      </Sheet>
    )

    const overlay = document.querySelector('[data-state="open"]')
    expect(overlay?.className).toContain('bg-[var(--scrim)]')
    expect(overlay?.className).toContain('backdrop-blur-[var(--scrim-blur)]')
  })
  it('floats a sheet above the bottom edge, centred and capped in width', () => {
    render(
      <Sheet open>
        <SheetContent side="floating" aria-describedby={undefined}>
          <SheetTitle>Floating</SheetTitle>
        </SheetContent>
      </Sheet>
    )
    const panel = screen.getByRole('dialog')
    expect(panel.getAttribute('data-side')).toBe('floating')
    for (const token of ['inset-x-4', 'bottom-4', 'mx-auto', 'max-w-[720px]', 'max-h-[85vh]', 'rounded-md'])
      expect(panel.className).toContain(token)
    // It slides only where motion is welcome; under reduced motion it just fades.
    expect(panel.className).toContain('motion-safe:data-[state=open]:slide-in-from-bottom')
    expect(panel.className).not.toMatch(/(^|\s)data-\[state=open\]:slide-in-from-bottom/)
  })
})
