import React, { useState, useMemo, useCallback } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ToastContainer } from './components/Toast';
import Dashboard from './components/Dashboard';
import QuestionsView from './components/QuestionsView';
import DataEditor from './components/DataEditor';
import Profile from './components/Profile';
import Sidebar, { SidebarTab } from './components/Sidebar';
import AIChatOverlay from './components/AIChatOverlay';
import { Menu } from 'lucide-react';

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4 animate-in fade-in zoom-in duration-500">
    <div className="text-6xl mb-4">🚧</div>
    <h2 className="text-3xl font-bold text-slate-800 dark:text-white">{title}</h2>
    <p className="text-slate-500 dark:text-slate-400 max-w-md">Cette fonctionnalité est en cours de développement. Revenez bientôt !</p>
  </div>
);

const AppContent: React.FC = () => {
  const { theme, toggleTheme, surveyData, updateSurveyData, toasts, dismissToast } = useApp();
  const [activeTab, setActiveTab] = useState<SidebarTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Keep for mobile if needed, though sidebar handles it mostly

  const handleTabChange = useCallback((tab: SidebarTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  }, []);

  const renderContent = useMemo(() => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard data={surveyData} />;
      case 'questions':
        return <QuestionsView data={surveyData} />;
      case 'editor': // Payment
        return <DataEditor data={surveyData} onUpdate={updateSurveyData} />;
      case 'profile': // Customer
        return <Profile />;
      case 'transactions':
        return <PlaceholderPage title="Transactions" />;
      case 'products':
        return <PlaceholderPage title="Produits" />;
      case 'messages':
        return <PlaceholderPage title="Messages de l'équipe" />;
      case 'settings':
        return <PlaceholderPage title="Paramètres" />;
      default:
        return <Dashboard data={surveyData} />;
    }
  }, [activeTab, surveyData, updateSurveyData]);

  const pageTitle = useMemo(() => {
    const titles: Record<string, string> = {
        dashboard: "Tableau de Bord",
        questions: "Statistiques Détaillées",
        editor: "Gestion des Données",
        profile: "Profil Client",
        transactions: "Historique des Transactions",
        products: "Catalogue Produits",
        messages: "Messagerie",
        settings: "Configuration"
    };
    return titles[activeTab] || "Hyper Analyse";
  }, [activeTab]);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#05050a] overflow-hidden font-sans">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      
      {/* Sidebar for Desktop */}
      <div className="hidden md:block h-full shadow-2xl z-50">
        <Sidebar 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
            isDark={theme === 'dark'} 
            toggleTheme={toggleTheme} 
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Mobile Header */}
        <header className="md:hidden bg-white dark:bg-[#1e1e2d] px-4 py-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
            <h1 className="font-bold text-lg dark:text-white">Zarss</h1>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600 dark:text-gray-300">
                <Menu />
            </button>
        </header>

         {/* Mobile Sidebar Overlay */}
         {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 md:hidden flex">
                <div className="w-64 h-full relative z-50">
                     <Sidebar 
                        activeTab={activeTab} 
                        onTabChange={handleTabChange} 
                        isDark={theme === 'dark'} 
                        toggleTheme={toggleTheme} 
                    />
                </div>
                <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            </div>
         )}


        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 lg:px-12 w-full">
            <div className="max-w-[1920px] mx-auto w-full space-y-8">
                 {/* Top Bar / Header inside content for Desktop context */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{pageTitle}</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Aperçu en temps réel de vos données</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                         <div className="hidden md:flex items-center gap-2 bg-white dark:bg-[#1e1e2d] px-4 py-2 rounded-full border border-slate-200 dark:border-white/10 shadow-sm">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Système en ligne</span>
                         </div>
                         <button 
                            onClick={toggleTheme}
                            className="bg-white dark:bg-[#1e1e2d] p-3 rounded-full border border-slate-200 dark:border-white/10 shadow-sm hover:scale-105 transition-transform"
                         >
                            {theme === 'dark' ? '🌙' : '☀️'}
                         </button>
                    </div>
                </div>

                <div className="w-full transition-all duration-300">
                    {renderContent}
                </div>
            </div>
        </main>
        
        <AIChatOverlay currentData={surveyData} />
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;
