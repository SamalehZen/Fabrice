import React, { useState, useCallback, useMemo } from 'react';
import { AppProvider, useApp, ThemeMode } from './context/AppContext';
import { ToastContainer } from './components/Toast';
import Dashboard from './components/Dashboard';
import QuestionsView from './components/QuestionsView';
import DataEditor from './components/DataEditor';
import AIChatOverlay from './components/AIChatOverlay';
import AnimatedBadge from './components/AnimatedBadge';
import TrustedCompanies from './components/TrustedCompanies';
import { LayoutDashboard, PieChart as PieChartIcon, Database, Menu, X, Sun, Moon } from 'lucide-react';

type TabType = 'dashboard' | 'questions' | 'editor' | 'trusted';

interface ThemeToggleProps {
  theme: ThemeMode;
  onClick: () => void;
  size?: 'sm' | 'md';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onClick, size = 'md' }) => {
  const isDark = theme === 'dark';
  const dimensions = size === 'sm' ? 'w-9 h-9' : 'w-11 h-11';
  const iconSize = size === 'sm' ? 18 : 20;
  
  return (
    <button
      onClick={onClick}
      aria-label={`Passer en mode ${isDark ? 'clair' : 'sombre'}`}
      className={`relative ${dimensions} rounded-full overflow-hidden transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
        isDark 
          ? 'bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 shadow-lg shadow-purple-900/30' 
          : 'bg-gradient-to-br from-amber-300 via-orange-400 to-rose-400 shadow-lg shadow-orange-300/50'
      }`}
    >
      <span className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${isDark ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90 scale-50'}`}>
        <Moon size={iconSize} className="text-purple-200" strokeWidth={2.5} />
        <span className="absolute top-1 right-1.5 w-1.5 h-1.5 bg-purple-300 rounded-full opacity-80" />
        <span className="absolute top-2.5 right-3 w-1 h-1 bg-purple-400 rounded-full opacity-60" />
      </span>
      <span className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0'}`}>
        <Sun size={iconSize} className="text-white" strokeWidth={2.5} />
      </span>
      <span className={`absolute inset-0 rounded-full transition-opacity duration-500 ${isDark ? 'bg-gradient-to-t from-purple-500/20 to-transparent' : 'bg-gradient-to-t from-white/30 to-transparent'}`} />
    </button>
  );
};

const NAV_ITEMS: { id: TabType; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { id: 'questions', label: 'Questions (camemberts)', icon: PieChartIcon },
  { id: 'editor', label: 'Éditeur de données', icon: Database },
];

const PAGE_TITLES: Record<TabType, { title: string; description: string }> = {
  dashboard: {
    title: "Panorama de l'analyse",
    description: "Analyse complète des profils clients, habitudes d'achat et niveaux de satisfaction.",
  },
  questions: {
    title: 'Analyse des questions (camemberts)',
    description: 'Visualisation des réponses aux questions 0 à 10 sous forme de graphiques circulaires.',
  },
  editor: {
    title: 'Gestion des données',
    description: "Mettez à jour les données de l'analyse en temps réel : graphiques et IA se synchronisent automatiquement.",
  },
};

const AppContent: React.FC = () => {
  const { theme, toggleTheme, surveyData, updateSurveyData, toasts, dismissToast } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  const currentPage = useMemo(() => PAGE_TITLES[activeTab], [activeTab]);

  const renderContent = useMemo(() => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard data={surveyData} />;
      case 'questions':
        return <QuestionsView data={surveyData} />;
      case 'editor':
        return <DataEditor data={surveyData} onUpdate={updateSurveyData} />;
      case 'trusted':
        return <TrustedCompanies isDarkMode={theme === 'dark'} />;
      default:
        return null;
    }
  }, [activeTab, surveyData, updateSurveyData]);

  const isDarkMode = theme === 'dark';
  const bgColor = isDarkMode ? '#0A0A0A' : '#F2F2F7';

  if (activeTab === 'trusted') {
    return (
      <div className="min-h-screen w-full transition-colors duration-500 overflow-x-hidden selection:bg-[#D9FF00] selection:text-black" style={{ backgroundColor: bgColor }}>
        <div className="fixed top-4 right-4 z-50 flex gap-3">
           <ThemeToggle theme={theme} onClick={toggleTheme} />
           <button 
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest shadow-xl transition-all ${isDarkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'}`}
           >
            Back to Dashboard
           </button>
        </div>
        <TrustedCompanies isDarkMode={isDarkMode} />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full transition-colors duration-500 overflow-x-hidden selection:bg-[#D9FF00] selection:text-black flex flex-col" style={{ backgroundColor: bgColor }}>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#7B61FF] rounded-full blur-[180px] transition-opacity duration-500 ${isDarkMode ? 'opacity-10' : 'opacity-5'}`}></div>
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#D9FF00] rounded-full blur-[180px] transition-opacity duration-500 ${isDarkMode ? 'opacity-10' : 'opacity-5'}`}></div>
      </div>

      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-12 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-2 transition-colors duration-500">
            {activeTab === 'dashboard' ? 'Analytics' : activeTab === 'questions' ? 'Questions' : 'Data Editor'}<span className="text-[#D9FF00]">.</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-md leading-relaxed">
            {activeTab === 'dashboard' 
              ? "Real-time insights into your platform's performance. Updated every 30 seconds."
              : activeTab === 'questions'
                ? "Detailed breakdown of survey responses per category."
                : "Manage and update your survey dataset locally."}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveTab('trusted')}
            className={`px-4 py-3 rounded-full border transition-all text-sm font-bold uppercase tracking-widest hover:scale-105 ${isDarkMode ? 'border-white/10 hover:bg-white/5' : 'border-black/10 hover:bg-black/5'}`}
          >
            Trusted By
          </button>
          <ThemeToggle theme={theme} onClick={toggleTheme} />
          
          <nav className="flex items-center bg-slate-100/80 dark:bg-white/5 rounded-xl p-1 border border-black/5 dark:border-white/5">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleTabChange(id)}
                className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all duration-200 ${
                  activeTab === id
                    ? (isDarkMode ? 'bg-white text-black shadow-lg' : 'bg-black text-white shadow-lg')
                    : (isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-black')
                }`}
              >
                <Icon size={16} className="inline mr-2" />
                <span className="hidden lg:inline">{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 py-10 transition-opacity duration-300">
        {renderContent}
      </main>

      <AIChatOverlay currentData={surveyData} />
    </div>
  );
};

const App: React.FC = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;
