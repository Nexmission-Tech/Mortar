/** Shared project settings and inventory helpers used by Add Bookings and Settings. */
import { useCallback, useEffect, useState } from 'react'
import {
  DEFAULT_PROJECT_SETTINGS,
  DEFAULT_UNIT_MODELS,
  MAX_PROJECT_UNITS,
  PANEL_LAW_FIRMS,
  normalizeProjectSettings,
  parseUnitCode,
  projectBlocks,
  projectUnits,
  unitCode,
  unitKey
} from '@mortar/core'
import type { ProjectSettings } from '@mortar/core'
import { fetchProjectSettings, saveProjectSettings } from '@/lib/api'

export { MAX_PROJECT_UNITS }

export function projectInventorySize(settings: ProjectSettings): number {
  const blockCount = settings.blocks?.length || 1
  return blockCount * (settings.maxFloor - settings.minFloor + 1) * settings.unitsPerFloor
}

export { DEFAULT_PROJECT_SETTINGS, DEFAULT_UNIT_MODELS, PANEL_LAW_FIRMS, normalizeProjectSettings }
export type { ProjectSettings, UnitModel } from '@mortar/core'

/** Every unit code in the layout, in the project's numbering. */
export function generateProjectInventoryUnits(settings: ProjectSettings): string[] {
  return projectUnits(settings).map((unit) => unit.code)
}

export function getAvailableInventoryUnits(
  settings: ProjectSettings,
  held: Map<string, string>,
  excludeUnits: string[] = []
) {
  const excluded = new Set(excludeUnits.map((unit) => unit.trim().toUpperCase()))
  return generateProjectInventoryUnits(settings).filter(
    (unit) => !excluded.has(unit.toUpperCase()) && !held.has(unitKey(settings.projectName, unit))
  )
}

export function formatUnitRangeDescription(settings: ProjectSettings): string {
  const blocks = projectBlocks(settings)
  const numbering = settings.numbering ?? 'plain'
  const first = unitCode(blocks[0] ?? '', settings.minFloor, 1, numbering)
  const last = unitCode(blocks[blocks.length - 1] ?? '', settings.maxFloor, settings.unitsPerFloor, numbering)
  return `${first} to ${last} (${projectInventorySize(settings).toLocaleString()} units)`
}

export function isUnitInRange(unit: string, settings: ProjectSettings): { inRange: boolean; reason?: string } {
  const normalized = unit.trim().toUpperCase()
  if (!normalized) return { inRange: false, reason: 'Choose A Unit' }
  const blocks = projectBlocks(settings)
  const position = parseUnitCode(normalized)
  if (!position) return { inRange: false, reason: 'Enter A Unit Number In The Configured Format' }
  const block = blocks.find((candidate) => candidate.toUpperCase() === position.block)
  if (block === undefined) return { inRange: false, reason: `Choose A Unit In ${blocks.join(', ')}` }
  if (normalized !== unitCode(block, position.floor, position.unit, settings.numbering ?? 'plain').toUpperCase())
    return { inRange: false, reason: 'Choose A Unit In The Configured Format' }
  if (position.floor < settings.minFloor || position.floor > settings.maxFloor)
    return { inRange: false, reason: `Floor ${position.floor} Is Outside The Configured Range` }
  if (position.unit < 1 || position.unit > settings.unitsPerFloor)
    return { inRange: false, reason: `Unit ${position.unit} Is Outside The Configured Range` }
  return { inRange: true }
}

export function useProjectSettings() {
  const [settings, setSettingsState] = useState<ProjectSettings>(DEFAULT_PROJECT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const readSettings = useCallback(async () => {
    const result = await fetchProjectSettings()
    const normalized = normalizeProjectSettings(result.settings)
    if (!normalized) throw new Error('Project Settings Could Not Be Read.')
    if (projectInventorySize(normalized) > MAX_PROJECT_UNITS) {
      throw new Error(`Project Inventory Cannot Exceed ${MAX_PROJECT_UNITS.toLocaleString()} Units.`)
    }
    return normalized
  }, [])

  const refreshSettings = useCallback(async () => {
    setLoading(true)
    try {
      setSettingsState(await readSettings())
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Project Settings Could Not Be Loaded.')
    } finally {
      setLoading(false)
    }
  }, [readSettings])

  useEffect(() => {
    let active = true
    void readSettings()
      .then((next) => {
        if (active) {
          setSettingsState(next)
          setError(null)
        }
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Project Settings Could Not Be Loaded.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [readSettings])

  const updateSettings = useCallback(async (next: ProjectSettings) => {
    setError(null)
    try {
      if (projectInventorySize(next) > MAX_PROJECT_UNITS) {
        throw new Error(`Project Inventory Cannot Exceed ${MAX_PROJECT_UNITS.toLocaleString()} Units.`)
      }
      const result = await saveProjectSettings(next)
      const normalized = normalizeProjectSettings(result.settings)
      if (!normalized) throw new Error('Project Settings Could Not Be Saved.')
      setSettingsState(normalized)
      return normalized
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Project Settings Could Not Be Saved.'
      setError(message)
      throw cause
    }
  }, [])

  return { settings, loading, error, refreshSettings, updateSettings }
}
