import React, { useState, useEffect, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import SearchResult from './components/SearchResult';
import LoadingSpinner from './components/LoadingSpinner';
import Suggestions from './components/Suggestions';
import CopyButton from './components/CopyButton';
import RefreshButton from './components/RefreshButton';
import Graph from './components/Graph';
import { searchWithGemini } from './services/geminiService';
import { getSearchHistory, addSearchHistoryItem, clearSearchHistory } from './services/historyService';
import * as systemPromptService from './services/systemPromptService';
import { SearchResultData, SearchFilters } from './types';

const App: React.FC = () => {
  const [searchResult, setSearchResult] = useState<SearchResultData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [filters, setFilters] = useState<SearchFilters>({
    dateRange: 'all',
    sortBy: 'relevance',
    sourceType: 'all',
  });
  const [systemPrompt, setSystemPrompt] = useState<string>(systemPromptService.getSystemPrompt());

  const performSearch = async (query: string, searchFilters: SearchFilters, prompt: string) => {
    setIsLoading(true);
    setError(null);
    setSearchResult(null);

    const result = await searchWithGemini(query, searchFilters, prompt);
    
    if (result.type === 'text' && result.text.includes('An error occurred')) {
      setError(result.text);
    } else {
      setSearchResult(result);
    }
    
    setIsLoading(false);
  };

  const handleSearch = useCallback(async (query: string, options: { isNavigating?: boolean } = {}) => {
    if (!query.trim() || (query === currentQuery && options.isNavigating)) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSearchResult(null);
    setCurrentQuery(query);

    if (!options.isNavigating) {
      const newHash = `q=${encodeURIComponent(query)}`;
      if (window.location.hash !== `#${newHash}`) {
        window.location.hash = newHash;
      }
    }
    
    addSearchHistoryItem(query);
    setSearchHistory(getSearchHistory());

    await performSearch(query, filters, systemPrompt);

  }, [currentQuery, filters, systemPrompt]);

  const handleFilterChange = (filterUpdate: Partial<SearchFilters>) => {
    const newFilters = { ...filters, ...filterUpdate };
    setFilters(newFilters);
    if (currentQuery) {
      performSearch(currentQuery, newFilters, systemPrompt);
    }
  };

  const handleSystemPromptChange = (newPrompt: string) => {
    setSystemPrompt(newPrompt);
    if (newPrompt === systemPromptService.DEFAULT_SYSTEM_PROMPT) {
      systemPromptService.clearSystemPrompt();
    } else {
      systemPromptService.setSystemPrompt(newPrompt);
    }
    if (currentQuery) {
      performSearch(currentQuery, filters, newPrompt);
    }
  };

  useEffect(() => {
    const getQueryFromHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#q=')) {
        try {
          return decodeURIComponent(hash.substring(3));
        } catch (e) {
          console.error("Failed to decode hash query:", e);
          return null;
        }
      }
      return null;
    };

    const handleHashChange = () => {
      const queryFromHash = getQueryFromHash();
      if (queryFromHash) {
        handleSearch(queryFromHash, { isNavigating: true });
      } else {
        setSearchResult(null);
        setError(null);
        setCurrentQuery('');
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    const initialQuery = getQueryFromHash();
    if (initialQuery) {
      handleSearch(initialQuery, { isNavigating: true });
    }

    setSearchHistory(getSearchHistory());

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [handleSearch]);

  const handleClearHistory = () => {
    clearSearchHistory();
    setSearchHistory([]);
  };

  return (
    <div className="min-h-screen text-[color:var(--on-background)] flex flex-col items-center pt-16 sm:pt-24 px-4">
      <header className="text-center mb-8">
        <h1 className="text-5xl sm:text-6xl tracking-tighter">
          <span className="text-[color:var(--primary)]">Astra</span> Search
        </h1>
        <p className="text-lg text-[color:var(--on-surface-variant)] mt-2">Your intelligent gateway to the web.</p>
      </header>

      <main className="w-full flex flex-col items-center">
        <SearchBar
          onSearch={handleSearch}
          isLoading={isLoading}
          history={searchHistory}
          onClearHistory={handleClearHistory}
          filters={filters}
          onFilterChange={handleFilterChange}
          systemPrompt={systemPrompt}
          onSystemPromptChange={handleSystemPromptChange}
        />
        
        {isLoading && <LoadingSpinner />}
        
        {error && (
            <div className="mt-8 text-center text-[color:var(--on-error-container)] bg-[color:var(--error-container)] p-4 rounded-lg max-w-3xl w-full">
                <p><strong>Error:</strong> {error}</p>
            </div>
        )}
        
        {searchResult && (
          <>
            <div className="w-full max-w-3xl mx-auto mt-8 flex justify-between items-center animate-fade-in">
              <h2 className="text-lg text-[color:var(--on-surface-variant)] truncate pr-4">
                Results for: <span className="text-[color:var(--on-surface)]">{currentQuery}</span>
              </h2>
              <div className="flex items-center gap-2 flex-shrink-0">
                  <RefreshButton
                    onClick={() => handleSearch(currentQuery)}
                    disabled={isLoading}
                  />
                  <CopyButton textToCopy={window.location.href} />
              </div>
            </div>

            {searchResult.type === 'text' && searchResult.suggestions && searchResult.suggestions.length > 0 && (
              <Suggestions 
                suggestions={searchResult.suggestions}
                onSuggestionClick={handleSearch}
              />
            )}

            {searchResult.type === 'text' && <SearchResult result={searchResult} />}
            {searchResult.type === 'graph' && searchResult.graphData && <Graph equations={searchResult.graphData.equations} />}
          </>
        )}


        {!isLoading && !searchResult && !error && (
            <div className="text-center mt-12 text-[color:var(--on-surface-variant)]">
                <p>Enter a query to start searching.</p>
            </div>
        )}
      </main>

      <footer className="w-full text-center p-4 mt-auto">
        <p className="text-[color:var(--on-surface-variant)] text-sm font-medium">Powered by Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;