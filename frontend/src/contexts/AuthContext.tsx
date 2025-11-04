"use client"
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Identity } from '@dfinity/agent';

interface AuthContextType {
  authClient: AuthClient | undefined;
  isAuthenticated: boolean;
  identity: Identity | undefined;
  principal: string | undefined;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authClient, setAuthClient] = useState<AuthClient>();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [identity, setIdentity] = useState<Identity>();
  const [principal, setPrincipal] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  // Check if we're on mainnet by looking at the URL
  const isMainnet = () => {
    if (typeof window === 'undefined') return false;
    const hostname = window.location.hostname;
    return hostname.includes('.ic0.app') || hostname.includes('.icp0.io') || hostname.includes('.raw.icp0.io');
  };

  // Get frontend canister ID dynamically
  const getFrontendCanisterId = () => {
    return process.env.NEXT_PUBLIC_CANISTER_ID_FRONTEND || 
           process.env.CANISTER_ID_FRONTEND || 
           '5kykv-2qaaa-aaaas-qcs6q-cai';
  };

  // Canonical origin for derivation (mainnet frontend canister)
  const getCanonicalOrigin = () => {
    if (isMainnet()) {
      return `https://${getFrontendCanisterId()}.icp0.io`;
    }
    return undefined; // No derivation origin for local development
  };

  // Determine the identity provider based on environment
  const getIdentityProvider = () => {
    // Check if we're on mainnet (production)
    if (isMainnet()) {
      return 'https://id.ai/'; // Internet Identity V2
    }
    // Local development - use the Internet Identity canister ID from dfx.json
    const iiCanisterId = process.env.NEXT_PUBLIC_CANISTER_ID_INTERNET_IDENTITY || 
                        process.env.CANISTER_ID_INTERNET_IDENTITY || 
                        'rdmx6-jaaaa-aaaaa-aaadq-cai';
    return `http://${iiCanisterId}.localhost:4943`;
  };

  // Initialize auth client
  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      const client = await AuthClient.create();
      setAuthClient(client);
      
      const authenticated = await client.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        const identity = client.getIdentity();
        setIdentity(identity);
        setPrincipal(identity.getPrincipal().toString());
      }
    } catch (error) {
      console.error('Failed to initialize auth client:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    if (!authClient) {
      console.error('Auth client not initialized');
      return;
    }

    try {
      const derivationOrigin = getCanonicalOrigin();
      const loginOptions: any = {
        identityProvider: getIdentityProvider(),
        // Session lasts for 7 days
        maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000),
        onSuccess: async () => {
          const authenticated = await authClient.isAuthenticated();
          setIsAuthenticated(authenticated);

          if (authenticated) {
            const identity = authClient.getIdentity();
            setIdentity(identity);
            const principalId = identity.getPrincipal().toString();
            setPrincipal(principalId);
            console.log('Login successful. Principal:', principalId);
          }
        },
        onError: (error?: string) => {
          console.error('Login failed:', error);
        },
      };

      // Add derivationOrigin only for mainnet
      if (derivationOrigin) {
        loginOptions.derivationOrigin = derivationOrigin;
      }

      await authClient.login(loginOptions);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logout = async () => {
    if (!authClient) {
      console.error('Auth client not initialized');
      return;
    }

    try {
      await authClient.logout();
      setIsAuthenticated(false);
      setIdentity(undefined);
      setPrincipal(undefined);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: AuthContextType = {
    authClient,
    isAuthenticated,
    identity,
    principal,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

