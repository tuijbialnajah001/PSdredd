import { POKEMON_ORDER_BY_STATS } from './pokemonOrder';

const CACHE_PREFIX = 'poki_cache_v3_';
const LIST_CACHE_KEY = 'poki_list_cache_v3';

export const fetchAllPokemonNames = async () => {
  const cacheKey = 'poki_all_names';
  try {
    const cachedNames = localStorage.getItem(cacheKey);
    if (cachedNames) {
      return JSON.parse(cachedNames);
    }
  } catch (e) {}

  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=10000`);
    const data = await response.json();
    const names = data.results.map((p: any) => p.name);
    try {
      localStorage.setItem(cacheKey, JSON.stringify(names));
    } catch (e) {}
    return names;
  } catch (e) {
    return [];
  }
};

export const fetchPokemonDetails = async (nameOrId: string | number) => {
  const pokemonKey = `${CACHE_PREFIX}${nameOrId}`;

  try {
    const cachedPokemon = localStorage.getItem(pokemonKey);
    if (cachedPokemon) {
      return JSON.parse(cachedPokemon);
    }
  } catch (e) {}

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${nameOrId}/`);
    if (!res.ok) throw new Error("Pokemon not found");
    const detailData = await res.json();
    
    let varieties = [{
      name: detailData.name,
      url: `https://pokeapi.co/api/v2/pokemon/${detailData.id}/`
    }];

    try {
      if (detailData.species?.url) {
        const speciesRes = await fetch(detailData.species.url);
        if (speciesRes.ok) {
          const speciesData = await speciesRes.json();
          if (speciesData.varieties?.length > 0) {
            varieties = speciesData.varieties.map((v: any) => ({
              name: v.pokemon.name,
              url: v.pokemon.url
            }));
          }
        }
      }
    } catch (e) { console.error("Failed to fetch species", e) }

    const optimizedData = {
      id: detailData.id,
      name: detailData.name,
      types: detailData.types.map((t: any) => ({
        type: { name: t.type.name }
      })),
      sprites: detailData.sprites,
      base_experience: detailData.base_experience,
      stats: detailData.stats.map((s: any) => ({ base_stat: s.base_stat })),
      varieties: varieties
    };

    try {
      localStorage.setItem(pokemonKey, JSON.stringify(optimizedData));
    } catch (e) {}

    return optimizedData;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const fetchPokemonList = async (limit = 24, offset = 0) => {
  const idsToFetch = POKEMON_ORDER_BY_STATS.slice(offset, offset + limit);

  const detailedPromises = idsToFetch.map(async (id: number) => {
    return await fetchPokemonDetails(id);
  });

  const results = await Promise.all(detailedPromises);
  // Filter out any nulls incase of failed fetches
  return results.filter(Boolean);
};
