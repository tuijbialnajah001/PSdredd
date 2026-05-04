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
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const handleDoubleClick = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    setIsFlipped(newState);
  };
  
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
    <>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
            onClick={() => { setIsExpanded(false); setIsFlipped(false); }}
          />
        )}
      </AnimatePresence>

      <div className="relative h-[320px] md:h-[350px] w-full">
        <motion.div
          layout
          whileHover={!isExpanded ? { y: -5, scale: 1.02 } : undefined}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, zIndex: isExpanded ? 50 : 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          onClick={!isExpanded ? onClick : undefined}
          onDoubleClick={handleDoubleClick}
          className={`group cursor-pointer ${
            isExpanded 
              ? 'fixed inset-4 md:inset-0 md:m-auto md:w-[800px] md:h-[500px] z-50 pointer-events-auto' 
              : 'absolute inset-0 z-10'
          }`}
          style={{ perspective: 1000 }}
        >
          <motion.div
            className="relative h-full w-full"
            layout
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 200, damping: 20 }}
            style={{ transformStyle: 'preserve-3d' }}
          >
        {/* FRONT */}
        <div 
          className="absolute inset-0 bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 overflow-hidden transition-all duration-300 group-hover:border-white/30 flex flex-col pointer-events-auto shadow-2xl"
          style={{ backfaceVisibility: 'hidden', boxShadow: isExpanded ? `0 25px 50px -12px ${color}40` : `0 4px 20px -2px ${color}20` }}
        >
          {/* Subtle Color Glow */}
          <div 
            className="absolute -top-20 -right-20 w-48 h-48 rounded-full blur-[60px] opacity-20 pointer-events-none"
            style={{ backgroundColor: color }}
          />
          <div 
            className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full blur-[60px] opacity-20 pointer-events-none"
            style={{ backgroundColor: color }}
          />
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
            <div className={`w-full flex justify-between items-start mb-2 transition-all ${isExpanded ? 'px-2 mt-2' : ''}`}>
              <div className="flex gap-1 flex-wrap">
                {activePokemon.types.map((t: any) => (
                  <span 
                    key={t.type.name} 
                    className={`px-2 py-0.5 rounded text-white font-bold uppercase tracking-wider shadow-sm transition-all ${isExpanded ? 'text-xs' : 'text-[0.55rem]'}`} 
                    style={{ backgroundColor: POKI_TYPE_COLORS[t.type.name] }}
                  >
                    {t.type.name}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-mono text-[var(--muted)] opacity-50 transition-all ${isExpanded ? 'text-sm' : 'text-[0.6rem]'}`}>#{activePokemon.id.toString().padStart(3, '0')}</span>
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
                className={`transition-transform duration-300 group-hover:scale-110 object-contain w-full ${isExpanded ? 'h-[200px] md:h-[250px]' : 'h-[120px] md:h-[140px]'}`} 
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

            <div className={`flex flex-col items-center justify-center shrink-0 mb-1 w-full px-2 transition-all ${isExpanded ? 'mt-4' : ''}`}>
              <h4 className={`font-['Righteous'] tracking-wider text-white transition-colors text-center capitalize max-h-14 overflow-hidden ${isExpanded ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl'}`}>
                {currentVariantName}
              </h4>
              {availableVariants.length > 1 && (
                <div className={`text-[var(--muted)]/60 tracking-widest uppercase text-center mt-0.5 transition-all ${isExpanded ? 'text-xs' : 'text-[0.55rem] md:text-[0.6rem]'}`}>
                  Swipe for {availableVariants.length - 1} more form{availableVariants.length > 2 ? 's' : ''}
                </div>
              )}
            </div>
            
            <div className={`mt-auto w-full pt-3 md:pt-4 border-t border-white/5 flex justify-between items-center shrink-0 transition-all ${isExpanded ? 'mb-2' : ''}`}>
              <div className={`uppercase tracking-widest text-[var(--muted)] transition-all ${isExpanded ? 'text-xs' : 'text-[0.55rem]'}`}>Market Price</div>
              <div className={`font-['Righteous'] text-[var(--gold)] tracking-wide transition-transform group-hover:scale-105 origin-right duration-300 ${isExpanded ? 'text-xl md:text-2xl' : 'text-base md:text-lg'}`}>
                🪙 {formatPrice(calculatePrice(activePokemon, imageIndex, currentVariantName))}
              </div>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div 
          className="absolute inset-0 bg-[#0A0A0A] border border-[var(--gold)]/30 rounded-2xl flex flex-col overflow-hidden shadow-2xl"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', boxShadow: isExpanded ? `0 25px 50px -12px ${color}40` : `0 4px 20px -2px ${color}20` }}
        >
          {/* Subtle Color Glow */}
          <div 
            className="absolute -top-20 -right-20 w-48 h-48 rounded-full blur-[60px] opacity-20 pointer-events-none"
            style={{ backgroundColor: color }}
          />
          <div 
            className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full blur-[60px] opacity-20 pointer-events-none"
            style={{ backgroundColor: color }}
          />
          
          {isExpanded ? (
            <div className="flex flex-col md:flex-row w-full h-full relative z-10">
               {/* Left Section: Image and Name */}
               <div className="flex-1 p-4 md:p-8 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-white/5 relative">
                  <div className="absolute top-4 left-4 flex gap-1 flex-wrap">
                      {activePokemon.types.map((t: any) => (
                        <span 
                          key={t.type.name} 
                          className="px-3 py-1 rounded text-white font-bold uppercase tracking-wider shadow-sm text-[0.65rem]"
                          style={{ backgroundColor: POKI_TYPE_COLORS[t.type.name] }}
                        >
                          {t.type.name}
                        </span>
                      ))}
                  </div>
                  <div className="absolute top-4 right-4 font-mono text-[var(--muted)] opacity-50 text-sm">
                    #{activePokemon.id.toString().padStart(3, '0')}
                  </div>
                  <img 
                    src={currentImgUrl} 
                    alt={currentVariantName} 
                    className="w-32 h-32 md:w-56 md:h-56 object-contain drop-shadow-2xl mb-2 mt-6 md:mt-0 max-h-[30vh]" 
                  />
                  <h4 className="font-['Righteous'] text-2xl md:text-4xl text-white capitalize text-center">
                     {currentVariantName}
                  </h4>
                  <div className="font-['Righteous'] text-[var(--gold)] mt-2 text-lg md:text-xl tracking-wide">
                     🪙 {formatPrice(calculatePrice(activePokemon, imageIndex, currentVariantName))}
                  </div>
               </div>

               {/* Right Section: Content (Variants + Stats) */}
               <div className="flex-[1.5] p-4 md:px-8 md:py-6 flex flex-col overflow-hidden">
                  {/* Variants / Forms (Now at the top of this section) */}
                  {availableVariants.length > 1 && (
                    <div className="mb-6 shrink-0">
                      <div className="text-[0.65rem] text-[var(--muted)] tracking-[0.2em] uppercase mb-3 text-center md:text-left flex items-center gap-2">
                        <span className="w-8 h-[1px] bg-white/10 hidden md:block" />
                        Available Forms ({availableVariants.length})
                      </div>
                      <div 
                        className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                      >
                        {availableVariants.map((v, i) => (
                          <button 
                            key={i} 
                            onClick={(e) => { e.stopPropagation(); setImageIndex(i); }}
                            className={`relative overflow-hidden rounded-xl border-2 transition-all p-1 md:p-1.5 shrink-0 bg-[#121212] snap-center group/variant ${
                              i === imageIndex 
                                ? 'border-[var(--gold)] scale-110 shadow-[0_0_20px_rgba(255,215,0,0.15)] z-10' 
                                : 'border-white/5 opacity-40 hover:opacity-100 hover:bg-white/5 hover:border-white/20'
                            }`}
                          >
                            <img src={v.url} className="w-10 h-10 md:w-14 md:h-14 object-contain" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stats Section */}
                  <div className="flex-1 flex flex-col min-h-0">
                    <h4 className="font-['Righteous'] tracking-[0.2em] text-[var(--gold)] mb-4 md:mb-6 text-sm md:text-base text-center md:text-left flex items-center gap-2">
                      <span className="w-8 h-[1px] bg-[var(--gold)]/30 hidden md:block" />
                      BASE STATS
                    </h4>
                    <div className="flex flex-col gap-3 md:gap-5 w-full overflow-y-auto pr-2 scrollbar-thin">
                      {activePokemon.stats?.slice(0, 6).map((stat: any, index: number) => {
                        const label = STAT_LABELS[index] || 'STAT';
                        const val = stat.base_stat || 0;
                        const maxVal = 255;
                        const pct = Math.min(100, Math.max(0, (val / maxVal) * 100));
                        
                        return (
                          <div key={index} className="flex items-center gap-4 group/stat">
                            <div className="font-bold text-white/30 tracking-widest shrink-0 text-[0.6rem] md:text-[0.7rem] w-16 md:w-24 group-hover/stat:text-white/60 transition-colors">
                              {label}
                            </div>
                            <div className="flex-1 bg-white/5 rounded-full overflow-hidden h-1.5 md:h-2">
                              <motion.div 
                                className="h-full rounded-full relative"
                                style={{ backgroundColor: color }}
                                initial={{ width: 0 }}
                                animate={{ width: isFlipped ? `${pct}%` : 0 }}
                                transition={{ duration: 1, type: "spring", stiffness: 50, delay: 0.1 + (index * 0.05) }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
                              </motion.div>
                            </div>
                            <div className="font-mono text-white/90 text-right font-medium text-xs md:text-sm w-8 tabular-nums">
                              {val}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
               </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-white/10 h-10 w-10"></div>
                <div className="flex-1 space-y-6 py-1">
                  <div className="h-2 bg-white/10 rounded"></div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-2 bg-white/10 rounded col-span-2"></div>
                      <div className="h-2 bg-white/10 rounded col-span-1"></div>
                    </div>
                    <div className="h-2 bg-white/10 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="absolute bottom-2 left-0 right-0 z-20 text-[0.55rem] text-center text-white/30 uppercase tracking-widest pointer-events-none pb-1 md:pb-0">
            Double Tap to Return
          </div>
        </div>
      </motion.div>
    </motion.div>
    </div>
    </>
  );
};
