import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import MainApp from './components/MainApp';
import { getCurrentUser, logoutUser } from './services/storage';
import { logoutFirebase } from './services/firebase';
import type { User } from './types';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

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
  };

  const handleLogout = async () => {
    await logoutFirebase(); // Limpa sessão no Firebase
    logoutUser(); // Limpa sessão local
    setUser(null);
  };

  if (loading) {
    // Loader minimalista e rápido enquanto verifica a sessão (fração de segundo)
    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-zinc-500"></div>
        </div>
    );
  }

  // Lógica de Proteção: Se não houver usuário, mostra Login obrigatório IMEDIATAMENTE.
  // A Splash Screen foi removida para agilizar o acesso ao login.
  if (!user) {
      return (
        <LoginScreen 
            onLogin={handleLogin} 
        />
      );
  }

  // Renderiza o App Principal apenas se houver usuário
  return (
    <MainApp 
        user={user} 
        onLogout={handleLogout} 
        onLoginRequest={() => {}} 
    />
  );
}