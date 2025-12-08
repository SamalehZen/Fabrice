import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { SurveyDataset, SimpleDataPoint, ComparisonDataPoint } from '../types';
import { Save, RefreshCw, AlertTriangle } from 'lucide-react';
import { SURVEY_DATA as INITIAL_DATA } from '../constants';
import { useApp } from '../context/AppContext';

interface DataEditorProps {
  data: SurveyDataset;
  onUpdate: (newData: SurveyDataset) => void;
}

interface Section {
  key: keyof SurveyDataset;
  label: string;
}

const SECTIONS: Section[] = [
  { key: 'ageGroups', label: "Q0 : Tranches d'âge" },
  { key: 'zones', label: 'Q1 : Zones résidentielles' },
  { key: 'transport', label: 'Q2 : Transport' },
  { key: 'frequency', label: 'Q3 : Fréquence de visite' },
  { key: 'visitReason', label: 'Q4 : Motif de venue' },
  { key: 'competitors', label: 'Q5 : Magasins fréquentés' },
  { key: 'choiceReason', label: 'Q6 : Raison du choix' },
  { key: 'satisfaction', label: 'Q7 : Satisfaction' },
  { key: 'preferredDepartment', label: 'Q8 : Rayons préférés' },
  { key: 'nameChangeAwareness', label: 'Q9 : Changement de nom' },
  { key: 'experienceChanges', label: "Q10 : Changements d'expérience" },
];

