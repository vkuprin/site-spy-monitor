const fetchWebsiteSize = async (url: string): Promise<number> => {
  try {
    const response = await fetch(url);
    const content = await response.text();
    return new Blob([content]).size;
  } catch (error) {
    console.error('Error while fetching:', error);
  }
};

export default fetchWebsiteSize;
