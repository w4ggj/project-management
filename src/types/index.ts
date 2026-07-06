export type Status = 'active' | 'paused' | 'done'

export interface Project {
  id: string
  name: string
  description: string | null
  status: Status
  left_off: string | null
  deadline: string | null
  repo_url: string | null
  live_url: string | null
  tags: string[]
  created_at: string
  updated_at: string
  todos?: Todo[]
  services?: Service[]
  paths?: Path[]
  notes?: Note[]
  time_entries?: TimeEntry[]
}

export interface Todo {
  id: string
  project_id: string
  text: string
  done: boolean
  position: number
  due_date: string | null
  created_at: string
}

export interface Note {
  id: string
  project_id: string
  body: string
  created_at: string
}

export interface Service {
  id: string
  project_id: string
  name: string
  url: string | null
  notes: string | null
  position: number
  created_at: string
}

export interface Path {
  id: string
  project_id: string
  path: string
  description: string | null
  position: number
  created_at: string
}

// Used by dashboard components that only need done status for progress bars
export type ProjectSummary = Omit<Project, 'todos' | 'services' | 'paths' | 'notes' | 'time_entries'> & {
  todos?: { done: boolean }[]
}

export interface TimeEntry {
  id: string
  project_id: string
  minutes: number
  description: string | null
  created_at: string
}

export interface Template {
  id: string
  name: string
  created_at: string
  template_todos?: TemplateTodo[]
}

export interface TemplateTodo {
  id: string
  template_id: string
  text: string
  position: number
}
