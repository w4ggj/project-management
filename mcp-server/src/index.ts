import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

const BASE_URL = process.env.APP_URL?.replace(/\/$/, '') ?? 'https://pm.tavaone.com'
const API_KEY = process.env.CRUD_API_KEY ?? ''

if (!API_KEY) {
  process.exit(1)
}

// Strip all non-printable-ASCII from stdout before Claude Desktop receives it
const _write = process.stdout.write.bind(process.stdout)
process.stdout.write = (chunk: any, ...args: any[]) => {
  if (typeof chunk === 'string') {
    chunk = chunk.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '')
  } else if (Buffer.isBuffer(chunk)) {
    chunk = Buffer.from(chunk.toString('utf8').replace(/[^\x09\x0A\x0D\x20-\x7E]/g, ''), 'utf8')
  }
  return (_write as any)(chunk, ...args)
}

async function api(method: string, path: string, body?: unknown) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  if (!res.ok) return { error: `${res.status}: ${text}` }
  try { return JSON.parse(text) } catch { return text }
}

function sanitize(s: string): string {
  return s.replace(/[^\x20-\x7E\n\r\t]/g, '')
}

function ok(data: unknown) {
  return { content: [{ type: 'text' as const, text: sanitize(JSON.stringify(data, null, 2)) }] }
}

function err(msg: string) {
  return { content: [{ type: 'text' as const, text: `Error: ${sanitize(msg)}` }] }
}

const server = new McpServer({ name: 'pm-supabase', version: '1.0.0' })

server.tool('list_projects', 'List all projects with status, deadline, and todo counts', {}, async () => {
  const data = await api('GET', '/api/projects')
  if (data?.error) return err(data.error)
  return ok(data)
})

server.tool('get_project', 'Get full details for a project including todos, notes, services, and paths', {
  id: z.string().describe('Project ID'),
}, async ({ id }) => {
  const data = await api('GET', `/api/projects/${id}`)
  if (data?.error) return err(data.error)
  return ok(data)
})

server.tool('create_project', 'Create a new project', {
  name: z.string().describe('Project name'),
  description: z.string().optional().describe('Project description'),
  status: z.enum(['active', 'paused', 'done']).default('active').describe('Project status'),
  deadline: z.string().optional().describe('Deadline date YYYY-MM-DD'),
  tags: z.array(z.string()).optional().describe('Tech/category tags'),
  repo_url: z.string().optional().describe('Repository URL'),
  live_url: z.string().optional().describe('Live site URL'),
  left_off: z.string().optional().describe('Where I left off'),
}, async (args) => {
  const data = await api('POST', '/api/projects', args)
  if (data?.error) return err(data.error)
  return ok(data)
})

server.tool('update_project', "Update a project's fields", {
  id: z.string().describe('Project ID'),
  name: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'paused', 'done']).optional(),
  deadline: z.string().optional().describe('YYYY-MM-DD or empty string to clear'),
  tags: z.array(z.string()).optional(),
  repo_url: z.string().optional().describe('Empty string to clear'),
  live_url: z.string().optional().describe('Empty string to clear'),
  left_off: z.string().optional(),
}, async ({ id, ...fields }) => {
  const updates: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(fields)) {
    if (val !== undefined) updates[key] = val === '' ? null : val
  }
  const data = await api('PATCH', `/api/projects/${id}`, updates)
  if (data?.error) return err(data.error)
  return ok(data)
})

server.tool('add_todo', 'Add a todo to a project', {
  project_id: z.string().describe('Project ID'),
  text: z.string().describe('Todo text'),
  due_date: z.string().optional().describe('Due date YYYY-MM-DD'),
}, async (args) => {
  const data = await api('POST', '/api/todos', args)
  if (data?.error) return err(data.error)
  return ok(data)
})

server.tool('update_todo', 'Update a todo (mark done, change text or due date)', {
  id: z.string().describe('Todo ID'),
  done: z.boolean().optional(),
  text: z.string().optional(),
  due_date: z.string().optional().describe('YYYY-MM-DD or empty string to clear'),
}, async ({ id, ...fields }) => {
  const updates: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(fields)) {
    if (val !== undefined) updates[key] = val === '' ? null : val
  }
  const data = await api('PATCH', `/api/todos/${id}`, updates)
  if (data?.error) return err(data.error)
  return ok(data)
})

