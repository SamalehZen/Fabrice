import React, { useState, useCallback, useMemo } from 'react';
import { AppProvider, useApp, ThemeMode } from './context/AppContext';
import { ToastContainer } from './components/Toast';
import Dashboard from './components/Dashboard';
import QuestionsView from './components/QuestionsView';
import DataEditor from './components/DataEditor';
import AIChatOverlay from './components/AIChatOverlay';
import AnimatedBadge from './components/AnimatedBadge';
import { LayoutDashboard, PieChart as PieChartIcon, Database, Menu, X, Sun, Moon, CreditCard } from 'lucide-react';

import FinanceDashboard from './components/FinanceDashboard';

type TabType = 'dashboard' | 'questions' | 'editor' | 'finance';

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
  { id: 'finance', label: 'Finance (Clone)', icon: CreditCard },
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
  finance: {
    title: 'Finance Dashboard (Clone PIXEL-PERFECT)',
    description: 'Reproduction fidèle du design financier à partir du screenshot.',
  },
};

const AppContent: React.FC = () => {
  const { theme, toggleTheme, surveyData, updateSurveyData, toasts, dismissToast } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('finance');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  }, []);

  const handleToggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
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
      case 'finance':
        return <FinanceDashboard />;
      default:
        return null;
    }
  }, [activeTab, surveyData, updateSurveyData]);

  if (activeTab === 'finance') {
    return (
      <div className="min-h-screen w-full bg-finance-black">
        <FinanceDashboard activeTab={activeTab} onTabChange={handleTabChange} />
        <AIChatOverlay currentData={surveyData} />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-dark-bg dark:via-dark-bg dark:to-dark-surface pb-24 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300 flex flex-col">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      
      <header className="bg-white/90 dark:bg-dark-surface/95 border-b border-slate-200/80 dark:border-dark-border sticky top-0 z-40 backdrop-blur-xl">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-brand-500 to-brand-700 p-2.5 rounded-xl shadow-lg shadow-brand-500/25 dark:shadow-brand-500/15">
              <LayoutDashboard className="text-white w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight leading-none">
                Hyper <span className="text-brand-600 dark:text-brand-400">Analyse</span>
              </h1>
              <p className="text-[10px] text-slate-400 dark:text-gray-500 font-medium tracking-wide">Dashboard Analytics</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <nav className="hidden md:flex items-center bg-slate-100/80 dark:bg-dark-card/60 rounded-xl p-1" role="navigation" aria-label="Navigation principale">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleTabChange(id)}
                  aria-current={activeTab === id ? 'page' : undefined}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                    activeTab === id
                      ? 'bg-white dark:bg-dark-hover text-brand-600 dark:text-brand-400 shadow-sm'
                      : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon size={16} aria-hidden="true" />
                    <span className="hidden lg:inline">{label}</span>
                  </span>
                </button>
              ))}
            </nav>

            <div className="hidden md:block w-px h-8 bg-slate-200 dark:bg-dark-border mx-1" />

            <ThemeToggle theme={theme} onClick={toggleTheme} />

            <div className="flex items-center gap-2 md:hidden">
              <ThemeToggle theme={theme} onClick={toggleTheme} size="sm" />
              <button
                className="p-2 text-slate-600 dark:text-gray-300 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                onClick={handleToggleMobileMenu}
                aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {mobileMenuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>

        <div
          id="mobile-menu"
          className={`md:hidden bg-white/98 dark:bg-dark-surface/98 border-t border-slate-100 dark:border-dark-border shadow-xl shadow-slate-900/5 dark:shadow-black/30 overflow-hidden transition-all duration-300 ${
            mobileMenuOpen ? 'max-h-96 py-4 px-4' : 'max-h-0 py-0 px-4'
          }`}
          role="navigation"
          aria-label="Navigation mobile"
        >
          <div className="space-y-2">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleTabChange(id)}
                aria-current={activeTab === id ? 'page' : undefined}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                  activeTab === id
                    ? 'bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-400 font-semibold'
                    : 'text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-dark-hover/60'
                }`}
              >
                <span className={`p-2 rounded-lg ${activeTab === id ? 'bg-brand-100 dark:bg-brand-500/20' : 'bg-slate-100 dark:bg-dark-card'}`}>
                  <Icon size={18} aria-hidden="true" />
                </span>
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 py-10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex p-3 rounded-2xl bg-gradient-to-br from-brand-500/10 to-purple-500/10 dark:from-brand-500/20 dark:to-purple-500/20 border border-brand-200/50 dark:border-brand-500/20">
              <span className="text-3xl">{activeTab === 'dashboard' ? '📊' : activeTab === 'questions' ? '🥧' : '✏️'}</span>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-800 dark:from-white dark:via-gray-200 dark:to-gray-300 bg-clip-text text-transparent">{currentPage.title}</h2>
              <p className="text-slate-500 dark:text-gray-400 mt-1.5 text-sm sm:text-base max-w-xl leading-relaxed">{currentPage.description}</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center">
            <AnimatedBadge text="Données en temps réel" color="#0ea5e9" />
          </div>
        </div>
        <div className="transition-opacity duration-300">{renderContent}</div>
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
