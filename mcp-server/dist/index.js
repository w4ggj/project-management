import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
    process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);
function toText(data) {
    return JSON.stringify(data, null, 2)
        .replace(/[^\x00-\x7F]/g, c => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`);
}
function ok(data) {
    return { content: [{ type: 'text', text: toText(data) }] };
}
function err(msg) {
    return { content: [{ type: 'text', text: `Error: ${msg}` }] };
}
const server = new McpServer({
    name: 'project-management',
    version: '1.0.0',
});
server.tool('list_projects', 'List all projects with their status, deadline, and todo counts', {}, async () => {
    const { data, error } = await supabase
        .from('projects')
        .select('*, todos(done)')
        .order('created_at', { ascending: false });
    if (error)
        return err(error.message);
    const projects = data.map(p => {
        const todos = p.todos ?? [];
        const done = todos.filter((t) => t.done).length;
        return {
            id: p.id,
            name: p.name,
            status: p.status,
            description: p.description,
            deadline: p.deadline,
            tags: p.tags,
            repo_url: p.repo_url,
            live_url: p.live_url,
            left_off: p.left_off,
            todos: `${done}/${todos.length} done`,
            updated_at: p.updated_at,
        };
    });
    return ok(projects);
});
server.tool('get_project', 'Get full details for a specific project including todos, notes, services, and paths', { id: z.string().describe('Project ID') }, async ({ id }) => {
    const [projectRes, todosRes, notesRes, servicesRes, pathsRes] = await Promise.all([
        supabase.from('projects').select('*').eq('id', id).single(),
        supabase.from('todos').select('*').eq('project_id', id).order('position'),
        supabase.from('notes').select('*').eq('project_id', id).order('created_at', { ascending: false }),
        supabase.from('services').select('*').eq('project_id', id).order('position'),
        supabase.from('paths').select('*').eq('project_id', id).order('position'),
    ]);
    if (projectRes.error)
        return err(projectRes.error.message);
    return ok({
        ...projectRes.data,
        todos: todosRes.data ?? [],
        notes: notesRes.data ?? [],
        services: servicesRes.data ?? [],
        paths: pathsRes.data ?? [],
    });
});
server.tool('create_project', 'Create a new project', {
    name: z.string().describe('Project name'),
    description: z.string().optional().describe('Project description'),
    status: z.enum(['active', 'paused', 'done']).default('active').describe('Project status'),
    deadline: z.string().optional().describe('Deadline date in YYYY-MM-DD format'),
    tags: z.array(z.string()).optional().describe('Array of technology/category tags'),
    repo_url: z.string().optional().describe('Repository URL'),
    live_url: z.string().optional().describe('Live site URL'),
    left_off: z.string().optional().describe('Where I left off note'),
}, async (args) => {
    const { data, error } = await supabase
        .from('projects')
        .insert({
        name: args.name,
        description: args.description ?? null,
        status: args.status ?? 'active',
        deadline: args.deadline ?? null,
        tags: args.tags ?? [],
        repo_url: args.repo_url ?? null,
        live_url: args.live_url ?? null,
        left_off: args.left_off ?? null,
    })
        .select()
        .single();
    if (error)
        return err(error.message);
    return ok(data);
});
server.tool('update_project', 'Update an existing project\'s fields', {
    id: z.string().describe('Project ID'),
    name: z.string().optional().describe('Project name'),
    description: z.string().optional().describe('Project description'),
    status: z.enum(['active', 'paused', 'done']).optional().describe('Project status'),
    deadline: z.string().optional().describe('Deadline date in YYYY-MM-DD format, or empty string to clear'),
    tags: z.array(z.string()).optional().describe('Array of technology/category tags'),
    repo_url: z.string().optional().describe('Repository URL, or empty string to clear'),
    live_url: z.string().optional().describe('Live site URL, or empty string to clear'),
    left_off: z.string().optional().describe('Where I left off note'),
}, async ({ id, ...fields }) => {
    const updates = {};
    for (const [key, val] of Object.entries(fields)) {
        if (val !== undefined) {
            updates[key] = val === '' ? null : val;
        }
    }
    const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error)
        return err(error.message);
    return ok(data);
});
server.tool('add_todo', 'Add a todo item to a project', {
    project_id: z.string().describe('Project ID'),
    text: z.string().describe('Todo text'),
    due_date: z.string().optional().describe('Due date in YYYY-MM-DD format'),
}, async ({ project_id, text, due_date }) => {
    const { data: existing } = await supabase
        .from('todos')
        .select('position')
        .eq('project_id', project_id)
        .order('position', { ascending: false })
        .limit(1);
    const position = existing && existing.length > 0 ? (existing[0].position ?? 0) + 1 : 0;
    const { data, error } = await supabase
        .from('todos')
        .insert({ project_id, text, due_date: due_date ?? null, done: false, position })
        .select()
        .single();
    if (error)
        return err(error.message);
    return ok(data);
});
server.tool('update_todo', 'Update a todo item (mark done, change text, change due date)', {
    id: z.string().describe('Todo ID'),
    done: z.boolean().optional().describe('Mark as done or not done'),
    text: z.string().optional().describe('New todo text'),
    due_date: z.string().optional().describe('Due date in YYYY-MM-DD format, or empty string to clear'),
}, async ({ id, ...fields }) => {
    const updates = {};
    for (const [key, val] of Object.entries(fields)) {
        if (val !== undefined) {
            updates[key] = val === '' ? null : val;
        }
    }
    const { data, error } = await supabase
        .from('todos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error)
        return err(error.message);
    return ok(data);
});
server.tool('add_note', 'Add a timestamped note to a project', {
    project_id: z.string().describe('Project ID'),
    body: z.string().describe('Note content'),
}, async ({ project_id, body }) => {
    const { data, error } = await supabase
        .from('notes')
        .insert({ project_id, body })
        .select()
        .single();
    if (error)
        return err(error.message);
    return ok(data);
});
server.tool('update_left_off', 'Update the "where I left off" field for a project — shortcut for quickly noting current context', {
    id: z.string().describe('Project ID'),
    left_off: z.string().describe('Description of where you left off'),
}, async ({ id, left_off }) => {
    const { data, error } = await supabase
        .from('projects')
        .update({ left_off })
        .eq('id', id)
        .select('id, name, left_off')
        .single();
    if (error)
        return err(error.message);
    return ok(data);
});
const transport = new StdioServerTransport();
await server.connect(transport);
