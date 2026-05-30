-- ============================================================================
-- Rally — esquema inicial
-- Postgres / Supabase. Incluye tablas, datos semilla, RLS y triggers.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Extensiones
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Catálogo de deportes
-- ---------------------------------------------------------------------------
create table if not exists public.sports (
  id          text primary key,
  name        text not null,
  color       text not null,
  min_players int  not null default 2,
  max_players int  not null default 4
);

insert into public.sports (id, name, color, min_players, max_players) values
  ('tennis',       'Tenis',        '#C6FF4D', 2, 4),
  ('pickleball',   'Pickleball',   '#4DC3FF', 2, 4),
  ('padel',        'Pádel',        '#FF7A4D', 4, 4),
  ('beach_tennis', 'Beach Tennis', '#FFD24D', 2, 4)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Perfiles (1:1 con auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  username   text unique,
  full_name  text,
  avatar_url text,
  bio        text,
  home_city  text,
  created_at timestamptz not null default now()
);

-- Crea automáticamente un perfil cuando se registra un usuario
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Grafo social (follows)
-- ---------------------------------------------------------------------------
create table if not exists public.follows (
  follower_id  uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

-- ---------------------------------------------------------------------------
-- Juegos
-- ---------------------------------------------------------------------------
create table if not exists public.games (
  id           uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references public.profiles (id) on delete cascade,
  sport_id     text not null references public.sports (id),
  title        text,
  location     text,
  starts_at    timestamptz not null,
  format       text not null default 'doubles' check (format in ('singles','doubles')),
  visibility   text not null default 'friends' check (visibility in ('private','friends','public')),
  status       text not null default 'scheduled' check (status in ('scheduled','completed','cancelled')),
  created_at   timestamptz not null default now()
);

create index if not exists games_organizer_idx on public.games (organizer_id);
create index if not exists games_starts_at_idx  on public.games (starts_at);

-- Participantes confirmados
create table if not exists public.game_players (
  game_id   uuid not null references public.games (id) on delete cascade,
  player_id uuid not null references public.profiles (id) on delete cascade,
  team      int  not null default 1 check (team in (1,2)),
  primary key (game_id, player_id)
);

-- Invitaciones (a usuarios o a contactos del teléfono)
create table if not exists public.game_invites (
  id            uuid primary key default gen_random_uuid(),
  game_id       uuid not null references public.games (id) on delete cascade,
  invitee_id    uuid references public.profiles (id) on delete cascade,
  contact_phone text,
  contact_name  text,
  status        text not null default 'pending' check (status in ('pending','accepted','declined')),
  created_at    timestamptz not null default now(),
  check (invitee_id is not null or contact_phone is not null)
);

create index if not exists game_invites_invitee_idx on public.game_invites (invitee_id);

-- ---------------------------------------------------------------------------
-- Costos de la cancha (pagos vía Stripe Connect)
-- El cobro/actualización de `status` y `stripe_payment_intent_id` se hace desde
-- una Edge Function + webhook de Stripe (service role), no desde el cliente.
-- ---------------------------------------------------------------------------
create table if not exists public.game_costs (
  game_id     uuid primary key references public.games (id) on delete cascade,
  total_cents int  not null check (total_cents >= 0),
  currency    text not null default 'USD',
  split_type  text not null default 'equal' check (split_type in ('equal','custom'))
);

create table if not exists public.cost_shares (
  game_id                  uuid not null references public.game_costs (game_id) on delete cascade,
  player_id                uuid not null references public.profiles (id) on delete cascade,
  amount_cents             int  not null check (amount_cents >= 0),
  status                   text not null default 'pending'
                             check (status in ('pending','processing','settled')),
  stripe_payment_intent_id text,
  primary key (game_id, player_id)
);

-- ---------------------------------------------------------------------------
-- Scores (por set)
-- ---------------------------------------------------------------------------
create table if not exists public.scores (
  id          uuid primary key default gen_random_uuid(),
  game_id     uuid not null references public.games (id) on delete cascade,
  set_number  int  not null check (set_number >= 1),
  team1_score int  not null default 0,
  team2_score int  not null default 0,
  unique (game_id, set_number)
);

-- ---------------------------------------------------------------------------
-- Achievements
-- ---------------------------------------------------------------------------
create table if not exists public.achievements (
  id          text primary key,
  name        text not null,
  description text not null,
  icon        text not null default '🏅'
);

insert into public.achievements (id, name, description, icon) values
  ('first_game',  'Primer partido', 'Jugaste tu primer partido en Rally.', '🎉'),
  ('win_1',       'Primera victoria', 'Ganaste tu primer partido.', '🥇'),
  ('win_10',      'En racha', 'Ganaste 10 partidos.', '🔥'),
  ('all_sports',  'Multideporte', 'Jugaste los 4 deportes de raqueta.', '🏆'),
  ('organizer_5', 'Anfitrión', 'Organizaste 5 partidos.', '📅')
on conflict (id) do nothing;

create table if not exists public.user_achievements (
  user_id        uuid not null references public.profiles (id) on delete cascade,
  achievement_id text not null references public.achievements (id) on delete cascade,
  unlocked_at    timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.profiles          enable row level security;
alter table public.follows           enable row level security;
alter table public.games             enable row level security;
alter table public.game_players      enable row level security;
alter table public.game_invites      enable row level security;
alter table public.game_costs        enable row level security;
alter table public.cost_shares       enable row level security;
alter table public.scores            enable row level security;
alter table public.user_achievements enable row level security;
alter table public.sports            enable row level security;
alter table public.achievements      enable row level security;

-- Catálogos: lectura pública
drop policy if exists sports_read on public.sports;
create policy sports_read on public.sports for select using (true);

drop policy if exists achievements_read on public.achievements;
create policy achievements_read on public.achievements for select using (true);

-- Profiles: lectura pública, escritura solo del dueño
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select using (true);

drop policy if exists profiles_write on public.profiles;
create policy profiles_write on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles
  for insert with check (auth.uid() = id);

-- Follows: cualquiera lee; solo tú creas/borras tus follows
drop policy if exists follows_read on public.follows;
create policy follows_read on public.follows for select using (true);

drop policy if exists follows_write on public.follows;
create policy follows_write on public.follows
  for all using (auth.uid() = follower_id) with check (auth.uid() = follower_id);

-- Helper: ¿soy participante del juego?
create or replace function public.is_game_participant(g uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.games where id = g and organizer_id = auth.uid()
    union
    select 1 from public.game_players where game_id = g and player_id = auth.uid()
    union
    select 1 from public.game_invites where game_id = g and invitee_id = auth.uid()
  );
$$;

-- Games: visibles si son públicos o si participas; escribe el organizador
drop policy if exists games_read on public.games;
create policy games_read on public.games for select
  using (visibility = 'public' or public.is_game_participant(id));

drop policy if exists games_insert on public.games;
create policy games_insert on public.games for insert
  with check (auth.uid() = organizer_id);

drop policy if exists games_update on public.games;
create policy games_update on public.games for update
  using (auth.uid() = organizer_id) with check (auth.uid() = organizer_id);

drop policy if exists games_delete on public.games;
create policy games_delete on public.games for delete
  using (auth.uid() = organizer_id);

-- Game players / invites / scores: legibles por participantes
drop policy if exists game_players_read on public.game_players;
create policy game_players_read on public.game_players for select
  using (public.is_game_participant(game_id));

drop policy if exists game_players_write on public.game_players;
create policy game_players_write on public.game_players for all
  using (exists (select 1 from public.games g where g.id = game_id and g.organizer_id = auth.uid()))
  with check (exists (select 1 from public.games g where g.id = game_id and g.organizer_id = auth.uid()));

drop policy if exists game_invites_read on public.game_invites;
create policy game_invites_read on public.game_invites for select
  using (public.is_game_participant(game_id) or invitee_id = auth.uid());

drop policy if exists game_invites_write on public.game_invites;
create policy game_invites_write on public.game_invites for all
  using (exists (select 1 from public.games g where g.id = game_id and g.organizer_id = auth.uid()))
  with check (exists (select 1 from public.games g where g.id = game_id and g.organizer_id = auth.uid()));

drop policy if exists scores_read on public.scores;
create policy scores_read on public.scores for select
  using (public.is_game_participant(game_id));

drop policy if exists scores_write on public.scores;
create policy scores_write on public.scores for all
  using (public.is_game_participant(game_id))
  with check (public.is_game_participant(game_id));

-- Costos: legibles por participantes; gestiona el organizador
drop policy if exists game_costs_read on public.game_costs;
create policy game_costs_read on public.game_costs for select
  using (public.is_game_participant(game_id));

drop policy if exists game_costs_write on public.game_costs;
create policy game_costs_write on public.game_costs for all
  using (exists (select 1 from public.games g where g.id = game_id and g.organizer_id = auth.uid()))
  with check (exists (select 1 from public.games g where g.id = game_id and g.organizer_id = auth.uid()));

drop policy if exists cost_shares_read on public.cost_shares;
create policy cost_shares_read on public.cost_shares for select
  using (public.is_game_participant(game_id));

-- El organizador puede ajustar los montos; el ESTADO de pago (status,
-- stripe_payment_intent_id) lo actualiza el webhook de Stripe con service role,
-- que ignora RLS. Los jugadores no marcan su parte como saldada a mano.
drop policy if exists cost_shares_update on public.cost_shares;
create policy cost_shares_update on public.cost_shares for update
  using (exists (select 1 from public.games g where g.id = game_id and g.organizer_id = auth.uid()))
  with check (exists (select 1 from public.games g where g.id = game_id and g.organizer_id = auth.uid()));

drop policy if exists cost_shares_insert on public.cost_shares;
create policy cost_shares_insert on public.cost_shares for insert
  with check (exists (select 1 from public.games g where g.id = game_id and g.organizer_id = auth.uid()));

-- User achievements: lectura pública (para perfiles); escritura vía triggers
drop policy if exists user_achievements_read on public.user_achievements;
create policy user_achievements_read on public.user_achievements for select using (true);

-- ============================================================================
-- Logros automáticos al completar un juego
-- ============================================================================
create or replace function public.award_achievements()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  p record;
begin
  if new.status = 'completed' and coalesce(old.status, '') <> 'completed' then
    for p in
      select player_id from public.game_players where game_id = new.id
      union
      select new.organizer_id
    loop
      -- Primer partido
      insert into public.user_achievements (user_id, achievement_id)
      values (p.player_id, 'first_game')
      on conflict do nothing;

      -- Multideporte: jugó los 4 deportes
      if (select count(distinct g.sport_id)
            from public.games g
            join public.game_players gp on gp.game_id = g.id
           where gp.player_id = p.player_id and g.status = 'completed') >= 4 then
        insert into public.user_achievements (user_id, achievement_id)
        values (p.player_id, 'all_sports')
        on conflict do nothing;
      end if;
    end loop;
  end if;
  return new;
end;
$$;

drop trigger if exists on_game_completed on public.games;
create trigger on_game_completed
  after update on public.games
  for each row execute function public.award_achievements();
