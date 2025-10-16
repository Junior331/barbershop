import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { logger } from '@/utils/logger';

// Declaração de tipos para o SDK do MercadoPago (global)
declare global {
  interface Window {
    MercadoPago: any;
  }
}

interface MercadoPagoContextType {
  mp: any | null;
  deviceId: string | null;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
}

const MercadoPagoContext = createContext<MercadoPagoContextType>({
  mp: null,
  deviceId: null,
  isLoading: true,
  error: null,
  initialized: false,
});

export const useMercadoPago = () => {
  const context = useContext(MercadoPagoContext);
  if (!context) {
    throw new Error('useMercadoPago must be used within MercadoPagoProvider');
  }
  return context;
};

interface MercadoPagoProviderProps {
  children: ReactNode;
  publicKey?: string;
}

export const MercadoPagoProvider: React.FC<MercadoPagoProviderProps> = ({
  children,
  publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY,
}) => {
  const [mp, setMp] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // ✅ Don't initialize if public key is missing or placeholder
    if (!publicKey || publicKey === 'TEST-placeholder' || publicKey.includes('placeholder')) {
      logger.warn('⚠️ MercadoPago public key not configured. Card payments will not work.');
      setIsLoading(false);
      setError('MercadoPago não configurado');
      return;
    }

    const initializeMercadoPago = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Aguardar SDK carregar
        let attempts = 0;
        const maxAttempts = 50; // 5 segundos (50 * 100ms)

        while (!window.MercadoPago && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (!window.MercadoPago) {
          throw new Error('MercadoPago SDK não carregou. Verifique sua conexão com a internet.');
        }

        // Inicializar MercadoPago
        const mercadopago = new window.MercadoPago(publicKey, {
          locale: 'pt-BR',
        });

        setMp(mercadopago);

        // Gerar Device ID para fingerprinting (segurança antifraude)
        try {
          const generatedDeviceId = await generateDeviceId();
          setDeviceId(generatedDeviceId);
          logger.info('✅ MercadoPago SDK initialized successfully', {
            deviceId: generatedDeviceId,
            publicKey: publicKey.substring(0, 10) + '...',
          });
        } catch (deviceError) {
          logger.warn('⚠️ Device ID generation failed, continuing without it', deviceError);
          // Não bloquear o fluxo se device ID falhar
        }

        setInitialized(true);
      } catch (err: any) {
        const errorMessage = err.message || 'Erro ao inicializar MercadoPago';
        setError(errorMessage);
        logger.error('❌ MercadoPago initialization failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeMercadoPago();
  }, [publicKey]);

  // Função para gerar Device ID (fingerprinting)
  const generateDeviceId = async (): Promise<string> => {
    try {
      // Método 1: Usar getIdentificationTypes (mais confiável)
      if (mp && typeof mp.getIdentificationTypes === 'function') {
        await mp.getIdentificationTypes();
      }

      // Gerar device ID baseado em características do browser
      const deviceData = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timestamp: Date.now(),
      };

      // Criar hash simples do device
      const deviceString = JSON.stringify(deviceData);
      const deviceHash = await hashString(deviceString);

      return `device_${deviceHash}`;
    } catch (error) {
      logger.warn('Device ID generation error:', error);
      // Fallback: gerar ID aleatório
      return `device_${Math.random().toString(36).substring(2, 15)}`;
    }
  };

  // Função auxiliar para criar hash
  const hashString = async (str: string): Promise<string> => {
    if (typeof window.crypto.subtle !== 'undefined') {
      const encoder = new TextEncoder();
      const data = encoder.encode(str);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
    } else {
      // Fallback para browsers mais antigos
      return Math.random().toString(36).substring(2, 15);
    }
  };

  const value: MercadoPagoContextType = {
    mp,
    deviceId,
    isLoading,
    error,
    initialized,
  };

  return (
    <MercadoPagoContext.Provider value={value}>
      {children}
    </MercadoPagoContext.Provider>
  );
};
