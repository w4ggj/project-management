-- Run this in the Supabase SQL Editor

create table projects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  status      text not null default 'active'
                check (status in ('active', 'paused', 'done')),
  left_off    text,
  deadline    date,
  repo_url    text,
  live_url    text,
  tags        text[] not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table todos (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  text        text not null,
  done        boolean not null default false,
  position    integer not null default 0,
  created_at  timestamptz not null default now()
);

create table services (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  name        text not null,
  url         text,
  notes       text,
  position    integer not null default 0,
  created_at  timestamptz not null default now()
);

create table paths (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  path        text not null,
  description text,
  position    integer not null default 0,
  created_at  timestamptz not null default now()
);

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_updated_at
  before update on projects
  for each row execute function update_updated_at();

create index todos_project_id    on todos(project_id);
create index services_project_id on services(project_id);
create index paths_project_id    on paths(project_id);
create index projects_status     on projects(status);
create index projects_deadline   on projects(deadline);
