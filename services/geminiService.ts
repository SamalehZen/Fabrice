import { GoogleGenAI } from "@google/genai";
import { SurveyDataset } from "../types";

let client: GoogleGenAI | null = null;

const QUESTION_MAPPINGS = [
  { id: "Q0", text: "Répartition des âges", key: "ageGroups", chart: "ageGroups" },
  { id: "Q1", text: "Zone de résidence", key: "zones", chart: "zones" },
  { id: "Q2", text: "Moyen de transport", key: "transport", chart: "transport" },
  { id: "Q3", text: "Fréquence de visite", key: "frequency", chart: "frequency" },
  { id: "Q4", text: "Motif principal de venue", key: "visitReason", chart: "visitReason" },
  { id: "Q5", text: "Magasin le plus fréquenté", key: "competitors", chart: "competitors" },
  { id: "Q6", text: "Raison du choix", key: "choiceReason", chart: "choiceReason" },
  { id: "Q7", text: "Satisfaction de la visite", key: "satisfaction", chart: "satisfaction" },
  { id: "Q8", text: "Rayon préféré", key: "preferredDepartment", chart: "preferredDepartment" },
  { id: "Q9", text: "Changement de nom remarqué", key: "nameChangeAwareness", chart: "nameChangeAwareness" },
  { id: "Q10", text: "Différences d'expérience d'achat", key: "experienceChanges", chart: "experienceChanges" }
];

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

  const dataContext = currentData ? JSON.stringify(currentData) : "Aucune donnée disponible";
  const questionGuide = QUESTION_MAPPINGS.map(({ id, text, key }) => `- ${id} : ${text} -> clé JSON "${key}"`).join("\n");
  const chartGuide = QUESTION_MAPPINGS.map(({ id, text, chart }) => `- ${id} ${text} : [[CHART:${chart}]]`).join("\n");

  const dynamicSystemInstruction = `
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
3. **Visuels** : lorsque la réponse concerne l'une des questions, ajoutez le tag correspondant pour afficher le graphique.

Tags graphiques autorisés :
${chartGuide}

Exemple :
Si l'utilisateur demande "D'où viennent les clients ?", répondez avec l'analyse textuelle puis finissez par : [[CHART:zones]]

4. **Contenu** :
   - Soyez factuel, professionnel et concis.
   - Citez les chiffres exacts du JSON pour justifier vos analyses.
   - Ne déduisez rien au-delà des données fournies.
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