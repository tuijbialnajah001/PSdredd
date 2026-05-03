import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { POKI_TYPE_COLORS, formatPrice, calculatePrice } from '../lib/constants';

interface PokemonCardProps {
  pokemon: any;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onClick?: () => void;
}

const STAT_LABELS = ['HP', 'ATK', 'DEF', 'SPA', 'SPD', 'SPE'];

export const PokemonCard = ({ pokemon, isFavorite, onToggleFavorite, onClick }: PokemonCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  const primaryType = pokemon.types[0].type.name;
  const color = POKI_TYPE_COLORS[primaryType] || '#777';
  const imgUrl = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isFlipped) {
      timeout = setTimeout(() => {
        setIsFlipped(false);
      }, 3500);
    }
    return () => clearTimeout(timeout);
  }, [isFlipped]);

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={onClick}
      onDoubleClick={() => setIsFlipped(true)}
      className="relative group cursor-pointer h-[320px] md:h-[350px]"
      style={{ perspective: 1000 }}
    >
      <motion.div
        className="relative h-full w-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* FRONT */}
        <div 
          className="absolute inset-0 bg-[#121212] border border-white/5 rounded-2xl p-3 md:p-4 overflow-hidden transition-all duration-300 group-hover:border-white/20 flex flex-col pointer-events-auto"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleFavorite) onToggleFavorite();
            }}
            className="absolute top-4 right-4 z-30 p-2 rounded-full bg-[#1a1a1a] border border-white/5 hover:bg-white/10 transition-all duration-300 group/btn pointer-events-auto"
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
            className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full -mr-10 -mt-10 pointer-events-none opacity-50" 
            style={{ backgroundColor: `${color}10` }}
          />
          
          <div className="relative z-10 flex flex-col items-center flex-1 h-full pt-1">
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

            <div className="w-full mb-4 relative flex items-center justify-center flex-1 min-h-0">
              <img 
                src={imgUrl} 
                alt={pokemon.name} 
                loading="lazy"
                decoding="async"
                className="transition-transform duration-300 group-hover:scale-110 object-contain h-[120px] md:h-[140px] w-full" 
              />
            </div>

            <h4 className="font-['Righteous'] text-xl md:text-2xl tracking-wider text-white mb-1 transition-colors text-center capitalize shrink-0">
              {pokemon.name}
            </h4>
            
            <div className="mt-auto w-full pt-3 md:pt-4 border-t border-white/5 flex justify-between items-center shrink-0">
              <div className="text-[0.55rem] uppercase tracking-widest text-[var(--muted)]">Market Price</div>
              <div className="font-['Righteous'] text-base md:text-lg text-[var(--gold)] tracking-wide transition-transform group-hover:scale-105 origin-right duration-300">
                🪙 {formatPrice(calculatePrice(pokemon))}
              </div>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div 
          className="absolute inset-0 bg-[#121212] border border-[var(--gold)]/30 rounded-2xl p-4 md:p-5 flex flex-col overflow-hidden"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div 
            className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--gold)]/20 to-transparent rounded-bl-full -mr-10 -mt-10 pointer-events-none opacity-20" 
          />
          <h4 className="font-['Righteous'] text-xl tracking-widest text-[var(--gold)] mb-4 text-center">
            BASE STATS
          </h4>
          
          <div className="flex-1 flex flex-col justify-center gap-3 md:gap-4 relative z-10 w-full px-2">
            {pokemon.stats?.slice(0, 6).map((stat: any, index: number) => {
              const label = STAT_LABELS[index] || 'STAT';
              const val = stat.base_stat || 0;
              const maxVal = 255;
              const pct = Math.min(100, Math.max(0, (val / maxVal) * 100));
              
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="text-[0.6rem] md:text-[0.65rem] font-bold text-white/50 w-8 md:w-10 tracking-wider">
                    {label}
                  </div>
                  <div className="flex-1 h-1.5 md:h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                      initial={{ width: 0 }}
                      animate={{ width: isFlipped ? `${pct}%` : 0 }}
                      transition={{ duration: 0.8, delay: isFlipped ? 0.2 + (index * 0.1) : 0, ease: "easeOut" }}
                    />
                  </div>
                  <div className="text-[0.65rem] md:text-xs font-mono text-white/90 w-6 md:w-8 text-right font-semibold">
                    {val}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-[0.55rem] text-center text-white/30 uppercase tracking-widest mt-auto shrink-0 pt-2 pb-1">
            Double Tap Details
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
