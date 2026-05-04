export const POKI_TYPE_COLORS: Record<string, string> = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705898',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

export const formatPrice = (price: number) => {
  return `${price}M`;
};

export const calculatePrice = (pokemon: any, variantIndex: number = 0, variantName: string = '') => {
  const statTotal = pokemon.stats?.reduce((acc: number, stat: any) => acc + stat.base_stat, 0) || 300;
  
  // Normalize stat total between min (~180) and avg legendary base (~720)
  const normalized = Math.max(0, Math.min(1, (statTotal - 180) / 540));
  
  // Power curve to ensure price distribution
  const scale = Math.pow(normalized, 1.4);
  
  // Base price calculation
  let rawPrice = 40 + (scale * 260);
  
  // Apply minor multipliers for special forms
  let multiplier = 1.0;
  const nameLower = variantName.toLowerCase();
  
  if (nameLower.includes('mega')) multiplier = 1.25;
  else if (nameLower.includes('gmax')) multiplier = 1.15;
  else if (nameLower.includes('primal')) multiplier = 1.3;
  else if (nameLower.includes('alola') || nameLower.includes('galar') || nameLower.includes('hisui')) multiplier = 1.1;
  else if (variantIndex > 0) multiplier = 1.05; 

  const finalRawPrice = rawPrice * multiplier;
  
  // User requested ONLY these specific price levels
  const allowedPrices = [40, 50, 60, 70, 80, 90, 100, 120, 150, 180, 200, 250, 300];
  
  // Find the closest value from the allowed list
  const closestPrice = allowedPrices.reduce((prev, curr) => {
    return (Math.abs(curr - finalRawPrice) < Math.abs(prev - finalRawPrice) ? curr : prev);
  });

  return closestPrice;
};
