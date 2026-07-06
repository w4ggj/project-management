'use client'

import { useEffect } from 'react'
import { requestNotificationPermission, scheduleDeadlineReminders } from '@/lib/notifications'
import { Project } from '@/types'

export default function NotificationInit() {
  useEffect(() => {
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
