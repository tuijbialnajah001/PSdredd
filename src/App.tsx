/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { PokemonCard } from './components/PokemonCard';
import { SearchBar } from './components/SearchBar';
import { FeedbackButton } from './components/FeedbackButton';
import { fetchPokemonList, fetchPokemonDetails } from './lib/api';
import { POKEMON_ORDER_BY_STATS } from './lib/pokemonOrder';
import { TrendingDown, TrendingUp, RefreshCcw } from 'lucide-react';

export default function App() {
  const [pokemons, setPokemons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 16;
  const [hasMore, setHasMore] = useState(true);
  const [sortOrder, setSortOrder] = useState<'default' | 'low' | 'high'>('default');

  const [activeTab, setActiveTab] = useState('Explore');
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [favorites, setFavorites] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('poke-favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const visiblePokemonIds = useRef<Set<number>>(new Set());

  useEffect(() => {
    const handleVisible = (e: any) => {
      const { id, visible } = e.detail;
      if (visible) {
        visiblePokemonIds.current.add(id);
      } else {
        visiblePokemonIds.current.delete(id);
      }
    };
    window.addEventListener('pokemon-visible' as any, handleVisible);
    return () => window.removeEventListener('pokemon-visible' as any, handleVisible);
  }, []);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastPokemonElementRef = useCallback((node: HTMLDivElement) => {
    if (loading || loadingMore || activeTab !== 'Explore' || isSearching || sortOrder !== 'default') return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setOffset(prevOffset => prevOffset + limit);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore, activeTab, isSearching, sortOrder]);

  useEffect(() => {
    localStorage.setItem('poke-favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchPokemonList(limit, 0); // Load initial batch
        setPokemons(data);
        setHasMore(data.length === limit);
      } catch (error) {
        console.error("Failed to fetch pokemons", error);
      }
      setLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (offset === 0) return; // Ignore initial load
    
    const loadMoreData = async () => {
      setLoadingMore(true);
      try {
        const data = await fetchPokemonList(limit, offset);
        if (data.length > 0) {
           setPokemons(prev => [...prev, ...data]);
        }
        setHasMore(offset + limit < POKEMON_ORDER_BY_STATS.length);
      } catch (error) {
        console.error("Failed to fetch more pokemons", error);
      }
      setLoadingMore(false);
    };

    if (activeTab === 'Explore' && !isSearching) {
       loadMoreData();
    }
  }, [offset, activeTab, isSearching]);

  const handleToggleFavorite = (pokemon: any) => {
    setFavorites(prev => {
      const isFav = prev.some(p => p.id === pokemon.id);
      if (isFav) {
        return prev.filter(p => p.id !== pokemon.id);
      }
      return [...prev, pokemon];
    });
  };

  const handleSearch = async (name: string) => {
    setIsSearching(true);
    setLoading(true);
    try {
      const data = await fetchPokemonDetails(name);
      if (data) {
        setSearchResult([data]);
      } else {
        setSearchResult([]); // Provide empty array to show no results
      }
    } catch (e) {
      setSearchResult([]);
    }
    setLoading(false);
  };

  const handleClearSearch = () => {
    setIsSearching(false);
    setSearchResult(null);
  };

  const calculateBST = (stats: any[]) => {
    return stats?.reduce((acc: number, s: any) => acc + (s.base_stat || 0), 0) || 0;
  };

  const displayedPokemons = useMemo(() => {
    let base = searchResult ? searchResult : (activeTab === 'Favorites' ? favorites : pokemons);
    
    if (sortOrder === 'default') return base;
    
    const sorted = [...base].sort((a, b) => {
      const bstA = calculateBST(a.stats);
      const bstB = calculateBST(b.stats);
      return sortOrder === 'low' ? bstA - bstB : bstB - bstA;
    });
    
    return sorted;
  }, [searchResult, activeTab, favorites, pokemons, sortOrder]);

  const toggleSort = () => {
    setSortOrder(prev => {
      if (prev === 'default') return 'low';
      if (prev === 'low') return 'high';
      return 'default';
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      // Pick a random pokemon that has variants AND is visible
      const variantsList = displayedPokemons.filter(p => 
        p.varieties && 
        p.varieties.length > 1 && 
        visiblePokemonIds.current.has(p.id)
      );

      if (variantsList.length > 0) {
        const randomPokemon = variantsList[Math.floor(Math.random() * variantsList.length)];
        const event = new CustomEvent('cycle-pokemon-variant', { detail: { id: randomPokemon.id } });
        window.dispatchEvent(event);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [displayedPokemons]);

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 pt-4 pb-12 min-h-[100vh]">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 relative pt-24 md:pt-20">
        <div className="text-center md:text-left">
          <h1 className="relative font-['Righteous'] text-3xl md:text-4xl mb-1 tracking-widest">
            EXPLORE <span className="text-[var(--gold)]">POKEMON</span>
          </h1>
          <div className="flex items-center justify-center md:justify-start gap-4">
            <p className="text-[0.55rem] md:text-[0.65rem] tracking-[0.4em] uppercase text-[var(--muted)] font-bold whitespace-nowrap">Discover & Collect</p>
            <div className="hidden md:block h-px w-16 bg-gradient-to-r from-[var(--gold)] to-transparent opacity-50" />
          </div>
        </div>

        <div className="w-full md:w-auto md:min-w-[320px] lg:min-w-[400px] flex items-center gap-3">
          <div className="flex-1">
            <SearchBar onSearch={handleSearch} onClear={handleClearSearch} />
          </div>
          
          <button 
            onClick={toggleSort}
            className={`h-12 w-12 shrink-0 rounded-xl border border-white/5 flex items-center justify-center transition-all duration-300 relative group overflow-hidden ${
              sortOrder !== 'default' ? 'bg-[var(--gold)]/10 border-[var(--gold)]/30' : 'bg-white/5'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative z-10 transition-transform duration-500 group-active:scale-95">
              {sortOrder === 'default' && <RefreshCcw className="w-5 h-5 text-[var(--muted)] group-hover:text-white" />}
              {sortOrder === 'low' && <TrendingDown className="w-5 h-5 text-[var(--gold)]" />}
              {sortOrder === 'high' && <TrendingUp className="w-5 h-5 text-[var(--gold)]" />}
            </div>
            
            <div className="absolute top-1 right-1 pointer-events-none">
               {sortOrder === 'low' && <span className="text-[8px] text-[var(--gold)] font-bold opacity-60">MIN</span>}
               {sortOrder === 'high' && <span className="text-[8px] text-[var(--gold)] font-bold opacity-60">MAX</span>}
            </div>
          </button>
        </div>
      </div>

      {/* Floating Curved Filter Button */}
      <div className="fixed top-6 md:top-8 left-1/2 -translate-x-1/2 z-50 bg-[#121212]/80 backdrop-blur-2xl border border-white/10 p-1.5 flex gap-1 shadow-[0_10px_40px_rgba(0,0,0,0.5)] items-center rounded-full transform-gpu">
        {['Explore', 'Favorites'].map((tab) => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-3 rounded-full text-[0.65rem] md:text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
              activeTab === tab 
                ? 'bg-white/10 text-white scale-100 border border-white/5' 
                : 'text-[var(--muted)] hover:text-white/90 hover:bg-white/5 transparent scale-95 border border-transparent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <FeedbackButton />

      {/* Grid container */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
           <div className="w-12 h-12 border-4 border-white/5 border-t-[var(--gold)] rounded-full animate-spin"></div>
        </div>
      ) : displayedPokemons.length === 0 ? (
         <div className="flex flex-col items-center justify-center h-64 text-[var(--muted)]">
            <p className="font-['Righteous'] text-2xl mb-2">No Pokemons found</p>
            <p className="text-sm">Start exploring to build your collection.</p>
         </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 lg:gap-6 relative">
            {displayedPokemons.map((pokemon, index) => {
              if (displayedPokemons.length === index + 1) {
                return (
                  <div ref={lastPokemonElementRef} key={pokemon.id}>
                    <PokemonCard 
                      pokemon={pokemon} 
                      isFavorite={favorites.some(fav => fav.id === pokemon.id)}
                      onToggleFavorite={() => handleToggleFavorite(pokemon)}
                    />
                  </div>
                );
              } else {
                return (
                  <div key={pokemon.id}>
                    <PokemonCard 
                      pokemon={pokemon} 
                      isFavorite={favorites.some(fav => fav.id === pokemon.id)}
                      onToggleFavorite={() => handleToggleFavorite(pokemon)}
                    />
                  </div>
                );
              }
            })}
          </div>
          {loadingMore && (
            <div className="flex justify-center items-center py-10">
               <div className="w-8 h-8 border-4 border-white/5 border-t-[var(--gold)] rounded-full animate-spin"></div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
