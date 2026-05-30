# Roadmap — Rally

## Fase 0 — Scaffold ✅ (actual)
- Estructura del proyecto (Expo Router + TypeScript).
- Cliente de Supabase, tema minimalista, catálogo de deportes.
- Esquema de base de datos con RLS y datos semilla.
- Pantallas base: auth, feed, juegos, logros, perfil.

## Fase 1 — Auth y perfil
- Login con email (magic link) y/o teléfono (OTP).
- Crear/editar perfil, subir avatar a Storage.
- Buscar usuarios por username; seguir/dejar de seguir.

## Fase 2 — Planificar juegos
- Crear juego: deporte, fecha/hora, lugar, formato, visibilidad.
- Lista "Mis juegos" (próximos / pasados).
- Detalle de juego con participantes.

## Fase 3 — Invitaciones y contactos
- Invitar usuarios in-app.
- Leer contactos del teléfono (`expo-contacts`) y hacer match con usuarios.
- Invitar contactos no usuarios por SMS/deeplink.
- Aceptar/rechazar invitaciones; notificaciones push (`expo-notifications`).

## Fase 4 — Costos de la cancha (Stripe Connect)
- Definir costo total y dividir (igual / personalizado).
- Edge Function de Supabase que crea PaymentIntents con la secret key de Stripe.
- Pago con tarjeta desde la app (`@stripe/stripe-react-native`).
- Webhook de Stripe → actualiza `cost_shares.status` (`pending`/`processing`/`settled`).
- Resumen de balances por persona.

## Fase 5 — Scores
- Registrar score por set según el deporte.
- Calcular ganador y cerrar el juego.
- Historial y estadísticas en el perfil (V/D, win rate, por deporte).

## Fase 6 — Achievements
- Catálogo de logros y evaluación con triggers al cerrar juego.
- Vista de logros (desbloqueados / por desbloquear).
- Compartir logros en el feed.

## Fase 7 — Feed social y pulido
- Feed de actividad (juegos jugados, logros, nuevos seguidores).
- Likes/comentarios (opcional).
- Pulido visual, accesibilidad, OTA updates.

## Más adelante
- Pagos reales (Stripe Connect / Mercado Pago) si se decide monetizar la división.
- Rankings y ligas (encaja con el nombre del repo, "league-manager").
- Reserva de canchas integrada con clubes.
