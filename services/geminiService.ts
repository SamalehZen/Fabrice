import { GoogleGenAI } from "@google/genai";
import { SurveyDataset } from "../types";
import { QUESTION_MAPPINGS } from "../constants";

let client: GoogleGenAI | null = null;

const resolveApiKey = (): string => {
  return (
    import.meta.env.VITE_GEMINI_API_KEY ||
    import.meta.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    ''
  );
};

const getClient = () => {
  if (!client) {
    const apiKey = resolveApiKey();
    if (apiKey) {
      client = new GoogleGenAI({ apiKey });
    }
  }
  return client;
};

export const generateInsight = async (userPrompt: string, currentData?: SurveyDataset): Promise<string> => {
  const ai = getClient();
  if (!ai) {
    return "La clé API est manquante. Configurez GEMINI_API_KEY ou GOOGLE_GENERATIVE_AI_API_KEY.";
  }

  const totalsMeta = currentData
    ? {
        totalRespondentsByResidence: currentData.zones.reduce((acc, curr) => acc + curr.value, 0),
        totalRespondentsByAge: currentData.ageGroups.reduce((acc, curr) => acc + curr.value, 0),
        ageGroupsSummary: currentData.ageGroups.map(group => `${group.name} : ${group.value}`).join(', ')
      }
    : null;

  const datasetForAI = currentData ? { ...currentData, metadata: totalsMeta } : null;

  const dataContext = datasetForAI ? JSON.stringify(datasetForAI) : "Aucune donnée disponible";
  const officialTotal = totalsMeta?.totalRespondentsByResidence ?? 0;
  const ageSummary = totalsMeta?.ageGroupsSummary ?? 'Non renseigné';

  const questionGuide = QUESTION_MAPPINGS.map(({ id, text, key }) => `- ${id} : ${text} -> clé JSON "${key}"`).join("\n");
  const chartGuide = QUESTION_MAPPINGS.map(({ id, text, chart }) => `- ${id} ${text} : [[CHART:${chart}]]`).join("\n");

  const dynamicSystemInstruction = `
Vous êtes Fabrice, l'assistant IA officiel de la plateforme "Fabrice AI".
Vous êtes un expert analyste de données spécialisé dans les enquêtes et l'expérience client.

Vous avez accès aux données de l'enquête au format JSON ci-dessous :
${dataContext}

Correspondance officielle des questions :
${questionGuide}

Règles de personnalité :
- Nom : Fabrice.
- Ton : Professionnel, chaleureux, précis et orienté "business intelligence".
- Style : Expert, structure claire (Markdown), fiable.

Règles à suivre pour les réponses :
1. **Langue** : Répondez TOUJOURS en **Français** courant et professionnel.
2. **Format** : Utilisez le **Markdown** pour structurer votre réponse (titres propres, listes à puces, termes importants en gras).
3. **Contradictions** : En cas de conflit apparent dans les données, fiez-vous aux données du JSON fourni (Vérité Terrain).
4. **Visuels** : Lorsqu'une question spécifique est abordée (Q0-Q10), insérez TOUJOURS le tag correspondant (ex: [[CHART:zones]]) à la fin de la section concernée.
5. **Tableaux** : Pour chaque analyse de question, fournissez systèmatiquement un tableau récapitulatif clair avant le graphique.
6. **Synthèse** : Si on vous demande un résumé, structurez-le par thèmes (Démographie, Satisfaction, Points Forts, Points Faibles).

Tags graphiques disponibles :
${chartGuide}

Contexte Données :
- Le total officiel des répondants est ${officialTotal} (basé sur Q1 Zones).
- Tranches d'âge : ${ageSummary}.

Exemple d'interaction :
Q: "D'où viennent les visiteurs ?"
R: "Les visiteurs proviennent principalement de... [Analyse textuelle] ... Voici le détail chiffré : [Tableau Markdown] ... [Conclusion]. [[CHART:zones]]"
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: dynamicSystemInstruction,
      },
    });
    return response.text || "Aucune analyse n'a pu être générée.";
  } catch (error) {
    console.error("Error generating insight:", error);
    return "Désolé, j'ai rencontré une erreur lors de l'analyse des données. Veuillez vérifier votre clé API et réessayer.";
  }
};
