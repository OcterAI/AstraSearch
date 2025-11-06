import React from 'react';
import { SearchResultData } from '../types';
import CopyButton from './CopyButton';
import RenderWithLatex from './RenderWithLatex';

interface SearchResultProps {
  result: SearchResultData;
}

const SearchResult: React.FC<SearchResultProps> = ({ result }) => {
  if (!result.text && (!result.sources || result.sources.length === 0)) {
    return null;
  }

  return (
    <div className="w-full max-w-3xl mx-auto mt-4 bg-[color:var(--surface)] rounded-2xl shadow-xl p-6 text-[color:var(--on-surface)] animate-fade-in">
      {result.text && (
        <RenderWithLatex text={result.text} />
      )}
      
      {result.sources && result.sources.length > 0 && (
        <div className="mt-6 pt-4 border-t border-[color:var(--outline)]">
          <h3 className="text-md text-[color:var(--on-surface-variant)] mb-3 tracking-wider uppercase">Sources</h3>
          <ol className="space-y-3">
            {result.sources.map((source, index) => (
              <li key={index} className="flex items-start justify-between gap-3">
                <div className="flex items-start min-w-0">
                  <span className="flex-shrink-0 w-5 h-5 bg-[color:var(--primary-container)] text-[color:var(--on-primary-container)] text-xs font-bold flex items-center justify-center rounded-full mr-3 mt-1">{index + 1}</span>
                  <a
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[color:var(--primary)] hover:opacity-80 hover:underline break-all"
                    aria-label={`Source: ${source.title || source.uri}`}
                  >
                    {source.title || source.uri}
                  </a>
                </div>
                <div className="flex-shrink-0 ml-2">
                    <CopyButton textToCopy={source.uri} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default SearchResult;