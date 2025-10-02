import { MarketUpdate, OptionChainData } from '../types';

// WebSocket message types
export interface WSMessage {
  type: string;
  data?: any;
  timestamp?: number;
}

export interface WSSubscriptionMessage extends WSMessage {
  type: 'subscribe' | 'unsubscribe';
  symbols: string[];
  dataType: 'stock_prices' | 'option_chain' | 'all';
}

export interface WSPriceUpdateMessage extends WSMessage {
  type: 'price_update';
  data: {
    updates: MarketUpdate[];
  };
}

export interface WSOptionChainMessage extends WSMessage {
  type: 'option_chain_update';
  data: {
    underlying: string;
    optionChain: OptionChainData;
  };
}

export interface WSErrorMessage extends WSMessage {
  type: 'error';
  data: {
    code: string;
    message: string;
  };
}

export interface WSHeartbeatMessage extends WSMessage {
  type: 'heartbeat';
  data: {
    timestamp: number;
  };
}

// Connection states
export type WSConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

// Event handlers
export interface WSEventHandlers {
  onConnect?: () => void;
  onDisconnect?: (code: number, reason: string) => void;
  onError?: (error: Event) => void;
  onPriceUpdate?: (updates: MarketUpdate[]) => void;
  onOptionChainUpdate?: (underlying: string, data: OptionChainData) => void;
  onConnectionStateChange?: (state: WSConnectionState) => void;
  onMessage?: (message: WSMessage) => void;
}

// WebSocket configuration
export interface WSConfig {
  url: string;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
  connectionTimeout?: number;
  enableHeartbeat?: boolean;
}

/**
 * WebSocket service for real-time market data
 * Handles connection management, reconnection, and message routing
 */
export class WebSocketService {
  private ws: WebSocket | null = null;
  private config: Required<WSConfig>;
  private handlers: WSEventHandlers = {};
  private connectionState: WSConnectionState = 'disconnected';
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private connectionTimer: NodeJS.Timeout | null = null;
  private subscriptions = new Set<string>();
  private lastHeartbeat = 0;
  private isDestroyed = false;

