import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SearchResultData, GroundingChunk, WebSource, SearchFilters } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might want to show a message to the user
  // but for this context, we assume the key is always present.
  console.error("API_KEY is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY as string });

export const searchWithGemini = async (query: string, filters: SearchFilters, systemPrompt: string): Promise<SearchResultData> => {
  try {
    let filterInstructions = '';
    const filterClauses = [];

    if (filters.dateRange !== 'all') {
      filterClauses.push(`from the past ${filters.dateRange}`);
    }
    if (filters.sortBy === 'date') {
      filterClauses.push('sorted by most recent date');
    }
    if (filters.sourceType !== 'all') {
      filterClauses.push(`from ${filters.sourceType} sources`);
    }

    if (filterClauses.length > 0) {
      filterInstructions = ` Apply the following search filters: ${filterClauses.join(', ')}.`;
    }
    
    const richQuery = `Answer the following query: "${query}".${filterInstructions}

SPECIAL INSTRUCTIONS:
1. If the query is a request to plot one or more mathematical functions or graphs (e.g., "graph y = x^2", "plot sin(x) and cos(x)"), your ENTIRE response MUST be in the following format and nothing else:
GRAPH::y=x^2,y=sin(x)
(Replace the equations with the exact mathematical expressions from the query, separated by commas).
2. For all other queries, provide a helpful text-based answer. Use LaTeX for mathematical formulas using $$ for display math and $ for inline math.
3. If you think a regular text query is misspelled or could be improved, please provide a few alternative search queries at the end of your answer. Format the suggestions like this:
Suggestions:
- suggestion 1
- suggestion 2`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: richQuery,
      config: {
        tools: [{ googleSearch: {} }],
        ...(systemPrompt && { systemInstruction: systemPrompt }),
      },
    });
    
    const rawText = response.text;

    if (rawText.startsWith('GRAPH::')) {
      const equations = rawText.substring('GRAPH::'.length).split(',').map(eq => eq.trim()).filter(Boolean);
      return {
        type: 'graph',
        text: `Graph for: ${query}`,
        sources: [],
        graphData: { equations }
      };
    }

    let text = rawText;
    let suggestions: string[] = [];

    const suggestionsMarker = 'Suggestions:';
    const suggestionsIndex = rawText.lastIndexOf(suggestionsMarker);

    if (suggestionsIndex !== -1) {
      const textAfterMarker = rawText.substring(suggestionsIndex + suggestionsMarker.length).trim();
      const potentialAnswer = rawText.substring(0, suggestionsIndex).trim();

      if (potentialAnswer) {
        text = potentialAnswer;
        suggestions = textAfterMarker
          .split('\n')
          .map(s => s.trim())
          .map(s => s.startsWith('- ') ? s.substring(2).trim() : s)
          .filter(s => s.length > 0);
      }
    }


    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

    const sources = groundingMetadata?.groundingChunks
      ?.map((chunk: GroundingChunk) => chunk.web)
      .filter((webSource): webSource is WebSource => !!webSource && !!webSource.uri)
      // Deduplicate sources based on URI
      .reduce((acc: WebSource[], current) => {
        if (!acc.some(item => item.uri === current.uri)) {
          acc.push(current);
        }
        return acc;
      }, []) || [];

    return { type: 'text', text, sources, suggestions };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        return { type: 'text', text: `An error occurred while searching. Please check the console for details. Error: ${error.message}`, sources: [] };
    }
    return { type: 'text', text: "An unknown error occurred while searching.", sources: [] };
  }
};