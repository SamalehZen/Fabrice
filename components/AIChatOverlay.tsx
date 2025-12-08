import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, X, Copy, Bot } from 'lucide-react';
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

const SUMMARY_REGEX = /(rapport|résumé|resume|synthèse|synthese|bilan|summary)/i;

const extractQuestionIds = (text: string): string[] => {
  if (!text) return [];
  const matches = new Set<string>();
  const regex = /(question\s*(\d+)|\bQ(\d+)\b)/gi;
  let match: RegExpExecArray | null = null;
  while ((match = regex.exec(text)) !== null) {
    const numberString = match[2] || match[3];
    if (!numberString) continue;
    const numberValue = Number(numberString);
    if (!Number.isNaN(numberValue) && numberValue >= 0 && numberValue <= 10) {
      matches.add(`Q${numberValue}`);
    }
  }
  return Array.from(matches);
};

const numberFormatter = new Intl.NumberFormat('fr-FR');
const formatNumber = (value: number) => numberFormatter.format(value);
const formatPercent = (value: number, decimals = 1) => `${value.toFixed(decimals).replace('.', ',')}%`;

const NAME_CHANGE_COLORS = ['#38BDF8', '#94A3B8'];
const POS_NEG_COLORS = ['#4ADE80', '#F87171'];
const isSummaryPrompt = (text: string) => (text ? SUMMARY_REGEX.test(text) : false);

interface AIChatOverlayProps {
  currentData: SurveyDataset;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const AIChatOverlay: React.FC<AIChatOverlayProps> = ({ currentData, isOpen, setIsOpen }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: "Bonjour ! Je suis l'IA Hyper Analyse. Je peux analyser vos données et générer des rapports." }
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
    const enrichedResponse = enforceResponseVisuals(userMsg, response);
    