  constructor(config: WSConfig, handlers: WSEventHandlers = {}) {
    this.config = {
      reconnectAttempts: 5,
      reconnectDelay: 1000,
      heartbeatInterval: 30000, // 30 seconds
      connectionTimeout: 10000, // 10 seconds
      enableHeartbeat: true,
      ...config
    };
    this.handlers = handlers;
  }

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isDestroyed) {
        reject(new Error('WebSocket service has been destroyed'));
        return;
      }

      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      this.setConnectionState('connecting');
      this.clearTimers();

      try {
        this.ws = new WebSocket(this.config.url);
        
        // Set connection timeout
        this.connectionTimer = setTimeout(() => {
          if (this.ws?.readyState === WebSocket.CONNECTING) {
            this.ws.close();
            reject(new Error('Connection timeout'));
          }
        }, this.config.connectionTimeout);

        this.ws.onopen = () => {
          this.clearTimers();
          this.setConnectionState('connected');
          this.reconnectAttempts = 0;
          this.lastHeartbeat = Date.now();
          
          // Start heartbeat if enabled
          if (this.config.enableHeartbeat) {
            this.startHeartbeat();
          }
          
          // Resubscribe to all active subscriptions
          this.resubscribeAll();
          
          this.handlers.onConnect?.();
          resolve();
        };

        this.ws.onclose = (event) => {
          this.clearTimers();
          this.ws = null;
          
          const wasConnected = this.connectionState === 'connected';
          this.setConnectionState('disconnected');
          
          this.handlers.onDisconnect?.(event.code, event.reason);
          
          // Attempt reconnection if not intentionally closed and not destroyed
          if (event.code !== 1000 && !this.isDestroyed && wasConnected) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          this.clearTimers();
          this.setConnectionState('error');
          this.handlers.onError?.(error);
          
          if (this.connectionState === 'connecting') {
            reject(error);
          }
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WSMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

      } catch (error) {
        this.setConnectionState('error');
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.clearTimers();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    this.setConnectionState('disconnected');
    this.subscriptions.clear();
  }

  /**
   * Subscribe to market data for specific symbols
   */
  subscribe(symbols: string[], dataType: 'stock_prices' | 'option_chain' | 'all' = 'all'): void {
    // Add to local subscriptions
    symbols.forEach(symbol => this.subscriptions.add(symbol));
    
    // Send subscription message if connected
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendMessage({
        type: 'subscribe',
        symbols,
        dataType,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Unsubscribe from market data for specific symbols
   */
  unsubscribe(symbols: string[], dataType: 'stock_prices' | 'option_chain' | 'all' = 'all'): void {
    // Remove from local subscriptions
    symbols.forEach(symbol => this.subscriptions.delete(symbol));
    
    // Send unsubscription message if connected
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendMessage({
        type: 'unsubscribe',
        symbols,
        dataType,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Send a message to the WebSocket server
   */
  sendMessage(message: WSMessage): boolean {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      console.warn('Cannot send message: WebSocket not connected');
      return false;
    }

    try {
      this.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
      return false;
    }
  }

  /**
   * Get current connection state
   */
  getConnectionState(): WSConnectionState {
    return this.connectionState;
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.connectionState === 'connected' && this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Update event handlers
   */
  setHandlers(handlers: Partial<WSEventHandlers>): void {
    this.handlers = { ...this.handlers, ...handlers };
  }

  /**
   * Get current subscriptions
   */
  getSubscriptions(): string[] {
    return Array.from(this.subscriptions);
  }

  /**
   * Destroy the WebSocket service
   */
  destroy(): void {
    this.isDestroyed = true;
    this.disconnect();
    this.handlers = {};
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: WSMessage): void {
    // Update last heartbeat time for any message
    this.lastHeartbeat = Date.now();
    
    // Call generic message handler
    this.handlers.onMessage?.(message);

    switch (message.type) {
      case 'price_update':
        const priceMessage = message as WSPriceUpdateMessage;
        if (priceMessage.data?.updates) {
          this.handlers.onPriceUpdate?.(priceMessage.data.updates);
        }
        break;

      case 'option_chain_update':
        const optionMessage = message as WSOptionChainMessage;
        if (optionMessage.data?.underlying && optionMessage.data?.optionChain) {
          this.handlers.onOptionChainUpdate?.(
            optionMessage.data.underlying,
            optionMessage.data.optionChain
          );
        }
        break;

      case 'error':
        const errorMessage = message as WSErrorMessage;
        console.error('WebSocket error:', errorMessage.data);
        break;

      case 'heartbeat':
        // Respond to server heartbeat
        this.sendMessage({
          type: 'heartbeat_response',
          timestamp: Date.now()
        });
        break;

      case 'subscription_confirmed':
        console.log('Subscription confirmed:', message.data);
        break;

      case 'subscription_error':
        console.error('Subscription error:', message.data);
        break;

      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  /**
   * Set connection state and notify handlers
   */
  private setConnectionState(state: WSConnectionState): void {
    if (this.connectionState !== state) {
      this.connectionState = state;
      this.handlers.onConnectionStateChange?.(state);
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.reconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.setConnectionState('error');
      return;
    }

    this.setConnectionState('reconnecting');
    this.reconnectAttempts++;
    
    const delay = Math.min(
      this.config.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      30000 // Max 30 seconds
    );

    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);

    this.reconnectTimer = setTimeout(() => {
      if (!this.isDestroyed) {
        this.connect().catch(error => {
          console.error('Reconnection failed:', error);
          this.scheduleReconnect();
        });
      }
    }, delay);
  }

  /**
   * Start heartbeat mechanism
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        // Check if we've received any message recently
        const timeSinceLastHeartbeat = Date.now() - this.lastHeartbeat;
        
        if (timeSinceLastHeartbeat > this.config.heartbeatInterval * 2) {
          // No heartbeat received, connection might be dead
          console.warn('No heartbeat received, closing connection');
          this.ws.close();
          return;
        }

        // Send heartbeat
        this.sendMessage({
          type: 'heartbeat',
          timestamp: Date.now()
        });
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Resubscribe to all active subscriptions
   */
  private resubscribeAll(): void {
    if (this.subscriptions.size > 0) {
      const symbols = Array.from(this.subscriptions);
      this.subscribe(symbols);
    }
  }

  /**
   * Clear all timers
   */
  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = null;
    }
  }
}

/**
 * Factory function to create WebSocket service with default configuration
 */
export function createWebSocketService(
  url?: string,
  handlers?: WSEventHandlers
): WebSocketService {
  const defaultUrl = process.env.VITE_WS_URL || 'wss://api.example.com/market-data';
  
  return new WebSocketService(
    {
      url: url || defaultUrl,
      reconnectAttempts: 5,
      reconnectDelay: 1000,
      heartbeatInterval: 30000,
      connectionTimeout: 10000,
      enableHeartbeat: true
    },
    handlers
  );
}

export default WebSocketService;