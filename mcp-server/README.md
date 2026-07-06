# Project Management MCP Server

Gives Claude direct access to your project management system via MCP.

## Setup

### 1. Build

```bash
cd mcp-server
npm install
npm run build
```

### 2. Configure Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "project-management": {
      "command": "node",
      "args": ["/absolute/path/to/project-management/mcp-server/dist/index.js"],
      "env": {
        "SUPABASE_URL": "https://zcuytthemafanchjrkwb.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key-here"
      }
    }
  }
}
```

Replace `/absolute/path/to/project-management` with the actual path on your machine and fill in your service role key.

Restart Claude Desktop after saving.

## Available Tools

| Tool | Description |
|------|-------------|
| `list_projects` | List all projects with status, deadline, todo counts |
| `get_project` | Full project details including todos, notes, services, paths |
| `create_project` | Create a new project |
| `update_project` | Update any project fields |
| `add_todo` | Add a todo to a project |
| `update_todo` | Mark todo done/undone, change text or due date |
| `add_note` | Add a timestamped note to a project |
| `update_left_off` | Quickly update the "where I left off" field |

## Example Usage

Once connected, you can ask Claude things like:

- "What projects am I working on?"
- "Add a todo to my project X: set up CI/CD"
- "Mark the project Y as done"
- "Add a note to project Z: just finished the auth refactor"
- "Update where I left off on project X"
