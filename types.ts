
// Data Models
export interface Track {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  downloadUrl: string;
  searchCount: number;
  createdAt?: string; // ISO Date string
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface UserData {
  uid: string;
  email: string;
  lastLogin: Date;
}

export interface AppSettings {
  googleSheetsApiUrl: string;
}

// Global declarations for the environment variables injected by the previous platform
declare global {
  var __app_id: string | undefined;
}

// Component Props
export interface SplashScreenProps {
  onFinish: () => void;
}

export interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export interface AdminPanelProps {
  user: User;
  onClose: () => void;
  onUpdate: () => void; // Trigger to refresh main app
}

export interface MainAppProps {
  user: User;
  onLogout: () => void;
}

// Runtime export to ensure this file is emitted as a module by the transpiler
export const TYPES_VERSION = '2.0.0';
