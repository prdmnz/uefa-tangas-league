
import React, { useState, useEffect } from 'react';
import { DraftState, DraftStatus, Team, Player } from '../types';
import { samplePlayers, sampleTeams, defaultDraftSettings } from '../data/players';
import { generateDraftOrder, makeDraftPick, randomizeDraftOrder, assignTeamToUser, getUserTeam } from '../utils/draftUtils';
import DraftBoard from '../components/DraftBoard';
import PlayerList from '../components/PlayerList';
import TeamView from '../components/TeamView';
import RandomizerButton from '../components/RandomizerButton';
import Navigation from '../components/Navigation';
import CsvUploader from '../components/CsvUploader';
import TeamSelection from '../components/TeamSelection';
import Timer from '../components/Timer';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  // Define team names
  const teamNames = [
    "Travinha", "Munhoz", "Lucas", "Luan", "João", "Rafael", "Murillo", "Vi", "Teló"
  ];
  
  // Initialize draft state
  const [draftState, setDraftState] = useState<DraftState>(() => {
    // Create teams with the specific names
    const initialTeams = teamNames.map((name, index) => ({
      id: `team-${index + 1}`,
      name,
      draftPosition: null,
      players: [],
      assignedTo: null
    })) as Team[];
    
    return {
      settings: { ...defaultDraftSettings, numberOfRounds: 18 }, // 18 rounds
      teams: initialTeams,
      picks: [],
      availablePlayers: [...samplePlayers],
      currentPick: 0,
      status: DraftStatus.NOT_STARTED
    };
  });

  // User state
  const [userId, setUserId] = useState<string | null>(null);
  
  // State for showing/hiding CSV uploader
  const [showCsvUploader, setShowCsvUploader] = useState(false);

  // Handle CSV players loaded
  const handlePlayersLoaded = (players: Player[]) => {
    setDraftState(prev => ({
      ...prev,
      availablePlayers: players,
    }));
    
    // Hide the uploader after successful import
    setShowCsvUploader(false);
    
    toast({
      title: "Players Imported",
      description: `${players.length} players have been imported successfully.`,
    });
  };

  // Handle timer completion
  const handleTimerComplete = () => {
    // In a real app, you might want to auto-select a player or just advance the pick
    toast({
      title: "Time's up!",
      description: "The current team's time to pick has expired.",
      variant: "destructive"
    });
  };

  // Handle player selection
  const handleSelectPlayer = (playerId: string) => {
    if (draftState.status !== DraftStatus.IN_PROGRESS) {
      toast({
        title: "Draft not active",
        description: "The draft must be in progress to make a selection.",
      });
      return;
    }

    // Check if user has permission to make this pick
    const currentTeam = draftState.currentPick < draftState.picks.length 
      ? draftState.picks[draftState.currentPick].team 
      : null;
      
    if (currentTeam && currentTeam.assignedTo !== userId && userId !== 'admin') {
      toast({
        title: "Not your turn",
        description: "You can only draft when it's your turn.",
        variant: "destructive"
      });
      return;
    }

    const updatedState = makeDraftPick(draftState, playerId);
    setDraftState(updatedState);
    
    const pick = updatedState.picks[updatedState.currentPick - 1];
    
    if (pick && pick.player) {
      toast({
        title: "Player Drafted",
        description: `${pick.team.name} selects ${pick.player.name} (${pick.player.position})`,
      });
    }
    
    // Check if draft is complete
    if (updatedState.status === DraftStatus.COMPLETED) {
      toast({
        title: "Draft Complete",
        description: "All picks have been made. Draft is now complete.",
      });
    }
  };

  // Handle draft randomization
  const handleRandomize = (randomizedTeams: Team[]) => {
    setDraftState(prev => ({
      ...prev,
      teams: randomizedTeams
    }));
  };

  // Handle team selection
  const handleTeamSelect = (userName: string, teamId: string) => {
    setUserId(userName);
    
    setDraftState(prev => ({
      ...prev,
      teams: assignTeamToUser(prev.teams, userName, teamId)
    }));
  };

  // Handle starting the draft
  const handleStartDraft = () => {
    // Make sure teams have draft positions
    if (draftState.teams.some(team => team.draftPosition === null)) {
      const randomizedTeams = randomizeDraftOrder(draftState.teams);
      
      const picks = generateDraftOrder(randomizedTeams, draftState.settings);
      
      setDraftState(prev => ({
        ...prev,
        teams: randomizedTeams,
        picks,
        currentPick: 0,
        status: DraftStatus.IN_PROGRESS
      }));
    } else {
      // Teams already have positions, just generate picks
      const picks = generateDraftOrder(draftState.teams, draftState.settings);
      
      setDraftState(prev => ({
        ...prev,
        picks,
        currentPick: 0,
        status: DraftStatus.IN_PROGRESS
      }));
    }
    
    toast({
      title: "Draft Started",
      description: "The draft is now in progress!",
    });
  };

  // Handle resetting the draft
  const handleResetDraft = () => {
    // Keep team assignments but reset other properties
    const resetTeams = draftState.teams.map(team => ({
      ...team, 
      draftPosition: null, 
      players: []
    }));
    
    setDraftState({
      settings: { ...defaultDraftSettings, numberOfRounds: 18 },
      teams: resetTeams,
      picks: [],
      availablePlayers: [...samplePlayers],
      currentPick: 0,
      status: DraftStatus.NOT_STARTED
    });
    
    toast({
      title: "Draft Reset",
      description: "The draft has been reset to its initial state.",
    });
  };

  // Handle pausing the draft
  const handlePauseDraft = () => {
    setDraftState(prev => ({
      ...prev,
      status: DraftStatus.PAUSED
    }));
    
    toast({
      title: "Draft Paused",
      description: "The draft has been paused.",
    });
  };

  // Handle resuming the draft
  const handleResumeDraft = () => {
    setDraftState(prev => ({
      ...prev,
      status: DraftStatus.IN_PROGRESS
    }));
    
    toast({
      title: "Draft Resumed",
      description: "The draft has been resumed.",
    });
  };

  // Get current user's team
  const userTeam = userId ? getUserTeam(draftState.teams, userId) : null;

  // Extract current team on the clock
  const currentTeam = draftState.currentPick < draftState.picks.length 
    ? draftState.picks[draftState.currentPick].team 
    : null;

  // Sticky current pick info
  const [showStickyInfo, setShowStickyInfo] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowStickyInfo(scrollY > 200);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <Navigation 
          draftStatus={draftState.status}
          onStartDraft={handleStartDraft}
          onResetDraft={handleResetDraft}
          onPauseDraft={handlePauseDraft}
          onResumeDraft={handleResumeDraft}
        />
        
        {/* Sticky current pick info */}
        {showStickyInfo && currentTeam && draftState.status === DraftStatus.IN_PROGRESS && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white py-2 px-4 flex justify-between items-center shadow-md">
            <div className="flex items-center">
              <span className="font-medium">On the Clock: </span>
              <span className="ml-2 font-bold text-lg">{currentTeam.name}</span>
              <span className="ml-4 text-sm opacity-80">
                Pick: {draftState.currentPick + 1} of {draftState.picks.length}
              </span>
            </div>
            
            <div className="w-32">
              <Timer 
                initialSeconds={draftState.settings.timePerPick} 
                isRunning={draftState.status === DraftStatus.IN_PROGRESS}
                onComplete={handleTimerComplete}
              />
            </div>
          </div>
        )}
        
        {/* If user is not logged in, show team selection */}
        {!userId && draftState.status === DraftStatus.NOT_STARTED && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3">
              <TeamSelection 
                teams={draftState.teams}
                onTeamSelect={handleTeamSelect}
                onStartDraft={handleStartDraft}
              />
            </div>
          </div>
        )}
        
        {/* If user is logged in, show draft interface */}
        {userId && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {draftState.status === DraftStatus.NOT_STARTED && (
                <div className="glass shadow-soft rounded-lg p-6 animate-fade-in">
                  <h2 className="text-xl font-medium mb-4">Welcome, {userId}!</h2>
                  <p className="text-gray-600 mb-6">
                    {userTeam ? `You have selected ${userTeam.name}. ` : ''}
                    This draft uses a snake format with 9 teams and 18 rounds. Before starting, you need to randomize the draft order.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                    <RandomizerButton
                      teams={draftState.teams}
                      onRandomize={handleRandomize}
                      disabled={draftState.status !== DraftStatus.NOT_STARTED}
                    />
                    
                    <button
                      onClick={handleStartDraft}
                      className="button-transition focus-ring px-4 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                    >
                      Start Draft
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => setShowCsvUploader(!showCsvUploader)}
                      className="text-blue-600 hover:text-blue-800 underline text-sm"
                    >
                      {showCsvUploader ? 'Esconder Upload CSV' : 'Importar Jogadores (CSV)'}
                    </button>
                    
                    <div className="text-xs text-gray-500">
                      {draftState.availablePlayers.length} jogadores disponíveis
                    </div>
                  </div>
                  
                  {showCsvUploader && (
                    <div className="mt-4">
                      <CsvUploader onPlayersLoaded={handlePlayersLoaded} />
                    </div>
                  )}
                </div>
              )}
              
              {draftState.picks.length > 0 && (
                <DraftBoard
                  picks={draftState.picks}
                  currentPick={draftState.currentPick}
                  isActive={draftState.status === DraftStatus.IN_PROGRESS}
                  timePerPick={draftState.settings.timePerPick}
                  onTimerComplete={handleTimerComplete}
                />
              )}
              
              <PlayerList
                players={draftState.availablePlayers}
                onSelectPlayer={handleSelectPlayer}
                disabled={draftState.status !== DraftStatus.IN_PROGRESS || 
                          (currentTeam && currentTeam.assignedTo !== userId && userId !== 'admin')}
              />
            </div>
            
            <div>
              {currentTeam && draftState.status === DraftStatus.IN_PROGRESS && (
                <div className="glass shadow-soft rounded-lg p-4 mb-6 animate-fade-in">
                  <h3 className="text-lg font-medium mb-2">On The Clock</h3>
                  <div className="text-2xl font-semibold">{currentTeam.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Draft Position: {currentTeam.draftPosition}
                  </div>
                  <div className="text-sm text-gray-600">
                    Pick: {draftState.currentPick + 1} of {draftState.picks.length}
                  </div>
                </div>
              )}
              
              <TeamView teams={draftState.teams} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
