import React from 'react';
import { User, Mail, Phone, MapPin, Shield, CreditCard, Bell } from 'lucide-react';

const Profile: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Profile */}
      <div className="relative bg-white dark:bg-[#0f111a] rounded-[2rem] p-8 shadow-xl border border-slate-100 dark:border-white/5 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-brand-500 to-purple-600 opacity-90"></div>
        <div className="relative flex flex-col sm:flex-row items-end sm:items-center gap-6 mt-12">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-white dark:border-[#0f111a] overflow-hidden shadow-2xl bg-slate-200">
                <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=300&h=300" 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                />
            </div>
            <button className="absolute bottom-0 right-0 bg-brand-500 text-white p-2 rounded-full shadow-lg hover:bg-brand-600 transition-colors">
                <User size={16} />
            </button>
          </div>
          <div className="flex-1 pb-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Mark Johnson</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Administrateur Système</p>
          </div>
          <div className="flex gap-3">
             <button className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                Éditer
             </button>
             <button className="px-6 py-2.5 bg-brand-500 text-white rounded-xl font-semibold hover:bg-brand-600 shadow-lg shadow-brand-500/25 transition-colors">
                Partager
             </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info Column */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-[#0f111a] rounded-3xl p-6 shadow-lg border border-slate-100 dark:border-white/5">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <User size={20} className="text-brand-500" />
                    Informations
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                            <Mail size={18} />
                        </div>
                        <div>
                            <p className="text-xs opacity-70 uppercase tracking-wider">Email</p>
                            <p className="font-semibold text-slate-900 dark:text-slate-200">mark.johnson@example.com</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                            <Phone size={18} />
                        </div>
                        <div>
                            <p className="text-xs opacity-70 uppercase tracking-wider">Téléphone</p>
                            <p className="font-semibold text-slate-900 dark:text-slate-200">+33 6 12 34 56 78</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                            <MapPin size={18} />
                        </div>
                        <div>
                            <p className="text-xs opacity-70 uppercase tracking-wider">Localisation</p>
                            <p className="font-semibold text-slate-900 dark:text-slate-200">Paris, France</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Settings Column */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#0f111a] rounded-3xl p-6 shadow-lg border border-slate-100 dark:border-white/5">
                <h3 className="text-lg font-bold mb-6">Paramètres du compte</h3>
                
                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-500/10 text-blue-500 p-3 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <Shield size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white">Sécurité & Connexion</h4>
                                <p className="text-xs text-slate-500">Mettez à jour votre mot de passe et sécurisez votre compte</p>
                            </div>
                        </div>
                         <div className="text-slate-400">Modifier</div>
                    </div>

                     <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                             <div className="bg-purple-500/10 text-purple-500 p-3 rounded-xl group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white">Facturation</h4>
                                <p className="text-xs text-slate-500">Gérez vos méthodes de paiement et abonnements</p>
                            </div>
                        </div>
                        <div className="text-slate-400">Modifier</div>
                    </div>

                     <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                             <div className="bg-orange-500/10 text-orange-500 p-3 rounded-xl group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                <Bell size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white">Notifications</h4>
                                <p className="text-xs text-slate-500">Choisissez vos préférences de notification</p>
                            </div>
                        </div>
                         <div className="text-slate-400">Modifier</div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
