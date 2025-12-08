import { GoogleGenAI } from "@google/genai";
import { SurveyDataset } from "../types";

let client: GoogleGenAI | null = null;

const getClient = () => {
  if (!client) {
    const apiKey = process.env.API_KEY;
    if (apiKey) {
      client = new GoogleGenAI({ apiKey });
    }
  }
  return client;
};

export const generateInsight = async (userPrompt: string, currentData?: SurveyDataset): Promise<string> => {
  const ai = getClient();
  if (!ai) {
    return "La clé API est manquante. Veuillez vous assurer que process.env.API_KEY est configuré.";
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
2. **Format** : Utilisez le **Markdown** pour structurer votre réponse de manière riche et lisible.
   - Utilisez des **titres** (##) pour séparer les sections.
   - Mettez les chiffres clés et insights importants en **gras**.
   - Utilisez des **listes à puces** pour énumérer les points.
   - Créez des **tableaux** Markdown clairs pour les comparaisons (ex: Concurrents, Zones, Tranches d'âge).
3. **Contenu** : 
   - Soyez factuel, professionnel et concis.
   - Citez les chiffres exacts du JSON pour justifier vos analyses.
   - Identifiez les tendances majeures.
   - Si les données ont changé (mise à jour en temps réel via l'éditeur), basez-vous sur le JSON fourni ci-dessus qui contient les valeurs actuelles.
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