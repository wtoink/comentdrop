'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  fid: number;
  username: string;
  displayName: string;
  pfp: string;
  custodyAddress: string;
  verifiedAddresses: string[];
}

interface WalletContextType {
  user: User | null;
  isConnected: boolean;
  isLoading: boolean;
  connectWallet: () => void;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is already connected on mount
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const storedUser = localStorage.getItem('farcaster_user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const connectWallet = async () => {
    setIsLoading(true);
    try {
      // For now, we'll use a simple approach with Neynar's sign-in
      // In production, you might want to use a more robust wallet connection
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to connect wallet');
      }

      const userData = await response.json();
      setUser(userData);
      setIsConnected(true);
      localStorage.setItem('farcaster_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setUser(null);
    setIsConnected(false);
    localStorage.removeItem('farcaster_user');
  };

  return (
    <WalletContext.Provider
      value={{
        user,
        isConnected,
        isLoading,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}