const doesWebsiteExist = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        // Mimic a typical user-agent to avoid being rejected by anti-bot defenses
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
        Range: 'bytes=0-1', // Request only the first two bytes
      },
    });

    // Some servers might not support partial content requests and thus ignore the range header,
    // they will still send a 200 status code if the resource is available.
    return response.ok;
  } catch (error) {
    console.error('Error while fetching:', error);
    return false;
  }
};

export default doesWebsiteExist;
