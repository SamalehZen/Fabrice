import { GoogleGenAI } from '@google/genai';
import { SurveyDataset } from '../types';
import { QUESTION_MAPPINGS } from '../constants';

let client: GoogleGenAI | null = null;

const resolveApiKey = (): string => {
  return (
    import.meta.env.VITE_GEMINI_API_KEY ||
    import.meta.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY ||
    (typeof process !== 'undefined' && process.env?.API_KEY) ||
    (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
    (typeof process !== 'undefined' && process.env?.GOOGLE_GENERATIVE_AI_API_KEY) ||
    ''
  );
};

const getClient = (): GoogleGenAI | null => {
  if (!client) {
    const apiKey = resolveApiKey();
    if (apiKey) {
      client = new GoogleGenAI({ apiKey });
    }
  }
  return client;
};

const buildSystemInstruction = (currentData: SurveyDataset | undefined): string => {
  const totalsMeta = currentData
    ? {
        totalRespondentsByResidence: currentData.zones.reduce((acc, curr) => acc + curr.value, 0),
        totalRespondentsByAge: currentData.ageGroups.reduce((acc, curr) => acc + curr.value, 0),
        ageGroupsSummary: currentData.ageGroups.map((group) => `${group.name} : ${group.value}`).join(', '),
      }
    : null;

  const datasetForAI = currentData ? { ...currentData, metadata: totalsMeta } : null;
  const dataContext = datasetForAI ? JSON.stringify(datasetForAI) : 'Aucune donnée disponible';
  const officialTotal = totalsMeta?.totalRespondentsByResidence ?? 0;
  const ageSummary = totalsMeta?.ageGroupsSummary ?? 'Non renseigné';

  const questionGuide = QUESTION_MAPPINGS.map(({ id, text, key }) => `- ${id} : ${text} -> clé JSON "${key}"`).join('\n');
  const chartGuide = QUESTION_MAPPINGS.map(({ id, text, chart }) => `- ${id} ${text} : [[CHART:${chart}]]`).join('\n');

  return `
Vous êtes un expert analyste de données pour Hyper Analyse.
Vous avez accès aux données de l'enquête au format JSON ci-dessous :
${dataContext}

Votre mission est de répondre aux questions de l'utilisateur en vous basant *uniquement* sur ces données.

Correspondance officielle des questions :
${questionGuide}

Si un utilisateur mentionne un numéro de question (ex. "question 8"), vous devez impérativement utiliser la clé JSON associée ci-dessus pour éviter toute confusion.

Règles à suivre :
1. **Langue** : Répondez TOUJOURS en **Français**.
2. **Format** : Utilisez le **Markdown** pour structurer votre réponse (titres, gras, listes, tableaux).
3. **Visuels** : lorsque la réponse concerne l'une des questions, ajoutez le tag correspondant pour afficher le graphique circulaire.
4. **Tableaux** : dès qu'une question Q0 à Q10 (ou "question X") est mentionnée, terminez avec un tableau Markdown professionnel à trois colonnes (**Option | Réponses | Part**) juste avant le tag du graphique.
5. **Rapports/Résumés complets** : si l'utilisateur demande un rapport global, une synthèse ou un résumé complet, créez un bloc dédié comportant un tableau multi-indicateurs, un tag de graphique pertinent et une explication détaillée (plusieurs phrases).

Tags graphiques autorisés :
${chartGuide}

Points d'attention essentiels :
- Le total officiel des répondants correspond à la somme des zones (Q1) = ${officialTotal}.
- Lorsque vous citez un volume global, précisez qu'il provient des résidences et non de la somme des âges.
- Les tranches d'âge actuellement enregistrées sont : ${ageSummary}.

Exemple :
Si l'utilisateur demande "D'où viennent les clients ?", répondez avec l'analyse textuelle puis finissez par : [[CHART:zones]]

6. **Contenu** :
   - Soyez factuel, professionnel et concis.
   - Citez les chiffres exacts du JSON pour justifier vos analyses.
   - Ne déduisez rien au-delà des données fournies.
`;
};

export const generateInsight = async (userPrompt: string, currentData?: SurveyDataset): Promise<string> => {
  const ai = getClient();

  if (!ai) {
    return 'La clé API est manquante. Créez un fichier .env.local avec VITE_GEMINI_API_KEY=votre_clé. Obtenez une clé sur https://aistudio.google.com/apikey';
  }

  if (!userPrompt.trim()) {
    return 'Veuillez entrer une question valide.';
  }

  const systemInstruction = buildSystemInstruction(currentData);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
      },
    });

    return response.text || "Aucune analyse n'a pu être générée.";
  } catch (error) {
    console.error('Error generating insight:', error);

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return 'Clé API invalide. Veuillez vérifier votre configuration.';
      }
      if (error.message.includes('quota') || error.message.includes('rate')) {
        return 'Limite de requêtes atteinte. Veuillez réessayer dans quelques instants.';
      }
      if (error.message.includes('network') || error.message.includes('fetch')) {
        return 'Erreur de connexion. Vérifiez votre connexion internet et réessayez.';
      }
    }

    return "Désolé, j'ai rencontré une erreur lors de l'analyse des données. Veuillez réessayer.";
  }
};
