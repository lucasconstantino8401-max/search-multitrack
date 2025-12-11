import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  LogOut, 
  Search, 
  X, 
  TrendingUp, 
  Download, 
  ArrowLeft, 
  Sparkles, 
  Database, 
  Play, 
  Filter,
  Calendar, 
  Music,
  Share2,
  LogIn
} from 'lucide-react';
import { listenToTracks, incrementSearchCountRemote } from '../services/storage';
import type { MainAppProps, Track } from '../types';
import AdminPanel from './AdminPanel';
import InteractiveBackground from './InteractiveBackground';

// --- CONFIGURAÇÃO DE SEGURANÇA ---
const ADMIN_EMAILS = [
    'admin@searchmultitracks.com',
    'lucasconstantino8401@gmail.com'
];

// Função auxiliar para normalizar texto
const normalizeText = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

// Componente de Logo SVG Reutilizável
const AppLogoSVG = ({ className = "w-full h-full" }: { className?: string }) => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M50 10C27.9086 10 10 27.9086 10 50C10 72.0914 27.9086 90 50 90C63.2 90 74.8 83.6 82.5 73.5" stroke="currentColor" strokeWidth="6" strokeLinecap="round" className="text-white opacity-100" />
        <path d="M78 78L90 90" stroke="#71717a" strokeWidth="8" strokeLinecap="round" />
        <rect x="32" y="35" width="8" height="30" rx="4" fill="currentColor" className="text-zinc-400" />
        <rect x="46" y="25" width="8" height="50" rx="4" fill="currentColor" className="text-white" />
        <rect x="60" y="40" width="8" height="20" rx="4" fill="currentColor" className="text-zinc-400" />
    </svg>
);

const HeaderLogo = () => (
    <div className="flex items-center gap-3">
        <div className="w-10 h-10 relative">
             <AppLogoSVG />
        </div>
        <div className="flex flex-col justify-center">
            <span className="text-xs font-black text-zinc-500 tracking-[0.15em] uppercase leading-none mb-0.5">Search</span>
            <span className="text-[10px] font-bold text-white tracking-[0.15em] uppercase leading-none">Multitracks</span>
        </div>
    </div>
);

// --- TRACK CARD ---
interface TrackCardProps {
  track: Track;
  featured?: boolean;
  onClick: (track: Track) => void;
  index?: number;
}

const TrackCard: React.FC<TrackCardProps> = ({ track, featured = false, onClick, index = 0 }) => (
  <div 
      onClick={() => onClick(track)}
      className={`
        relative group overflow-hidden rounded-2xl flex flex-col cursor-pointer
        bg-zinc-950/40 backdrop-blur-md border border-white/10
        transition-all duration-500 ease-out
        hover:-translate-y-1.5 hover:border-white/30 hover:bg-zinc-900/60
        hover:shadow-[0_15px_40px_-10px_rgba(255,255,255,0.05)]
        ${featured ? 'h-full' : ''}
        animate-fade-in-up
      `}
      style={{ 
        animationDelay: `${index * 0.05}s`,
        animationFillMode: 'both' 
      }}
  >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/0 to-white/0 opacity-0 group-hover:opacity-100 group-hover:to-white/5 transition-opacity duration-500 pointer-events-none"></div>

      {/* Imagem / Capa */}
      <div className="relative aspect-square overflow-hidden bg-zinc-950">
          <img 
              src={track.imageUrl} 
              alt={track.title} 
              className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 opacity-80 grayscale group-hover:grayscale-0 group-hover:opacity-100" 
              onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300/09090b/3f3f46?text=No+Image'} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-40"></div>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
              <div className="w-14 h-14 bg-white backdrop-blur-md border border-white rounded-full flex items-center justify-center pl-1 shadow-2xl scale-50 group-hover:scale-100 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] text-black">
                  <Play size={24} fill="currentColor" />
              </div>
          </div>
          {featured && (
            <div className="absolute top-3 left-3 z-10">
                 <span className="bg-white text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">Top 1</span>
            </div>
          )}
      </div>

      {/* Conteúdo */}
      <div className="p-5 flex flex-col flex-1 relative z-10">
          <div className="flex-1 min-w-0 mb-4">
             <h3 className="text-zinc-200 font-bold text-base leading-tight mb-1 truncate group-hover:text-white transition-colors duration-300" title={track.title}>
               {track.title}
             </h3>
             <p className="text-zinc-600 text-xs flex items-center gap-1 truncate font-medium uppercase tracking-wide group-hover:text-zinc-400 transition-colors">
               {track.artist}
             </p>
          </div>
      </div>
  </div>
);