const DataEditor: React.FC<DataEditorProps> = ({ data, onUpdate }) => {
  const { showToast } = useApp();
  const [localData, setLocalData] = useState<SurveyDataset>(() => structuredClone(data));
  const [activeSection, setActiveSection] = useState<keyof SurveyDataset>('ageGroups');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalData(structuredClone(data));
    setHasChanges(false);
  }, [data]);

  const handleSimpleUpdate = useCallback((key: keyof SurveyDataset, index: number, field: 'name' | 'value', value: string) => {
    setLocalData(prev => {
      const currentList = prev[key] as SimpleDataPoint[];
      if (!currentList) return prev;
      const updatedList = currentList.map((item, idx) => {
        if (idx !== index) return item;
        if (field === 'value') {
          const nextValue = value === '' ? 0 : Number(value);
          return { ...item, value: Number.isNaN(nextValue) ? 0 : Math.max(0, nextValue) };
        }
        return { ...item, name: value };
      });
      return { ...prev, [key]: updatedList } as SurveyDataset;
    });
    setHasChanges(true);
  }, []);

  const handleComparisonUpdate = useCallback((index: number, field: 'positive' | 'negative', value: string) => {
    setLocalData(prev => {
      const updatedList = prev.experienceChanges.map((item, idx) => {
        if (idx !== index) return item;
        const nextValue = value === '' ? 0 : Number(value);
        return {
          ...item,
          [field]: Number.isNaN(nextValue) ? 0 : Math.max(0, nextValue),
        } as ComparisonDataPoint;
      });
      return { ...prev, experienceChanges: updatedList };
    });
    setHasChanges(true);
  }, []);

  const saveChanges = useCallback(() => {
    onUpdate(structuredClone(localData));
    setHasChanges(false);
    showToast('Données mises à jour avec succès !', 'success');
  }, [localData, onUpdate, showToast]);

  const resetData = useCallback(() => {
    setLocalData(structuredClone(INITIAL_DATA));
    onUpdate(structuredClone(INITIAL_DATA));
    setHasChanges(false);
    setShowResetConfirm(false);
    showToast("Données réinitialisées aux valeurs d'origine.", 'info');
  }, [onUpdate, showToast]);

  const currentSectionData = useMemo(() => {
    if (activeSection === 'experienceChanges') return null;
    return localData[activeSection] as SimpleDataPoint[];
  }, [localData, activeSection]);

  const currentSectionLabel = useMemo(() => {
    return SECTIONS.find(s => s.key === activeSection)?.label || '';
  }, [activeSection]);

  return (
    <div className="bg-white/90 dark:bg-dark-surface/90 rounded-xl shadow-sm shadow-slate-200/60 dark:shadow-black/50 border border-slate-200 dark:border-dark-border p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Éditeur de données</h2>
          <p className="text-sm text-slate-500 dark:text-gray-400">
            Modifiez les résultats de l'analyse en temps réel
            {hasChanges && (
              <span className="ml-2 text-amber-600 dark:text-amber-400 font-medium">• Modifications non sauvegardées</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowResetConfirm(true)}
            disabled={!hasChanges && JSON.stringify(localData) === JSON.stringify(INITIAL_DATA)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-dark-border text-slate-600 dark:text-gray-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label="Réinitialiser les données"
          >
            <RefreshCw size={18} aria-hidden="true" />
            <span className="hidden sm:inline">Réinitialiser</span>
          </button>
          <button
            onClick={saveChanges}
            disabled={!hasChanges}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 shadow-sm shadow-brand-200/60 dark:shadow-brand-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            aria-label="Sauvegarder les modifications"
          >
            <Save size={18} aria-hidden="true" />
            <span className="hidden sm:inline">Sauvegarder</span>
          </button>
        </div>
      </div>

      {showResetConfirm && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
          <AlertTriangle className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={20} aria-hidden="true" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Êtes-vous sûr de vouloir réinitialiser toutes les données ?
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              Cette action est irréversible et effacera toutes vos modifications.
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={resetData}
                className="px-3 py-1.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                Confirmer
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-sm rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <nav className="w-full lg:w-64 space-y-1" aria-label="Sections de données">
          {SECTIONS.map((section) => (
            <button
              key={section.key}
              onClick={() => setActiveSection(section.key)}
              aria-current={activeSection === section.key ? 'true' : undefined}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                activeSection === section.key
                  ? 'bg-brand-50 text-brand-700 border border-brand-100 dark:bg-brand-500/20 dark:text-brand-100 dark:border-brand-300/40'
                  : 'text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-dark-hover/60'
              }`}
            >
              {section.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 bg-slate-50 dark:bg-dark-card/70 rounded-xl p-6 border border-slate-100 dark:border-dark-border">
          {activeSection !== 'experienceChanges' && currentSectionData && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-700 dark:text-gray-200 mb-4">{currentSectionLabel}</h3>
              <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                <div className="col-span-8">Libellé</div>
                <div className="col-span-4">Valeur</div>
              </div>
              {currentSectionData.map((item, index) => (
                <div key={`${activeSection}-${index}`} className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-8">
                    <label className="sr-only" htmlFor={`${activeSection}-name-${index}`}>
                      Libellé de l'option {index + 1}
                    </label>
                    <input
                      id={`${activeSection}-name-${index}`}
                      type="text"
                      value={item.name}
                      onChange={(e) => handleSimpleUpdate(activeSection, index, 'name', e.target.value)}
                      className="w-full p-2.5 border border-slate-300 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-dark-card/60 text-slate-800 dark:text-slate-100 transition-colors"
                    />
                  </div>
                  <div className="col-span-4">
                    <label className="sr-only" htmlFor={`${activeSection}-value-${index}`}>
                      Valeur de l'option {index + 1}
                    </label>
                    <input
                      id={`${activeSection}-value-${index}`}
                      type="number"
                      min="0"
                      value={item.value}
                      onChange={(e) => handleSimpleUpdate(activeSection, index, 'value', e.target.value)}
                      className="w-full p-2.5 border border-slate-300 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-dark-card/60 text-slate-800 dark:text-slate-100 transition-colors"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'experienceChanges' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-700 dark:text-gray-200 mb-4">Q10 : Changements d'expérience</h3>
              <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                <div className="col-span-4">Catégorie</div>
                <div className="col-span-4 text-green-600 dark:text-green-400">Positif</div>
                <div className="col-span-4 text-red-600 dark:text-red-400">Négatif</div>
              </div>
              {localData.experienceChanges.map((item, index) => (
                <div key={`experience-${index}`} className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-4 font-medium text-slate-700 dark:text-gray-200">{item.category}</div>
                  <div className="col-span-4">
                    <label className="sr-only" htmlFor={`experience-positive-${index}`}>
                      Valeur positive pour {item.category}
                    </label>
                    <input
                      id={`experience-positive-${index}`}
                      type="number"
                      min="0"
                      value={item.positive}
                      onChange={(e) => handleComparisonUpdate(index, 'positive', e.target.value)}
                      className="w-full p-2.5 border border-slate-300 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-green-700 dark:text-green-300 bg-white dark:bg-dark-card/60 transition-colors"
                    />
                  </div>
                  <div className="col-span-4">
                    <label className="sr-only" htmlFor={`experience-negative-${index}`}>
                      Valeur négative pour {item.category}
                    </label>
                    <input
                      id={`experience-negative-${index}`}
                      type="number"
                      min="0"
                      value={item.negative}
                      onChange={(e) => handleComparisonUpdate(index, 'negative', e.target.value)}
                      className="w-full p-2.5 border border-slate-300 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-red-700 dark:text-red-300 bg-white dark:bg-dark-card/60 transition-colors"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataEditor;
