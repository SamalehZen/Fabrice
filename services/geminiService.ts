import { GoogleGenAI } from "@google/genai";
import { SurveyDataset } from "../types";

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

  // Use provided data or fallback
  const dataContext = currentData ? JSON.stringify(currentData) : "Aucune donnée disponible";

  const dynamicSystemInstruction = `
Vous êtes un expert analyste de données pour le Bawadi Mall.
Vous avez accès aux données de l'enquête au format JSON ci-dessous :
${dataContext}

Votre mission est de répondre aux questions de l'utilisateur en vous basant *uniquement* sur ces données.

Règles à suivre impérativement :
1. **Langue** : Répondez TOUJOURS en **Français**.
2. **Format** : Utilisez le **Markdown** pour structurer votre réponse (titres, gras, listes, tableaux).
3. **Visuels (GRAPHIQUES)** : Si la réponse concerne une catégorie de données spécifique, vous DEVEZ ajouter un TAG spécial à la fin de votre réponse pour que l'interface affiche le graphique correspondant.

Liste des tags disponibles (utilisez exactement ce format) :
- Âge : [[CHART:ageGroups]]
- Zones résidentielles : [[CHART:zones]]
- Transport : [[CHART:transport]]
- Fréquence de visite : [[CHART:frequency]]
- Motif de visite : [[CHART:visitReason]]
- Concurrents : [[CHART:competitors]]
- Raison du choix : [[CHART:choiceReason]]
- Satisfaction : [[CHART:satisfaction]]
- Rayons préférés : [[CHART:preferredDepartment]]
- Changement de nom : [[CHART:nameChangeAwareness]]
- Changements expérience (Q10) : [[CHART:experienceChanges]]

Exemple : 
Si l'utilisateur demande "D'où viennent les clients ?", répondez avec l'analyse textuelle puis finissez par : [[CHART:zones]]

4. **Contenu** : 
   - Soyez factuel, professionnel et concis.
   - Citez les chiffres exacts du JSON pour justifier vos analyses.
   - Si les données ont changé, basez-vous sur le JSON fourni ci-dessus.
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