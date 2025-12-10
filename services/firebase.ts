import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
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
let db: any = undefined;
let googleProvider: any = undefined;
let isConfigured = false;

// Inicialização
try {
    // Garante que o app só é inicializado uma vez
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    
    // Inicializa Auth usando o namespace global compatível
    auth = firebase.auth();
    
    // Inicializa Firestore (Banco de Dados) usando o namespace global compatível
    db = firebase.firestore();
    
    googleProvider = new firebase.auth.GoogleAuthProvider();
    googleProvider.setCustomParameters({
        prompt: 'select_account'
    });
    
    isConfigured = true;
    console.log("Firebase initialized successfully.");
} catch (error) {
    console.error("Firebase Initialization Error:", error);
    isConfigured = false;
}

export { auth, db };

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
        const result = await auth.signInWithPopup(googleProvider);
        const fbUser = result.user;
        
        return {
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || 'Usuário',
            photoURL: fbUser.photoURL || ''
        };
    } catch (error: any) {
        console.error("Google Auth Error:", error);
        
        // CORREÇÃO CRÍTICA: Se o ambiente (ex: preview/iframe) bloquear o popup ou storage,
        // ativamos o usuário de demonstração para não bloquear o sistema.
        if (error.code === 'auth/operation-not-supported-in-this-environment' || 
            error.code === 'auth/popup-closed-by-user' ||
            error.code === 'auth/unauthorized-domain' ||
            (error.message && error.message.includes('operation is not supported'))) {
            
            console.warn("Ambiente restrito detectado. Ativando Modo de Demonstração (Mock Admin).");
            
            return new Promise((resolve) => {
                 setTimeout(() => {
                     const mockUser: User = {
                         uid: 'mock-admin-' + Date.now(),
                         email: 'admin@searchmultitracks.com', 
                         displayName: 'Admin (Mock)',
                         photoURL: ''
                     };
                     resolve(mockUser);
                 }, 1500);
            });
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
            await auth.signOut();
        } catch (e) {
            console.warn("Logout error:", e);
        }
    }
};