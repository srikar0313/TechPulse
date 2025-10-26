
import { GoogleGenAI, Type } from "@google/genai";
import type { Article } from '../types';
import { CATEGORIES } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a client-side app, so process.env.API_KEY is expected to be handled by the environment.
  // In a real build, you'd use Vite/CRA env vars like import.meta.env.VITE_API_KEY.
  // For this context, we will proceed assuming it's available.
  console.warn("API_KEY is not set. The application might not work correctly.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: 'The headline of the article.',
      },
      image: {
        type: Type.STRING,
        description: 'A URL to a relevant image for the article. Use https://picsum.photos/seed/{random_word}/800/600 if no real image is available.',
      },
      source: {
        type: Type.STRING,
        description: 'The name of the news source, e.g., TechCrunch, The Verge.',
      },
      description: {
        type: Type.STRING,
        description: 'A short summary of the article, between 100 and 150 words.',
      },
      publishedAt: {
        type: Type.STRING,
        description: 'The publication date in ISO 8601 format.',
      },
      link: {
        type: Type.STRING,
        description: 'The direct URL to the original article.',
      },
      category: {
        type: Type.STRING,
        description: `The category of the article. Must be one of: ${CATEGORIES.join(', ')}.`,
      },
    },
    required: ['title', 'image', 'source', 'description', 'publishedAt', 'link', 'category'],
  },
};

export const fetchTechNews = async (): Promise<Omit<Article, 'id'>[]> => {
  const prompt = `
    Act as a tech news aggregator. Generate a JSON array of 12 recent and compelling tech news articles.
    Ensure the articles are diverse and cover the following categories: ${CATEGORIES.join(', ')}.
    The sources should be reputable, like TechCrunch, The Verge, Wired, Engadget, and Ars Technica.
    Each article must have a unique title, a valid image URL, a source name, a descriptive summary (100-150 words), a publication date in ISO 8601 format, a URL to the original article, and an appropriate category from the provided list.
    Generate fresh and different content each time this prompt is called.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    const articles = JSON.parse(jsonText);
    
    // Basic validation
    if (!Array.isArray(articles)) {
        throw new Error("API did not return an array.");
    }

    return articles;

  } catch (error) {
    console.error("Error fetching or parsing tech news from Gemini API:", error);
    throw new Error("Failed to generate tech news.");
  }
};
