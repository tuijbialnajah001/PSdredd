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

export const calculatePrice = (pokemon: any) => {
  const statTotal = pokemon.stats?.reduce((acc: number, stat: any) => acc + stat.base_stat, 0) || 300;
  
  // Normalize stats (range ~150 to ~700) to a price between 100 and 400
  let price = 100 + ((statTotal - 150) / 550) * 300;
  
  // Clamp and round off to the nearest 10 (max 400)
  return Math.max(100, Math.min(400, Math.round(price / 10) * 10));
};
