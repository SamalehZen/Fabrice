import { SurveyDataset } from './types';

// Colors for charts
export const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#f97316', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];
export const SATISFACTION_COLORS = ['#ef4444', '#f97316', '#84cc16', '#22c55e']; // Red to Green

export const SURVEY_DATA: SurveyDataset = {
  ageGroups: [
    { name: '< 20 ans', value: 17 },
    { name: '20-30 ans', value: 185 },
    { name: '30-50 ans', value: 138 },
  ],
  zones: [
    { name: 'Heron', value: 23 },
    { name: 'Centre Ville', value: 178 },
    { name: 'Haramous', value: 21 },
    { name: 'Gabode', value: 35 },
    { name: 'Balbala', value: 199 },
  ],
  transport: [
    { name: 'Taxi/Bus', value: 102 },
    { name: 'Vehicule Personnel', value: 301 },
    { name: 'A Pied', value: 20 },
    { name: 'Autre', value: 0 },
  ],
  frequency: [
    { name: 'Très rarement', value: 48 },
    { name: '1-3 fois/mois', value: 97 },
    { name: '1 fois/semaine', value: 72 },
    { name: 'Plusieurs fois/semaine', value: 199 },
  ],
  visitReason: [
    { name: 'Courses Hypermarche', value: 123 },
    { name: 'Promenade', value: 78 },
    { name: 'Restaurer', value: 117 },
    { name: 'Cinema', value: 52 },
    { name: 'Jeux Enfants', value: 55 },
    { name: 'Autre', value: 15 },
  ],
  competitors: [
    { name: 'Boutique Quartier', value: 47 },
    { name: 'Cash Center', value: 45 },
    { name: 'Algamil', value: 70 },
    { name: 'Nougaprix', value: 62 },
    { name: 'Napoleon', value: 37 },
    { name: 'Casino Haramous', value: 71 },
    { name: 'Bawadi Mall', value: 250 },
    { name: 'Autre', value: 25 },
  ],
  choiceReason: [
    { name: 'Proximité', value: 151 },
    { name: 'Choix', value: 70 },
    { name: 'Moins cher', value: 114 },
    { name: 'Produits adaptés', value: 111 },
    { name: 'Promos', value: 45 },
    { name: 'Autre', value: 15 },
  ],
  satisfaction: [
    { name: 'Pas du tout', value: 45 },
    { name: 'Moyennement', value: 52 },
    { name: 'Satisfait', value: 228 },
    { name: 'Très satisfait', value: 118 },
  ],
  preferredDepartment: [
    { name: 'Bazar/Non-Alim', value: 40 },
    { name: 'Epicerie', value: 40 },
    { name: 'Boissons', value: 60 },
    { name: 'Beauté/Soin', value: 45 },
    { name: 'Entretien', value: 35 },
    { name: 'Surgelés', value: 30 },
    { name: 'Cremerie', value: 30 },
    { name: 'Fruits/Legumes', value: 50 },
    { name: 'Boucherie', value: 25 },
    { name: 'Cafeteriat', value: 80 },
    { name: 'Autres', value: 85 },
  ],
  nameChangeAwareness: [
    { name: 'Oui', value: 187 },
    { name: 'Non', value: 207 },
  ],
  experienceChanges: [
    { category: 'Prix', positive: 38, negative: 45, labelPositive: '+ Cher', labelNegative: '- Cher' },
    { category: 'Choix', positive: 35, negative: 20, labelPositive: '+ De Choix', labelNegative: '- De Choix' },
    { category: 'Promos', positive: 35, negative: 40, labelPositive: '+ De Promo', labelNegative: '- De Promo' },
    { category: 'Ambiance', positive: 10, negative: 5, labelPositive: '+ Ambiance', labelNegative: '- Ambiance' },
  ]
};

export const SYSTEM_INSTRUCTION = `
You are a senior data analyst for Bawadi Mall. 
You have access to the following survey dataset in JSON format:
${JSON.stringify(SURVEY_DATA)}

Your job is to answer user questions about this specific data.
- Be concise and professional.
- Use specific numbers from the data to back up your claims.
- Identify trends (e.g., "Most customers come by personal vehicle").
- If asked for recommendations, base them on the data (e.g., "Since many people come for food, expand the food court").
- Do not make up data not present in the JSON.
`;
