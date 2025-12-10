import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MessageSquare, X, Send, Sparkles, Loader2, Maximize2, Minimize2, Copy, Check } from 'lucide-react';
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
const MARKDOWN_TABLE_REGEX = /\|[^\n]+\|\n\|(?:\s*:?-+:?\s*\|)+\n(?:\|[^\n]+\|\n?)*/m;
const NAME_CHANGE_COLORS = ['#0ea5e9', '#94a3b8'];
const POS_NEG_COLORS = ['#22c55e', '#ef4444'];

const numberFormatter = new Intl.NumberFormat('fr-FR');
const formatNumber = (value: number) => numberFormatter.format(value);
const formatPercent = (value: number, decimals = 1) => `${value.toFixed(decimals).replace('.', ',')}%`;
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

interface AIChatOverlayProps {
  currentData: SurveyDataset;
}

const extractQuestionIds = (text: string): string[] => {
  if (!text) return [];
  const matches = new Set<string>();
  const regex = /(question\s*(\d+)|\bQ(\d+)\b)/gi;
  let match: RegExpExecArray | null;
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

const containsMarkdownTable = (text: string) => MARKDOWN_TABLE_REGEX.test(text);
const isSummaryPrompt = (text: string) => (text ? SUMMARY_REGEX.test(text) : false);

const hasQuestionTable = (text: string, questionId: string): boolean => {
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

const AIChatOverlay: React.FC<AIChatOverlayProps> = ({ currentData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: "Bonjour ! Je suis votre assistant analytique pour Hyper Sam. Posez-moi vos questions sur les données (ex: 'Quelle est la satisfaction ?'), je peux afficher des graphiques.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, loading]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const getTopEntry = useCallback((dataset: SimpleDataPoint[]) => {
    if (!dataset || dataset.length === 0) return null;
    return dataset.reduce((prev, curr) => (curr.value > prev.value ? curr : prev));
  }, []);

  const buildSimpleTable = useCallback((dataset: SimpleDataPoint[]) => {
    if (!dataset || dataset.length === 0) return '';
    const total = dataset.reduce((sum, item) => sum + item.value, 0) || 1;
    const header = '| Option | Réponses | Part |\n| --- | ---: | ---: |\n';
    const rows = dataset.map((item) => {
      const percent = (item.value / total) * 100;
      return `| ${item.name} | ${formatNumber(item.value)} | ${formatPercent(percent)} |`;
    }).join('\n');
    return `${header}${rows}`;
  }, []);

  const buildExperienceTable = useCallback((dataset: ComparisonDataPoint[]) => {
    if (!dataset || dataset.length === 0) return '';
    const header = '| Catégorie | Perception positive | Perception négative |\n| --- | ---: | ---: |\n';
    const rows = dataset.map((item) => {
      const total = item.positive + item.negative || 1;
      const positiveShare = (item.positive / total) * 100;
      const negativeShare = (item.negative / total) * 100;
      return `| ${item.category} | ${formatNumber(item.positive)} (${formatPercent(positiveShare)}) | ${formatNumber(item.negative)} (${formatPercent(negativeShare)}) |`;
    }).join('\n');
    return `${header}${rows}`;
  }, []);

  const buildTableForKey = useCallback((key: keyof SurveyDataset) => {
    if (key === 'experienceChanges') {
      return buildExperienceTable(currentData.experienceChanges);
    }
    return buildSimpleTable(currentData[key] as SimpleDataPoint[]);
  }, [currentData, buildSimpleTable, buildExperienceTable]);

  const computeSummaryMetrics = useCallback(() => {
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
  }, [currentData, getTopEntry]);

  const buildSummaryTable = useCallback(() => {
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
  }, [computeSummaryMetrics]);

  const buildSummaryNarrative = useCallback(() => {
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
  }, [computeSummaryMetrics]);

  const enforceResponseVisuals = useCallback((prompt: string, assistantText: string) => {
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
        additions.push(`${blockTitle}\n${table || '_Aucune donnée disponible pour cette question._'}`);
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
        const narrative = buildSummaryNarrative();
        enrichedResponse += `\n\n${summaryTitle}\n${table || '_Aucune donnée pour le rapport global._'}\n\n${narrative || ''}\n\n[[CHART:satisfaction]]`;
      }
    }

    return enrichedResponse;
  }, [buildTableForKey, buildSummaryTable, buildSummaryNarrative]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await generateInsight(userMsg, currentData);
      const enrichedResponse = enforceResponseVisuals(userMsg, response);
      setMessages((prev) => [...prev, { role: 'assistant', text: enrichedResponse }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', text: "Désolé, une erreur s'est produite. Veuillez réessayer." }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, currentData, enforceResponseVisuals]);

  const copyToClipboard = useCallback(async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text.replace(/\[\[CHART:\w+\]\]/g, ''));
      setCopiedId(index);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      console.error('Failed to copy text');
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const renderChart = useMemo(() => (chartKey: string) => {
    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

    if (chartKey === 'nameChangeAwareness') {
      const total = currentData.nameChangeAwareness.reduce((sum, slice) => sum + slice.value, 0) || 1;
      return (
        <div className="mt-4 bg-white/95 dark:bg-dark-card/90 border border-slate-200 dark:border-dark-border rounded-xl p-4 space-y-4 shadow-sm dark:shadow-black/40">
          <div className="h-56">{render3DPie(currentData.nameChangeAwareness, { colors: NAME_CHANGE_COLORS, innerRadius: 55, showLegend: false, paddingAngle: 4, isDark })}</div>
          <div className="space-y-2 text-xs">
            {currentData.nameChangeAwareness.map((slice, index) => {
              const percent = (slice.value / total) * 100;
              return (
                <div key={`q9-row-${slice.name}`} className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-dark-border/80 px-3 py-2 bg-slate-50/70 dark:bg-dark-card/80">
                  <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-gray-100">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: NAME_CHANGE_COLORS[index % NAME_CHANGE_COLORS.length] }} aria-hidden="true" />
                    {slice.name}
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-slate-900 dark:text-white">{formatPercent(percent)}</p>
                    <p className="text-[11px] text-slate-500 dark:text-gray-400">{formatNumber(slice.value)} réponses</p>
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
      const summaryData = [
        { name: 'Perception positive', value: totalPositive },
        { name: 'Perception négative', value: totalNegative },
      ];
      const detailCharts = currentData.experienceChanges.map((item) => ({
        category: item.category,
        total: item.positive + item.negative,
        slices: [
          { name: item.labelPositive || 'Positif', value: item.positive },
          { name: item.labelNegative || 'Négatif', value: item.negative },
        ],
      }));

      return (
        <div className="mt-4 space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-gradient-to-b from-white to-slate-50 dark:from-dark-surface dark:to-dark-bg/80 p-4 shadow-sm dark:shadow-black/40">
            <div className="h-56">{render3DPie(summaryData, { colors: POS_NEG_COLORS, innerRadius: 55, paddingAngle: 6, showLegend: false, isDark })}</div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              {summaryData.map((item) => (
                <div key={`q10-highlight-${item.name}`} className="rounded-xl border border-slate-100 dark:border-dark-border px-3 py-2 bg-white/85 dark:bg-dark-card/80">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-gray-400">{item.name}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatPercent((item.value / summaryTotal) * 100)}</p>
                  <p className="text-[11px] text-slate-500 dark:text-gray-400">{formatNumber(item.value)} réponses</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {detailCharts.map((chart) => {
              const total = chart.total || 1;
              return (
                <div key={`q10-detail-${chart.category}`} className="rounded-xl border border-slate-100 dark:border-dark-border bg-white/90 dark:bg-dark-card/80 p-4 shadow-sm dark:shadow-black/40">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Répartition – {chart.category}</p>
                    <span className="text-[11px] text-slate-500 dark:text-gray-400">{formatNumber(chart.total)} réponses</span>
                  </div>
                  <div className="mt-3 flex items-center gap-4">
                    <div className="w-24 h-24">{render3DPie(chart.slices, { colors: POS_NEG_COLORS, innerRadius: 40, outerRadius: 60, paddingAngle: 4, showLegend: false, minLabelPercent: 0.12, isDark, labelPosition: 'inside' })}</div>
                    <div className="flex-1 space-y-2 text-xs">
                      {chart.slices.map((slice, index) => {
                        const percent = (slice.value / total) * 100;
                        return (
                          <div key={`q10-row-${chart.category}-${slice.name}`}>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-2 font-semibold text-slate-700 dark:text-gray-100">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: POS_NEG_COLORS[index % POS_NEG_COLORS.length] }} aria-hidden="true" />
                                {slice.name}
                              </span>
                              <span className="font-semibold text-slate-900 dark:text-white">{formatPercent(percent)}</span>
                            </div>
                            <div className="mt-1 h-1.5 w-full rounded-full bg-slate-200 dark:bg-dark-muted overflow-hidden">
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
      <div className="mt-4 bg-white/95 dark:bg-dark-card/90 border border-slate-200 dark:border-dark-border rounded-xl p-4 space-y-4 shadow-sm dark:shadow-black/40">
        <div className="h-64">{render3DPie(data, { colors, innerRadius: 55, paddingAngle: 4, showLegend: false, isDark })}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {data.map((slice, index) => {
            const percent = (slice.value / total) * 100;
            return (
              <div key={`chat-card-${chartKey}-${slice.name}`} className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-dark-border/80 px-3 py-2 bg-slate-50/70 dark:bg-dark-card/80">
                <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-gray-100">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} aria-hidden="true" />
                  {slice.name}
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-slate-900 dark:text-white">{formatPercent(percent)}</p>
                  <p className="text-[11px] text-slate-500 dark:text-gray-400">{formatNumber(slice.value)} réponses</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }, [currentData]);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Fermer l'assistant IA" : "Ouvrir l'assistant IA"}
        aria-expanded={isOpen}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl shadow-brand-500/40 dark:shadow-brand-900/60 transition-all duration-300 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${isOpen ? 'bg-red-500 rotate-90' : 'bg-brand-600'} text-white`}
      >
        {isOpen ? <X size={24} aria-hidden="true" /> : <MessageSquare size={24} aria-hidden="true" />}
      </button>

      <div
        role="dialog"
        aria-label="Assistant IA Hyper Sam"
        aria-hidden={!isOpen}
        className={`fixed z-50 bg-white/95 dark:bg-dark-surface/95 rounded-xl shadow-2xl shadow-slate-200/70 dark:shadow-black/70 border border-slate-200 dark:border-dark-border flex flex-col transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'} ${isExpanded ? 'bottom-6 right-6 w-[920px] h-[80vh] max-w-[96vw]' : 'bottom-24 right-6 w-[480px] h-[600px] max-h-[70vh] max-w-[92vw]'}`}
      >
        <div className="bg-brand-600 p-4 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <Sparkles className="text-white w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-bold text-white">Assistant IA</h2>
              <p className="text-brand-100 text-xs">Propulsé par Gemini 2.5</p>
            </div>
          </div>
          <button onClick={() => setIsExpanded(!isExpanded)} className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label={isExpanded ? 'Réduire la fenêtre' : 'Agrandir la fenêtre'}>
            {isExpanded ? <Minimize2 size={18} aria-hidden="true" /> : <Maximize2 size={18} aria-hidden="true" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50 dark:bg-dark-bg" ref={scrollRef} role="log" aria-live="polite">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] rounded-xl text-sm overflow-hidden ${msg.role === 'user' ? 'bg-brand-600 text-white rounded-tr-none p-3 shadow-brand-500/30 shadow-lg' : 'bg-white/95 dark:bg-dark-card/90 text-slate-800 dark:text-gray-100 border border-slate-200 dark:border-dark-border rounded-tl-none shadow-sm dark:shadow-black/40'}`}>
                {msg.role === 'user' ? (
                  msg.text
                ) : (
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
                          className="prose prose-sm dark:prose-invert max-w-none p-4 prose-headings:text-slate-800 dark:prose-headings:text-white prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-2 prose-p:text-slate-600 dark:prose-p:text-slate-200 prose-p:my-2 prose-strong:text-brand-700 dark:prose-strong:text-brand-300 prose-strong:font-bold prose-ul:list-disc prose-ul:ml-4 prose-ul:my-2 prose-ol:list-decimal prose-ol:ml-4 prose-li:text-slate-600 dark:prose-li:text-slate-200 prose-table:w-full prose-table:border-collapse prose-table:my-4 prose-table:text-xs prose-th:bg-slate-100 dark:prose-th:bg-slate-800 prose-th:p-2 prose-th:text-left prose-th:border prose-th:border-slate-200 dark:prose-th:border-slate-700 prose-td:p-2 prose-td:border prose-td:border-slate-200 dark:prose-td:border-slate-700 prose-a:text-brand-600 dark:prose-a:text-brand-300 prose-a:underline hover:prose-a:text-brand-800"
                        >
                          {part}
                        </ReactMarkdown>
                      );
                    })}
                    <button
                      onClick={() => copyToClipboard(msg.text, i)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-slate-100 dark:bg-dark-muted rounded-lg text-slate-500 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-300 z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      aria-label="Copier le texte"
                    >
                      {copiedId === i ? <Check size={14} className="text-green-500" aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/95 dark:bg-dark-card/90 p-4 rounded-xl rounded-tl-none border border-slate-200 dark:border-dark-border shadow-sm dark:shadow-black/40 flex items-center gap-2" role="status" aria-live="polite">
                <Loader2 className="w-4 h-4 animate-spin text-brand-600" aria-hidden="true" />
                <span className="text-xs text-slate-500 dark:text-gray-400">Analyse des données et génération du graphique...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-white/95 dark:bg-dark-surface/90 border-t border-slate-100 dark:border-dark-border rounded-b-xl">
          <div className="flex gap-2">
            <label htmlFor="chat-input" className="sr-only">Votre message</label>
            <input
              id="chat-input"
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Analysez les tendances, comparez les zones..."
              disabled={loading}
              className="flex-1 bg-slate-100 dark:bg-dark-card/80 border-0 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:opacity-50 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              aria-label="Envoyer le message"
              className="bg-brand-600 text-white p-3 rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-brand-200/70 dark:shadow-brand-900/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <Send size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIChatOverlay;
