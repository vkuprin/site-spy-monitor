const fetchWebsiteSize = async (url: string): Promise<number> => {
  try {
    const response = await fetch(url, {
      mode: 'no-cors',
    });
    const content = await response.text();
    return new Blob([content]).size;
  } catch (error) {
    console.error('Error while fetching:', error);
  }
};

export default fetchWebsiteSize;
