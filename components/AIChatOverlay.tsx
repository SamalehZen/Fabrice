import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Loader2, Maximize2, Minimize2, Copy } from 'lucide-react';
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
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const MARKDOWN_TABLE_REGEX = /\|[^\n]+\|\n\|(?:\s*:?-+:?\s*\|)+\n(?:\|[^\n]+\|\n?)*/m;
const containsMarkdownTable = (text: string) => MARKDOWN_TABLE_REGEX.test(text);
const hasQuestionTable = (text: string, questionId: string) => {
  if (!text || !questionId) return false;
  const escaped = escapeRegExp(questionId);
  const numericId = Number(questionId.replace(/[^0-9]/g, ''));
  const patternSource = Number.isNaN(numericId) ? escaped : `${escaped}|question\\s*${numericId}`;
  const pattern = new RegExp(patternSource, 'i');
  const match = pattern.exec(text);
  if (!match) return false;
  const windowStart = Math.max(0, match.index - 200);
  const windowEnd = Math.min(text.length, match.index + 800);
  return containsMarkdownTable(text.slice(windowStart, windowEnd));
};

const NAME_CHANGE_COLORS = ['#A8D4F0', '#D9D4C7'];
const POS_NEG_COLORS = ['#B8D4B4', '#F5C4C4'];
const isSummaryPrompt = (text: string) => (text ? SUMMARY_REGEX.test(text) : false);

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
    const enrichedResponse = enforceResponseVisuals(userMsg, response);
    setLoading(false);
    setMessages(prev => [...prev, { role: 'assistant', text: enrichedResponse }]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getTopEntry = (dataset: SimpleDataPoint[]) => {
    if (!dataset || dataset.length === 0) return null;
    return dataset.reduce((prev, curr) => (curr.value > prev.value ? curr : prev));
  };

  const buildSimpleTable = (dataset: SimpleDataPoint[]) => {
    if (!dataset || dataset.length === 0) return '';
    const total = dataset.reduce((sum, item) => sum + item.value, 0) || 1;
    const header = '| Option | Réponses | Part |\n| --- | ---: | ---: |\n';
    const rows = dataset.map((item) => {
      const percent = (item.value / total) * 100;
      return `| ${item.name} | ${formatNumber(item.value)} | ${formatPercent(percent)} |`;
    }).join('\n');
    return `${header}${rows}`;
  };

  const buildExperienceTable = (dataset: ComparisonDataPoint[]) => {
    if (!dataset || dataset.length === 0) return '';
    const header = '| Catégorie | Perception positive | Perception négative |\n| --- | ---: | ---: |\n';
    const rows = dataset.map((item) => {
      const total = item.positive + item.negative || 1;
      const positiveShare = (item.positive / total) * 100;
      const negativeShare = (item.negative / total) * 100;
      return `| ${item.category} | ${formatNumber(item.positive)} (${formatPercent(positiveShare)}) | ${formatNumber(item.negative)} (${formatPercent(negativeShare)}) |`;
    }).join('\n');
    return `${header}${rows}`;
  };

  const buildTableForKey = (key: keyof SurveyDataset) => {
    if (key === 'experienceChanges') return buildExperienceTable(currentData.experienceChanges);
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
    const satisfiedCount = currentData.satisfaction.filter((item) => item.name.toLowerCase().includes('satisfait')).reduce((sum, item) => sum + item.value, 0);
    return { zoneTop, reasonTop, freqTop, departmentTop, totalZones, totalVisitReason, totalFrequency, totalDepartment, totalSatisfaction, satisfiedCount };
  };

  const buildSummaryTable = () => {
    const { zoneTop, reasonTop, freqTop, departmentTop, totalZones, totalVisitReason, totalFrequency, totalDepartment, totalSatisfaction, satisfiedCount } = computeSummaryMetrics();
    const rows: { indicator: string; result: string; source: string }[] = [];
    if (zoneTop) {
      const share = (zoneTop.value / totalZones) * 100;
      rows.push({ indicator: 'Zone dominante', result: `${zoneTop.name} (${formatNumber(zoneTop.value)} répondants, ${formatPercent(share)})`, source: 'Q1 - Zones' });
    }
    if (reasonTop) {
      const share = (reasonTop.value / totalVisitReason) * 100;
      rows.push({ indicator: 'Motif principal', result: `${reasonTop.name} (${formatNumber(reasonTop.value)} répondants, ${formatPercent(share)})`, source: 'Q4 - Motifs' });
    }
    if (freqTop) {
      const share = (freqTop.value / totalFrequency) * 100;
      rows.push({ indicator: 'Fréquence la plus citée', result: `${freqTop.name} (${formatNumber(freqTop.value)} répondants, ${formatPercent(share)})`, source: 'Q3 - Fréquence' });
    }
    if (departmentTop) {
      const share = (departmentTop.value / totalDepartment) * 100;
      rows.push({ indicator: 'Rayon privilégié', result: `${departmentTop.name} (${formatNumber(departmentTop.value)} visites, ${formatPercent(share)})`, source: 'Q8 - Rayons' });
    }
    if (totalSatisfaction) {
      const satisfactionShare = (satisfiedCount / totalSatisfaction) * 100;
      rows.push({ indicator: 'Clients satisfaits', result: `${formatNumber(satisfiedCount)} répondants (${formatPercent(satisfactionShare)})`, source: 'Q7 - Satisfaction' });
    }
    if (rows.length === 0) return '';
    const header = '| Indicateur | Résultat | Source |\n| --- | --- | --- |\n';
    const body = rows.map((row) => `| ${row.indicator} | ${row.result} | ${row.source} |`).join('\n');
    return `${header}${body}`;
  };

  const buildSummaryNarrative = () => {
    const { zoneTop, reasonTop, freqTop, departmentTop, totalZones, totalVisitReason, totalFrequency, totalDepartment, totalSatisfaction, satisfiedCount } = computeSummaryMetrics();
    const sentences: string[] = [];
    if (zoneTop) {
      const share = (zoneTop.value / totalZones) * 100;
      sentences.push(`Les répondants proviennent majoritairement de ${zoneTop.name} (${formatPercent(share)} des ${formatNumber(totalZones)} participants).`);
    }
    if (reasonTop) {
      const share = (reasonTop.value / totalVisitReason) * 100;
      sentences.push(`Le motif dominant reste "${reasonTop.name}" avec ${formatNumber(reasonTop.value)} citations (${formatPercent(share)}).`);
    }
    if (freqTop && departmentTop) {
      const freqShare = (freqTop.value / totalFrequency) * 100;
      const deptShare = (departmentTop.value / totalDepartment) * 100;
      sentences.push(`La fréquence ${freqTop.name.toLowerCase()} représente ${formatPercent(freqShare)}, tandis que le rayon ${departmentTop.name} concentre ${formatPercent(deptShare)} des préférences.`);
    }
    if (totalSatisfaction) {
      const satisfactionShare = (satisfiedCount / totalSatisfaction) * 100;
      sentences.push(`Au global, ${formatPercent(satisfactionShare)} des clients se déclarent satisfaits ou très satisfaits (${formatNumber(satisfiedCount)} réponses sur ${formatNumber(totalSatisfaction)}).`);
    }
    return sentences.join(' ');
  };

  const enforceResponseVisuals = (prompt: string, assistantText: string) => {
    let enrichedResponse = assistantText || '';
    const questionIds = extractQuestionIds(prompt).map((id) => id.toUpperCase());
    questionIds.forEach((questionId) => {
      const mapping = QUESTION_CONFIG_MAP[questionId];
      if (!mapping) return;
      const blockTitle = `#### Tableau professionnel – ${questionId}`;
      const chartTag = `[[CHART:${mapping.chart}]]`;
      const hasTable = enrichedResponse.includes(blockTitle) || hasQuestionTable(enrichedResponse, questionId);
      const hasChart = enrichedResponse.includes(chartTag);
      const additions: string[] = [];
      if (!hasTable) {
        const table = buildTableForKey(mapping.key);
        const tableContent = table || '_Aucune donnée disponible pour cette question._';
        additions.push(`${blockTitle}\n${tableContent}`);
      }
      if (!hasChart) additions.push(chartTag);
      if (additions.length) enrichedResponse += `\n\n${additions.join('\n')}`;
    });
    if (isSummaryPrompt(prompt)) {
      const summaryTitle = '### Rapport synthétique officiel';
      if (!enrichedResponse.includes(summaryTitle)) {
        const table = buildSummaryTable();
        const narrative = buildSummaryNarrative();
        enrichedResponse += `\n\n${summaryTitle}\n${table || '_Aucune donnée pour le rapport global._'}\n\n${narrative || ''}\n\n[[CHART:satisfaction]]`;
      }
    }
    return enrichedResponse;
  };

  const renderChart = (chartKey: string) => {
    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    if (chartKey === 'nameChangeAwareness') {
      const total = currentData.nameChangeAwareness.reduce((sum, slice) => sum + slice.value, 0) || 1;
      return (
        <div className="mt-4 bg-white dark:bg-charcoal-800 border border-cream-300 dark:border-charcoal-700 rounded-2xl p-4 space-y-4 shadow-sm">
          <div className="h-56">{render3DPie(currentData.nameChangeAwareness, { colors: NAME_CHANGE_COLORS, innerRadius: 55, showLegend: false, paddingAngle: 4, isDark })}</div>
          <div className="space-y-2 text-xs">
            {currentData.nameChangeAwareness.map((slice, index) => {
              const percent = total ? (slice.value / total) * 100 : 0;
              return (
                <div key={`q9-row-${slice.name}`} className="flex items-center justify-between rounded-xl border border-cream-200 dark:border-charcoal-700 px-3 py-2 bg-cream-100 dark:bg-charcoal-700">
                  <div className="flex items-center gap-2 font-semibold text-charcoal-900 dark:text-cream-100">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: NAME_CHANGE_COLORS[index % NAME_CHANGE_COLORS.length] }} />
                    {slice.name}
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-charcoal-900 dark:text-white">{formatPercent(percent)}</p>
                    <p className="text-[11px] text-charcoal-900/50 dark:text-cream-400">{formatNumber(slice.value)} réponses</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    if (chartKey === 'experienceChanges') {
      const totalPositive = currentData.experienceChanges.reduce((acc, curr) => acc + curr.positive, 0);
      const totalNegative = currentData.experienceChanges.reduce((acc, curr) => acc + curr.negative, 0);
      const summaryTotal = totalPositive + totalNegative || 1;
      const summaryData = [{ name: 'Perception positive', value: totalPositive }, { name: 'Perception négative', value: totalNegative }];
      const detailCharts = currentData.experienceChanges.map((item) => ({
        category: item.category, total: item.positive + item.negative,
        slices: [{ name: item.labelPositive || 'Positif', value: item.positive }, { name: item.labelNegative || 'Négatif', value: item.negative }]
      }));
      return (
        <div className="mt-4 space-y-4">
          <div className="rounded-2xl border border-cream-300 dark:border-charcoal-700 bg-gradient-to-b from-white to-cream-100 dark:from-charcoal-800 dark:to-charcoal-900 p-4 shadow-sm">
            <div className="h-56">{render3DPie(summaryData, { colors: POS_NEG_COLORS, innerRadius: 55, paddingAngle: 6, showLegend: false, isDark })}</div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              {summaryData.map((item) => (
                <div key={`q10-highlight-${item.name}`} className="rounded-xl border border-cream-200 dark:border-charcoal-700 px-3 py-2 bg-white dark:bg-charcoal-800">
                  <p className="text-[11px] uppercase tracking-wide text-charcoal-900/50 dark:text-cream-400">{item.name}</p>
                  <p className="text-2xl font-bold text-charcoal-900 dark:text-white mt-1">{formatPercent((item.value / summaryTotal) * 100)}</p>
                  <p className="text-[11px] text-charcoal-900/50 dark:text-cream-400">{formatNumber(item.value)} réponses</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {detailCharts.map((chart) => {
              const total = chart.total || 1;
              return (
                <div key={`q10-detail-${chart.category}`} className="rounded-2xl border border-cream-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-charcoal-900 dark:text-white">Répartition – {chart.category}</p>
                    <span className="text-[11px] text-charcoal-900/50 dark:text-cream-400">{formatNumber(chart.total)} réponses</span>
                  </div>
                  <div className="mt-3 flex items-center gap-4">
                    <div className="w-24 h-24">{render3DPie(chart.slices, { colors: POS_NEG_COLORS, innerRadius: 40, outerRadius: 60, paddingAngle: 4, showLegend: false, minLabelPercent: 0.12, isDark, labelPosition: 'inside' })}</div>
                    <div className="flex-1 space-y-2 text-xs">
                      {chart.slices.map((slice, index) => {
                        const percent = total ? (slice.value / total) * 100 : 0;
                        return (
                          <div key={`q10-row-${chart.category}-${slice.name}`}>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-2 font-semibold text-charcoal-900 dark:text-cream-100">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: POS_NEG_COLORS[index % POS_NEG_COLORS.length] }} />
                                {slice.name}
                              </span>
                              <span className="font-semibold text-charcoal-900 dark:text-white">{formatPercent(percent)}</span>
                            </div>
                            <div className="mt-1 h-1.5 w-full rounded-full bg-cream-200 dark:bg-charcoal-700 overflow-hidden">
                              <span className="block h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: POS_NEG_COLORS[index % POS_NEG_COLORS.length] }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
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
    const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
    return (
      <div className="mt-4 bg-white dark:bg-charcoal-800 border border-cream-300 dark:border-charcoal-700 rounded-2xl p-4 space-y-4 shadow-sm">
        <div className="h-64">{render3DPie(data, { colors, innerRadius: 55, paddingAngle: 4, showLegend: false, isDark })}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {data.map((slice, index) => {
            const percent = total ? (slice.value / total) * 100 : 0;
            return (
              <div key={`chat-card-${chartKey}-${slice.name}`} className="flex items-center justify-between rounded-xl border border-cream-200 dark:border-charcoal-700 px-3 py-2 bg-cream-100 dark:bg-charcoal-700">
                <div className="flex items-center gap-2 font-semibold text-charcoal-900 dark:text-cream-100">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                  {slice.name}
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-charcoal-900 dark:text-white">{formatPercent(percent)}</p>
                  <p className="text-[11px] text-charcoal-900/50 dark:text-cream-400">{formatNumber(slice.value)} réponses</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 ${isOpen ? 'bg-red-500 rotate-90' : 'bg-sage-400'} text-white`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
      <div
        className={`fixed z-50 bg-white dark:bg-charcoal-800 rounded-2xl shadow-2xl border border-cream-300 dark:border-charcoal-700 flex flex-col transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'} ${isExpanded ? 'bottom-6 right-6 w-[920px] h-[80vh] max-w-[96vw]' : 'bottom-24 right-6 w-[520px] h-[600px] max-h-[70vh] max-w-[92vw]'}`}
      >
        <div className="bg-charcoal-900 p-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-sage-400/20 p-2 rounded-lg"><Sparkles className="text-sage-300 w-5 h-5" /></div>
            <div>
              <h3 className="font-bold text-white">Assistant IA</h3>
              <p className="text-cream-400 text-xs">Propulsé par Gemini 2.5</p>
            </div>
          </div>
          <button onClick={() => setIsExpanded(!isExpanded)} className="text-cream-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors">
            {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-cream-100 dark:bg-charcoal-900" ref={scrollRef}>
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] rounded-2xl text-sm overflow-hidden ${msg.role === 'user' ? 'bg-sage-400 text-white rounded-tr-none p-3 shadow-lg' : 'bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100 border border-cream-300 dark:border-charcoal-700 rounded-tl-none shadow-sm'}`}>
                {msg.role === 'user' ? msg.text : (
                  <div className="relative group">
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
                          className="prose prose-sm dark:prose-invert max-w-none p-4 prose-headings:text-charcoal-900 dark:prose-headings:text-white prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-2 prose-p:text-charcoal-900/70 dark:prose-p:text-cream-200 prose-p:my-2 prose-strong:text-sage-500 dark:prose-strong:text-sage-300 prose-strong:font-bold prose-ul:list-disc prose-ul:ml-4 prose-ul:my-2 prose-ol:list-decimal prose-ol:ml-4 prose-li:text-charcoal-900/70 dark:prose-li:text-cream-200 prose-table:w-full prose-table:border-collapse prose-table:my-4 prose-table:text-xs prose-th:bg-cream-200 dark:prose-th:bg-charcoal-700 prose-th:p-2 prose-th:text-left prose-th:border prose-th:border-cream-300 dark:prose-th:border-charcoal-600 prose-td:p-2 prose-td:border prose-td:border-cream-300 dark:prose-td:border-charcoal-600 prose-a:text-sage-500 dark:prose-a:text-sage-300 prose-a:underline hover:prose-a:text-sage-600"
                        >
                          {part}
                        </ReactMarkdown>
                      );
                    })}
                    <button onClick={() => copyToClipboard(msg.text.replace(/\[\[CHART:\w+\]\]/g, ''))} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-cream-200 dark:bg-charcoal-700 rounded text-charcoal-900/50 dark:text-cream-300 hover:text-sage-500 dark:hover:text-sage-300 z-10" title="Copier le texte">
                      <Copy size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-charcoal-800 p-4 rounded-2xl rounded-tl-none border border-cream-300 dark:border-charcoal-700 shadow-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-sage-400" />
                <span className="text-xs text-charcoal-900/50 dark:text-cream-400">Analyse des données et génération du graphique...</span>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 bg-white dark:bg-charcoal-800 border-t border-cream-300 dark:border-charcoal-700 rounded-b-2xl">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Analysez les tendances, comparez les zones..."
              className="flex-1 bg-cream-100 dark:bg-charcoal-700 border-0 rounded-xl px-4 py-3 text-sm text-charcoal-900 dark:text-cream-100 focus:ring-2 focus:ring-sage-400 focus:outline-none"
            />
            <button onClick={handleSend} disabled={!input.trim() || loading} className="bg-sage-400 text-white p-3 rounded-xl hover:bg-sage-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg">
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIChatOverlay;
