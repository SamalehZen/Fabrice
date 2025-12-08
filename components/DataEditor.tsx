import React, { useEffect, useState } from 'react';
import { SurveyDataset, SimpleDataPoint, ComparisonDataPoint } from '../types';
import { Save, RefreshCw, Edit3 } from 'lucide-react';
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
        return {
          ...item,
          [field]: Number.isNaN(nextValue) ? 0 : nextValue
        } as ComparisonDataPoint;
      });
      return { ...prev, experienceChanges: updatedList };
    });
  };

  const saveChanges = () => {
    onUpdate(JSON.parse(JSON.stringify(localData)));
    alert("Données mises à jour avec succès !");
  };

  const resetData = () => {
    setLocalData(JSON.parse(JSON.stringify(INITIAL_DATA)));
    onUpdate(JSON.parse(JSON.stringify(INITIAL_DATA)));
  };

  useEffect(() => {
    setLocalData(JSON.parse(JSON.stringify(data)));
  }, [data]);

  const sections: { key: keyof SurveyDataset; label: string }[] = [
    { key: 'ageGroups', label: "Q0 : Âge" },
    { key: 'zones', label: 'Q1 : Zones' },
    { key: 'transport', label: 'Q2 : Transport' },
    { key: 'frequency', label: 'Q3 : Fréquence' },
    { key: 'visitReason', label: 'Q4 : Motifs' },
    { key: 'competitors', label: 'Q5 : Magasins' },
    { key: 'choiceReason', label: 'Q6 : Raisons' },
    { key: 'satisfaction', label: 'Q7 : Satisfaction' },
    { key: 'preferredDepartment', label: 'Q8 : Rayons' },
    { key: 'nameChangeAwareness', label: 'Q9 : Nom' },
    { key: 'experienceChanges', label: "Q10 : Expérience" },
  ];

  return (
    <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 min-h-[80vh] flex flex-col">
      <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <Edit3 className="text-brand-500" /> Éditeur
          </h2>
          <p className="text-sm text-slate-400 mt-1">Modification temps réel des données</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={resetData}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-slate-500 hover:bg-slate-50 font-medium transition-colors border border-transparent hover:border-slate-200"
          >
            <RefreshCw size={18} /> Reset
          </button>
          <button 
            onClick={saveChanges}
            className="flex items-center gap-2 px-6 py-3 bg-[#D4E157] text-slate-900 rounded-2xl shadow-lg shadow-[#D4E157]/30 hover:shadow-[#D4E157]/50 transition-all font-bold transform hover:scale-105"
          >
            <Save size={18} /> Sauvegarder
          </button>
        </div>
      </div>

      <div className="flex gap-8 flex-1">
        {/* Sidebar Nav */}
        <div className="w-64 space-y-2 shrink-0 border-r border-slate-100 pr-6">
          {sections.map((section) => (
            <button
              key={section.key}
              onClick={() => setActiveSection(section.key)}
              className={`w-full text-left px-5 py-4 rounded-2xl text-sm font-semibold transition-all ${
                activeSection === section.key 
                ? 'bg-slate-900 text-white shadow-lg' 
                : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>

        {/* Editor Form */}
        <div className="flex-1 bg-slate-50/50 rounded-3xl p-8 border border-slate-100">
           {activeSection && activeSection !== 'experienceChanges' && (
             <div className="space-y-4 max-w-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-700">{sections.find(s => s.key === activeSection)?.label}</h3>
                    <span className="text-xs font-bold bg-slate-200 px-2 py-1 rounded text-slate-500">TABULAR DATA</span>
                </div>
                
                <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <div className="col-span-8">Label</div>
                  <div className="col-span-4">Valeur</div>
                </div>

                {(localData[activeSection as keyof SurveyDataset] as SimpleDataPoint[]).map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 items-center group">
                    <div className="col-span-8">
                       <input 
                         type="text" 
                         value={item.name}
                         onChange={(e) => handleSimpleUpdate(activeSection as keyof SurveyDataset, index, 'name', e.target.value)}
                         className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#D4E157] focus:border-transparent outline-none transition-shadow text-slate-700 font-medium group-hover:shadow-sm"
                       />
                    </div>
                    <div className="col-span-4">
                      <input 
                         type="number" 
                         value={item.value}
                         onChange={(e) => handleSimpleUpdate(activeSection as keyof SurveyDataset, index, 'value', e.target.value)}
                         className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#D4E157] focus:border-transparent outline-none transition-shadow text-slate-900 font-bold text-center group-hover:shadow-sm"
                       />
                    </div>
                  </div>
                ))}
             </div>
           )}

           {activeSection === 'experienceChanges' && (
             <div className="space-y-4 max-w-3xl">
                <h3 className="text-lg font-bold text-slate-700 mb-6">Comparatif Expérience</h3>
                <div className="grid grid-cols-12 gap-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  <div className="col-span-4">Catégorie</div>
                  <div className="col-span-4 text-green-600 center">Positif</div>
                  <div className="col-span-4 text-red-500 center">Négatif</div>
                </div>
                {localData.experienceChanges.map((item, index) => (
                   <div key={index} className="grid grid-cols-12 gap-4 items-center mb-3">
                     <div className="col-span-4 font-bold text-slate-700 pl-4">{item.category}</div>
                     <div className="col-span-4">
                        <input 
                           type="number" 
                           value={item.positive}
                           onChange={(e) => handleComparisonUpdate(index, 'positive', e.target.value)}
                           className="w-full p-3 bg-green-50/50 border border-green-100 rounded-2xl text-green-700 font-bold text-center focus:ring-2 focus:ring-green-400 outline-none"
                         />
                     </div>
                     <div className="col-span-4">
                        <input 
                           type="number" 
                           value={item.negative}
                           onChange={(e) => handleComparisonUpdate(index, 'negative', e.target.value)}
                           className="w-full p-3 bg-red-50/50 border border-red-100 rounded-2xl text-red-700 font-bold text-center focus:ring-2 focus:ring-red-400 outline-none"
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