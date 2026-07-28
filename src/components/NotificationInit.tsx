'use client'

import { useEffect } from 'react'
import { requestNotificationPermission, scheduleDeadlineReminders } from '@/lib/notifications'
import { Project } from '@/types'

export default function NotificationInit() {
  useEffect(() => {
    // Register the PWA service worker so the app is installable on mobile.
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {})
    }

    const init = async () => {
      await requestNotificationPermission()
      const res = await fetch('/api/projects')
      const projects: Project[] = await res.json()
      scheduleDeadlineReminders(projects)
    }
    init()
  }, [])

  return null
}
