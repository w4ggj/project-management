'use client'

import { Project } from '@/types'
import { daysUntil } from './utils'

export async function requestNotificationPermission() {
  if (typeof window === 'undefined') return
  if (!('Notification' in window)) return
  if (Notification.permission === 'default') {
    await Notification.requestPermission()
  }
}

export function scheduleDeadlineReminders(projects: Project[]) {
  if (typeof window === 'undefined') return
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  for (const project of projects) {
    if (!project.deadline || project.status === 'done') continue
    const days = daysUntil(project.deadline)
    if (days === null) continue

    if (days === 0) {
      new Notification(`Due today: ${project.name}`, {
        body: 'This project is due today.',
        icon: '/favicon.ico',
      })
    } else if (days === 1) {
      new Notification(`Due tomorrow: ${project.name}`, {
        body: 'This project is due tomorrow.',
        icon: '/favicon.ico',
      })
    } else if (days > 0 && days <= 7) {
      // Schedule a notification at 9am today if within the week
      const now = new Date()
      const nineAm = new Date()
      nineAm.setHours(9, 0, 0, 0)
      const msUntil9am = nineAm.getTime() - now.getTime()
      if (msUntil9am > 0) {
        setTimeout(() => {
          new Notification(`Upcoming deadline: ${project.name}`, {
            body: `Due in ${days} day${days === 1 ? '' : 's'}.`,
            icon: '/favicon.ico',
          })
        }, msUntil9am)
      }
    }
  }
}
