import React, { useEffect, useState } from 'react';
import { SurveyDataset, SimpleDataPoint, ComparisonDataPoint } from '../types';
import { Save, RefreshCw } from 'lucide-react';
import { SURVEY_DATA as INITIAL_DATA } from '../constants';

interface DataEditorProps {
  data: SurveyDataset;
  onUpdate: (newData: SurveyDataset) => void;
}

const DataEditor: React.FC<DataEditorProps> = ({ data, onUpdate }) => {
  const [localData, setLocalData] = useState<SurveyDataset>(() => JSON.parse(JSON.stringify(data)));
  const [activeSection, setActiveSection] = useState<string | null>('ageGroups');

  const handleSimpleUpdate = (key: keyof SurveyDataset, index: number, field: 'name' | 'value', value: string) => {
    setLocalData(prev => {
      const currentList = prev[key] as SimpleDataPoint[];
      if (!currentList) return prev;
      const updatedList = currentList.map((item, idx) => {
        if (idx !== index) return item;
        if (field === 'value') {
          const nextValue = value === '' ? 0 : Number(value);
          return { ...item, value: Number.isNaN(nextValue) ? 0 : nextValue };
        }
        return { ...item, name: value };
      });
      return { ...prev, [key]: updatedList } as SurveyDataset;
    });
  };

  const handleComparisonUpdate = (index: number, field: 'positive' | 'negative', value: string) => {
    setLocalData(prev => {
      const updatedList = prev.experienceChanges.map((item, idx) => {
        if (idx !== index) return item;
        const nextValue = value === '' ? 0 : Number(value);
        return { ...item, [field]: Number.isNaN(nextValue) ? 0 : nextValue } as ComparisonDataPoint;
      });
      return { ...prev, experienceChanges: updatedList };
    });
  };

  const saveChanges = () => {
    const payload = JSON.parse(JSON.stringify(localData));
    onUpdate(payload);
    alert("Données mises à jour avec succès ! Tableau et graphiques rafraîchis.");
  };

  const resetData = () => {
    setLocalData(JSON.parse(JSON.stringify(INITIAL_DATA)));
    onUpdate(JSON.parse(JSON.stringify(INITIAL_DATA)));
    alert("Données réinitialisées aux valeurs d'origine.");
  };

  useEffect(() => {
    setLocalData(JSON.parse(JSON.stringify(data)));
  }, [data]);

  const sections: { key: keyof SurveyDataset; label: string }[] = [
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

  return (
    <div className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-sm border border-cream-300 dark:border-charcoal-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-charcoal-900 dark:text-white">Éditeur de données</h2>
          <p className="text-sm text-charcoal-900/50 dark:text-cream-400">Modifiez les résultats de l'analyse en temps réel</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={resetData}
            className="flex items-center gap-2 px-4 py-2.5 border border-cream-300 dark:border-charcoal-600 text-charcoal-900/70 dark:text-cream-300 rounded-xl hover:bg-cream-100 dark:hover:bg-charcoal-700 transition-colors"
          >
            <RefreshCw size={18} /> Réinitialiser
          </button>
          <button 
            onClick={saveChanges}
            className="flex items-center gap-2 px-4 py-2.5 bg-sage-400 text-white rounded-xl hover:bg-sage-500 shadow-sm transition-colors"
          >
            <Save size={18} /> Sauvegarder
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-64 space-y-1">
          {sections.map((section) => (
            <button
              key={section.key}
              onClick={() => setActiveSection(section.key)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeSection === section.key 
                ? 'bg-sage-100 text-sage-500 border border-sage-200 dark:bg-sage-500/20 dark:text-sage-300 dark:border-sage-400/40' 
                : 'text-charcoal-900/70 dark:text-cream-300 hover:bg-cream-100 dark:hover:bg-charcoal-700'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-cream-100 dark:bg-charcoal-900 rounded-xl p-6 border border-cream-200 dark:border-charcoal-700">
          {activeSection && activeSection !== 'experienceChanges' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-charcoal-900 dark:text-cream-100 mb-4">{sections.find(s => s.key === activeSection)?.label}</h3>
              <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-charcoal-900/40 dark:text-cream-400 uppercase tracking-wider mb-2">
                <div className="col-span-8">Libellé</div>
                <div className="col-span-4">Valeur</div>
              </div>
              {(localData[activeSection as keyof SurveyDataset] as SimpleDataPoint[]).map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-8">
                    <input 
                      type="text" 
                      value={item.name}
                      onChange={(e) => handleSimpleUpdate(activeSection as keyof SurveyDataset, index, 'name', e.target.value)}
                      className="w-full p-3 border border-cream-300 dark:border-charcoal-600 rounded-xl focus:ring-2 focus:ring-sage-400 focus:border-sage-400 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100"
                    />
                  </div>
                  <div className="col-span-4">
                    <input 
                      type="number" 
                      value={item.value}
                      onChange={(e) => handleSimpleUpdate(activeSection as keyof SurveyDataset, index, 'value', e.target.value)}
                      className="w-full p-3 border border-cream-300 dark:border-charcoal-600 rounded-xl focus:ring-2 focus:ring-sage-400 focus:border-sage-400 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'experienceChanges' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-charcoal-900 dark:text-cream-100 mb-4">Q10 : Changements d'expérience</h3>
              <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-charcoal-900/40 dark:text-cream-400 uppercase tracking-wider mb-2">
                <div className="col-span-4">Catégorie</div>
                <div className="col-span-4 text-sage-500">Positif</div>
                <div className="col-span-4 text-red-400">Négatif</div>
              </div>
              {localData.experienceChanges.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-4 font-medium text-charcoal-900 dark:text-cream-100">{item.category}</div>
                  <div className="col-span-4">
                    <input 
                      type="number" 
                      value={item.positive}
                      onChange={(e) => handleComparisonUpdate(index, 'positive', e.target.value)}
                      className="w-full p-3 border border-cream-300 dark:border-charcoal-600 rounded-xl focus:ring-2 focus:ring-sage-400 focus:border-sage-400 text-sage-600 dark:text-sage-300 bg-white dark:bg-charcoal-800"
                    />
                  </div>
                  <div className="col-span-4">
                    <input 
                      type="number" 
                      value={item.negative}
                      onChange={(e) => handleComparisonUpdate(index, 'negative', e.target.value)}
                      className="w-full p-3 border border-cream-300 dark:border-charcoal-600 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 text-red-500 dark:text-red-300 bg-white dark:bg-charcoal-800"
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
