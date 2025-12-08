import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Loader2, Maximize2, Minimize2, Copy } from 'lucide-react';
import { generateInsight } from '../services/geminiService';
import { SurveyDataset } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { COLORS, SATISFACTION_COLORS } from '../constants';

interface AIChatOverlayProps {
  currentData: SurveyDataset;
}

const AIChatOverlay: React.FC<AIChatOverlayProps> = ({ currentData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: "Bonjour ! Je suis votre assistant analytique pour Hyper Analyse. Posez-moi vos questions sur les données (ex: 'Quelle est la satisfaction ?'), je peux afficher des graphiques." }
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

    const response = await generateInsight(userMsg, currentData);
    
    setLoading(false);
    setMessages(prev => [...prev, { role: 'assistant', text: response }]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Helper to render the Chart inside the chat based on the key
  const renderChart = (chartKey: string) => {
    let data: any[] = [];
    let colors = COLORS;

    // Map string key to dataset
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
      case 'nameChangeAwareness': data = currentData.nameChangeAwareness; colors = ['#22c55e', '#ef4444']; break;
      case 'experienceChanges': 
        // Transform Q10 for Pie Chart
        data = [
            { name: 'Positif', value: currentData.experienceChanges.reduce((acc, curr) => acc + curr.positive, 0) },
            { name: 'Négatif', value: currentData.experienceChanges.reduce((acc, curr) => acc + curr.negative, 0) }
        ];
        colors = ['#22c55e', '#ef4444'];
        break;
      default: return null;
    }

    if (!data || data.length === 0) return null;

    return (
      <div className="w-full h-64 mt-4 bg-slate-50 rounded-xl border border-slate-200 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              <filter id="shadow3dChat" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
                <feOffset in="blur" dx="2" dy="2" result="offsetBlur" />
                <feSpecularLighting in="blur" surfaceScale="5" specularConstant=".75" specularExponent="20" lightingColor="#ffffff" result="specOut">
                  <fePointLight x="-5000" y="-10000" z="20000" />
                </feSpecularLighting>
                <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut" />
                <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litPaint" />
                <feMerge>
                  <feMergeNode in="offsetBlur" />
                  <feMergeNode in="litPaint" />
                </feMerge>
              </filter>
            </defs>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={60}
              paddingAngle={4}
              dataKey="value"
              style={{ filter: 'url(#shadow3dChat)' }}
              stroke="none"
              label={({ percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke="rgba(255,255,255,0.2)" />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 ${
          isOpen ? 'bg-red-500 rotate-90' : 'bg-brand-600'
        } text-white`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Chat Window */}
      <div
        className={`fixed z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col transition-all duration-300 origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        } ${
          isExpanded 
            ? 'bottom-6 right-6 w-[800px] h-[80vh] max-w-[95vw]' 
            : 'bottom-24 right-6 w-96 h-[600px] max-h-[70vh] max-w-[90vw]'
        }`}
      >
        {/* Header */}
        <div className="bg-brand-600 p-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white">Assistant IA</h3>
              <p className="text-brand-100 text-xs">Propulsé par Gemini 2.5</p>
            </div>
          </div>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50" ref={scrollRef}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl text-sm overflow-hidden ${
                  msg.role === 'user'
                    ? 'bg-brand-600 text-white rounded-tr-none p-3'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'
                }`}
              >
                {msg.role === 'user' ? (
                  msg.text
                ) : (
                  <div className="relative group">
                    {/* Split message to find chart tags */}
                    {msg.text.split(/(\[\[CHART:\w+\]\])/).map((part, index) => {
                      if (part.startsWith('[[CHART:') && part.endsWith(']]')) {
                         const chartKey = part.replace('[[CHART:', '').replace(']]', '');
                         return <React.Fragment key={index}>{renderChart(chartKey)}</React.Fragment>;
                      }
                      // Skip empty strings resulted from split
                      if (!part.trim() && index !== 0) return null;
                      
                      return (
                        <ReactMarkdown 
                          key={index}
                          remarkPlugins={[remarkGfm]}
                          className="prose prose-sm max-w-none p-4 
                            prose-headings:text-slate-800 prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-2 
                            prose-p:text-slate-600 prose-p:my-2 
                            prose-strong:text-brand-700 prose-strong:font-bold 
                            prose-ul:list-disc prose-ul:ml-4 prose-ul:my-2 
                            prose-ol:list-decimal prose-ol:ml-4 
                            prose-li:text-slate-600 
                            prose-table:w-full prose-table:border-collapse prose-table:my-4 prose-table:text-xs
                            prose-th:bg-slate-100 prose-th:p-2 prose-th:text-left prose-th:border prose-th:border-slate-200
                            prose-td:p-2 prose-td:border prose-td:border-slate-200
                            prose-a:text-brand-600 prose-a:underline hover:prose-a:text-brand-800"
                        >
                          {part}
                        </ReactMarkdown>
                      );
                    })}
                    
                    <button 
                      onClick={() => copyToClipboard(msg.text.replace(/\[\[CHART:\w+\]\]/g, ''))}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-slate-100 rounded text-slate-500 hover:text-brand-600 z-10"
                      title="Copier le texte"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                <span className="text-xs text-slate-500">Analyse des données et génération du graphique...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100 rounded-b-2xl">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Analysez les tendances, comparez les zones..."
              className="flex-1 bg-slate-100 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="bg-brand-600 text-white p-3 rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-brand-200"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIChatOverlay;