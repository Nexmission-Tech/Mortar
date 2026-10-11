/**
 * Main authenticated application shell.
 * Wraps dashboard and project routes with sidebar navigation and top nav.
 * The app pages carry no site footer; that belongs to the public pages only.
 */

import { useEffect, useState, type ReactNode } from 'react'
import { matchPath, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useSnapshot } from '@/lib/data'
import { usePersona } from '@/lib/persona'
import { notificationStore } from '@/lib/notificationStore'
import { AppNav } from './AppNav'
import { AppSidebar } from './AppSidebar'
import { TourProvider } from '@/tour/TourProvider'
import { TourButton } from '@/tour/TourButton'

type AppLayoutProps = {
  children: ReactNode
  /** Pass minimal to AppNav for full-screen pages */
  minimalNav?: boolean
}

/**
 * Renders the shared app frame around route content.
 * Expects children for the active page and an optional minimal nav mode for focused screens.
 */
export function AppLayout({ children, minimalNav }: AppLayoutProps) {
  const { snapshot, refresh } = useSnapshot()
  const { profile, persona } = usePersona()
  const solidGround = matchPath('/bookings/:id', useLocation().pathname) !== null
  useEffect(() => {
    for (const task of snapshot?.tasks ?? []) {
      const relevant =
        persona === 'sales-admin'
          ? task.ownerName === profile?.name && (task.ownerRole === 'sales_admin' || task.ownerRole === 'sales')
          : persona === 'loan-admin'
            ? task.ownerRole === 'loan_admin' && task.ownerName === profile.name
            : persona === 'legal-admin'
              ? task.ownerRole === 'legal' && task.ownerName === profile.name
              : false
      if (relevant && task.status === 'open' && task.managerFlaggedBy) notificationStore.managerTask(task)
    }
  }, [snapshot, persona, profile?.name])
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') void refresh()
    }, 30000)
    return () => clearInterval(timer)
  }, [refresh])
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="relative flex min-h-dvh flex-col">
      <AppSidebar mobileOpen={mobileSidebarOpen} onMobileClose={() => setMobileSidebarOpen(false)} />
      <AppNav minimal={minimalNav} onMenuClick={() => setMobileSidebarOpen(true)} />
      <TourProvider>
        {/* The full case page reads on a solid ground: its journey drawing needs no texture behind it. */}
        <main className={cn('app-canvas flex-1 pt-14 lg:ml-16', solidGround && 'app-canvas-solid')}>{children}</main>
        <TourButton />
      </TourProvider>
    </div>
  )
}
