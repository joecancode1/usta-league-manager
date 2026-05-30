/**
 * Catálogo de deportes (espejo de la tabla `sports`).
 * Mantener sincronizado con supabase/migrations/0001_init.sql.
 */
export type SportId = 'tennis' | 'pickleball' | 'padel' | 'beach_tennis';

export interface Sport {
  id: SportId;
  name: string;
  emoji: string;
  color: string;
  minPlayers: number;
  maxPlayers: number;
}

export const SPORTS: Sport[] = [
  { id: 'tennis', name: 'Tenis', emoji: '🎾', color: '#C6FF4D', minPlayers: 2, maxPlayers: 4 },
  { id: 'pickleball', name: 'Pickleball', emoji: '🥒', color: '#4DC3FF', minPlayers: 2, maxPlayers: 4 },
  { id: 'padel', name: 'Pádel', emoji: '🎾', color: '#FF7A4D', minPlayers: 4, maxPlayers: 4 },
  { id: 'beach_tennis', name: 'Beach Tennis', emoji: '🏖️', color: '#FFD24D', minPlayers: 2, maxPlayers: 4 },
];

export const SPORTS_BY_ID: Record<SportId, Sport> = Object.fromEntries(
  SPORTS.map((s) => [s.id, s]),
) as Record<SportId, Sport>;
