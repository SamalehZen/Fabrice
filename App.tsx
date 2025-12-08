import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import QuestionsView from './components/QuestionsView';
import DataEditor from './components/DataEditor';
import AIChatOverlay from './components/AIChatOverlay';
import { LayoutDashboard, PieChart as PieChartIcon, Database, Menu } from 'lucide-react';
import { SURVEY_DATA } from './constants';
import { SurveyDataset } from './types';

const App: React.FC = () => {
  // Central State for Survey Data to enable real-time editing
  const [surveyData, setSurveyData] = useState<SurveyDataset>(JSON.parse(JSON.stringify(SURVEY_DATA)));
  const [activeTab, setActiveTab] = useState<'dashboard' | 'questions' | 'editor'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 bg-opacity-95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-brand-600 p-2 rounded-lg shadow-md shadow-brand-200">
              <LayoutDashboard className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none">
                Hyper <span className="text-brand-600">Analyse</span>
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-1">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'dashboard' 
                ? 'bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-200' 
                : 'text-slate-600 hover:bg-slate-50'
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
                ? 'bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-200' 
                : 'text-slate-600 hover:bg-slate-50'
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
                ? 'bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-200' 
                : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Database size={16} /> Éditeur de données
              </span>
            </button>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-slate-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 p-4 space-y-2">
            <button 
              onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${activeTab === 'dashboard' ? 'bg-brand-50 text-brand-700' : 'text-slate-600'}`}
            >
              <LayoutDashboard size={18} /> Tableau de bord
            </button>
            <button 
              onClick={() => { setActiveTab('questions'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${activeTab === 'questions' ? 'bg-brand-50 text-brand-700' : 'text-slate-600'}`}
            >
              <PieChartIcon size={18} /> Questions (camemberts)
            </button>
            <button 
              onClick={() => { setActiveTab('editor'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${activeTab === 'editor' ? 'bg-brand-50 text-brand-700' : 'text-slate-600'}`}
            >
              <Database size={18} /> Éditeur de données
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            {activeTab === 'dashboard' && "Panorama de l'analyse"}
            {activeTab === 'questions' && 'Analyse des questions (camemberts)'}
            {activeTab === 'editor' && 'Gestion des données'}
          </h2>
          <p className="text-slate-500 mt-1 max-w-2xl">
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

      {/* AI Assistant - now aware of dynamic data */}
      <AIChatOverlay currentData={surveyData} />
    </div>
  );
};

export default App;