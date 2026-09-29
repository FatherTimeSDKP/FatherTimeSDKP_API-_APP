import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider } from './config';

// In-memory token cache (never stored in localStorage or sessionStorage per skill guidelines)
let cachedAccessToken: string | null = null;

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  accessToken: string | null;
  signInWithGoogle: () => Promise<string | null>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ADMIN_EMAIL = 'dallasnamiyadaddy@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        cachedAccessToken = null;
        setAccessToken(null);
      }
      setLoading(false);
    }, (err) => {
      console.error('[Auth State Error]', err);
      setError(err.message);
      cachedAccessToken = null;
      setAccessToken(null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<string | null> => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        cachedAccessToken = credential.accessToken;
        setAccessToken(credential.accessToken);
        return credential.accessToken;
      }
      return null;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign in failed';
      console.error('[Sign In Error]', msg);
      setError(msg);
      throw err;
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
      cachedAccessToken = null;
      setAccessToken(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign out failed';
      console.error('[Sign Out Error]', msg);
      setError(msg);
      throw err;
    }
  };

  const clearError = () => setError(null);

  const isAdmin = Boolean(user && user.email === ADMIN_EMAIL);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        accessToken,
        signInWithGoogle,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
