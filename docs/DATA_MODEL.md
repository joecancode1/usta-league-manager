# Modelo de datos — Rally

Base de datos: **Postgres (Supabase)**. El SQL completo (con RLS y triggers) está
en [`supabase/migrations/0001_init.sql`](../supabase/migrations/0001_init.sql).

## Diagrama de relaciones

```
auth.users ─1:1─ profiles
profiles ─< follows >─ profiles            (seguir / seguidores)
profiles ─1:N─ games (organizer)
sports   ─1:N─ games
games    ─1:N─ game_players ─N:1─ profiles
games    ─1:N─ game_invites
games    ─1:1─ game_costs   ─1:N─ cost_shares ─N:1─ profiles
games    ─1:N─ scores
achievements ─< user_achievements >─ profiles
```

## Tablas

### `sports`
Catálogo de deportes. Sembrado con tenis, pickleball, pádel, beach tennis.

| Columna       | Tipo      | Notas                                   |
|---------------|-----------|-----------------------------------------|
| id            | text PK   | `tennis`, `pickleball`, `padel`, `beach_tennis` |
| name          | text      | Nombre visible                          |
| color         | text      | Color de acento (hex)                   |
| min_players   | int       | Mínimo de jugadores                     |
| max_players   | int       | Máximo de jugadores                     |

### `profiles`
Perfil social, 1:1 con `auth.users`.

| Columna     | Tipo        | Notas                          |
|-------------|-------------|--------------------------------|
| id          | uuid PK     | = `auth.users.id`              |
| username    | text unique | handle público                 |
| full_name   | text        |                                |
| avatar_url  | text        | Storage                        |
| bio         | text        |                                |
| home_city   | text        |                                |
| created_at  | timestamptz | default now()                  |

### `follows`
Grafo social (dirigido: A sigue a B).

| Columna      | Tipo  | Notas                |
|--------------|-------|----------------------|
| follower_id  | uuid  | FK profiles          |
| following_id | uuid  | FK profiles          |
| PK           |       | (follower, following)|

### `games`
Un partido planificado.

| Columna     | Tipo        | Notas                                        |
|-------------|-------------|----------------------------------------------|
| id          | uuid PK     |                                              |
| organizer_id| uuid        | FK profiles                                  |
| sport_id    | text        | FK sports                                    |
| title       | text        | opcional                                     |
| location    | text        | nombre del club/cancha                       |
| starts_at   | timestamptz | fecha y hora                                 |
| format      | text        | `singles` / `doubles`                        |
| visibility  | text        | `private` / `friends` / `public`             |
| status      | text        | `scheduled` / `completed` / `cancelled`      |
| created_at  | timestamptz |                                              |

### `game_players`
Quién participa en un juego (confirmados).

| Columna   | Tipo  | Notas                              |
|-----------|-------|------------------------------------|
| game_id   | uuid  | FK games                           |
| player_id | uuid  | FK profiles                        |
| team      | int   | 1 o 2 (para dobles/equipos)        |
| PK        |       | (game_id, player_id)               |

### `game_invites`
Invitaciones (a usuarios o a contactos del teléfono).

| Columna      | Tipo  | Notas                                          |
|--------------|-------|------------------------------------------------|
| id           | uuid PK |                                              |
| game_id      | uuid  | FK games                                       |
| invitee_id   | uuid  | FK profiles (null si es contacto externo)      |
| contact_phone| text  | para invitados que aún no son usuarios         |
| contact_name | text  |                                                |
| status       | text  | `pending` / `accepted` / `declined`            |
| created_at   | timestamptz |                                          |

### `game_costs`
Costo total de la cancha por juego.

| Columna     | Tipo    | Notas                           |
|-------------|---------|---------------------------------|
| game_id     | uuid PK | FK games                        |
| total_cents | int     | costo total (en centavos)       |
| currency    | text    | ISO 4217 (`USD`, `MXN`, ...)    |
| split_type  | text    | `equal` / `custom`              |

### `cost_shares`
La parte que le toca a cada jugador.

| Columna     | Tipo  | Notas                                  |
|-------------|-------|----------------------------------------|
| game_id     | uuid  | FK game_costs                          |
| player_id   | uuid  | FK profiles                            |
| amount_cents| int   | lo que debe                            |
| status      | text  | `pending` / `settled` (modo registro)  |
| PK          |       | (game_id, player_id)                   |

### `scores`
Resultado por set/parcial.

| Columna     | Tipo  | Notas                                  |
|-------------|-------|----------------------------------------|
| id          | uuid PK |                                      |
| game_id     | uuid  | FK games                               |
| set_number  | int   | 1, 2, 3...                             |
| team1_score | int   |                                        |
| team2_score | int   |                                        |

Ganador del juego = equipo con más sets ganados (se calcula al cerrar).

### `achievements`
Catálogo de logros.

| Columna     | Tipo    | Notas                          |
|-------------|---------|--------------------------------|
| id          | text PK | `first_game`, `win_10`, ...    |
| name        | text    |                                |
| description | text    |                                |
| icon        | text    | emoji o nombre de ícono        |

### `user_achievements`
Logros desbloqueados por usuario.

| Columna        | Tipo        | Notas                  |
|----------------|-------------|------------------------|
| user_id        | uuid        | FK profiles            |
| achievement_id | text        | FK achievements        |
| unlocked_at    | timestamptz | default now()          |
| PK             |             | (user_id, achievement) |

## Notas de seguridad (RLS)

- `profiles`: lectura pública; escritura solo del dueño.
- `games` / relacionadas: visibles para organizador + participantes + invitados;
  los juegos `public` son legibles por todos.
- `cost_shares`: cada quien ve su parte; el organizador ve todas las del juego.
- `user_achievements`: legibles por todos (para mostrar en perfil); escritura solo
  vía funciones del servidor (triggers `security definer`).
