const fetchWebsiteSize = async (url: string): Promise<number> => {
  const response = await fetch(url);
  const content = await response.text();
  return new Blob([content]).size;
};

export default fetchWebsiteSize;
