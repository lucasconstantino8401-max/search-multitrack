import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
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

try {
    // 1. Initialize App (Idempotent check)
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    
    // 2. Initialize Auth
    if (firebase.auth) {
        auth = firebase.auth();
        googleProvider = new firebase.auth.GoogleAuthProvider();
        googleProvider.setCustomParameters({ prompt: 'select_account' });
    } else {
        console.error("Firebase Auth module failed to load.");
    }
    
    // Export for debug
    if (typeof window !== 'undefined') {
        (window as any).firebase = firebase;
    }

} catch (error) {
    console.error("Firebase Init Error:", error);
}

// Exportamos 'db' como undefined pois removemos o Firestore
const db = undefined;

export { auth, db, firebase };

/**
 * Realiza o login com Google.
 */
export const signInWithGoogle = async (): Promise<User> => {
    if (!auth || !googleProvider) {
        console.warn("Auth not initialized. Using Mock.");
        return new Promise((resolve) => {
             setTimeout(() => {
                 resolve({
                     uid: 'mock-' + Date.now(),
                     email: 'admin@searchmultitracks.com', 
                     displayName: 'Admin (Mock)',
                     photoURL: ''
                 });
             }, 1000);
        });
    }

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
        throw error;
    }
};

/**
 * Realiza o logout.
 */
export const logoutFirebase = async () => {
    if (auth) {
        await auth.signOut();
    }
};