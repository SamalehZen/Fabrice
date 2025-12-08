import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import QuestionsView from './components/QuestionsView';
import DataEditor from './components/DataEditor';
import AIChatOverlay from './components/AIChatOverlay';
import { 
  LayoutDashboard, 
  PieChart as PieChartIcon, 
  Database, 
  MessageSquare,
  Settings,
  Bell,
  Search,
  User 
} from 'lucide-react';
import { SURVEY_DATA } from './constants';
import { SurveyDataset } from './types';

const App: React.FC = () => {
  const [surveyData, setSurveyData] = useState<SurveyDataset>(JSON.parse(JSON.stringify(SURVEY_DATA)));
  const [activeTab, setActiveTab] = useState<'dashboard' | 'questions' | 'editor'>('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Force light mode for this specific design request
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#E4E5E7] p-4 gap-4 font-sans text-slate-800 overflow-hidden">
      
      {/* Sidebar - Floating Pill Style */}
      <aside className="w-20 bg-[#E0E0E0] md:bg-white rounded-[2.5rem] flex flex-col items-center py-6 shadow-soft z-50 justify-between shrink-0 hidden md:flex">
        <div className="flex flex-col items-center gap-8">
          {/* Logo */}
          <div className="w-12 h-12 bg-[#D4E157] rounded-2xl flex items-center justify-center shadow-lg shadow-[#D4E157]/40 text-slate-900 font-bold text-xl">
            H
          </div>

          {/* Nav Items */}
          <nav className="flex flex-col gap-6 w-full px-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`p-3 rounded-2xl transition-all duration-300 relative group flex justify-center ${
                activeTab === 'dashboard'
                  ? 'bg-white text-slate-900 shadow-lg'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
              }`}
            >
              <LayoutDashboard size={22} className={activeTab === 'dashboard' ? 'stroke-[2.5px]' : ''} />
              {activeTab === 'dashboard' && <span className="absolute -right-1 top-1 w-2 h-2 bg-red-400 rounded-full"></span>}
            </button>

            <button
              onClick={() => setActiveTab('questions')}
              className={`p-3 rounded-2xl transition-all duration-300 flex justify-center ${
                activeTab === 'questions'
                  ? 'bg-white text-slate-900 shadow-lg'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
              }`}
            >
              <PieChartIcon size={22} className={activeTab === 'questions' ? 'stroke-[2.5px]' : ''} />
            </button>

            <button
              onClick={() => setActiveTab('editor')}
              className={`p-3 rounded-2xl transition-all duration-300 flex justify-center ${
                activeTab === 'editor'
                  ? 'bg-white text-slate-900 shadow-lg'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
              }`}
            >
              <Database size={22} className={activeTab === 'editor' ? 'stroke-[2.5px]' : ''} />
            </button>
            
            <div className="w-8 h-[2px] bg-slate-300 rounded-full mx-auto my-1"></div>

             <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`p-3 rounded-2xl transition-all duration-300 flex justify-center ${
                isChatOpen
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                  : 'text-slate-400 hover:text-brand-500 hover:bg-brand-50'
              }`}
            >
              <MessageSquare size={22} />
            </button>

          </nav>
        </div>

        <div className="flex flex-col items-center gap-6">
          <button className="text-slate-400 hover:text-slate-600 transition-colors">
            <Bell size={20} />
          </button>
          <button className="text-slate-400 hover:text-slate-600 transition-colors">
            <Settings size={20} />
          </button>
          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative rounded-[2.5rem] bg-[#E4E5E7]">
         {/* Mobile Header (visible only on small screens) */}
         <div className="md:hidden flex justify-between items-center p-4 bg-white/50 rounded-2xl mb-4 mx-2 mt-2">
            <div className="w-10 h-10 bg-[#D4E157] rounded-xl flex items-center justify-center font-bold">H</div>
            <div className="flex gap-4">
              <button 
                onClick={() => setActiveTab('dashboard')} 
                className={activeTab === 'dashboard' ? 'text-slate-900' : 'text-slate-400'}
              >
                <LayoutDashboard />
              </button>
              <button 
                onClick={() => setActiveTab('questions')} 
                className={activeTab === 'questions' ? 'text-slate-900' : 'text-slate-400'}
              >
                <PieChartIcon />
              </button>
              <button 
                onClick={() => setActiveTab('editor')} 
                className={activeTab === 'editor' ? 'text-slate-900' : 'text-slate-400'}
              >
                <Database />
              </button>
            </div>
         </div>

         {/* Content Scroll Area */}
         <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar p-2 md:p-4">
            <div className="max-w-[1600px] mx-auto min-h-full">
               {/* View Renderer */}
               {activeTab === 'dashboard' && <Dashboard data={surveyData} />}
               {activeTab === 'questions' && <QuestionsView data={surveyData} />}
               {activeTab === 'editor' && <DataEditor data={surveyData} onUpdate={setSurveyData} />}
            </div>
         </div>
      </main>

      {/* Chat Overlay - Passed state controls */}
      <AIChatOverlay currentData={surveyData} isOpen={isChatOpen} setIsOpen={setIsChatOpen} />
    </div>
  );
};

export default App;