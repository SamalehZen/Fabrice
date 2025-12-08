import React, { useEffect, useState } from 'react';
import { Menu, Search, Bell, Moon, Sun } from 'lucide-react';
import Dashboard from './components/Dashboard';
import QuestionsView from './components/QuestionsView';
import DataEditor from './components/DataEditor';
import Settings from './components/Settings';
import AIChatOverlay from './components/AIChatOverlay';
import Sidebar from './components/Sidebar';
import { SURVEY_DATA } from './constants';
import { SurveyDataset } from './types';

const THEME_STORAGE_KEY = 'fabrice-ai-theme';
export type ThemeMode = 'light' | 'dark';

const resolveInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const App: React.FC = () => {
  const [surveyData, setSurveyData] = useState<SurveyDataset>(JSON.parse(JSON.stringify(SURVEY_DATA)));
  const [activeTab, setActiveTab] = useState<'dashboard' | 'questions' | 'editor' | 'settings'>('dashboard');
  const [theme, setTheme] = useState<ThemeMode>(() => resolveInitialTheme());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsMobile(true);
        setIsSidebarOpen(false);
      } else {
        setIsMobile(false);
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.setProperty('color-scheme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-300">
      
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        isMobile={isMobile}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-30 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            {isMobile && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Menu size={24} />
              </button>
            )}
            
            <div className="hidden md:flex items-center gap-3 px-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 rounded-xl w-full max-w-md border border-transparent focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-900/30 transition-all">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400 text-slate-700 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
            </button>
            
            <div className="flex items-center gap-4 pl-6 border-l border-slate-200 dark:border-slate-700">
               <div className="flex flex-col text-right hidden sm:block">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Fabrice Admin</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Super Admin</span>
               </div>
               <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden ring-2 ring-white dark:ring-slate-800 shadow-sm">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Fabrice" alt="Profile" className="w-full h-full object-cover" />
               </div>
               
               <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
               >
                 {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
               </button>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8 scroll-smooth relative">
           {/* Background Decoration */}
           <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-950/20 dark:to-transparent pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab !== 'settings' && (
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {activeTab === 'dashboard' && 'Vue d\'ensemble'}
                    {activeTab === 'questions' && 'Analyses Détaillées'}
                    {activeTab === 'editor' && 'Gestion de Données'}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                    {activeTab === 'dashboard' && 'Métriques clés et indicateurs de performance en temps réel.'}
                    {activeTab === 'questions' && 'Exploration approfondie des réponses par segment.'}
                    {activeTab === 'editor' && 'Modification et calibrage des sources de données.'}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   Système opérationnel
                </div>
              </div>
            )}

            <div className="min-h-[500px]">
              {activeTab === 'dashboard' && <Dashboard data={surveyData} />}
              {activeTab === 'questions' && <QuestionsView data={surveyData} />}
              {activeTab === 'editor' && <DataEditor data={surveyData} onUpdate={setSurveyData} />}
              {activeTab === 'settings' && <Settings />}
            </div>
            
            <footer className="pt-12 pb-6 text-center text-slate-400 dark:text-slate-600 text-sm">
              <p>© 2025 Fabrice AI. Tous droits réservés.</p>
            </footer>
          </div>
        </main>
      </div>

      <AIChatOverlay currentData={surveyData} />
    </div>
  );
};

export default App;
