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
import ChampionsBanner from '../components/ChampionsBanner';
import { toast } from '@/hooks/use-toast';
import { useRealTime } from '../context/RealTimeContext';
import { v4 as uuidv4 } from 'uuid';
import { FileText, Users, Trophy, Clock, AlertCircle, Play, Pause, RotateCcw } from 'lucide-react';

const Index = () => {
  const { 
    userId, 
    draftState, 
    connectUser, 
    selectTeam, 
    startDraft: startDraftRealTime, 
    makePick: makePickRealTime,
    resetDraft: resetDraftRealTime,
    pauseDraft: pauseDraftRealTime,
    resumeDraft: resumeDraftRealTime,
    randomizeTeams: randomizeTeamsRealTime
  } = useRealTime();
  
  const [showCsvUploader, setShowCsvUploader] = useState(false);
  const [currentPickStartTime, setCurrentPickStartTime] = useState<Date | undefined>(undefined);
  const [localUserId, setLocalUserId] = useState<string | null>(null);

  const handleTeamsCountChange = (count: number) => {
    if (!draftState) return;
    
    console.log(`Changing teams count to: ${count}`);
    
    // Use the resetDraft function with the custom config
    resetDraftRealTime({ numberOfTeams: count });
    
    toast({
      title: "Configuração atualizada",
      description: `O draft agora será realizado com ${count} times.`,
    });
  };

  useEffect(() => {
    if (draftState && draftState.status === DraftStatus.IN_PROGRESS) {
      const currentPickObj = draftState.picks[draftState.currentPick];
      if (currentPickObj && currentPickObj.timeStamp) {
        setCurrentPickStartTime(new Date(currentPickObj.timeStamp));
      } else {
        setCurrentPickStartTime(new Date());
      }
    } else if (draftState && draftState.status !== DraftStatus.IN_PROGRESS) {
      setCurrentPickStartTime(undefined);
    }
  }, [draftState?.currentPick, draftState?.status]);

  useEffect(() => {
    const storedUserId = localStorage.getItem('draftAppUserId');
    const newUserId = storedUserId || uuidv4();
    
    if (!storedUserId) {
      localStorage.setItem('draftAppUserId', newUserId);
    }
    
    setLocalUserId(newUserId);
    
    if (newUserId && !userId) {
      connectUser(newUserId);
    }
  }, [userId, connectUser]);

  const handlePlayersLoaded = (players: Player[]) => {
    setShowCsvUploader(false);
    
    toast({
      title: "Jogadores Importados",
      description: `${players.length} jogadores foram importados com sucesso.`,
    });
  };

  const handleTimerComplete = () => {
    toast({
      title: "Tempo esgotado!",
      description: "O tempo para escolha do time atual expirou.",
      variant: "destructive"
    });
  };

  const handleSelectPlayer = (playerId: string) => {
    console.log("Attempting to select player:", playerId);
    console.log("User ID:", userId);
    console.log("Draft status:", draftState?.status);
    
    if (!draftState || draftState.status !== DraftStatus.IN_PROGRESS) {
      toast({
        title: "Draft não ativo",
        description: "O draft precisa estar em andamento para fazer uma seleção.",
        variant: "destructive"
      });
      return;
    }

    const currentTeam = draftState.currentPick < draftState.picks.length 
      ? draftState.picks[draftState.currentPick].team 
      : null;
      
    if (!currentTeam) {
      console.error("No current team found for pick:", draftState.currentPick);
      return;
    }
    
    console.log("Current team on the clock:", currentTeam);
    console.log("Current team assigned to:", currentTeam.assignedTo);
    console.log("Local user ID:", localUserId);
    
    const userTeam = draftState.teams.find(team => team.assignedTo === localUserId);
    
    if (currentTeam.assignedTo !== localUserId && currentTeam.assignedTo !== userTeam?.assignedTo) {
      toast({
        title: "Não é sua vez",
        description: "Você só pode escolher quando for sua vez.",
        variant: "destructive"
      });
      console.log("Not user's turn. Current team assigned to:", currentTeam.assignedTo, "User ID/Name:", localUserId);
      return;
    }

    console.log("Making pick:", draftState.currentPick, playerId);
    makePickRealTime(draftState.currentPick, playerId);
  };

  const handleRandomize = (randomizedTeams: Team[]) => {
  };

  const handleTeamSelect = (userName: string, teamId: string) => {
    console.log(`Team selection: User ${userName} selected team ${teamId}`);
    
    if (localUserId) {
      localStorage.setItem('draftAppUserName', userName);
      selectTeam(userName, teamId);
    }
  };

  const handleStartDraft = () => {
    if (!draftState) return;
    
    if (draftState.teams.some(team => team.draftPosition === null)) {
      toast({
        title: "Times não sorteados",
        description: "Você precisa sortear a ordem dos times antes de iniciar o draft.",
        variant: "destructive"
      });
      return;
    }
    
    const picks = generateDraftOrder(draftState.teams, draftState.settings);
    
    const updatedDraftState: DraftState = {
      ...draftState,
      picks,
      currentPick: 0,
      status: DraftStatus.IN_PROGRESS
    };
    
    startDraftRealTime(updatedDraftState);
    
    setCurrentPickStartTime(new Date());
  };

  const handleResetDraft = () => {
    resetDraftRealTime();
    setCurrentPickStartTime(undefined);
  };

  const handlePauseDraft = () => {
    pauseDraftRealTime();
  };

  const handleResumeDraft = () => {
    resumeDraftRealTime();
    setCurrentPickStartTime(new Date());
  };

  const userTeam = draftState ? draftState.teams.find(team => 
    team.assignedTo === userId || team.assignedTo === localUserId
  ) : null;

  const currentTeam = draftState && draftState.currentPick < draftState.picks.length 
    ? draftState.picks[draftState.currentPick].team 
    : null;

  const isUserTurn = Boolean(
    (userId || localUserId) && 
    currentTeam && 
    (currentTeam.assignedTo === userId || currentTeam.assignedTo === localUserId)
  );

  const [showStickyInfo, setShowStickyInfo] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowStickyInfo(scrollY > 200);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showDraftBoard = draftState && (
    draftState.status === DraftStatus.IN_PROGRESS || 
    draftState.status === DraftStatus.PAUSED ||
    draftState.status === DraftStatus.COMPLETED ||
    (draftState.picks && draftState.picks.length > 0)
  );

  useEffect(() => {
    console.log("User ID:", userId);
    console.log("User team:", userTeam);
    console.log("Current team:", currentTeam);
    console.log("Is user's turn:", isUserTurn);
    console.log("Draft state:", draftState);
  }, [userId, userTeam, currentTeam, draftState]);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <ChampionsBanner />
        
        <div className="mt-6">
          <Navigation 
            draftStatus={draftState?.status || DraftStatus.NOT_STARTED}
            onStartDraft={handleStartDraft}
            onResetDraft={handleResetDraft}
            onPauseDraft={handlePauseDraft}
            onResumeDraft={handleResumeDraft}
          />
        </div>
        
        {showStickyInfo && currentTeam && draftState?.status === DraftStatus.IN_PROGRESS && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 flex justify-between items-center shadow-md">
            <div className="flex items-center">
              <span className="font-medium">Na Vez: </span>
              <span className="ml-2 font-bold text-lg">{currentTeam.name}</span>
              <span className="ml-4 text-sm opacity-80">
                Pick: {draftState.currentPick + 1} de {draftState.picks.length}
              </span>
              
              {isUserTurn && (
                <span className="ml-4 bg-yellow-400 text-blue-900 px-2 py-0.5 rounded-full text-xs font-bold animate-pulse flex items-center gap-1">
                  <AlertCircle size={12} />
                  É a sua vez!
                </span>
              )}
            </div>
            
            <div className="w-32 flex items-center gap-2">
              <Clock size={16} className="text-blue-200" />
              <Timer 
                key={`sticky-timer-${draftState.currentPick}`}
                initialSeconds={draftState.settings.timePerPick} 
                isRunning={draftState.status === DraftStatus.IN_PROGRESS}
                onComplete={handleTimerComplete}
                startTime={currentPickStartTime}
              />
            </div>
          </div>
        )}
        
        {(!userTeam && draftState && draftState.status === DraftStatus.NOT_STARTED) && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-3">
              <TeamSelection 
                teams={draftState.teams}
                onTeamSelect={handleTeamSelect}
                onStartDraft={handleStartDraft}
                onTeamsCountChange={handleTeamsCountChange}
              />
            </div>
          </div>
        )}
        
        {userId && draftState && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2 space-y-6">
              {draftState.status === DraftStatus.NOT_STARTED && (
                <div className="glass-card p-6 animate-fade-in">
                  <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
                    <Trophy size={20} className="text-amber-500" />
                    Seja bem-vindo{userTeam ? `, técnico do ${userTeam.name}` : ''}!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {userTeam ? `Você selecionou ${userTeam.name}. ` : ''}
                    Este draft utiliza um formato snake com {draftState.teams.length} times e {draftState.settings.numberOfRounds} rodadas. Antes de começar, você precisa sortear a ordem do draft.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                    <RandomizerButton
                      teams={draftState.teams}
                      onRandomize={handleRandomize}
                      disabled={draftState.status !== DraftStatus.NOT_STARTED}
                    />
                    
                    <button
                      onClick={handleStartDraft}
                      className="button-transition focus-ring px-4 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 flex items-center gap-2 shadow-md"
                      disabled={draftState.teams.some(team => team.draftPosition === null)}
                    >
                      <Play size={18} />
                      Iniciar Draft
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => setShowCsvUploader(!showCsvUploader)}
                      className="text-blue-600 hover:text-blue-800 underline text-sm flex items-center gap-1"
                    >
                      <FileText size={16} />
                      {showCsvUploader ? 'Esconder Upload CSV' : 'Importar Jogadores (CSV)'}
                    </button>
                    
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Users size={14} />
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
              
              {showDraftBoard && (
                <DraftBoard
                  picks={draftState.picks}
                  currentPick={draftState.currentPick}
                  isActive={draftState.status === DraftStatus.IN_PROGRESS}
                  timePerPick={draftState.settings.timePerPick}
                  onTimerComplete={handleTimerComplete}
                  startTime={currentPickStartTime}
                />
              )}
              
              {draftState.status === DraftStatus.IN_PROGRESS && (
                <PlayerList
                  players={draftState.availablePlayers}
                  onSelectPlayer={handleSelectPlayer}
                  disabled={draftState.status !== DraftStatus.IN_PROGRESS}
                  isUserTurn={isUserTurn}
                />
              )}
            </div>
            
            <div>
              {currentTeam && draftState.status === DraftStatus.IN_PROGRESS && (
                <div className="glass-card p-4 mb-6 animate-fade-in">
                  <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                    <Trophy size={18} className="text-yellow-500" />
                    Na Vez
                  </h3>
                  <div className="text-2xl font-semibold">{currentTeam.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Posição no Draft: {currentTeam.draftPosition}
                  </div>
                  <div className="text-sm text-gray-600">
                    Pick: {draftState.currentPick + 1} de {draftState.picks.length}
                  </div>
                  
                  {isUserTurn && (
                    <div className="mt-3 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-md text-sm font-medium border border-yellow-200 flex items-center gap-2">
                      <AlertCircle size={16} />
                      É a sua vez de escolher um jogador!
                    </div>
                  )}
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
