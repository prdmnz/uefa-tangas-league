import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { websocketService, WebSocketEvent } from '../services/websocketService';
import { DraftState, Team, Player, DraftStatus } from '../types';
import { toast } from '@/hooks/use-toast';

interface RealTimeContextState {
  isConnected: boolean;
  userId: string | null;
  draftState: DraftState | null;
  connectUser: (userId: string) => void;
  selectTeam: (userId: string, teamId: string) => void;
  startDraft: (draftState: DraftState) => void;
  makePick: (pickIndex: number, playerId: string) => void;
  randomizeTeams: (teams: Team[]) => void;
  uploadCsv: (players: Player[]) => void;
  resetDraft: () => void;
  pauseDraft: () => void;
  resumeDraft: () => void;
  disconnect: () => void;
}

const RealTimeContext = createContext<RealTimeContextState | undefined>(undefined);

// Reducer to manage shared state
type RealTimeAction =
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_USER_ID'; payload: string | null }
  | { type: 'SET_DRAFT_STATE'; payload: DraftState | null }
  | { type: 'UPDATE_TEAMS'; payload: Team[] }
  | { type: 'UPDATE_PLAYERS'; payload: Player[] }
  | { type: 'UPDATE_PICK'; payload: { pickIndex: number; playerId: string } }
  | { type: 'SET_DRAFT_STATUS'; payload: DraftStatus };

interface RealTimeState {
  isConnected: boolean;
  userId: string | null;
  draftState: DraftState | null;
}

const initialState: RealTimeState = {
  isConnected: false,
  userId: null,
  draftState: null,
};

function realTimeReducer(state: RealTimeState, action: RealTimeAction): RealTimeState {
  switch (action.type) {
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    case 'SET_USER_ID':
      return { ...state, userId: action.payload };
    case 'SET_DRAFT_STATE':
      return { ...state, draftState: action.payload };
    case 'UPDATE_TEAMS':
      if (!state.draftState) return state;
      return {
        ...state,
        draftState: {
          ...state.draftState,
          teams: action.payload,
        },
      };
    case 'UPDATE_PLAYERS':
      if (!state.draftState) return state;
      return {
        ...state,
        draftState: {
          ...state.draftState,
          availablePlayers: action.payload,
        },
      };
    case 'UPDATE_PICK':
      if (!state.draftState) return state;
      return state;
    case 'SET_DRAFT_STATUS':
      if (!state.draftState) return state;
      return {
        ...state,
        draftState: {
          ...state.draftState,
          status: action.payload,
        },
      };
    default:
      return state;
  }
}

export const RealTimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(realTimeReducer, initialState);

  const handleConnect = () => {
    dispatch({ type: 'SET_CONNECTED', payload: true });
    toast({
      title: 'Conectado',
      description: 'Você está conectado ao servidor em tempo real.',
    });
  };

  const handleDisconnect = () => {
    dispatch({ type: 'SET_CONNECTED', payload: false });
    toast({
      title: 'Desconectado',
      description: 'Você foi desconectado do servidor em tempo real.',
      variant: 'destructive',
    });
  };

  const handleReconnectFailed = () => {
    toast({
      title: 'Erro de Conexão',
      description: 'Não foi possível reconectar ao servidor após várias tentativas.',
      variant: 'destructive',
    });
  };

  useEffect(() => {
    websocketService.on('connect', handleConnect);
    websocketService.on('disconnect', handleDisconnect);
    websocketService.on('reconnect_failed', handleReconnectFailed);
    
    websocketService.on('TEAM_SELECTED', (payload: any) => {
      if (!state.draftState) return;
      
      toast({
        title: 'Time Selecionado',
        description: `Um usuário escolheu o time ${payload.teamId}`,
      });
      
      dispatch({ type: 'UPDATE_TEAMS', payload: payload.teams });
    });
    
    websocketService.on('DRAFT_STARTED', (payload: DraftState) => {
      dispatch({ type: 'SET_DRAFT_STATE', payload });
      
      toast({
        title: 'Draft Iniciado',
        description: 'O draft foi iniciado!',
      });
    });
    
    websocketService.on('PICK_MADE', (payload: any) => {
      dispatch({ 
        type: 'UPDATE_PICK', 
        payload: { 
          pickIndex: payload.pickIndex, 
          playerId: payload.playerId 
        } 
      });
      
      toast({
        title: 'Escolha Realizada',
        description: `Um jogador foi selecionado`,
      });
    });
    
    websocketService.on('TEAMS_RANDOMIZED', (payload: any) => {
      if (!state.draftState) return;
      
      dispatch({ type: 'UPDATE_TEAMS', payload: payload.teams });
      
      toast({
        title: 'Times Randomizados',
        description: 'A ordem do draft foi randomizada',
      });
    });
    
    websocketService.on('CSV_UPLOADED', (payload: any) => {
      if (!state.draftState) return;
      
      dispatch({ type: 'UPDATE_PLAYERS', payload: payload.players });
      
      toast({
        title: 'CSV Importado',
        description: `${payload.players.length} jogadores foram importados`,
      });
    });
    
    websocketService.on('DRAFT_RESET', () => {
      dispatch({ type: 'SET_DRAFT_STATE', payload: null });
      
      toast({
        title: 'Draft Resetado',
        description: 'O draft foi resetado',
      });
    });
    
    websocketService.on('DRAFT_PAUSED', () => {
      if (!state.draftState) return;
      
      dispatch({ type: 'SET_DRAFT_STATUS', payload: DraftStatus.PAUSED });
      
      toast({
        title: 'Draft Pausado',
        description: 'O draft foi pausado',
      });
    });
    
    websocketService.on('DRAFT_RESUMED', () => {
      if (!state.draftState) return;
      
      dispatch({ type: 'SET_DRAFT_STATUS', payload: DraftStatus.IN_PROGRESS });
      
      toast({
        title: 'Draft Retomado',
        description: 'O draft foi retomado',
      });
    });
    
    return () => {
      websocketService.off('connect', handleConnect);
      websocketService.off('disconnect', handleDisconnect);
      websocketService.off('reconnect_failed', handleReconnectFailed);
      websocketService.off('TEAM_SELECTED', () => {});
      websocketService.off('DRAFT_STARTED', () => {});
      websocketService.off('PICK_MADE', () => {});
      websocketService.off('TEAMS_RANDOMIZED', () => {});
      websocketService.off('CSV_UPLOADED', () => {});
      websocketService.off('DRAFT_RESET', () => {});
      websocketService.off('DRAFT_PAUSED', () => {});
      websocketService.off('DRAFT_RESUMED', () => {});
    };
  }, [state.draftState]);
  
  const connectUser = (userId: string) => {
    websocketService.connect(userId);
    dispatch({ type: 'SET_USER_ID', payload: userId });
    
    websocketService.sendEvent({
      type: 'CONNECT_USER',
      payload: { userId, userName: userId },
    });
  };
  
  const selectTeam = (userId: string, teamId: string) => {
    websocketService.sendEvent({
      type: 'TEAM_SELECTED',
      payload: { userId, teamId },
    });
  };
  
  const startDraft = (draftState: DraftState) => {
    websocketService.sendEvent({
      type: 'DRAFT_STARTED',
      payload: draftState,
    });
  };
  
  const makePick = (pickIndex: number, playerId: string) => {
    websocketService.sendEvent({
      type: 'PICK_MADE',
      payload: { pickIndex, playerId },
    });
  };
  
  const randomizeTeams = (teams: Team[]) => {
    websocketService.sendEvent({
      type: 'TEAMS_RANDOMIZED',
      payload: { teams },
    });
  };
  
  const uploadCsv = (players: Player[]) => {
    websocketService.sendEvent({
      type: 'CSV_UPLOADED',
      payload: { players },
    });
  };
  
  const resetDraft = () => {
    websocketService.sendEvent({
      type: 'DRAFT_RESET',
    });
  };
  
  const pauseDraft = () => {
    websocketService.sendEvent({
      type: 'DRAFT_PAUSED',
    });
  };
  
  const resumeDraft = () => {
    websocketService.sendEvent({
      type: 'DRAFT_RESUMED',
    });
  };
  
  const disconnect = () => {
    websocketService.disconnect();
    dispatch({ type: 'SET_CONNECTED', payload: false });
    dispatch({ type: 'SET_USER_ID', payload: null });
  };
  
  const value = {
    isConnected: state.isConnected,
    userId: state.userId,
    draftState: state.draftState,
    connectUser,
    selectTeam,
    startDraft,
    makePick,
    randomizeTeams,
    uploadCsv,
    resetDraft,
    pauseDraft,
    resumeDraft,
    disconnect,
  };
  
  return (
    <RealTimeContext.Provider value={value}>
      {children}
    </RealTimeContext.Provider>
  );
};

export const useRealTime = () => {
  const context = useContext(RealTimeContext);
  if (context === undefined) {
    throw new Error('useRealTime must be used within a RealTimeProvider');
  }
  return context;
};
