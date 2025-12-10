import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import type { User } from '../types';

// ------------------------------------------------------------------
// CONFIGURAÇÃO DO FIREBASE
// ------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyC3do0sfTr8za_FtJhuvdDRlSElQRQCqbs",
  authDomain: "search-multitrack.firebaseapp.com",
  projectId: "search-multitrack",
  storageBucket: "search-multitrack.firebasestorage.app",
  messagingSenderId: "972332306776",
  appId: "1:972332306776:web:40b4017e4f9b66c5aa152d",
  measurementId: "G-ZEBZSHTPFB"
};

// --- SINGLETONS ---
let auth: any = undefined;
let googleProvider: any = undefined;
let isConfigured = false;

// Inicialização
try {
    // Garante que o app só é inicializado uma vez
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    
    // Inicializa Auth
    auth = getAuth(app);
    
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
        prompt: 'select_account'
    });
    
    isConfigured = true;
    console.log("Firebase initialized successfully.");
} catch (error) {
    console.error("Firebase Initialization Error:", error);
    isConfigured = false;
}

/**
 * Realiza o login com Google.
 */
export const signInWithGoogle = async (): Promise<User> => {
    // MODO DEMONSTRAÇÃO / FALLBACK se a configuração falhar
    if (!isConfigured || !auth) {
        console.warn("Firebase failed to initialize. Using Mock Login.");
        return new Promise((resolve) => {
             setTimeout(() => {
                 const mockUser: User = {
                     uid: 'mock-admin-' + Date.now(),
                     email: 'admin@searchmultitracks.com', 
                     displayName: 'Admin (Mock)',
                     photoURL: ''
                 };
                 resolve(mockUser);
             }, 1000);
        });
    }

    // LOGIN REAL COM FIREBASE
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const fbUser = result.user;
        
        return {
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || 'Usuário',
            photoURL: fbUser.photoURL || ''
        };
    } catch (error: any) {
        console.error("Google Auth Error:", error);
        
        if (error.code === 'auth/unauthorized-domain') {
            throw new Error(`Domínio não autorizado: ${window.location.hostname}. Adicione-o no Console Firebase.`);
        }
        if (error.code === 'auth/popup-closed-by-user') {
            throw new Error("O popup de login foi fechado antes da conclusão.");
        }
        throw error;
    }
};

/**
 * Realiza o logout.
 */
export const logoutFirebase = async () => {
    if (isConfigured && auth) {
        try {
            await firebaseSignOut(auth);
        } catch (e) {
            console.warn("Logout error:", e);
        }
    }
};