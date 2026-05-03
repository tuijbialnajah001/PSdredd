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
  
  // Normalize stat total between min (~150) and max (~780)
  const normalized = Math.max(0, Math.min(1, (statTotal - 150) / 630));
  
  // Apply a curve so legendary/high stats scale up faster at the top end
  const scale = Math.pow(normalized, 1.5);
  
  // Base price mapped to the requested 75 to 350 range
  let price = 75 + (scale * 275);
  
  // Apply multiplier based on the variant form to ensure no two forms have the exact same price
  let multiplier = 1.0;
  const nameLower = variantName.toLowerCase();
  
  if (nameLower.includes('mega')) multiplier = 1.35;
  else if (nameLower.includes('gmax')) multiplier = 1.25;
  else if (nameLower.includes('primal')) multiplier = 1.4;
  else if (nameLower.includes('alola') || nameLower.includes('galar') || nameLower.includes('hisui')) multiplier = 1.15;
  else if (variantIndex > 0) multiplier = 1.05 + (variantIndex * 0.05); // Increment price for cap variations, different forms etc.

  price = price * multiplier;
  
  // Clean rounding
  return Math.max(75, Math.min(500, Math.round(price)));
};
