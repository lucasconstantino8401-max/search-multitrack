import React, { useState, useEffect } from 'react';
import SplashScreen from './components/SplashScreen';
import LoginScreen from './components/LoginScreen';
import MainApp from './components/MainApp';
import { getCurrentUser, logoutUser } from './services/storage';
import { logoutFirebase } from './services/firebase';
import type { User } from './types';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // Verifica sessão local
    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    setIsLoggingIn(false);
  };

  const handleLogout = async () => {
    await logoutFirebase(); // Limpa sessão no Firebase
    logoutUser(); // Limpa sessão local
    setUser(null);
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (loading) {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zinc-500"></div>
        </div>
    );
  }

  // Se o usuário solicitou login explicitamente
  if (isLoggingIn) {
      return (
        <LoginScreen 
            onLogin={handleLogin} 
            onCancel={() => setIsLoggingIn(false)} 
        />
      );
  }

  // Renderiza o App Principal (pode ser com user logado ou null/guest)
  return (
    <MainApp 
        user={user} 
        onLogout={handleLogout} 
        onLoginRequest={() => setIsLoggingIn(true)} 
    />
  );
}