
import { io, Socket } from 'socket.io-client';
import { Player, Team, DraftState } from '../types';

// Types of events that can be sent/received
export type WebSocketEvent = 
  | { type: 'CONNECT_USER'; payload: { userId: string; userName: string; } }
  | { type: 'TEAM_SELECTED'; payload: { userId: string; teamId: string; } }
  | { type: 'DRAFT_STARTED'; payload: DraftState }
  | { type: 'PICK_MADE'; payload: { pickIndex: number; playerId: string; timestamp: Date; } }
  | { type: 'TEAMS_RANDOMIZED'; payload: { teams: Team[] } }
  | { type: 'CSV_UPLOADED'; payload: { players: Player[] } }
  | { type: 'DRAFT_RESET'; payload?: null }
  | { type: 'DRAFT_PAUSED'; payload?: null }
  | { type: 'DRAFT_RESUMED'; payload: { timestamp: Date } };

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'reconnecting' = 'disconnected';
  
  // Start WebSocket connection
  connect(userId: string): void {
    if (this.socket) return;
    
    this.connectionStatus = 'connecting';
    console.log(`[WebSocket] Initializing connection for user ${userId}...`);
    
    // Get the WebSocket server URL from environment variables or use default
    const serverUrl = import.meta.env.VITE_WEBSOCKET_URL || 'https://your-websocket-server.com';
    
    this.socket = io(serverUrl, {
      query: { userId },
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      timeout: 10000,
    });
    
    this.setupEventListeners();
  }
  
  private setupEventListeners(): void {
    if (!this.socket) return;
    
    this.socket.on('connect', () => {
      console.log('[WebSocket] Connected successfully!');
      this.connectionStatus = 'connected';
      this.reconnectAttempts = 0;
      this.notifyListeners('connect', {});
    });
    
    this.socket.on('disconnect', (reason) => {
      console.log(`[WebSocket] Disconnected! Reason: ${reason}`);
      this.connectionStatus = 'disconnected';
      this.notifyListeners('disconnect', { reason });
    });
    
    this.socket.on('error', (error) => {
      console.error('[WebSocket] Connection error:', error);
      this.notifyListeners('error', error);
    });
    
    this.socket.on('message', (message: WebSocketEvent) => {
      console.log(`[WebSocket] Received event: ${message.type}`, message.payload);
      this.notifyListeners(message.type, message.payload || {});
    });
    
    this.socket.on('reconnect_attempt', (attempt) => {
      this.reconnectAttempts = attempt;
      this.connectionStatus = 'reconnecting';
      console.log(`[WebSocket] Reconnection attempt ${attempt} of ${this.maxReconnectAttempts}`);
      this.notifyListeners('reconnect_attempt', { attempt });
    });
    
    this.socket.on('reconnect_failed', () => {
      console.error('[WebSocket] Failed to reconnect after multiple attempts');
      this.connectionStatus = 'disconnected';
      this.notifyListeners('reconnect_failed', {});
    });
    
    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`[WebSocket] Successfully reconnected after ${attemptNumber} attempts`);
      this.connectionStatus = 'connected';
      this.notifyListeners('reconnect', { attemptNumber });
    });
  }
  
  // Get current connection status
  getStatus(): string {
    return this.connectionStatus;
  }
  
  // Send event to server
  sendEvent(event: WebSocketEvent): void {
    if (!this.socket) {
      console.error('[WebSocket] Cannot send event: WebSocket not connected');
      return;
    }
    
    console.log(`[WebSocket] Sending event: ${event.type}`, event.payload);
    this.socket.emit('message', event);
  }
  
  // Add listener for specific event
  on(eventType: string, callback: Function): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    
    this.listeners.get(eventType)?.push(callback);
    console.log(`[WebSocket] Added listener for event: ${eventType}`);
  }
  
  // Remove listener
  off(eventType: string, callback: Function): void {
    if (!this.listeners.has(eventType)) return;
    
    const eventListeners = this.listeners.get(eventType) || [];
    const index = eventListeners.indexOf(callback);
    
    if (index !== -1) {
      eventListeners.splice(index, 1);
      this.listeners.set(eventType, eventListeners);
      console.log(`[WebSocket] Removed listener for event: ${eventType}`);
    }
  }
  
  // Notify all listeners for an event
  private notifyListeners(eventType: string, data: any): void {
    if (!this.listeners.has(eventType)) return;
    
    this.listeners.get(eventType)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[WebSocket] Error in ${eventType} listener:`, error);
      }
    });
  }
  
  // Disconnect WebSocket
  disconnect(): void {
    if (!this.socket) return;
    
    console.log('[WebSocket] Disconnecting...');
    this.socket.disconnect();
    this.socket = null;
    this.listeners.clear();
    this.connectionStatus = 'disconnected';
  }
  
  // Force reconnection
  reconnect(): void {
    if (!this.socket) return;
    
    console.log('[WebSocket] Forcing reconnection...');
    this.socket.connect();
  }
}

// Export a singleton instance of the service
export const websocketService = new WebSocketService();
