import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Maximize2, Minimize2, Copy, Sparkles, Loader2, RotateCcw } from 'lucide-react';
import { generateInsight } from '../services/geminiService';
import { SurveyDataset, SimpleDataPoint, ComparisonDataPoint } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { COLORS, SATISFACTION_COLORS, QUESTION_MAPPINGS, QuestionMapping } from '../constants';
import { render3DPie } from './Pie3DRenderer';

const QUESTION_CONFIG_MAP = QUESTION_MAPPINGS.reduce<Record<string, QuestionMapping>>((acc, mapping) => {
  acc[mapping.id.toUpperCase()] = mapping;
  return acc;
}, {});

const numberFormatter = new Intl.NumberFormat('fr-FR');
const formatNumber = (value: number) => numberFormatter.format(value);
const formatPercent = (value: number, decimals = 1) => `${value.toFixed(decimals).replace('.', ',')}%`;

const NAME_CHANGE_COLORS = ['#6366f1', '#94a3b8'];
const POS_NEG_COLORS = ['#22c55e', '#ef4444'];

interface AIChatOverlayProps {
  currentData: SurveyDataset;
}

const AIChatOverlay: React.FC<AIChatOverlayProps> = ({ currentData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: "Bonjour ! Je suis **Fabrice**, votre assistant IA.\n\nJe suis là pour analyser vos données d'enquête. Demandez-moi par exemple :\n- *\"Quelle est la satisfaction globale ?\"*\n- *\"Fais-moi un résumé des points forts.\"*\n- *\"Compare les zones d'habitation.\"*" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await generateInsight(userMsg, currentData);
      setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    } catch (error) {
       setMessages(prev => [...prev, { role: 'assistant', text: "Désolé, une erreur technique est survenue." }]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const resetChat = () => {
    setMessages([{ role: 'assistant', text: "Bonjour ! Je suis **Fabrice**, votre assistant IA.\n\nComment puis-je vous aider aujourd'hui ?" }]);
  }

  // Helper to render the Chart inside the chat based on the key
  const renderChart = (chartKey: string) => {
    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

    if (chartKey === 'nameChangeAwareness') {
      const total = currentData.nameChangeAwareness.reduce((sum, slice) => sum + slice.value, 0) || 1;
      return (
        <div className="mt-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-4 shadow-sm">
          <div className="h-56">
            {render3DPie(currentData.nameChangeAwareness, {
              colors: NAME_CHANGE_COLORS,
              innerRadius: 50,
              showLegend: false,
              paddingAngle: 4,
              isDark,
            })}
          </div>
          <div className="space-y-2 text-xs">
            {currentData.nameChangeAwareness.map((slice, index) => {
              const percent = total ? (slice.value / total) * 100 : 0;
              return (
                <div key={`q9-row-${slice.name}`} className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-800 px-3 py-2 bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: NAME_CHANGE_COLORS[index % NAME_CHANGE_COLORS.length] }} />
                    {slice.name}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-white">{formatPercent(percent)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (chartKey === 'experienceChanges') {
      // Logic for experience changes chart...
      // Simplified for chat view, focusing on summary
      const totalPositive = currentData.experienceChanges.reduce((acc, curr) => acc + curr.positive, 0);
      const totalNegative = currentData.experienceChanges.reduce((acc, curr) => acc + curr.negative, 0);
      const summaryData = [
        { name: 'Positif', value: totalPositive },
        { name: 'Négatif', value: totalNegative }
      ];
      return (
        <div className="mt-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
            <div className="h-56">
              {render3DPie(summaryData, {
                colors: POS_NEG_COLORS,
                innerRadius: 50,
                showLegend: true,
                isDark,
              })}
            </div>
        </div>
      );
    }

    let data: SimpleDataPoint[] = [];
    let colors = COLORS;

    switch (chartKey) {
      case 'ageGroups': data = currentData.ageGroups; break;
      case 'zones': data = currentData.zones; break;
      case 'transport': data = currentData.transport; break;
      case 'frequency': data = currentData.frequency; break;
      case 'visitReason': data = currentData.visitReason; break;
      case 'competitors': data = currentData.competitors; break;
      case 'choiceReason': data = currentData.choiceReason; break;
      case 'satisfaction': data = currentData.satisfaction; colors = SATISFACTION_COLORS; break;
      case 'preferredDepartment': data = currentData.preferredDepartment; break;
      default: return null;
    }

    if (!data || data.length === 0) return null;

    return (
      <div className="mt-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm w-full max-w-sm mx-auto">
        <div className="h-64">
          {render3DPie(data, {
            colors,
            innerRadius: 50,
            paddingAngle: 4,
            showLegend: false,
            isDark,
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl shadow-indigo-500/30 transition-all duration-300 hover:scale-105 active:scale-95 group flex items-center justify-center ${
          isOpen ? 'bg-indigo-600 rotate-0' : 'bg-white dark:bg-slate-800'
        }`}
      > 
        {isOpen ? (
          <X className="text-white" size={24} />
        ) : (
          <div className="relative">
             <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
             <Bot className="text-indigo-600 dark:text-indigo-400 relative z-10" size={32} />
             <div className="absolute -top-2 -right-2 w-3 h-3 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse"></div>
          </div>
        )}
      </button>

      {/* Chat Window */}
      <div
        className={`fixed z-50 bg-white dark:bg-slate-950 rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-black/70 border border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 origin-bottom-right overflow-hidden ${
          isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-8 pointer-events-none'
        } ${
          isExpanded 
            ? 'bottom-6 right-6 w-[800px] h-[85vh] max-w-[95vw]' 
            : 'bottom-24 right-6 w-[440px] h-[600px] max-h-[80vh] max-w-[90vw]'
        }`}
      >
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Bot className="text-white w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white leading-tight">Fabrice</h3>
              <div className="flex items-center gap-1.5">
                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                 <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Assistant AI connecté</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
             <button 
              onClick={resetChat}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Nouvelle conversation"
            >
              <RotateCcw size={18} />
            </button>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50 dark:bg-slate-950" ref={scrollRef}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
               {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 mt-1 border border-indigo-200 dark:border-indigo-800">
                     <Bot size={16} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
               )}

              <div
                className={`max-w-[85%] rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-sm p-3.5'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-tl-sm p-4'
                }`}
              >
                {msg.role === 'user' ? (
                  msg.text
                ) : (
                  <div className="relative group">
                    {/* Content Parsing for Charts */}
                    {msg.text.split(/(\[\[CHART:\w+\]\])/).map((part, index) => {
                      if (part.startsWith('[[CHART:') && part.endsWith(']]')) {
                         const chartKey = part.replace('[[CHART:', '').replace(']]', '');
                         return <React.Fragment key={index}>{renderChart(chartKey)}</React.Fragment>;
                      }
                      if (!part.trim() && index !== 0) return null;
                      
                      return (
                        <ReactMarkdown 
                          key={index}
                          remarkPlugins={[remarkGfm]}
                          className="prose prose-sm dark:prose-invert max-w-none 
                            prose-p:leading-relaxed prose-p:my-1.5
                            prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white prose-headings:mt-4 prose-headings:mb-2
                            prose-strong:font-bold prose-strong:text-indigo-600 dark:prose-strong:text-indigo-400
                            prose-ul:my-2 prose-li:my-0.5
                            prose-table:text-xs prose-table:my-4 prose-table:border prose-table:border-slate-200 dark:prose-table:border-slate-700 prose-table:rounded-lg prose-table:overflow-hidden
                            prose-th:bg-slate-50 dark:prose-th:bg-slate-800 prose-th:p-2 prose-th:text-slate-700 dark:prose-th:text-slate-300
                            prose-td:p-2 prose-td:border-t prose-td:border-slate-100 dark:prose-td:border-slate-800"
                        >
                          {part}
                        </ReactMarkdown>
                      );
                    })}
                    
                    <button 
                      onClick={() => copyToClipboard(msg.text.replace(/\[\[CHART:\w+\]\]/g, ''))}
                      className="absolute -bottom-6 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-slate-400 hover:text-indigo-500 flex items-center gap-1"
                    >
                      <Copy size={12} /> Copier
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
             <div className="flex gap-3 justify-start animate-pulse">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
                    <Bot size={16} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl rounded-tl-sm p-4 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                   <div className="flex gap-1">
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                   </div>
                   <span className="text-xs text-slate-400 font-medium">Fabrice réfléchit...</span>
                </div>
             </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 rounded-b-2xl">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Envoyez un message à Fabrice..."
              className="w-full bg-slate-100 dark:bg-slate-800 border-0 rounded-2xl pl-4 pr-12 py-3.5 text-[15px] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/50 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-inner"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className={`absolute right-2 p-2 rounded-xl transition-all ${
                 input.trim() && !loading 
                 ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/30' 
                 : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send size={18} className={input.trim() && !loading ? 'ml-0.5' : ''} />
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-2">
             Fabrice peut faire des erreurs. Vérifiez toujours les données importantes.
          </p>
        </div>
      </div>
    </>
  );
};

export default AIChatOverlay;
