import React from 'react';
import { User, Lock, Bell, Palette, Globe, Save } from 'lucide-react';
import ChartCard from './ChartCard';

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
       <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Paramètres</h2>
          <p className="text-slate-500 dark:text-slate-400">Gérez vos préférences et la configuration de l'application.</p>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-2">
            <button className="w-full text-left px-4 py-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-medium flex items-center gap-3">
              <User size={18} /> Profil
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium flex items-center gap-3 transition-colors">
              <Lock size={18} /> Sécurité
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium flex items-center gap-3 transition-colors">
              <Bell size={18} /> Notifications
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium flex items-center gap-3 transition-colors">
              <Palette size={18} /> Apparence
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium flex items-center gap-3 transition-colors">
              <Globe size={18} /> Langue
            </button>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <ChartCard title="Information du Profil">
               <div className="space-y-4 max-w-lg">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg">
                       <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Fabrice" alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    <div>
                       <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20">
                         Changer la photo
                       </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prénom</label>
                      <input type="text" defaultValue="Fabrice" className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom</label>
                      <input type="text" defaultValue="Admin" className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                      <input type="email" defaultValue="admin@fabrice.ai" className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                     <button className="flex items-center gap-2 px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:opacity-90 transition-opacity font-medium">
                       <Save size={18} /> Enregistrer
                     </button>
                  </div>
               </div>
            </ChartCard>
          </div>
       </div>
    </div>
  );
};

export default Settings;
