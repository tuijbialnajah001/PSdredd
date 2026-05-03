import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useMemo, TouchEvent } from 'react';
import { POKI_TYPE_COLORS, formatPrice, calculatePrice } from '../lib/constants';

interface PokemonCardProps {
  pokemon: any;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onClick?: () => void;
}

const STAT_LABELS = ['HEALTH', 'ATTACK', 'DEFENSE', 'SP. ATK', 'SP. DEF', 'SPEED'];

export const PokemonCard = ({ pokemon, isFavorite, onToggleFavorite, onClick }: PokemonCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  
  // Map over pokemon.varieties to show actual pokemon forms (Mega, GMax, etc.)
  const availableVariants = useMemo(() => {
    if (pokemon.varieties && pokemon.varieties.length > 0) {
      return pokemon.varieties.map((v: any) => {
        const segments = v.url.split('/').filter(Boolean);
        const id = segments[segments.length - 1];
        const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
        
        let formattedName = v.name.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
        
        return {
          id,
          url: imageUrl,
          name: formattedName
        };
      });
    }
    
    // Fallback if no varieties are fetched yet
    return [{ 
      id: pokemon.id,
      url: pokemon.sprites?.other?.['official-artwork']?.front_default || pokemon.sprites?.front_default, 
      name: pokemon.name.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) 
    }];
  }, [pokemon.varieties, pokemon.sprites, pokemon.name, pokemon.id]);

  const currentVariant = availableVariants[imageIndex] || availableVariants[0];
  const currentImgUrl = currentVariant.url;
  const currentVariantName = currentVariant.name;

  const [variantDetails, setVariantDetails] = useState<Record<string, any>>({});

  useEffect(() => {
    if (currentVariant && currentVariant.id && currentVariant.id.toString() !== pokemon.id.toString() && !variantDetails[currentVariant.id]) {
      fetch(`https://pokeapi.co/api/v2/pokemon/${currentVariant.id}/`)
        .then(res => res.json())
        .then(data => {
          setVariantDetails(prev => ({...prev, [currentVariant.id]: data}));
        })
        .catch(console.error);
    }
  }, [currentVariant, pokemon.id, variantDetails]);

  const activePokemon = currentVariant?.id && currentVariant.id.toString() !== pokemon.id.toString() && variantDetails[currentVariant.id] 
    ? variantDetails[currentVariant.id] 
    : pokemon;

  const primaryType = activePokemon.types[0].type.name;
  const color = POKI_TYPE_COLORS[primaryType] || '#777';

  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 30;

    if (distance > minSwipeDistance) {
      setImageIndex((prev) => (prev + 1) % availableVariants.length);
    } else if (distance < -minSwipeDistance) {
      setImageIndex((prev) => (prev - 1 + availableVariants.length) % availableVariants.length);
    }
    setTouchStartX(null);
  };

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={onClick}
      onDoubleClick={() => setIsFlipped(!isFlipped)}
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
                {activePokemon.types.map((t: any) => (
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
                <span className="text-[0.6rem] font-mono text-[var(--muted)] opacity-50">#{activePokemon.id.toString().padStart(3, '0')}</span>
              </div>
            </div>

            <div 
              className="w-full mb-4 relative flex items-center justify-center flex-1 min-h-0"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <img 
                src={currentImgUrl} 
                alt={currentVariantName} 
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  if (currentVariant.id) {
                    (e.target as HTMLImageElement).src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${currentVariant.id}.png`;
                  }
                }}
                className="transition-transform duration-300 group-hover:scale-110 object-contain h-[120px] md:h-[140px] w-full" 
              />
              
              {/* Variant Pagination Dots / Text */}
              {availableVariants.length > 1 && (
                <div className="absolute bottom-0 flex gap-1 justify-center w-full max-w-[80%] flex-wrap overflow-hidden h-2 opacity-50 hover:opacity-100 transition-opacity">
                  {availableVariants.length <= 15 ? availableVariants.map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 shrink-0 ${i === imageIndex ? 'bg-white scale-125' : 'bg-white/30'}`}
                    />
                  )) : (
                    <div className="text-[0.6rem] text-white/70 font-mono tracking-wider -mt-1 font-bold">
                       {imageIndex + 1} / {availableVariants.length}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col items-center justify-center shrink-0 mb-1 w-full px-2">
              <h4 className="font-['Righteous'] text-lg md:text-xl tracking-wider text-white transition-colors text-center capitalize max-h-14 overflow-hidden">
                {currentVariantName}
              </h4>
              {availableVariants.length > 1 && (
                <div className="text-[0.55rem] md:text-[0.6rem] text-[var(--muted)]/60 tracking-widest uppercase text-center mt-0.5">
                  Swipe for {availableVariants.length - 1} more form{availableVariants.length > 2 ? 's' : ''}
                </div>
              )}
            </div>
            
            <div className="mt-auto w-full pt-3 md:pt-4 border-t border-white/5 flex justify-between items-center shrink-0">
              <div className="text-[0.55rem] uppercase tracking-widest text-[var(--muted)]">Market Price</div>
              <div className="font-['Righteous'] text-base md:text-lg text-[var(--gold)] tracking-wide transition-transform group-hover:scale-105 origin-right duration-300">
                🪙 {formatPrice(calculatePrice(activePokemon, imageIndex, currentVariantName))}
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
            {activePokemon.stats?.slice(0, 6).map((stat: any, index: number) => {
              const label = STAT_LABELS[index] || 'STAT';
              const val = stat.base_stat || 0;
              const maxVal = 255;
              const pct = Math.min(100, Math.max(0, (val / maxVal) * 100));
              
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="text-[0.55rem] md:text-[0.6rem] font-bold text-white/50 w-14 md:w-16 tracking-wider shrink-0 truncate">
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
            Double Tap to Flip
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
