import { describe, expect, test } from 'vitest'
import { sceneColors } from '../sceneColors'

describe('sceneColors', () => {
  const vars: Record<string, string> = {
    '--status-info': 'rgb(1, 1, 1)',
    '--status-positive': 'rgb(2, 2, 2)',
    '--status-warning': 'rgb(3, 3, 3)',
    '--status-danger': 'rgb(4, 4, 4)',
    '--status-signed': 'rgb(5, 5, 5)',
    '--input': 'rgb(6, 6, 6)',
    '--card': 'rgb(10, 10, 10)',
    '--muted': 'rgb(7, 7, 7)',
    '--foreground': 'rgb(8, 8, 8)',
    '--muted-foreground': 'rgb(9, 9, 9)'
  }

  test('maps each state to its status token', () => {
    const colors = sceneColors((name) => vars[name] ?? '')
    expect(colors).toMatchObject({
      booked: 'rgb(1, 1, 1)',
      loan_approved: 'rgb(2, 2, 2)',
      needs_action: 'rgb(3, 3, 3)',
      release_review: 'rgb(4, 4, 4)',
      signed: 'rgb(5, 5, 5)',
      available: 'rgb(6, 6, 6)',
      ghost: 'rgb(7, 7, 7)',
      podium: 'rgb(7, 7, 7)',
      selected: 'rgb(8, 8, 8)',
      selectedInner: 'rgb(10, 10, 10)',
      hovered: 'rgb(9, 9, 9)'
    })
  })

  test('falls back to a neutral when a token is empty', () => {
    const colors = sceneColors(() => '  ')
    expect(colors.booked).toBe('gray')
    expect(colors.selected).toBe('gray')
  })
})