server.tool('add_note', 'Add a timestamped note to a project', {
  project_id: z.string().describe('Project ID'),
  body: z.string().describe('Note content'),
}, async (args) => {
  const data = await api('POST', '/api/notes', args)
  if (data?.error) return err(data.error)
  return ok(data)
})

server.tool('update_left_off', 'Update the "where I left off" field for a project', {
  id: z.string().describe('Project ID'),
  left_off: z.string().describe('Where you left off'),
}, async ({ id, left_off }) => {
  const data = await api('PATCH', `/api/projects/${id}`, { left_off })
  if (data?.error) return err(data.error)
  return ok(data)
})

server.tool('add_path', 'Add a file/directory path to a project', {
  project_id: z.string().describe('Project ID'),
  path: z.string().describe('File or directory path'),
  description: z.string().optional().describe('What this path is for'),
}, async (args) => {
  const data = await api('POST', '/api/paths', args)
  if (data?.error) return err(data.error)
  return ok(data)
})

server.tool('add_service', 'Add a service/URL to a project', {
  project_id: z.string().describe('Project ID'),
  name: z.string().describe('Service name (e.g. "Supabase", "Render dashboard")'),
  url: z.string().optional().describe('Service URL'),
  notes: z.string().optional().describe('Any notes about this service'),
}, async (args) => {
  const data = await api('POST', '/api/services', args)
  if (data?.error) return err(data.error)
  return ok(data)
})

server.tool('delete_todo', 'Delete a todo by ID', {
  id: z.string().describe('Todo ID'),
}, async ({ id }) => {
  const data = await api('DELETE', `/api/todos/${id}`)
  if (data?.error) return err(data.error)
  return ok(data)
})

server.tool('weekly_summary', 'Get a summary of overdue todos, todos due within 7 days, and projects with deadlines within 14 days', {}, async () => {
  const [projects, todos] = await Promise.all([
    api('GET', '/api/projects'),
    api('GET', '/api/todos'),
  ])
  if (projects?.error) return err(projects.error)
  if (todos?.error) return err(todos.error)

  const today = new Date().toISOString().slice(0, 10)
  const in7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const in14 = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const todoList: any[] = Array.isArray(todos) ? todos : (todos?.todos ?? [])
  const projectList: any[] = Array.isArray(projects) ? projects : (projects?.projects ?? [])

  const overdue = todoList.filter(t => !t.done && t.due_date && t.due_date < today)
  const dueSoon = todoList.filter(t => !t.done && t.due_date && t.due_date >= today && t.due_date <= in7)
  const projectsDueSoon = projectList.filter(p => p.deadline && p.deadline >= today && p.deadline <= in14)

  const lines: string[] = []

  lines.push('=== WEEKLY SUMMARY ===')
  lines.push(`(as of ${today})`)
  lines.push('')

  lines.push(`OVERDUE TODOS (${overdue.length})`)
  if (overdue.length === 0) {
    lines.push('  None')
  } else {
    for (const t of overdue) {
      lines.push(`  - [${t.due_date}] ${t.text} (id: ${t.id})`)
    }
  }
  lines.push('')

  lines.push(`TODOS DUE WITHIN 7 DAYS (${dueSoon.length})`)
  if (dueSoon.length === 0) {
    lines.push('  None')
  } else {
    for (const t of dueSoon) {
      lines.push(`  - [${t.due_date}] ${t.text} (id: ${t.id})`)
    }
  }
  lines.push('')

  lines.push(`PROJECTS WITH DEADLINES WITHIN 14 DAYS (${projectsDueSoon.length})`)
  if (projectsDueSoon.length === 0) {
    lines.push('  None')
  } else {
    for (const p of projectsDueSoon) {
      lines.push(`  - [${p.deadline}] ${p.name} — ${p.status} (id: ${p.id})`)
    }
  }

  return { content: [{ type: 'text' as const, text: sanitize(lines.join('\n')) }] }
})

const transport = new StdioServerTransport()
await server.connect(transport)