    setLoading(false);
    setMessages(prev => [...prev, { role: 'assistant', text: enrichedResponse }]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // ... (keeping helper functions for table/summary building - they are pure logic)
  const getTopEntry = (dataset: SimpleDataPoint[]) => {
    if (!dataset || dataset.length === 0) return null;
    return dataset.reduce((prev, curr) => (curr.value > prev.value ? curr : prev));
  };
    const buildSimpleTable = (dataset: SimpleDataPoint[]) => {
    if (!dataset || dataset.length === 0) return '';
    const total = dataset.reduce((sum, item) => sum + item.value, 0) || 1;
    const header = '| Option | Réponses | Part |\n| --- | ---: | ---: |\n';
    const rows = dataset
      .map((item) => {
        const percent = (item.value / total) * 100;
        return `| ${item.name} | ${formatNumber(item.value)} | ${formatPercent(percent)} |`;
      })
      .join('\n');
    return `${header}${rows}`;
  };

  const buildExperienceTable = (dataset: ComparisonDataPoint[]) => {
    if (!dataset || dataset.length === 0) return '';
    const header = '| Catégorie | Perception positive | Perception négative |\n| --- | ---: | ---: |\n';
    const rows = dataset
      .map((item) => {
        const total = item.positive + item.negative || 1;
        const positiveShare = (item.positive / total) * 100;
        const negativeShare = (item.negative / total) * 100;
        return `| ${item.category} | ${formatNumber(item.positive)} (${formatPercent(positiveShare)}) | ${formatNumber(item.negative)} (${formatPercent(negativeShare)}) |`;
      })
      .join('\n');
    return `${header}${rows}`;
  };

  const buildTableForKey = (key: keyof SurveyDataset) => {
    if (key === 'experienceChanges') {
      return buildExperienceTable(currentData.experienceChanges);
    }
    return buildSimpleTable(currentData[key] as SimpleDataPoint[]);
  };

  const computeSummaryMetrics = () => {
    const zoneTop = getTopEntry(currentData.zones);
    const reasonTop = getTopEntry(currentData.visitReason);
    const freqTop = getTopEntry(currentData.frequency);
    const departmentTop = getTopEntry(currentData.preferredDepartment);
    const totalZones = currentData.zones.reduce((sum, item) => sum + item.value, 0) || 1;
    const totalVisitReason = currentData.visitReason.reduce((sum, item) => sum + item.value, 0) || 1;
    const totalFrequency = currentData.frequency.reduce((sum, item) => sum + item.value, 0) || 1;
    const totalDepartment = currentData.preferredDepartment.reduce((sum, item) => sum + item.value, 0) || 1;
    const totalSatisfaction = currentData.satisfaction.reduce((sum, item) => sum + item.value, 0) || 1;
    const satisfiedCount = currentData.satisfaction
      .filter((item) => item.name.toLowerCase().includes('satisfait'))
      .reduce((sum, item) => sum + item.value, 0);

    return {
      zoneTop,
      reasonTop,
      freqTop,
      departmentTop,
      totalZones,
      totalVisitReason,
      totalFrequency,
      totalDepartment,
      totalSatisfaction,
      satisfiedCount,
    };
  };

  const buildSummaryTable = () => {
    const {
      zoneTop,
      reasonTop,
      freqTop,
      departmentTop,
      totalZones,
      totalVisitReason,
      totalFrequency,
      totalDepartment,
      totalSatisfaction,
      satisfiedCount,
    } = computeSummaryMetrics();

    const rows: { indicator: string; result: string; source: string }[] = [];

    if (zoneTop) {
      const share = (zoneTop.value / totalZones) * 100;
      rows.push({
        indicator: 'Zone dominante',
        result: `${zoneTop.name} (${formatNumber(zoneTop.value)} répondants, ${formatPercent(share)})`,
        source: 'Q1 - Zones',
      });
    }

    if (reasonTop) {
      const share = (reasonTop.value / totalVisitReason) * 100;
      rows.push({
        indicator: 'Motif principal',
        result: `${reasonTop.name} (${formatNumber(reasonTop.value)} répondants, ${formatPercent(share)})`,
        source: 'Q4 - Motifs',
      });
    }

    if (freqTop) {
      const share = (freqTop.value / totalFrequency) * 100;
      rows.push({
        indicator: 'Fréquence la plus citée',
        result: `${freqTop.name} (${formatNumber(freqTop.value)} répondants, ${formatPercent(share)})`,
        source: 'Q3 - Fréquence',
      });
    }

    if (departmentTop) {
      const share = (departmentTop.value / totalDepartment) * 100;
      rows.push({
        indicator: 'Rayon privilégié',
        result: `${departmentTop.name} (${formatNumber(departmentTop.value)} visites, ${formatPercent(share)})`,
        source: 'Q8 - Rayons',
      });
    }

    if (totalSatisfaction) {
      const satisfactionShare = (satisfiedCount / totalSatisfaction) * 100;
      rows.push({
        indicator: 'Clients satisfaits',
        result: `${formatNumber(satisfiedCount)} répondants (${formatPercent(satisfactionShare)})`,
        source: 'Q7 - Satisfaction',
      });
    }

    if (rows.length === 0) return '';

    const header = '| Indicateur | Résultat | Source |\n| --- | --- | --- |\n';
    const body = rows
      .map((row) => `| ${row.indicator} | ${row.result} | ${row.source} |`)
      .join('\n');

    return `${header}${body}`;
  };

  // ... (rest of logic for enforcing visuals is same as before, simplified for this context)
  
  const enforceResponseVisuals = (prompt: string, assistantText: string) => {
    let enrichedResponse = assistantText || '';
    const questionIds = extractQuestionIds(prompt).map((id) => id.toUpperCase());

    questionIds.forEach((questionId) => {
      const mapping = QUESTION_CONFIG_MAP[questionId];
      if (!mapping) return;
      const blockTitle = `#### Tableau professionnel – ${questionId}`;
      const chartTag = `[[CHART:${mapping.chart}]]`;
      const hasTable = enrichedResponse.includes('Tableau') || enrichedResponse.includes('|'); // Simplified check
      const hasChart = enrichedResponse.includes(chartTag);
      const additions: string[] = [];
      if (!hasTable) {
         const table = buildTableForKey(mapping.key);
         if(table) additions.push(`${blockTitle}\n${table}`);
      }
      if (!hasChart) {
        additions.push(chartTag);
      }
      if (additions.length) {
        enrichedResponse += `\n\n${additions.join('\n')}`;
      }
    });

    if (isSummaryPrompt(prompt)) {
      const summaryTitle = '### Rapport synthétique officiel';
      if (!enrichedResponse.includes(summaryTitle)) {
        const table = buildSummaryTable();
        if(table) enrichedResponse += `\n\n${summaryTitle}\n${table}\n\n[[CHART:satisfaction]]`;
      }
    }

    return enrichedResponse;
  };


  const renderChart = (chartKey: string) => {
    // ... same as before but style adjustment
     if (chartKey === 'nameChangeAwareness') {
      const total = currentData.nameChangeAwareness.reduce((sum, slice) => sum + slice.value, 0) || 1;
      return (
        <div className="mt-4 bg-white/50 border border-slate-200 rounded-2xl p-4 space-y-4">
          <div className="h-48">
            {render3DPie(currentData.nameChangeAwareness, {
              colors: NAME_CHANGE_COLORS,
              innerRadius: 40,
              showLegend: false,
              paddingAngle: 4,
              isDark: false,
            })}
          </div>
        </div>
      );
    }

    if (chartKey === 'experienceChanges') {
      const totalPositive = currentData.experienceChanges.reduce((acc, curr) => acc + curr.positive, 0);
      const totalNegative = currentData.experienceChanges.reduce((acc, curr) => acc + curr.negative, 0);
      const summaryData = [
        { name: 'Positif', value: totalPositive },
        { name: 'Négatif', value: totalNegative }
      ];

      return (
        <div className="mt-4 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white/50 p-4">
            <div className="h-48">
              {render3DPie(summaryData, {
                colors: POS_NEG_COLORS,
                innerRadius: 40,
                showLegend: false,
                isDark: false,
              })}
            </div>
          </div>
        </div>
      );
    }

    let data: SimpleDataPoint[] = [];
    let colors = COLORS;

    if (chartKey === 'satisfaction') {
        data = currentData.satisfaction;
        colors = SATISFACTION_COLORS;
    } else {
        // ... map other keys ...
        // Simplified for brevity, assume keys map nicely
        const map: any = {
            'ageGroups': currentData.ageGroups,
            'zones': currentData.zones,
            'transport': currentData.transport,
            'frequency': currentData.frequency,
            'visitReason': currentData.visitReason,
            'competitors': currentData.competitors,
            'choiceReason': currentData.choiceReason,
            'preferredDepartment': currentData.preferredDepartment
        }
        data = map[chartKey];
    }
    
    if (!data || data.length === 0) return null;

    return (
      <div className="mt-4 bg-white/50 border border-slate-200 rounded-2xl p-4 space-y-4">
        <div className="h-56">
          {render3DPie(data, {
            colors,
            innerRadius: 40,
            showLegend: false,
            isDark: false,
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        className={`fixed inset-y-0 right-0 z-[60] w-[450px] bg-white/90 backdrop-blur-xl border-l border-slate-200 shadow-2xl transition-transform duration-500 ease-in-out transform flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#D4E157] rounded-xl flex items-center justify-center shadow-lg shadow-[#D4E157]/30">
              <Bot className="text-slate-800" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Assistant IA</h3>
              <p className="text-xs text-slate-500 font-medium">Toujours prêt à aider</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-3xl p-4 text-sm shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-sm'
                    : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm'
                }`}
              >
                {msg.role === 'user' ? (
                  msg.text
                ) : (
                  <div className="relative group space-y-2">
                    {msg.text.split(/(\[\[CHART:\w+\]\])/).map((part, index) => {
                      if (part.startsWith('[[CHART:') && part.endsWith(']]')) {
                         const chartKey = part.replace('[[CHART:', '').replace(']]', '');
                         return <React.Fragment key={index}>{renderChart(chartKey)}</React.Fragment>;
                      }
                      if (!part.trim()) return null;
                      
                      return (
                        <ReactMarkdown 
                          key={index}
                          remarkPlugins={[remarkGfm]}
                          className="prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-slate-800 prose-p:text-slate-600 prose-li:text-slate-600 prose-strong:text-slate-900 prose-table:text-xs prose-th:bg-slate-50 prose-td:border-slate-100"
                        >
                          {part}
                        </ReactMarkdown>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-3xl rounded-tl-sm shadow-sm border border-slate-100 flex items-center gap-3">
                <Loader2 className="w-4 h-4 animate-spin text-[#D4E157]" />
                <span className="text-xs text-slate-400 font-medium tracking-wide">L'IA réfléchit...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-6 bg-white border-t border-slate-100">
           <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Posez une question..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-6 pr-14 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#D4E157] transition-all placeholder:text-slate-400 font-medium"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="absolute right-2 top-2 p-2 bg-[#D4E157] text-slate-800 rounded-xl hover:bg-[#C0CA33] disabled:opacity-50 transition-colors"
              >
                <Send size={18} />
              </button>
           </div>
        </div>

      </div>
      
      {/* Overlay Backdrop */}
      {isOpen && (
        <div 
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 transition-opacity"
            onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default AIChatOverlay;