import React, { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';
import QuestionsView from './components/QuestionsView';
import DataEditor from './components/DataEditor';
import AIChatOverlay from './components/AIChatOverlay';
import { LayoutDashboard, PieChart as PieChartIcon, Database, Settings, LogOut, MessageSquare, Search, ChevronDown } from 'lucide-react';
import { SURVEY_DATA } from './constants';
import { SurveyDataset } from './types';

const THEME_STORAGE_KEY = 'hyper-analyse-theme';
type ThemeMode = 'light' | 'dark';

const resolveInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const App: React.FC = () => {
  const [surveyData, setSurveyData] = useState<SurveyDataset>(JSON.parse(JSON.stringify(SURVEY_DATA)));
  const [activeTab, setActiveTab] = useState<'dashboard' | 'questions' | 'editor'>('dashboard');
  const [theme, setTheme] = useState<ThemeMode>(() => resolveInitialTheme());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.setProperty('color-scheme', theme);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'questions', label: 'Statistiques', icon: PieChartIcon },
    { id: 'editor', label: 'Données', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-cream-200 dark:bg-charcoal-900 flex transition-colors duration-300">
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-charcoal-900 dark:bg-charcoal-950 flex flex-col transition-all duration-300 fixed h-full z-50`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-cream-100 rounded-xl flex items-center justify-center shadow-lg">
            <LayoutDashboard className="w-5 h-5 text-charcoal-900" />
          </div>
          {!sidebarCollapsed && (
            <span className="text-xl font-bold text-white tracking-tight">Hyper</span>
          )}
        </div>

        <div className="px-4 py-6 flex flex-col items-center border-b border-white/10">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cream-200 to-cream-300 overflow-hidden shadow-xl ring-4 ring-white/10">
            <div className="w-full h-full bg-gradient-to-br from-sage-300 to-sage-400 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">A</span>
            </div>
          </div>
          {!sidebarCollapsed && (
            <>
              <p className="text-cream-400 text-xs mt-3">Bienvenue,</p>
              <p className="text-white font-semibold">Analyste</p>
            </>
          )}
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-sage-400/20 text-sage-300'
                    : 'text-cream-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-sage-300' : ''} />
                {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 space-y-1 border-t border-white/10">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-cream-400 hover:bg-white/5 hover:text-white transition-all">
            <MessageSquare size={20} />
            {!sidebarCollapsed && (
              <>
                <span className="font-medium">Messages</span>
                <span className="ml-auto bg-sage-400 text-charcoal-900 text-xs font-bold px-2 py-0.5 rounded-full">5</span>
              </>
            )}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-cream-400 hover:bg-white/5 hover:text-white transition-all">
            <Settings size={20} />
            {!sidebarCollapsed && <span className="font-medium">Paramètres</span>}
          </button>
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-cream-400 hover:bg-white/5 hover:text-white transition-all"
          >
            <LogOut size={20} />
            {!sidebarCollapsed && <span className="font-medium">{theme === 'dark' ? 'Mode clair' : 'Mode sombre'}</span>}
          </button>
        </div>
      </aside>

      <div className={`flex-1 ${sidebarCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
        <header className="sticky top-0 z-40 bg-cream-200/80 dark:bg-charcoal-900/80 backdrop-blur-xl border-b border-cream-300 dark:border-charcoal-800">
          <div className="px-8 h-16 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-charcoal-900 dark:text-white">
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'questions' && 'Statistiques'}
                {activeTab === 'editor' && 'Éditeur de données'}
              </h1>
              <p className="text-sm text-charcoal-900/60 dark:text-cream-400">Analyse des données clients</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-900/40 dark:text-cream-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="pl-10 pr-4 py-2.5 w-64 bg-white dark:bg-charcoal-800 border border-cream-300 dark:border-charcoal-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-sage-400/50 transition-all"
                />
              </div>
            </div>
          </div>
        </header>

        <main className="p-8">
          <div className="transition-opacity duration-300">
            {activeTab === 'dashboard' && <Dashboard data={surveyData} />}
            {activeTab === 'questions' && <QuestionsView data={surveyData} />}
            {activeTab === 'editor' && <DataEditor data={surveyData} onUpdate={setSurveyData} />}
          </div>
        </main>
      </div>

      <AIChatOverlay currentData={surveyData} />
    </div>
  );
};

export default App;
