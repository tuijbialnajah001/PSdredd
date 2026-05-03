import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { fetchAllPokemonNames } from '../lib/api';

interface SearchBarProps {
  onSearch: (name: string) => void;
  onClear: () => void;
}

export const SearchBar = ({ onSearch, onClear }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [allNames, setAllNames] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAllPokemonNames().then(setAllNames);
  }, []);

  useEffect(() => {
    if (query.trim().length > 0) {
      const q = query.trim().toLowerCase().replace(/\s+/g, '-');
      const matches = allNames.filter(name => name.startsWith(q)).slice(0, 8);
      setSuggestions(matches);
      setIsOpen(matches.length > 0);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [query, allNames]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (name: string) => {
    setQuery(name);
    setIsOpen(false);
    onSearch(name);
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    onClear();
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md mx-auto z-30">
      <div className="relative flex items-center">
        <Search className="absolute left-4 w-5 h-5 text-white/40" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (suggestions.length > 0) setIsOpen(true); }}
          onKeyDown={(e) => {
             if (e.key === 'Enter' && query.trim()) {
                const searchQ = query.trim().toLowerCase();
                const exactMatch = allNames.find(n => n.replace(/-/g, ' ') === searchQ || n === searchQ);
                handleSelect(exactMatch || searchQ.replace(/\\s+/g, '-'));
             }
          }}
          placeholder="Search pokemon..."
          className="w-full bg-[#1a1a1a] border border-white/10 rounded-full py-3.5 pl-12 pr-12 text-white placeholder-white/40 focus:outline-none focus:border-[var(--gold)]/50 transition-colors"
        />
        {query && (
          <button 
            onClick={handleClear}
            className="absolute right-4 p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-40 transform-gpu">
          {suggestions.map((name, index) => {
            const qLen = query.trim().length;
            const matchedPart = name.slice(0, qLen).replace(/-/g, ' ');
            const restPart = name.slice(qLen).replace(/-/g, ' ');
            
            return (
              <button
                key={name}
                onClick={() => handleSelect(name)}
                className={`w-full text-left px-5 py-3 hover:bg-white/5 transition-colors capitalize flex items-center ${
                  index !== suggestions.length - 1 ? 'border-b border-white/5' : ''
                }`}
              >
                <span className="text-[var(--gold)] font-bold">{matchedPart}</span>
                <span className="text-white/80">{restPart}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
