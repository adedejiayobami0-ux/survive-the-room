create extension if not exists pgcrypto;

drop table if exists public.round_results cascade;
drop table if exists public.choices cascade;
drop table if exists public.player_secrets cascade;
drop table if exists public.players cascade;
drop table if exists public.rooms cascade;

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (char_length(code) = 5),
  host_user_id uuid not null,
  pack_id text not null,
  status text not null default 'lobby' check (status in ('lobby','playing','finished')),
  round integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null,
  name text not null check (char_length(name) between 1 and 24),
  health integer not null default 5,
  energy integer not null default 5,
  supplies integer not null default 1,
  alive boolean not null default true,
  has_submitted boolean not null default false,
  created_at timestamptz not null default now(),
  unique(room_id,user_id)
);

create table public.player_secrets (
  player_id uuid primary key references public.players(id) on delete cascade,
  user_id uuid not null,
  role_name text not null,
  role_goal text not null,
  created_at timestamptz not null default now()
);

create table public.choices (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  user_id uuid not null,
  round integer not null,
  pack_id text not null,
  choice_id text not null,
  created_at timestamptz not null default now(),
  unique(player_id,round)
);

create table public.round_results (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  round integer not null,
  consequence text not null,
  explanation text not null,
  health_delta integer not null default 0,
  energy_delta integer not null default 0,
  supplies_delta integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.rooms enable row level security;
alter table public.players enable row level security;
alter table public.player_secrets enable row level security;
alter table public.choices enable row level security;
alter table public.round_results enable row level security;

create policy "read rooms" on public.rooms
for select to authenticated using (true);

create policy "create own rooms" on public.rooms
for insert to authenticated
with check ((select auth.uid()) = host_user_id);

create policy "host updates room" on public.rooms
for update to authenticated
using ((select auth.uid()) = host_user_id)
with check ((select auth.uid()) = host_user_id);

create policy "read player state" on public.players
for select to authenticated using (true);

create policy "insert self player" on public.players
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "update own player" on public.players
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "read own secret" on public.player_secrets
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "create own secret" on public.player_secrets
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "read own choices" on public.choices
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "insert own choices" on public.choices
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "update own choices" on public.choices
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "read round results" on public.round_results
for select to authenticated using (true);

grant select,insert,update on public.rooms to authenticated;
grant select,insert,update on public.players to authenticated;
grant select,insert on public.player_secrets to authenticated;
grant select,insert,update on public.choices to authenticated;
grant select on public.round_results to authenticated;

alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.players;
alter publication supabase_realtime add table public.round_results;

create or replace function public.resolve_learning_round(
  target_room_code text,
  choice_map jsonb,
  max_rounds integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_room public.rooms%rowtype;
  choice_row record;
  effect jsonb;
  alive_count integer;
  submitted_count integer;
begin
  select *
  into target_room
  from public.rooms
  where code = upper(target_room_code)
  for update;

  if target_room.id is null then
    raise exception 'Room not found';
  end if;

  if auth.uid() is null or auth.uid() <> target_room.host_user_id then
    raise exception 'Only the host can resolve this round';
  end if;

  select count(*) into alive_count
  from public.players
  where room_id = target_room.id and alive = true;

  select count(*) into submitted_count
  from public.players
  where room_id = target_room.id and alive = true and has_submitted = true;

  if alive_count = 0 or submitted_count < alive_count then
    raise exception 'Not all active players have submitted';
  end if;

  delete from public.round_results
  where room_id = target_room.id and round = target_room.round;

  for choice_row in
    select c.*, p.alive
    from public.choices c
    join public.players p on p.id = c.player_id
    where c.room_id = target_room.id
      and c.round = target_room.round
      and p.alive = true
  loop
    effect := choice_map -> choice_row.choice_id;

    if effect is null then
      raise exception 'Missing effect mapping for choice %', choice_row.choice_id;
    end if;

    update public.players
    set
      health = greatest(0, least(5, health + coalesce((effect->>'health')::integer,0))),
      energy = greatest(0, least(5, energy + coalesce((effect->>'energy')::integer,0))),
      supplies = greatest(0, supplies + coalesce((effect->>'supplies')::integer,0))
    where id = choice_row.player_id;

    insert into public.round_results (
      room_id,
      player_id,
      round,
      consequence,
      explanation,
      health_delta,
      energy_delta,
      supplies_delta
    )
    values (
      target_room.id,
      choice_row.player_id,
      target_room.round,
      effect->>'consequence',
      effect->>'explanation',
      coalesce((effect->>'health')::integer,0),
      coalesce((effect->>'energy')::integer,0),
      coalesce((effect->>'supplies')::integer,0)
    );
  end loop;

  update public.players
  set alive = false
  where room_id = target_room.id and health <= 0;

  update public.players
  set has_submitted = false
  where room_id = target_room.id;

  if target_room.round + 1 >= max_rounds then
    update public.rooms
    set status = 'finished'
    where id = target_room.id;
  else
    update public.rooms
    set round = round + 1
    where id = target_room.id;
  end if;
end;
$$;

revoke all on function public.resolve_learning_round(text,jsonb,integer) from public;
grant execute on function public.resolve_learning_round(text,jsonb,integer) to authenticated;
