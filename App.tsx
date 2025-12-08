import React, { useState, useCallback, useMemo } from 'react';
import { AppProvider, useApp, ThemeMode } from './context/AppContext';
import { ToastContainer } from './components/Toast';
import Dashboard from './components/Dashboard';
import QuestionsView from './components/QuestionsView';
import DataEditor from './components/DataEditor';
import AIChatOverlay from './components/AIChatOverlay';
import { LayoutDashboard, PieChart as PieChartIcon, Database, Menu, X } from 'lucide-react';

type TabType = 'dashboard' | 'questions' | 'editor';

interface FruitBadgeProps {
  theme: ThemeMode;
  className?: string;
}

const FruitBadge: React.FC<FruitBadgeProps> = ({ theme, className = '' }) => {
  const peelGradient = theme === 'dark' ? 'from-amber-300 via-orange-400 to-rose-500' : 'from-amber-200 via-orange-300 to-rose-400';
  const glossGradient = theme === 'dark' ? 'from-white/25 to-transparent' : 'from-white/70 to-transparent';
  const leafPrimary = theme === 'dark' ? 'bg-emerald-300' : 'bg-emerald-500';
  const leafSecondary = theme === 'dark' ? 'bg-emerald-400/80' : 'bg-emerald-400/60';
  const seedColor = theme === 'dark' ? 'bg-slate-900/60' : 'bg-white/70';

  return (
    <span className={`relative inline-flex w-10 h-10 ${className}`} aria-hidden="true">
      <span className={`absolute inset-0 rounded-full bg-gradient-to-br ${peelGradient} shadow-[0_10px_30px_rgba(249,115,22,0.35)] transition-all duration-500`} />
      <span className="absolute inset-[1px] rounded-full border border-white/30 dark:border-white/10" />
      <span className={`absolute inset-[4px] rounded-full bg-gradient-to-br ${glossGradient} opacity-90 mix-blend-screen`} />
      <span className={`absolute -top-1 left-1.5 w-5 h-2.5 rounded-full ${leafPrimary} rotate-[-18deg] origin-left blur-[0.3px]`} />
      <span className={`absolute -top-2 left-3 w-3 h-3 rounded-full ${leafSecondary} rotate-[-34deg] origin-bottom`} />
      <span className={`absolute bottom-3 left-4 w-1 h-1 rounded-full ${seedColor}`} />
      <span className={`absolute bottom-2.5 right-3 w-1 h-1 rounded-full ${seedColor}`} />
    </span>
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
      default:
        return null;
    }
  }, [activeTab, surveyData, updateSurveyData]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-dark-bg dark:via-dark-bg dark:to-dark-surface pb-20 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      
      <header className="bg-white/80 dark:bg-dark-surface/90 border-b border-slate-200 dark:border-dark-border sticky top-0 z-40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-brand-600 dark:bg-brand-500 p-2 rounded-xl shadow-md shadow-brand-200/70 dark:shadow-brand-900/40">
              <LayoutDashboard className="text-white w-5 h-5" aria-hidden="true" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight leading-none">
              Hyper <span className="text-brand-600 dark:text-brand-300">Analyse</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <nav className="hidden md:flex gap-1" role="navigation" aria-label="Navigation principale">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleTabChange(id)}
                  aria-current={activeTab === id ? 'page' : undefined}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                    activeTab === id
                      ? 'bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-200 dark:bg-brand-500/20 dark:text-brand-300 dark:ring-brand-400/40'
                      : 'text-slate-600 hover:bg-slate-50 dark:text-gray-300 dark:hover:bg-dark-hover/70'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon size={16} aria-hidden="true" />
                    {label}
                  </span>
                </button>
              ))}
            </nav>

            <button
              onClick={toggleTheme}
              aria-label={`Passer en mode ${theme === 'dark' ? 'clair' : 'sombre'}`}
              className="hidden md:flex items-center gap-3 px-3 py-2 rounded-xl border border-slate-200 dark:border-dark-border bg-white/70 dark:bg-dark-surface/90 shadow-inner shadow-slate-200/60 dark:shadow-black/40 backdrop-blur transition-all hover:bg-slate-50 dark:hover:bg-dark-hover/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <FruitBadge theme={theme} />
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 dark:text-gray-400">Palette</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {theme === 'dark' ? 'Sombre fruitée' : 'Clair vitaminé'}
                </p>
              </div>
              <span
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                  theme === 'dark' ? 'bg-dark-muted' : 'bg-slate-200'
                }`}
                aria-hidden="true"
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full transition-transform duration-300 shadow ${
                    theme === 'dark'
                      ? 'translate-x-6 bg-brand-400 shadow-brand-900/50'
                      : 'translate-x-1 bg-orange-400 shadow-orange-500/40'
                  }`}
                />
              </span>
            </button>

            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={toggleTheme}
                aria-label={`Passer en mode ${theme === 'dark' ? 'clair' : 'sombre'}`}
                className="p-2 rounded-xl border border-slate-200 dark:border-dark-border bg-white/80 dark:bg-dark-surface/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <FruitBadge theme={theme} />
              </button>
              <button
                className="p-2 text-slate-600 dark:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                onClick={handleToggleMobileMenu}
                aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {mobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>

        <div
          id="mobile-menu"
          className={`md:hidden bg-white/95 dark:bg-dark-surface/95 border-t border-slate-100 dark:border-dark-border shadow-lg shadow-slate-900/10 overflow-hidden transition-all duration-300 ${
            mobileMenuOpen ? 'max-h-96 p-4' : 'max-h-0 p-0'
          }`}
          role="navigation"
          aria-label="Navigation mobile"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-dark-border bg-slate-50/80 dark:bg-dark-card/80 px-4 py-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Palette fruitée</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {theme === 'dark' ? 'Mode sombre' : 'Mode clair'}
                </p>
              </div>
              <button
                onClick={toggleTheme}
                aria-label={`Passer en mode ${theme === 'dark' ? 'clair' : 'sombre'}`}
                className="p-2 rounded-xl border border-slate-200 dark:border-dark-border bg-white/90 dark:bg-dark-surface/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <FruitBadge theme={theme} />
              </button>
            </div>
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleTabChange(id)}
                aria-current={activeTab === id ? 'page' : undefined}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                  activeTab === id
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-100'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-hover/60'
                }`}
              >
                <Icon size={18} aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{currentPage.title}</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">{currentPage.description}</p>
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
