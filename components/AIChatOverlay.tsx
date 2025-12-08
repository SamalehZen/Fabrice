import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Loader2, Maximize2, Minimize2, Copy } from 'lucide-react';
import { generateInsight } from '../services/geminiService';
import { SurveyDataset } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AIChatOverlayProps {
  currentData: SurveyDataset;
}

const AIChatOverlay: React.FC<AIChatOverlayProps> = ({ currentData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: "Bonjour ! Je suis votre assistant analytique pour le Bawadi Mall. Posez-moi vos questions sur les données de l'enquête, je peux générer des tableaux et des analyses détaillées." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    // Pass the current data state to the service
    const response = await generateInsight(userMsg, currentData);
    
    setLoading(false);
    setMessages(prev => [...prev, { role: 'assistant', text: response }]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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
                    <ReactMarkdown 
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
                      {msg.text}
                    </ReactMarkdown>
                    <button 
                      onClick={() => copyToClipboard(msg.text)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-slate-100 rounded text-slate-500 hover:text-brand-600"
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
                <span className="text-xs text-slate-500">Analyse des données en cours...</span>
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