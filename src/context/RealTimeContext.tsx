import React, { createContext, useContext, useEffect, useReducer, useState } from 'react';
import { websocketService, WebSocketEvent } from '../services/websocketService';
import { DraftState, Team, Player, DraftStatus, RealTimeState } from '../types';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

interface RealTimeReducerState {
  isConnected: boolean;
  userId: string | null;
  draftState: DraftState | null;
}

const initialState: RealTimeReducerState = {
  isConnected: false,
  userId: null,
  draftState: null,
};

function realTimeReducer(state: RealTimeReducerState, action: RealTimeAction): RealTimeReducerState {
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
  const [realTimeLoaded, setRealTimeLoaded] = useState(false);

  // Função para inicializar e carregar os dados do Supabase
  const initializeSupabaseData = async () => {
    try {
      // Carregar estado atual do draft
      const { data: draftStateData, error: draftStateError } = await supabase
        .from('draft_state')
        .select('*')
        .single();

      if (draftStateError) {
        console.error('Erro ao carregar estado do draft:', draftStateError);
        return;
      }

      // Carregar times
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .order('id');

      if (teamsError) {
        console.error('Erro ao carregar times:', teamsError);
        return;
      }

      // Carregar picks existentes
      const { data: picksData, error: picksError } = await supabase
        .from('draft_picks')
        .select('*')
        .order('overall');

      if (picksError) {
        console.error('Erro ao carregar picks:', picksError);
        return;
      }

      // Carregar jogadores de campo
      const { data: fieldPlayersData, error: fieldPlayersError } = await supabase
        .from('field_players')
        .select('*')
        .order('ovr', { ascending: false });

      if (fieldPlayersError) {
        console.error('Erro ao carregar jogadores de campo:', fieldPlayersError);
        return;
      }

      // Carregar goleiros
      const { data: goalkeepersData, error: goalkeepersError } = await supabase
        .from('goalkeepers')
        .select('*')
        .order('ovr', { ascending: false });

      if (goalkeepersError) {
        console.error('Erro ao carregar goleiros:', goalkeepersError);
        return;
      }

      // Converter dados para o formato esperado pela aplicação
      const teams = teamsData.map(team => ({
        id: team.id,
        name: team.name,
        draftPosition: team.draft_position,
        assignedTo: team.assigned_to,
        players: [] // Vamos preencher depois com base nos picks
      }));

      // Combinar jogadores de campo e goleiros
      const allPlayers = [
        ...fieldPlayersData.map(player => ({
          id: player.id,
          name: player.name,
          position: player.position,
          team: player.team,
          ovr: player.ovr,
          height: player.height,
          weight: player.weight,
          skillMoves: player.skill_moves,
          stats: {
            pace: player.pace,
            shooting: player.shooting,
            passing: player.passing,
            dribbling: player.dribbling,
            defense: player.defense,
            physical: player.physical
          }
        })),
        ...goalkeepersData.map(player => ({
          id: player.id,
          name: player.name,
          position: player.position,
          team: player.team,
          ovr: player.ovr,
          height: player.height,
          weight: player.weight,
          stats: {
            elasticity: player.elasticity,
            handling: player.handling,
            shooting: player.shooting,
            reflexes: player.reflexes,
            speed: player.speed,
            positioning: player.positioning
          }
        }))
      ];

      // Processar picks e atualizar times com jogadores escolhidos
      const picks = picksData.map(pick => {
        const team = teams.find(t => t.id === pick.team_id) || teams[0];
        const player = pick.player_id ? allPlayers.find(p => p.id === pick.player_id) || null : null;
        
        // Adicionar jogador ao time se ele existir
        if (player && team) {
          const teamIndex = teams.findIndex(t => t.id === team.id);
          if (teamIndex !== -1) {
            if (!teams[teamIndex].players) {
              teams[teamIndex].players = [];
            }
            
            teams[teamIndex].players.push({
              player,
              pickNumber: pick.overall,
              round: pick.round
            });
          }
        }
        
        return {
          overall: pick.overall,
          round: pick.round,
          pickInRound: pick.pick_in_round,
          team,
          player,
          timeStamp: pick.timestamp ? new Date(pick.timestamp) : undefined
        };
      });

      // Construir estado do draft
      const draftState: DraftState = {
        settings: {
          numberOfTeams: teams.length,
          numberOfRounds: draftStateData.number_of_rounds,
          timePerPick: draftStateData.time_per_pick,
          snakeFormat: draftStateData.snake_format
        },
        teams,
        picks,
        availablePlayers: allPlayers.filter(player => 
          !picks.some(pick => pick.player && pick.player.id === player.id)
        ),
        currentPick: draftStateData.current_pick,
        status: draftStateData.status as DraftStatus
      };

      dispatch({ type: 'SET_DRAFT_STATE', payload: draftState });
      setRealTimeLoaded(true);
    } catch (error) {
      console.error('Erro ao inicializar dados do Supabase:', error);
    }
  };

  // Configurar ouvintes do Supabase
  useEffect(() => {
    // Inicializar dados
    initializeSupabaseData();
    
    // Configura canais Realtime para atualização em tempo real
    const teamsChannel = supabase
      .channel('public:teams')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'teams' }, 
        (payload) => {
          console.log('Teams changed:', payload);
          // Recarregar times quando houver mudanças
          initializeSupabaseData();
        }
      )
      .subscribe();
    
    const draftStateChannel = supabase
      .channel('public:draft_state')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'draft_state' }, 
        (payload) => {
          console.log('Draft state changed:', payload);
          // Recarregar estado do draft quando houver mudanças
          initializeSupabaseData();
        }
      )
      .subscribe();

    const draftPicksChannel = supabase
      .channel('public:draft_picks')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'draft_picks' }, 
        (payload) => {
          console.log('Draft picks changed:', payload);
          // Recarregar picks quando houver mudanças
          initializeSupabaseData();
        }
      )
      .subscribe();

    const playersChannel = supabase
      .channel('public:players')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'field_players' }, 
        (payload) => {
          console.log('Field players changed:', payload);
          // Recarregar jogadores quando houver mudanças
          initializeSupabaseData();
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'goalkeepers' },
        (payload) => {
          console.log('Goalkeepers changed:', payload);
          // Recarregar jogadores quando houver mudanças
          initializeSupabaseData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(teamsChannel);
      supabase.removeChannel(draftStateChannel);
      supabase.removeChannel(draftPicksChannel);
      supabase.removeChannel(playersChannel);
    };
  }, []);

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
  
  // Métodos para interagir com o Supabase
  const connectUser = async (userId: string) => {
    try {
      // Registrar usuário conectado
      const { data, error } = await supabase
        .from('connected_users')
        .upsert({ 
          user_id: userId, 
          user_name: userId,
          last_active: new Date().toISOString() 
        }, 
        { onConflict: 'user_id' });

      if (error) {
        console.error('Erro ao conectar usuário:', error);
        return;
      }
      
      dispatch({ type: 'SET_USER_ID', payload: userId });
      
      toast({
        title: 'Conectado',
        description: `Bem-vindo, ${userId}!`,
      });
    } catch (error) {
      console.error('Erro ao conectar usuário:', error);
    }
  };
  
  const selectTeam = async (userId: string, teamId: string) => {
    try {
      // Atualizar time selecionado
      const { error } = await supabase
        .from('teams')
        .update({ assigned_to: userId })
        .eq('id', teamId);
      
      if (error) {
        console.error('Erro ao selecionar time:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível selecionar o time.',
          variant: 'destructive'
        });
        return;
      }
      
      toast({
        title: 'Time Selecionado',
        description: `Você selecionou o time com ID ${teamId}`,
      });
    } catch (error) {
      console.error('Erro ao selecionar time:', error);
    }
  };
  
  const startDraft = async (draftState: DraftState) => {
    try {
      // Atualizar estado do draft
      const { error } = await supabase
        .from('draft_state')
        .update({ 
          status: DraftStatus.IN_PROGRESS,
          current_pick: 0,
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Erro ao iniciar draft:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível iniciar o draft.',
          variant: 'destructive'
        });
        return;
      }

      // Limpar picks anteriores se houver
      await supabase.from('draft_picks').delete().neq('id', 'placeholder');

      // Criar novos picks
      for (const pick of draftState.picks) {
        await supabase.from('draft_picks').insert({
          overall: pick.overall,
          round: pick.round,
          pick_in_round: pick.pickInRound,
          team_id: pick.team.id,
          player_id: pick.player?.id || null
        });
      }
      
      toast({
        title: 'Draft Iniciado',
        description: 'O draft foi iniciado com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao iniciar draft:', error);
    }
  };
  
  const makePick = async (pickIndex: number, playerId: string) => {
    try {
      if (!state.draftState || pickIndex >= state.draftState.picks.length) {
        return;
      }
      
      const pick = state.draftState.picks[pickIndex];
      
      // Atualizar pick no banco
      const { error } = await supabase
        .from('draft_picks')
        .update({ 
          player_id: playerId,
          timestamp: new Date().toISOString()
        })
        .eq('overall', pick.overall);
      
      if (error) {
        console.error('Erro ao fazer pick:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível selecionar o jogador.',
          variant: 'destructive'
        });
        return;
      }
      
      // Atualizar current_pick no estado do draft
      await supabase
        .from('draft_state')
        .update({ 
          current_pick: pickIndex + 1,
          status: pickIndex + 1 >= state.draftState.picks.length 
            ? DraftStatus.COMPLETED 
            : DraftStatus.IN_PROGRESS
        });
      
      toast({
        title: 'Jogador Selecionado',
        description: 'Sua escolha foi registrada!',
      });
    } catch (error) {
      console.error('Erro ao fazer pick:', error);
    }
  };
  
  const randomizeTeams = async (teams: Team[]) => {
    try {
      // Atualizar posições no draft
      for (const team of teams) {
        await supabase
          .from('teams')
          .update({ draft_position: team.draftPosition })
          .eq('id', team.id);
      }
      
      toast({
        title: 'Times Randomizados',
        description: 'A ordem do draft foi randomizada com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao randomizar times:', error);
    }
  };
  
  const processPlayers = async (players: Player[]) => {
    try {
      // Limpar jogadores existentes
      await supabase.from('field_players').delete().neq('id', 'placeholder');
      await supabase.from('goalkeepers').delete().neq('id', 'placeholder');
      
      // Inserir novos jogadores
      for (const player of players) {
        if (player.position === 'GK') {
          const { elasticity, handling, shooting, reflexes, speed, positioning } = 
            player.stats as { elasticity: number, handling: number, shooting: number, reflexes: number, speed: number, positioning: number };
          
          await supabase.from('goalkeepers').insert({
            id: player.id,
            name: player.name,
            position: player.position,
            team: player.team,
            ovr: player.ovr,
            height: player.height || null,
            weight: player.weight || null,
            elasticity,
            handling,
            shooting,
            reflexes,
            speed,
            positioning
          });
        } else {
          const { pace, shooting, passing, dribbling, defense, physical } = 
            player.stats as { pace: number, shooting: number, passing: number, dribbling: number, defense: number, physical: number };
          
          await supabase.from('field_players').insert({
            id: player.id,
            name: player.name,
            position: player.position,
            team: player.team,
            ovr: player.ovr,
            height: player.height || null,
            weight: player.weight || null,
            skill_moves: player.skillMoves || null,
            pace,
            shooting,
            passing,
            dribbling,
            defense,
            physical
          });
        }
      }
    } catch (error) {
      console.error('Erro ao processar jogadores:', error);
    }
  };
  
  const uploadCsv = async (players: Player[]) => {
    try {
      await processPlayers(players);
      
      toast({
        title: 'CSV Importado',
        description: `${players.length} jogadores foram importados com sucesso!`,
      });
    } catch (error) {
      console.error('Erro ao importar CSV:', error);
    }
  };
  
  const resetDraft = async () => {
    try {
      // Resetar estado do draft
      await supabase
        .from('draft_state')
        .update({ 
          status: DraftStatus.NOT_STARTED,
          current_pick: 0,
          updated_at: new Date().toISOString()
        });
      
      // Limpar picks
      await supabase.from('draft_picks').delete().neq('id', 'placeholder');
      
      // Resetar posições dos times e limpar assignments
      await supabase
        .from('teams')
        .update({ 
          draft_position: null
        });
      
      toast({
        title: 'Draft Resetado',
        description: 'O draft foi resetado com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao resetar draft:', error);
    }
  };
  
  const pauseDraft = async () => {
    try {
      // Pausar draft
      const { error } = await supabase
        .from('draft_state')
        .update({ 
          status: DraftStatus.PAUSED,
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Erro ao pausar draft:', error);
        return;
      }
      
      toast({
        title: 'Draft Pausado',
        description: 'O draft foi pausado com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao pausar draft:', error);
    }
  };
  
  const resumeDraft = async () => {
    try {
      // Retomar draft
      const { error } = await supabase
        .from('draft_state')
        .update({ 
          status: DraftStatus.IN_PROGRESS,
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Erro ao retomar draft:', error);
        return;
      }
      
      toast({
        title: 'Draft Retomado',
        description: 'O draft foi retomado com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao retomar draft:', error);
    }
  };
  
  const disconnect = async () => {
    if (state.userId) {
      // Atualizar status do usuário para inativo
      await supabase
        .from('connected_users')
        .update({ last_active: new Date().toISOString() })
        .eq('user_id', state.userId);
    }
    
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
