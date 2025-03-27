
import { io, Socket } from 'socket.io-client';
import { Player, Team, DraftState } from '../types';

// Tipos de eventos que podem ser enviados/recebidos
export type WebSocketEvent = 
  | { type: 'CONNECT_USER'; payload: { userId: string; userName: string; } }
  | { type: 'TEAM_SELECTED'; payload: { userId: string; teamId: string; } }
  | { type: 'DRAFT_STARTED'; payload: DraftState }
  | { type: 'PICK_MADE'; payload: { pickIndex: number; playerId: string; } }
  | { type: 'TEAMS_RANDOMIZED'; payload: { teams: Team[] } }
  | { type: 'CSV_UPLOADED'; payload: { players: Player[] } }
  | { type: 'DRAFT_RESET' }
  | { type: 'DRAFT_PAUSED' }
  | { type: 'DRAFT_RESUMED' };

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  // Iniciar conexão WebSocket
  connect(userId: string): void {
    if (this.socket) return;
    
    // Substitua pela URL do seu servidor WebSocket em produção
    const serverUrl = import.meta.env.VITE_WEBSOCKET_URL || 'https://your-websocket-server.com';
    
    this.socket = io(serverUrl, {
      query: { userId },
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
    });
    
    this.setupEventListeners();
  }
  
  private setupEventListeners(): void {
    if (!this.socket) return;
    
    this.socket.on('connect', () => {
      console.log('WebSocket connected!');
      this.reconnectAttempts = 0;
      this.notifyListeners('connect', {});
    });
    
    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected!');
      this.notifyListeners('disconnect', {});
    });
    
    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.notifyListeners('error', error);
    });
    
    this.socket.on('message', (message: WebSocketEvent) => {
      this.notifyListeners(message.type, message.payload);
    });
    
    this.socket.on('reconnect_attempt', (attempt) => {
      this.reconnectAttempts = attempt;
      console.log(`Reconnection attempt ${attempt} of ${this.maxReconnectAttempts}`);
    });
    
    this.socket.on('reconnect_failed', () => {
      console.error('Failed to reconnect to WebSocket server after multiple attempts');
      this.notifyListeners('reconnect_failed', {});
    });
  }
  
  // Enviar evento para o servidor
  sendEvent(event: WebSocketEvent): void {
    if (!this.socket) {
      console.error('Cannot send event: WebSocket not connected');
      return;
    }
    
    this.socket.emit('message', event);
  }
  
  // Adicionar listener para um evento específico
  on(eventType: string, callback: Function): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    
    this.listeners.get(eventType)?.push(callback);
  }
  
  // Remover listener
  off(eventType: string, callback: Function): void {
    if (!this.listeners.has(eventType)) return;
    
    const eventListeners = this.listeners.get(eventType) || [];
    const index = eventListeners.indexOf(callback);
    
    if (index !== -1) {
      eventListeners.splice(index, 1);
      this.listeners.set(eventType, eventListeners);
    }
  }
  
  // Notificar todos os listeners de um evento
  private notifyListeners(eventType: string, data: any): void {
    if (!this.listeners.has(eventType)) return;
    
    this.listeners.get(eventType)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${eventType} listener:`, error);
      }
    });
  }
  
  // Desconectar WebSocket
  disconnect(): void {
    if (!this.socket) return;
    
    this.socket.disconnect();
    this.socket = null;
    this.listeners.clear();
  }
}

// Exportar uma instância singleton do serviço
export const websocketService = new WebSocketService();
