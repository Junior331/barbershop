import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import type { UseWebSocketReturn } from '@/hooks/useWebSocket';

interface WebSocketContextType extends UseWebSocketReturn {}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider = ({ children }: WebSocketProviderProps) => {
  const webSocket = useWebSocket();

  // Log connection status for debugging
  useEffect(() => {
    if (webSocket.isConnected) {
      console.log('🔌 WebSocket Provider: Conectado');
    } else {
      console.log('🔌 WebSocket Provider: Desconectado');
    }
  }, [webSocket.isConnected]);

  return (
    <WebSocketContext.Provider value={webSocket}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);

  if (!context) {
    throw new Error('useWebSocketContext deve ser usado dentro de um WebSocketProvider');
  }

  return context;
};