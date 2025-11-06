export interface WebSource {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web: WebSource;
}

export interface GroundingMetadata {
  groundingChunks: GroundingChunk[];
}

export interface GraphData {
  equations: string[];
}

export interface SearchFilters {
  dateRange: 'all' | 'day' | 'week' | 'month' | 'year';
  sortBy: 'relevance' | 'date';
  sourceType: 'all' | 'news' | 'academic' | 'blogs';
}

export interface SearchResultData {
  type: 'text' | 'graph';
  text: string;
  sources: WebSource[];
  suggestions?: string[];
  graphData?: GraphData;
}