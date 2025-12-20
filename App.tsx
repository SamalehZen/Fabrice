import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ToastContainer } from './components/Toast';
import ModernSidebar from './components/ModernSidebar';
import ModernRightPanel from './components/ModernRightPanel';
import FinancialDashboard from './components/FinancialDashboard';
import QuestionsView from './components/QuestionsView';
import DataEditor from './components/DataEditor';
import { Menu } from 'lucide-react';

const AppContent: React.FC = () => {
  const { surveyData, updateSurveyData, toasts, dismissToast, theme, toggleTheme } = useApp();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Force dark mode on mount since the design is dark
  useEffect(() => {
    if (theme === 'light') toggleTheme();
  }, []);

  const renderContent = useMemo(() => {
    switch (activeTab) {
      case 'dashboard':
        return <FinancialDashboard />;
      case 'questions':
        return (
          <div className="p-8 h-full overflow-y-auto custom-scrollbar">
             <div className="max-w-7xl mx-auto">
               <h2 className="text-2xl font-bold text-white mb-6">Analysis Questions</h2>
               <QuestionsView data={surveyData} />
             </div>
          </div>
        );
      case 'editor':
        return (
          <div className="p-8 h-full overflow-y-auto custom-scrollbar">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-2xl font-bold text-white mb-6">Data Management</h2>
                <DataEditor data={surveyData} onUpdate={updateSurveyData} />
            </div>
          </div>
        );
      default:
        // Placeholder for other sidebar items
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="p-6 rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] text-center max-w-md">
                    <div className="w-16 h-16 bg-[#2A2A2A] rounded-full flex items-center justify-center mx-auto mb-4">
                         <span className="text-3xl">🚧</span>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Coming Soon</h2>
                    <p className="text-sm">The <strong>{activeTab}</strong> page is currently under development.</p>
                </div>
            </div>
        );
    }
  }, [activeTab, surveyData, updateSurveyData]);

  // Determine if Right Panel should be visible (Only on Dashboard for now as per screenshot layout)
  // Or show it always? The screenshot shows it as part of the main layout.
  // It contains generic "Wallet", "Quick Action", "Daily Limit". This seems global.
  // But for "Data Editor", it might take too much space?
  // I will hide it for Data Editor and Questions to give them space, show for Dashboard.
  const showRightPanel = activeTab === 'dashboard' || activeTab === 'wallet' || activeTab === 'transactions';

  return (
    <div className="flex h-screen w-full bg-[#0D0D0D] text-white font-sans overflow-hidden">
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />

        {/* Mobile Menu Button */}
        <button 
            className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#1A1A1A] rounded-lg border border-[#333] text-white"
            onClick={() => setSidebarOpen(true)}
        >
            <Menu size={24} />
        </button>
        
        {/* Sidebar */}
        <ModernSidebar 
            activeTab={activeTab} 
            onTabChange={(id) => {
                setActiveTab(id);
                setSidebarOpen(false);
            }} 
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex min-w-0 bg-[#0D0D0D]">
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                 {/* Content Wrapper for Scroll */}
                 <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                    {renderContent}
                 </div>
            </div>

            {/* Right Panel */}
            {showRightPanel && <ModernRightPanel />}
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
