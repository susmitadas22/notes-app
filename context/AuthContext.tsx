import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: string | null;
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for persisted session
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const session = await AsyncStorage.getItem('session');
      if (session) {
        setUser(session);
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hashPassword = async (password: string) => {
    const digest = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password
    );
    return digest;
  };

  const signUp = async (username: string, password: string) => {
    try {
      // Check if user already exists
      const existingUser = await AsyncStorage.getItem(`user:${username}`);
      if (existingUser) {
        throw new Error('Username already exists');
      }

      const hashedPassword = await hashPassword(password);
      await AsyncStorage.setItem(`user:${username}`, hashedPassword);
      
      // Auto login after signup
      await signIn(username, password);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signIn = async (username: string, password: string) => {
    try {
      const storedHash = await AsyncStorage.getItem(`user:${username}`);
      if (!storedHash) {
        throw new Error('User not found');
      }

      const hashedPassword = await hashPassword(password);
      if (hashedPassword !== storedHash) {
        throw new Error('Invalid credentials');
      }

      await AsyncStorage.setItem('session', username);
      setUser(username);
      router.replace('/');
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('session');
      setUser(null);
      router.replace('/sign-in');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
