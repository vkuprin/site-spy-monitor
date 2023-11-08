const doesWebsiteExist = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, {
      // method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
        Range: 'bytes=0-1', // Request only the first two bytes
      },
    });

    // Any client error (4xx) or success (2xx) status code will indicate the site exists
    console.log('Response status:', response.status);
    return response.ok || (response.status >= 400 && response.status < 500);
  } catch (error) {
    return false;
  }
};

export default doesWebsiteExist;
