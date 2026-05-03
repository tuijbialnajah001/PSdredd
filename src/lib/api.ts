export const fetchPokemonList = async (limit = 20, offset = 0) => {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
  const data = await response.json();
  
  const detailedPromises = data.results.map(async (item: any) => {
    const res = await fetch(item.url);
    return res.json();
  });
  
  return Promise.all(detailedPromises);
};
