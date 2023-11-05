const doesWebsiteExist = async (url: string): Promise<boolean> => {
  try {
    // Use a GET request with a limited response body
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        // Add a User-Agent to mimic a web browser request
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
      },
    });

    // Check if status code is in the range of 200-299
    return response.ok;
  } catch (error) {
    // Handle different kinds of errors (network error, 403 Forbidden, etc.)
    if (error instanceof TypeError) {
      // Network error or some other error like CORS, etc.
      console.error('There was a network error:', error);
    } else {
      // Other kinds of errors (like Fetch API specific errors)
      console.error('Error while fetching:', error);
    }
    return false;
  }
};

export default doesWebsiteExist;
