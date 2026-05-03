const CACHE_PREFIX = 'poki_cache_';
const LIST_CACHE_KEY = 'poki_list_cache';

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
    
    const optimizedData = {
      id: detailData.id,
      name: detailData.name,
      types: detailData.types.map((t: any) => ({
        type: { name: t.type.name }
      })),
      sprites: {
        front_default: detailData.sprites.front_default,
        other: {
          'official-artwork': {
            front_default: detailData.sprites.other['official-artwork'].front_default
          }
        }
      },
      base_experience: detailData.base_experience,
      stats: detailData.stats.map((s: any) => ({ base_stat: s.base_stat }))
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
  const listKey = `${LIST_CACHE_KEY}_${limit}_${offset}`;
  let listData = null;

  try {
    const cachedList = localStorage.getItem(listKey);
    if (cachedList) {
      listData = JSON.parse(cachedList);
    }
  } catch (e) {
    // Ignore cache read errors
  }

  if (!listData) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
    const data = await response.json();
    listData = data.results;
    try {
      localStorage.setItem(listKey, JSON.stringify(listData));
    } catch (e) {
      // Ignore cache write errors
    }
  }

  const detailedPromises = listData.map(async (item: any) => {
    const pokemonKey = `${CACHE_PREFIX}${item.name}`;

    try {
      const cachedPokemon = localStorage.getItem(pokemonKey);
      if (cachedPokemon) {
        return JSON.parse(cachedPokemon);
      }
    } catch (e) {
      // Ignore cache read errors
    }

    const res = await fetch(item.url);
    const detailData = await res.json();
    
    // Extract only what's needed for the UI to keep cache small and fast
    const optimizedData = {
      id: detailData.id,
      name: detailData.name,
      types: detailData.types.map((t: any) => ({
        type: { name: t.type.name }
      })),
      sprites: {
        front_default: detailData.sprites.front_default,
        other: {
          'official-artwork': {
            front_default: detailData.sprites.other['official-artwork'].front_default
          }
        }
      },
      base_experience: detailData.base_experience,
      stats: detailData.stats.map((s: any) => ({ base_stat: s.base_stat }))
    };

    try {
      localStorage.setItem(pokemonKey, JSON.stringify(optimizedData));
    } catch (e) {
      // Ignore cache write errors
    }

    return optimizedData;
  });

  return Promise.all(detailedPromises);
};
