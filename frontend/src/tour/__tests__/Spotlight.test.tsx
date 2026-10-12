import { act, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Spotlight } from '@/tour/Spotlight'

vi.stubGlobal(
  'ResizeObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
)

describe('Spotlight', () => {
  it('opens the tab that holds a step’s target before spotlighting it', async () => {
    render(
      <>
        <Tabs defaultValue="tasks">
          <TabsList>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="tasks">Your Tasks</TabsTrigger>
          </TabsList>
          <TabsContent value="actions" forceMount className="data-[state=inactive]:hidden">
            <div data-tour="today-card">First Row</div>
          </TabsContent>
          <TabsContent value="tasks" forceMount className="data-[state=inactive]:hidden">
            Tasks
          </TabsContent>
        </Tabs>
        <Spotlight
          step={{ label: 'The Next Move', route: '/chase', target: '[data-tour="today-card"]', caption: 'Caption' }}
          onBack={() => {}}
          onNext={() => {}}
          canBack={false}
          last={false}
        />
      </>
    )
    await act(async () => {
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)))
    })
    expect(screen.getByRole('tab', { name: 'Actions' }).getAttribute('data-state')).toBe('active')
  })
})