// --- TRACK DETAIL VIEW ---
interface TrackDetailProps {
    track: Track;
    onClose: () => void;
    onDownload: () => void;
}

const TrackDetailView: React.FC<TrackDetailProps> = ({ track, onClose, onDownload }) => {
    const formattedDate = track.createdAt 
        ? new Date(track.createdAt).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'Data desconhecida';

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col animate-fade-in overflow-y-auto">
            <div className="absolute inset-0 z-0 overflow-hidden">
                <img 
                    src={track.imageUrl} 
                    className="w-full h-full object-cover blur-[80px] opacity-20 scale-125"
                    alt=""
                />
                <div className="absolute inset-0 bg-black/60"></div>
            </div>
            
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 md:p-12 min-h-screen">
                <button 
                    onClick={onClose}
                    className="absolute top-6 left-6 md:top-10 md:left-10 p-3 bg-black/20 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-white hover:text-black transition-all group z-20"
                >
                    <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                </button>

                <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    {/* Imagem Grande */}
                    <div className="relative aspect-square w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-[0_0_100px_-20px_rgba(255,255,255,0.1)] ring-1 ring-white/10 group">
                         <img 
                            src={track.imageUrl} 
                            alt={track.title} 
                            className="w-full h-full object-cover"
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    </div>

                    {/* Informações */}
                    <div className="flex flex-col justify-center text-center md:text-left space-y-8">
                        <div>
                             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-6">
                                <Music size={12} />
                                <span>Multitrack</span>
                             </div>
                             <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-2 tracking-tight">
                                {track.title}
                             </h1>
                             <h2 className="text-xl md:text-2xl text-zinc-400 font-medium">
                                {track.artist}
                             </h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm max-w-md mx-auto md:mx-0">
                            <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex flex-col gap-1">
                                <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2 justify-center md:justify-start">
                                   <Calendar size={12} /> Data
                                </span>
                                <span className="text-zinc-300 font-mono">{formattedDate}</span>
                            </div>
                             <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex flex-col gap-1">
                                <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2 justify-center md:justify-start">
                                   <TrendingUp size={12} /> Buscas
                                </span>
                                <span className="text-zinc-300 font-mono">{track.searchCount || 0}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 max-w-md mx-auto md:mx-0 w-full">
                            <button 
                                onClick={onDownload}
                                className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-5 px-8 rounded-xl flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)] group"
                            >
                                <Download className="group-hover:animate-bounce" size={24} />
                                <span className="tracking-widest">BAIXAR AGORA</span>
                            </button>
                            
                            {/* Info de segurança */}
                            <p className="text-[10px] text-zinc-500 text-center md:text-left max-w-xs mx-auto md:mx-0 leading-relaxed">
                                Ao baixar, você será redirecionado para o servidor externo onde o arquivo está hospedado.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN APP COMPONENT ---
