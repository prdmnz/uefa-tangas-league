
export interface Player {
  id: string;
  name: string;
  position: string;
  team: string;
  ovr: number;
  height?: string;
  weight?: string;
  skillMoves?: number;
  stats: PlayerStats;
}

export interface GKStats {
  elasticity: number;
  handling: number;
  shooting: number;
  reflexes: number;
  speed: number;
  positioning: number;
}

export interface FieldPlayerStats {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defense: number;
  physical: number;
}

export type PlayerStats = GKStats | FieldPlayerStats;

export interface TeamPlayer {
  player: Player;
  pickNumber: number;
  round: number;
}

export interface Team {
  id: string;
  name: string;
  logo?: string;
  draftPosition: number | null;
  players: TeamPlayer[];
}

export interface DraftPick {
  overall: number;
  round: number;
  pickInRound: number;
  team: Team;
  player: Player | null;
  timeStamp?: Date;
}

export enum DraftStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  PAUSED = 'paused'
}

export interface DraftSettings {
  numberOfTeams: number;
  numberOfRounds: number;
  timePerPick: number; // in seconds
  snakeFormat: boolean;
}

export interface DraftState {
  settings: DraftSettings;
  teams: Team[];
  picks: DraftPick[];
  availablePlayers: Player[];
  currentPick: number;
  status: DraftStatus;
}
