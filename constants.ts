import { SurveyDataset } from './types';

// Colors for charts
export const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#f97316', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];
export const SATISFACTION_COLORS = ['#ef4444', '#f97316', '#84cc16', '#22c55e']; // Red to Green

export interface QuestionMapping {
  id: string;
  text: string;
  key: keyof SurveyDataset;
  chart: keyof SurveyDataset | 'experienceChanges';
}

export const QUESTION_MAPPINGS: QuestionMapping[] = [
  { id: 'Q0', text: "Répartition des âges", key: 'ageGroups', chart: 'ageGroups' },
  { id: 'Q1', text: "Zone de résidence", key: 'zones', chart: 'zones' },
  { id: 'Q2', text: "Moyen de transport", key: 'transport', chart: 'transport' },
  { id: 'Q3', text: "Fréquence de visite", key: 'frequency', chart: 'frequency' },
  { id: 'Q4', text: "Motif principal de venue", key: 'visitReason', chart: 'visitReason' },
  { id: 'Q5', text: "Magasin le plus fréquenté", key: 'competitors', chart: 'competitors' },
  { id: 'Q6', text: "Raison du choix", key: 'choiceReason', chart: 'choiceReason' },
  { id: 'Q7', text: "Satisfaction de la visite", key: 'satisfaction', chart: 'satisfaction' },
  { id: 'Q8', text: "Rayon préféré", key: 'preferredDepartment', chart: 'preferredDepartment' },
  { id: 'Q9', text: "Changement de nom remarqué", key: 'nameChangeAwareness', chart: 'nameChangeAwareness' },
  { id: 'Q10', text: "Différences d'expérience d'achat", key: 'experienceChanges', chart: 'experienceChanges' }
];

export const SURVEY_DATA: SurveyDataset = {
  ageGroups: [
    { name: '< 20 ans', value: 17 },
    { name: '20-30 ans', value: 185 },
    { name: '30-50 ans', value: 138 },
    { name: '> 50 ans', value: 33 },
  ],
  zones: [
    { name: 'Heron', value: 24 },
    { name: 'Centre Ville', value: 186 },
    { name: 'Haramous', value: 24 },
    { name: 'Gabode', value: 36 },
    { name: 'Balbala', value: 206 },
  ],
  transport: [
    { name: 'Taxi/Bus', value: 109 },
    { name: 'Vehicule Personnel', value: 311 },
    { name: 'A Pied', value: 23 },
    { name: 'Autre', value: 0 },
  ],
  frequency: [
    { name: 'Très rarement', value: 53 },
    { name: '1-3 fois/mois', value: 102 },
    { name: '1 fois/semaine', value: 77 },
    { name: 'Plusieurs fois/semaine', value: 204 },
  ],
  visitReason: [
    { name: 'Courses Hypermarché', value: 128 },
    { name: 'Promenade', value: 83 },
    { name: 'Restaurer', value: 122 },
    { name: 'Cinema', value: 52 },
    { name: 'Jeux Enfants', value: 60 },
    { name: 'Autre', value: 15 },
  ],
  competitors: [
    { name: 'Boutique', value: 52 },
    { name: 'Cash Center', value: 45 },
    { name: 'Algamil', value: 75 },
    { name: 'Nougaprix', value: 62 },
    { name: 'Napoleon', value: 42 },
    { name: 'Casino', value: 76 },
    { name: 'Bawadi Mall', value: 250 },
    { name: 'Autre', value: 25 },
  ],
  choiceReason: [
    { name: 'Proximité', value: 156 },
    { name: 'Choix', value: 75 },
    { name: 'Moins cher', value: 116 },
    { name: 'Produits adaptés', value: 114 },
    { name: 'Promos', value: 46 },
    { name: 'Autre', value: 15 },
  ],
  satisfaction: [
    { name: 'Pas du tout', value: 50 },
    { name: 'Moyennement', value: 57 },
    { name: 'Satisfait', value: 233 },
    { name: 'Très satisfait', value: 123 },
  ],
  preferredDepartment: [
    { name: 'Bazar', value: 40 },
    { name: 'Epicerie', value: 40 },
    { name: 'Boissons', value: 60 },
    { name: 'Beauté/Soin', value: 50 },
    { name: 'Entretien', value: 40 },
    { name: 'Surgelés', value: 30 },
    { name: 'Cremerie', value: 30 },
    { name: 'Fruits/Legumes', value: 50 },
    { name: 'Boucherie', value: 30 },
    { name: 'Cafeteria', value: 80 },
    { name: 'Autres', value: 90 },
  ],
  nameChangeAwareness: [
    { name: 'Oui', value: 192 },
    { name: 'Non', value: 222 },
  ],
  experienceChanges: [
    { category: 'Prix', positive: 38, negative: 45, labelPositive: '+ Cher', labelNegative: '- Cher' },
    { category: 'Choix', positive: 35, negative: 20, labelPositive: '+ De Choix', labelNegative: '- De Choix' },
    { category: 'Promos', positive: 35, negative: 40, labelPositive: '+ De Promo', labelNegative: '- De Promo' },
    { category: 'Ambiance', positive: 10, negative: 5, labelPositive: "+ D'Ambiance", labelNegative: "- D'Ambiance" },
  ]
};

export const SYSTEM_INSTRUCTION = `
You are a senior data analyst for Hyper Analyse. 
You have access to the following survey dataset in JSON format:
${JSON.stringify(SURVEY_DATA)}

Your job is to answer user questions about this specific data.
- Be concise and professional.
- Use specific numbers from the data to back up your claims.
- Identify trends (e.g., "Most customers come by personal vehicle").
- If asked for recommendations, base them on the data (e.g., "Since many people come for food, expand the food court").
- Do not make up data not present in the JSON.
`;
