/**
 * Tipos de la base de datos de Rally.
 *
 * Versión escrita a mano para el scaffold. Una vez que el esquema esté estable,
 * puedes regenerarlos con:
 *   npx supabase gen types typescript --project-id <id> > src/types/database.ts
 */

export type GameFormat = 'singles' | 'doubles';
export type GameVisibility = 'private' | 'friends' | 'public';
export type GameStatus = 'scheduled' | 'completed' | 'cancelled';
export type InviteStatus = 'pending' | 'accepted' | 'declined';
export type ShareStatus = 'pending' | 'settled';
export type SplitType = 'equal' | 'custom';

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  home_city: string | null;
  created_at: string;
}

export interface Game {
  id: string;
  organizer_id: string;
  sport_id: string;
  title: string | null;
  location: string | null;
  starts_at: string;
  format: GameFormat;
  visibility: GameVisibility;
  status: GameStatus;
  created_at: string;
}

export interface GamePlayer {
  game_id: string;
  player_id: string;
  team: number;
}

export interface GameInvite {
  id: string;
  game_id: string;
  invitee_id: string | null;
  contact_phone: string | null;
  contact_name: string | null;
  status: InviteStatus;
  created_at: string;
}

export interface GameCost {
  game_id: string;
  total_cents: number;
  currency: string;
  split_type: SplitType;
}

export interface CostShare {
  game_id: string;
  player_id: string;
  amount_cents: number;
  status: ShareStatus;
}

export interface Score {
  id: string;
  game_id: string;
  set_number: number;
  team1_score: number;
  team2_score: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface UserAchievement {
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
}

/**
 * Esquema mínimo para createClient<Database>. Se puede ampliar/regenerar.
 */
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string }; Update: Partial<Profile> };
      games: { Row: Game; Insert: Omit<Game, 'id' | 'created_at'> & { id?: string }; Update: Partial<Game> };
      game_players: { Row: GamePlayer; Insert: GamePlayer; Update: Partial<GamePlayer> };
      game_invites: { Row: GameInvite; Insert: Omit<GameInvite, 'id' | 'created_at'> & { id?: string }; Update: Partial<GameInvite> };
      game_costs: { Row: GameCost; Insert: GameCost; Update: Partial<GameCost> };
      cost_shares: { Row: CostShare; Insert: CostShare; Update: Partial<CostShare> };
      scores: { Row: Score; Insert: Omit<Score, 'id'> & { id?: string }; Update: Partial<Score> };
      achievements: { Row: Achievement; Insert: Achievement; Update: Partial<Achievement> };
      user_achievements: { Row: UserAchievement; Insert: UserAchievement; Update: Partial<UserAchievement> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
