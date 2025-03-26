
import { DraftPick, DraftSettings, DraftState, DraftStatus, Player, Team, TeamPlayer } from "../types";

/**
 * Generates the draft order in snake format
 */
export const generateDraftOrder = (teams: Team[], settings: DraftSettings): DraftPick[] => {
  const picks: DraftPick[] = [];
  const { numberOfRounds, snakeFormat } = settings;
  
  for (let round = 1; round <= numberOfRounds; round++) {
    // In snake format, even rounds go in reverse order
    const roundTeams = snakeFormat && round % 2 === 0 
      ? [...teams].sort((a, b) => (b.draftPosition || 0) - (a.draftPosition || 0))
      : [...teams].sort((a, b) => (a.draftPosition || 0) - (b.draftPosition || 0));
    
    for (let pickInRound = 1; pickInRound <= teams.length; pickInRound++) {
      const overall = (round - 1) * teams.length + pickInRound;
      const team = roundTeams[pickInRound - 1];
      
      picks.push({
        overall,
        round,
        pickInRound,
        team,
        player: null
      });
    }
  }
  
  return picks;
};

/**
 * Randomizes the draft order for teams
 */
export const randomizeDraftOrder = (teams: Team[]): Team[] => {
  const shuffled = [...teams];
  
  // Fisher-Yates shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Assign draft positions
  return shuffled.map((team, index) => ({
    ...team,
    draftPosition: index + 1
  }));
};

/**
 * Check if player is a goalkeeper
 */
export const isGoalkeeper = (player: Player): boolean => {
  return player.position === 'GK';
};

/**
 * Makes a draft pick
 */
export const makeDraftPick = (draftState: DraftState, playerId: string): DraftState => {
  const { picks, availablePlayers, currentPick } = draftState;
  
  if (currentPick >= picks.length) {
    return draftState; // Draft is complete
  }
  
  const playerIndex = availablePlayers.findIndex(p => p.id === playerId);
  if (playerIndex === -1) {
    return draftState; // Player not found
  }
  
  const player = availablePlayers[playerIndex];
  const pick = picks[currentPick];
  const team = pick.team;
  
  // Update the pick with the selected player
  const updatedPicks = [...picks];
  updatedPicks[currentPick] = {
    ...pick,
    player,
    timeStamp: new Date()
  };
  
  // Add player to team
  const teamPlayer: TeamPlayer = {
    player,
    pickNumber: pick.overall,
    round: pick.round
  };
  
  const updatedTeams = draftState.teams.map(t => {
    if (t.id === team.id) {
      return {
        ...t,
        players: [...t.players, teamPlayer]
      };
    }
    return t;
  });
  
  // Remove player from available players
  const updatedAvailablePlayers = [...availablePlayers];
  updatedAvailablePlayers.splice(playerIndex, 1);
  
  // Check if draft is complete
  const nextPick = currentPick + 1;
  const isDraftComplete = nextPick >= picks.length;
  
  return {
    ...draftState,
    picks: updatedPicks,
    teams: updatedTeams,
    availablePlayers: updatedAvailablePlayers,
    currentPick: nextPick,
    status: isDraftComplete ? DraftStatus.COMPLETED : DraftStatus.IN_PROGRESS
  };
};

/**
 * Filter players by search criteria
 */
export const filterPlayers = (
  players: Player[],
  search: string,
  positionFilter: string,
  teamFilter: string
): Player[] => {
  return players.filter(player => {
    const matchesSearch = search === '' || 
      player.name.toLowerCase().includes(search.toLowerCase());
    
    const matchesPosition = positionFilter === '' || 
      player.position === positionFilter;
    
    const matchesTeam = teamFilter === '' || 
      player.team === teamFilter;
    
    return matchesSearch && matchesPosition && matchesTeam;
  });
};

/**
 * Format time from seconds to MM:SS
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Get unique player positions from player list
 */
export const getUniquePositions = (players: Player[]): string[] => {
  const positions = players.map(player => player.position);
  return [...new Set(positions)].sort();
};

/**
 * Get unique teams from player list
 */
export const getUniqueTeams = (players: Player[]): string[] => {
  const teams = players.map(player => player.team);
  return [...new Set(teams)].sort();
};
