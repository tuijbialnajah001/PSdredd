/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { PokemonCard } from './components/PokemonCard';
import { fetchPokemonList } from './lib/api';

export default function App() {
  const [pokemons, setPokemons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Explore');
  const [favorites, setFavorites] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('poke-favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('poke-favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchPokemonList(24, 0); // Load initial batch
        setPokemons(data);
      } catch (error) {
        console.error("Failed to fetch pokemons", error);
      }
      setLoading(false);
    };

    loadData();
  }, []);

  const handleToggleFavorite = (pokemon: any) => {
    setFavorites(prev => {
      const isFav = prev.some(p => p.id === pokemon.id);
      if (isFav) {
        return prev.filter(p => p.id !== pokemon.id);
      }
      return [...prev, pokemon];
    });
  };

  const displayedPokemons = activeTab === 'Favorites' ? favorites : pokemons;

  return (
    <div className="max-w-[1100px] mx-auto px-8 pt-12 pb-32 min-h-[100vh]">
      {/* Header */}
      <div className="text-center mb-16 relative pt-8">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-[var(--gold)]/5 rounded-full blur-[80px] pointer-events-none transform-gpu" />
        <h1 className="relative font-['Righteous'] text-5xl md:text-6xl mb-4 tracking-wider">
          EXPLORE <span className="text-[var(--gold)] drop-shadow-[0_0_15px_rgba(201,168,76,0.2)]">POKEMON</span>
        </h1>
        <div className="flex items-center justify-center gap-4">
          <div className="h-px w-12 md:w-24 bg-gradient-to-r from-transparent to-[var(--gold)] opacity-50" />
          <p className="text-[0.65rem] md:text-xs tracking-[0.5em] uppercase text-[var(--muted)] font-bold whitespace-nowrap">Discover & Collect</p>
          <div className="h-px w-12 md:w-24 bg-gradient-to-l from-transparent to-[var(--gold)] opacity-50" />
        </div>
      </div>

      {/* Floating Curved Filter Button */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-[#121212]/80 backdrop-blur-xl border border-white/10 p-1.5 flex gap-1 shadow-[0_10px_40px_rgba(0,0,0,0.5)] items-center rounded-full transform-gpu">
        {['Explore', 'Favorites'].map((tab) => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-3 rounded-full text-[0.65rem] md:text-xs font-bold uppercase tracking-widest transition-all duration-300 will-change-transform ${
              activeTab === tab 
                ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] scale-100' 
                : 'text-[var(--muted)] hover:text-white/90 hover:bg-white/5 transparent scale-95'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid container */}
      {loading && activeTab !== 'Favorites' ? (
        <div className="flex justify-center items-center h-64">
           <div className="w-12 h-12 border-4 border-white/5 border-t-[var(--gold)] rounded-full animate-spin"></div>
        </div>
      ) : displayedPokemons.length === 0 ? (
         <div className="flex flex-col items-center justify-center h-64 text-[var(--muted)]">
            <p className="font-['Righteous'] text-2xl mb-2">No Pokemons found</p>
            <p className="text-sm">Start exploring to build your collection.</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative z-10">
          {displayedPokemons.map((pokemon) => (
            <PokemonCard 
              key={pokemon.id} 
              pokemon={pokemon} 
              isFavorite={favorites.some(fav => fav.id === pokemon.id)}
              onToggleFavorite={() => handleToggleFavorite(pokemon)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
