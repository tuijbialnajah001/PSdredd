import { Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { POKI_TYPE_COLORS, formatPrice, calculatePrice } from '../lib/constants';

interface PokemonCardProps {
  pokemon: any;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onClick?: () => void;
}

export const PokemonCard = ({ pokemon, isFavorite, onToggleFavorite, onClick }: PokemonCardProps) => {
  const primaryType = pokemon.types[0].type.name;
  const color = POKI_TYPE_COLORS[primaryType] || '#777';
  const imgUrl = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={onClick}
      className="relative group cursor-pointer h-full"
    >
      <div className="relative h-full bg-[#121212] border border-white/5 rounded-3xl p-5 overflow-hidden transition-all duration-300 group-hover:border-white/20 flex flex-col">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleFavorite) onToggleFavorite();
          }}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-[#1a1a1a] border border-white/5 hover:bg-white/10 transition-all duration-300 group/btn"
        >
          <Heart 
            className={`w-4 h-4 transition-transform duration-300 ${
              isFavorite 
                ? 'fill-[var(--gold)] text-[var(--gold)] scale-110' 
                : 'text-white/50 group-hover/btn:text-white'
            }`} 
          />
        </button>
        <div 
          className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-110 pointer-events-none opacity-50" 
          style={{ backgroundColor: `${color}10` }}
        />
        
        <div className="relative z-10 flex flex-col items-center flex-1">
          <div className="w-full flex justify-between items-start mb-2">
            <div className="flex gap-1 flex-wrap">
              {pokemon.types.map((t: any) => (
                <span 
                  key={t.type.name} 
                  className="text-[0.55rem] px-2 py-0.5 rounded text-white font-bold uppercase tracking-wider shadow-sm" 
                  style={{ backgroundColor: POKI_TYPE_COLORS[t.type.name] }}
                >
                  {t.type.name}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[0.6rem] font-mono text-[var(--muted)] opacity-50">#{pokemon.id.toString().padStart(3, '0')}</span>
            </div>
          </div>

          <div className="w-full aspect-square mb-4 relative flex items-center justify-center">
            <img 
              src={imgUrl} 
              alt={pokemon.name} 
              loading="lazy"
              decoding="async"
              className="transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-2 object-contain h-full w-full" 
            />
          </div>

          <h4 className="font-['Righteous'] text-2xl tracking-wider text-white mb-1 group-hover:text-[var(--gold)] transition-colors text-center capitalize">
            {pokemon.name}
          </h4>
          
          <div className="mt-auto w-full pt-4 border-t border-white/5 flex justify-between items-center">
            <div className="text-[0.55rem] uppercase tracking-widest text-[var(--muted)]">Market Price</div>
            <div className="font-['Righteous'] text-lg text-[var(--gold)] tracking-wide transition-transform group-hover:scale-105 origin-right duration-300">
              🪙 {formatPrice(calculatePrice(pokemon))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
