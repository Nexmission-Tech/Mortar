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
    '--muted-foreground': 'rgb(9, 9, 9)',
    '--model-glass': 'rgb(11, 11, 11)',
    '--model-structure': 'rgb(12, 12, 12)',
    '--model-podium': 'rgb(13, 13, 13)',
    '--model-sky': 'rgb(14, 14, 14)',
    '--model-sky-ground': 'rgb(15, 15, 15)',
    '--model-plinth': 'rgb(20, 20, 20)',
    '--model-ground': 'rgb(21, 21, 21)',
    '--model-paving': 'rgb(22, 22, 22)',
    '--model-stone': 'rgb(23, 23, 23)',
    '--model-road': 'rgb(24, 24, 24)',
    '--model-lane': 'rgb(25, 25, 25)',
    '--model-lawn': 'rgb(26, 26, 26)',
    '--model-water': 'rgb(27, 27, 27)',
    '--model-foliage': 'rgb(28, 28, 28)',
    '--model-track': 'rgb(29, 29, 29)',
    '--model-neighbour': 'rgb(30, 30, 30)',
    '--model-band': 'rgb(31, 31, 31)',
    '--model-trunk': 'rgb(32, 32, 32)'
  }

  test('maps each state to its status token', () => {
    const colors = sceneColors((name) => vars[name] ?? '')
    expect(colors).toMatchObject({
      booked: 'rgb(1, 1, 1)',
      loan_approved: 'rgb(2, 2, 2)',
      needs_action: 'rgb(3, 3, 3)',
      release_review: 'rgb(4, 4, 4)',
      signed: 'rgb(5, 5, 5)',
      available: 'rgb(11, 11, 11)',
      ghost: 'rgb(7, 7, 7)',
      podium: 'rgb(13, 13, 13)',
      structure: 'rgb(12, 12, 12)',
      sky: 'rgb(14, 14, 14)',
      skyGround: 'rgb(15, 15, 15)',
      plinth: 'rgb(20, 20, 20)',
      ground: 'rgb(21, 21, 21)',
      paving: 'rgb(22, 22, 22)',
      stone: 'rgb(23, 23, 23)',
      road: 'rgb(24, 24, 24)',
      lane: 'rgb(25, 25, 25)',
      lawn: 'rgb(26, 26, 26)',
      water: 'rgb(27, 27, 27)',
      foliage: 'rgb(28, 28, 28)',
      track: 'rgb(29, 29, 29)',
      neighbour: 'rgb(30, 30, 30)',
      band: 'rgb(31, 31, 31)',
      trunk: 'rgb(32, 32, 32)',
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
