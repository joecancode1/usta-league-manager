# Arquitectura — Rally

## 1. Visión

Rally es una red social minimalista para deportes de raqueta. El objetivo es que
organizar un partido sea tan fácil como mandar un mensaje: eliges el deporte,
invitas gente, reservan/dividen la cancha, juegan, ponen el score y suben en el
ranking de logros.

Principios de diseño:

- **Minimalista:** mucho espacio en blanco, jerarquía tipográfica clara, pocas
  acciones por pantalla, un solo color de acento por deporte.
- **Rápido:** las acciones clave (crear juego, invitar, poner score) en ≤ 3 taps.
- **Social pero local:** el grafo de relaciones se construye desde tus contactos
  del teléfono + búsqueda por usuario.

## 2. Deportes soportados

| Deporte       | Jugadores típicos | Formato de score        |
|---------------|-------------------|-------------------------|
| Tenis         | 2 (singles) / 4 (dobles) | sets (6 games, tie-break) |
| Pádel         | 4 (dobles)        | sets (6 games, tie-break) |
| Pickleball    | 2 / 4             | puntos a 11 (gana por 2) |
| Beach tennis  | 2 / 4             | sets (tie-break)          |

El catálogo vive en `src/constants/sports.ts` y en la tabla `sports`, para poder
añadir deportes sin tocar la app.

## 3. Arquitectura técnica

```
┌─────────────────────────────┐
│   App Expo (iOS / Android)   │
│   React Native + TS          │
│   Expo Router (file-based)   │
│   @supabase/supabase-js      │
└───────────────┬─────────────┘
                │ HTTPS / WebSocket
                ▼
┌─────────────────────────────┐
│          Supabase            │
│  • Auth (email + OTP/phone)  │
│  • Postgres + Row Level Sec. │
│  • Realtime (feed, scores)   │
│  • Storage (avatares)        │
│  • Edge Functions (futuro)   │
└─────────────────────────────┘
```

### Por qué Expo + Supabase

- Una sola base de código para iOS y Android, iteración rápida (OTA updates).
- Supabase da Auth, base de datos relacional (ideal para el grafo social y los
  partidos), Realtime y Storage sin montar servidores.
- **RLS (Row Level Security)** asegura que cada usuario solo vea/edite lo suyo
  directamente desde el cliente, sin un backend intermedio para el MVP.

## 4. Features → cómo se implementan

1. **Deportes** — tabla `sports`; selector visual al crear un juego.
2. **Perfil social** — tabla `profiles` (1:1 con `auth.users`), avatar en Storage,
   relaciones en `follows`. Stats agregadas desde `game_players` + `scores`.
3. **Planificar un juego** — tabla `games` (deporte, fecha/hora, lugar, formato,
   visibilidad). El creador es el organizador.
4. **Invitar usuarios y contactos** — `game_invites`. Contactos del teléfono se
   leen con `expo-contacts`; si el contacto no es usuario se genera un invite por
   SMS/deeplink (futuro). Usuarios existentes reciben invite in-app.
5. **Dividir costos de la cancha** — `game_costs` (costo total) + `cost_shares`
   (parte de cada jugador). **Stripe Connect:** el organizador define el costo, la
   app reparte y cada jugador paga su parte con tarjeta. Los `PaymentIntent` se crean
   desde una **Supabase Edge Function** (la clave secreta de Stripe nunca toca el
   cliente); el estado del pago se refleja en `cost_shares.status`
   (`pending`/`processing`/`settled`) vía webhook de Stripe.
6. **Scores** — `scores` por juego/set; al cerrar el juego se determina ganador y
   se actualizan stats.
7. **Achievements** — `achievements` (catálogo) + `user_achievements` (desbloqueos).
   Se evalúan con triggers/funciones al cerrar un juego (p. ej. "Primer partido",
   "10 victorias", "Jugaste los 4 deportes").

## 5. Navegación (Expo Router)

```
app/
├── _layout.tsx          # Root: provee sesión de auth, redirige
├── index.tsx            # Splash / redirección según sesión
├── (auth)/
│   ├── _layout.tsx
│   └── sign-in.tsx      # Login / registro
└── (tabs)/
    ├── _layout.tsx      # Tab bar
    ├── index.tsx        # Feed / Inicio
    ├── games.tsx        # Mis juegos + crear
    ├── achievements.tsx # Logros
    └── profile.tsx      # Perfil
```

## 6. Seguridad y privacidad

- Toda tabla con datos de usuario lleva **RLS** (ver `0001_init.sql`).
- Los contactos del teléfono se hashean/usan solo para hacer match; no se suben en
  crudo a menos que el usuario lo permita.
- Secretos (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) vía variables de entorno; la
  `anon key` es pública por diseño (la protección real es RLS).

## 7. Próximos pasos

Ver [`ROADMAP.md`](ROADMAP.md).
