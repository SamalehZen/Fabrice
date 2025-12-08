import React, { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';
import QuestionsView from './components/QuestionsView';
import DataEditor from './components/DataEditor';
import AIChatOverlay from './components/AIChatOverlay';
import { LayoutDashboard, PieChart as PieChartIcon, Database, Menu } from 'lucide-react';
import { SURVEY_DATA } from './constants';
import { SurveyDataset } from './types';

const THEME_STORAGE_KEY = 'hyper-analyse-theme';
type ThemeMode = 'light' | 'dark';

const resolveInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'light';
  }
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const FruitBadge: React.FC<{ theme: ThemeMode; className?: string }> = ({ theme, className = '' }) => {
  const peelGradient = theme === 'dark' ? 'from-amber-300 via-orange-400 to-rose-500' : 'from-amber-200 via-orange-300 to-rose-400';
  const glossGradient = theme === 'dark' ? 'from-white/25 to-transparent' : 'from-white/70 to-transparent';
  const leafPrimary = theme === 'dark' ? 'bg-emerald-300' : 'bg-emerald-500';
  const leafSecondary = theme === 'dark' ? 'bg-emerald-400/80' : 'bg-emerald-400/60';
  const seedColor = theme === 'dark' ? 'bg-slate-900/60' : 'bg-white/70';

  return (
    <span className={`relative inline-flex w-10 h-10 ${className}`} aria-hidden>
      <span className={`absolute inset-0 rounded-full bg-gradient-to-br ${peelGradient} shadow-[0_10px_30px_rgba(249,115,22,0.35)] transition-all duration-500`}></span>
      <span className="absolute inset-[1px] rounded-full border border-white/30 dark:border-white/10"></span>
      <span className={`absolute inset-[4px] rounded-full bg-gradient-to-br ${glossGradient} opacity-90 mix-blend-screen`}></span>
      <span className={`absolute -top-1 left-1.5 w-5 h-2.5 rounded-full ${leafPrimary} rotate-[-18deg] origin-left blur-[0.3px]`}></span>
      <span className={`absolute -top-2 left-3 w-3 h-3 rounded-full ${leafSecondary} rotate-[-34deg] origin-bottom`}></span>
      <span className={`absolute bottom-3 left-4 w-1 h-1 rounded-full ${seedColor}`}></span>
      <span className={`absolute bottom-2.5 right-3 w-1 h-1 rounded-full ${seedColor}`}></span>
    </span>
  );
};

const App: React.FC = () => {
  const [surveyData, setSurveyData] = useState<SurveyDataset>(JSON.parse(JSON.stringify(SURVEY_DATA)));
  const [activeTab, setActiveTab] = useState<'dashboard' | 'questions' | 'editor'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(() => resolveInitialTheme());

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.setProperty('color-scheme', theme);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-[#121212] dark:via-[#141414] dark:to-[#1E1E1E] pb-20 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <header className="bg-white/80 dark:bg-[#121212]/85 border-b border-slate-200 dark:border-white/5 sticky top-0 z-40 backdrop-blur-xl shadow-lg shadow-slate-200/30 dark:shadow-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-brand-600 dark:bg-brand-500/90 p-2 rounded-lg shadow-md shadow-brand-200/70 dark:shadow-brand-900/50">
              <LayoutDashboard className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight leading-none">
                Hyper <span className="text-brand-600 dark:text-brand-300">Analyse</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <nav className="hidden md:flex gap-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-200 dark:bg-brand-500/20 dark:text-brand-100 dark:ring-brand-400/40'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-[#262626]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <LayoutDashboard size={16} /> Tableau de bord
                </span>
              </button>
              <button
                onClick={() => setActiveTab('questions')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'questions'
                    ? 'bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-200 dark:bg-brand-500/20 dark:text-brand-100 dark:ring-brand-400/40'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-[#262626]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <PieChartIcon size={16} /> Questions (camemberts)
                </span>
              </button>
              <button
                onClick={() => setActiveTab('editor')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'editor'
                    ? 'bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-200 dark:bg-brand-500/20 dark:text-brand-100 dark:ring-brand-400/40'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-[#262626]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Database size={16} /> Éditeur de données
                </span>
              </button>
            </nav>

            <button
              onClick={toggleTheme}
              aria-label="Basculer le mode fruité"
              className="hidden md:flex items-center gap-3 px-3 py-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-[#181818] shadow-inner shadow-slate-200/60 dark:shadow-black/50 backdrop-blur"
            >
              <FruitBadge theme={theme} />
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Palette</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{theme === 'dark' ? 'Sombre fruitée' : 'Clair vitaminé'}</p>
              </div>
              <span className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-slate-200'
              }`}>
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full transition-transform duration-300 shadow ${
                    theme === 'dark'
                      ? 'translate-x-6 bg-brand-400 shadow-brand-900/50'
                      : 'translate-x-1 bg-orange-400 shadow-orange-500/40'
                  }`}
                ></span>
              </span>
            </button>

            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={toggleTheme}
                aria-label="Basculer le mode fruité"
                className="p-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#1a1a1a]"
              >
                <FruitBadge theme={theme} />
              </button>
              <button
                className="p-2 text-slate-600 dark:text-slate-200"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Ouvrir la navigation mobile"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 dark:bg-[#0f0f0f]/95 border-t border-slate-100 dark:border-white/5 p-4 space-y-3 shadow-lg shadow-slate-900/10 dark:shadow-black/60">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/80 dark:bg-[#171717]/70 px-4 py-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Palette fruitée</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{theme === 'dark' ? 'Mode sombre' : 'Mode clair'}</p>
              </div>
              <button
                onClick={toggleTheme}
                aria-label="Basculer le thème fruité"
                className="p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#1a1a1a]"
              >
                <FruitBadge theme={theme} />
              </button>
            </div>
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${
                activeTab === 'dashboard'
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-100'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1f1f1f]'
              }`}
            >
              <LayoutDashboard size={18} /> Tableau de bord
            </button>
            <button
              onClick={() => {
                setActiveTab('questions');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${
                activeTab === 'questions'
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-100'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1f1f1f]'
              }`}
            >
              <PieChartIcon size={18} /> Questions (camemberts)
            </button>
            <button
              onClick={() => {
                setActiveTab('editor');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${
                activeTab === 'editor'
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-100'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1f1f1f]'
              }`}
            >
              <Database size={18} /> Éditeur de données
            </button>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {activeTab === 'dashboard' && 'Panorama de l\'analyse'}
            {activeTab === 'questions' && 'Analyse des questions (camemberts)'}
            {activeTab === 'editor' && 'Gestion des données'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            {activeTab === 'dashboard' && 'Analyse complète des profils clients, habitudes d’achat et niveaux de satisfaction.'}
            {activeTab === 'questions' && 'Visualisation des réponses aux questions 0 à 10 sous forme de graphiques circulaires.'}
            {activeTab === 'editor' && "Mettez à jour les données de l'analyse en temps réel : graphiques et IA se synchronisent automatiquement."}
          </p>
        </div>
        <div className="transition-opacity duration-300">
          {activeTab === 'dashboard' && <Dashboard data={surveyData} />}
          {activeTab === 'questions' && <QuestionsView data={surveyData} />}
          {activeTab === 'editor' && <DataEditor data={surveyData} onUpdate={setSurveyData} />}
        </div>
      </main>

      <AIChatOverlay currentData={surveyData} />
    </div>
  );
};

export default App;