const MainApp: React.FC<MainAppProps> = ({ user, onLogout, onLoginRequest }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGuest, setIsGuest] = useState(true);

  // Verifica se é Admin
  useEffect(() => {
    if (user && user.email) {
        setIsGuest(false);
        const check = ADMIN_EMAILS.some(email => user.email.includes(email) || email === user.email);
        setIsAdmin(check);
    } else {
        setIsGuest(true);
        setIsAdmin(false);
    }
  }, [user]);

  // Carrega Tracks
  useEffect(() => {
    const unsubscribe = listenToTracks((data) => {
        setTracks(data);
    });
    return () => unsubscribe();
  }, []);

  // Filter Logic
  const filteredTracks = tracks.filter(track => {
    const searchLower = normalizeText(searchTerm);
    return (
      normalizeText(track.title).includes(searchLower) ||
      normalizeText(track.artist).includes(searchLower)
    );
  });

  const handleDownload = async (track: Track) => {
      if (!track.downloadUrl) {
          alert("Erro: Link de download não disponível.");
          return;
      }
      // Analytics
      incrementSearchCountRemote(track.id);
      // Open Link
      window.open(track.downloadUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans selection:bg-white/20">
      
      <InteractiveBackground />

      {/* --- HEADER --- */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
            
            {/* Logo */}
            <div className="flex-shrink-0 cursor-pointer hover:opacity-80 transition" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
                <HeaderLogo />
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-lg relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search className="text-zinc-500 group-focus-within:text-white transition-colors" size={18} />
                </div>
                <input 
                    type="text" 
                    placeholder="Buscar música, artista ou banda..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-full py-3 pl-12 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:bg-zinc-900 focus:border-white/30 focus:ring-1 focus:ring-white/10 transition-all shadow-inner"
                />
                 {searchTerm && (
                    <button 
                        onClick={() => setSearchTerm('')}
                        className="absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-white"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
                {isAdmin && (
                    <button 
                        onClick={() => setShowAdmin(true)}
                        className="hidden md:flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 hover:text-white transition-colors"
                    >
                        <LayoutDashboard size={14} />
                        <span>Painel</span>
                    </button>
                )}
                
                {isGuest ? (
                     <button 
                        onClick={onLoginRequest}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-full text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 transition-transform active:scale-95 shadow-lg shadow-white/10"
                    >
                        <LogIn size={16} />
                        <span className="hidden sm:inline">Entrar</span>
                    </button>
                ) : (
                    <button 
                        onClick={onLogout}
                        className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-red-400 hover:bg-red-950/30 hover:border-red-900/50 transition-all"
                        title="Sair"
                    >
                        <LogOut size={18} />
                    </button>
                )}
            </div>
        </div>

        {/* Search Bar - Mobile */}
        <div className="md:hidden px-4 pb-4">
             <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search className="text-zinc-500" size={18} />
                </div>
                <input 
                    type="text" 
                    placeholder="Buscar música..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-all"
                />
            </div>
        </div>
      </header>

      {/* --- CONTENT --- */}
      <main className="pt-36 md:pt-32 pb-20 px-4 md:px-8 max-w-[1600px] mx-auto relative z-10">
         
         {/* Welcome / Stats Area */}
         {!searchTerm && (
             <div className="mb-12 animate-fade-in">
                 <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">
                    {isGuest ? 'Bem-vindo.' : `Olá, ${user?.displayName?.split(' ')[0] || 'Visitante'}.`}
                 </h1>
                 <p className="text-zinc-400 text-lg">
                    {tracks.length > 0 ? `${tracks.length} multitracks disponíveis para você.` : 'Carregando biblioteca...'}
                 </p>
             </div>
         )}

         {/* Results Grid */}
         {filteredTracks.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                 {filteredTracks.map((track, idx) => (
                     <TrackCard 
                        key={track.id} 
                        track={track} 
                        onClick={setSelectedTrack} 
                        index={idx}
                     />
                 ))}
             </div>
         ) : (
             <div className="flex flex-col items-center justify-center py-20 opacity-50">
                 <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                     <Search size={32} className="text-zinc-600" />
                 </div>
                 <p className="text-zinc-500 font-medium">Nenhuma música encontrada.</p>
             </div>
         )}

      </main>

      {/* --- MODALS --- */}
      
      {/* Track Details */}
      {selectedTrack && (
          <TrackDetailView 
             track={selectedTrack} 
             onClose={() => setSelectedTrack(null)} 
             onDownload={() => handleDownload(selectedTrack)}
          />
      )}

      {/* Admin Panel */}
      {showAdmin && user && (
          <AdminPanel 
             user={user} 
             onClose={() => setShowAdmin(false)}
             onUpdate={() => {
                 // Refresh handled by listeners
                 setShowAdmin(false);
             }}
          />
      )}

    </div>
  );
};

export default MainApp;