import { DraftPick, DraftSettings, DraftState, DraftStatus, Player, Team, TeamPlayer } from "../types";

/**
 * Generates the draft order in snake format
 */
export const generateDraftOrder = (teams: Team[], settings: DraftSettings): DraftPick[] => {
  const picks: DraftPick[] = [];
  const { numberOfRounds, snakeFormat } = settings;
  
  // Filter only teams with draftPosition assigned
  const teamsInDraft = teams.filter(team => team.draftPosition !== null && team.assignedTo);
  
  for (let round = 1; round <= numberOfRounds; round++) {
    // In snake format, even rounds go in reverse order
    const roundTeams = snakeFormat && round % 2 === 0 
      ? [...teamsInDraft].sort((a, b) => (b.draftPosition || 0) - (a.draftPosition || 0))
      : [...teamsInDraft].sort((a, b) => (a.draftPosition || 0) - (b.draftPosition || 0));
    
    for (let pickInRound = 1; pickInRound <= roundTeams.length; pickInRound++) {
      const overall = (round - 1) * roundTeams.length + pickInRound;
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
  // Only include teams that have been assigned to a user
  const teamsToRandomize = teams.filter(team => team.assignedTo);
  const otherTeams = teams.filter(team => !team.assignedTo);
  
  // Fisher-Yates shuffle for assigned teams
  const shuffled = [...teamsToRandomize];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Assign draft positions to shuffled teams
  const shuffledWithPositions = shuffled.map((team, index) => ({
    ...team,
    draftPosition: index + 1
  }));
  
  // Combine assigned teams with unassigned teams
  return [...shuffledWithPositions, ...otherTeams];
};

/**
 * Visual randomizer that returns a sequence of team arrays for animation
 */
export const visualRandomizer = (teams: Team[], steps = 10): Team[][] => {
  const sequences: Team[][] = [];
  
  for (let step = 0; step < steps; step++) {
    const shuffled = [...teams];
    
    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Assign draft positions
    const teamWithPositions = shuffled.map((team, index) => ({
      ...team,
      draftPosition: index + 1
    }));
    
    sequences.push(teamWithPositions);
  }
  
  return sequences;
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

/**
 * Get position color based on FIFA colors
 */
export const getPositionColor = (position: string): string => {
  // FIFA-inspired position colors
  const positionColors: Record<string, string> = {
    // Goalkeepers - Yellow
    'GK': 'bg-yellow-100 text-yellow-800',
    
    // Defenders - Blue
    'CB': 'bg-blue-100 text-blue-800',
    'LB': 'bg-blue-100 text-blue-800',
    'RB': 'bg-blue-100 text-blue-800',
    'LWB': 'bg-blue-100 text-blue-800',
    'RWB': 'bg-blue-100 text-blue-800',
    
    // Midfielders - Green
    'CDM': 'bg-green-100 text-green-800',
    'CM': 'bg-green-100 text-green-800',
    'CAM': 'bg-green-100 text-green-800',
    'LM': 'bg-green-100 text-green-800',
    'RM': 'bg-green-100 text-green-800',
    
    // Forwards - Red
    'LW': 'bg-red-100 text-red-800',
    'RW': 'bg-red-100 text-red-800',
    'ST': 'bg-red-100 text-red-800',
    'CF': 'bg-red-100 text-red-800'
  };
  
  return positionColors[position] || 'bg-gray-100 text-gray-800';
};

/**
 * Assign a team to a user
 */
export const assignTeamToUser = (teams: Team[], userId: string, teamId: string): Team[] => {
  return teams.map(team => {
    if (team.id === teamId) {
      return {
        ...team,
        assignedTo: userId
      };
    }
    return team;
  });
};

/**
 * Get the user's assigned team
 */
export const getUserTeam = (teams: Team[], userId: string): Team | undefined => {
  if (!userId) return undefined;
  return teams.find(team => team.assignedTo === userId);
};

/**
 * Check if it's the user's turn to draft
 */
export const isUserTurn = (draftState: DraftState, userId: string): boolean => {
  if (!userId || !draftState || draftState.status !== DraftStatus.IN_PROGRESS) {
    return false;
  }

  // If current pick is past the end of the draft, return false
  if (draftState.currentPick >= draftState.picks.length) {
    return false;
  }

  // Get the current team on the clock
  const currentTeam = draftState.picks[draftState.currentPick].team;
  
  // Get the user's team
  const userTeam = draftState.teams.find(team => team.assignedTo === userId);
  
  // Check if it's the user's turn:
  // 1. If the current team is directly assigned to the user OR
  // 2. If the user's team is the team that's on the clock
  return currentTeam.assignedTo === userId || 
         (userTeam !== undefined && currentTeam.assignedTo === userTeam.assignedTo);
};
