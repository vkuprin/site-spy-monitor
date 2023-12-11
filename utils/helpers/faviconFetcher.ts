const faviconFetcher = async (url: string) => {
  const optionsToFindFavicon = [
    'link[rel="shortcut icon"]',
    'link[rel="icon"]',
    'link[rel="apple-touch-icon"]',
    'link[rel="apple-touch-icon-precomposed"]',
    'link[rel="apple-touch-startup-image"]',
    'link[rel="mask-icon"]',
    'link[rel="fluid-icon"]',
    'link[rel="manifest"]',
  ];

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return new URL('/favicon.ico', url).href;
    }

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const faviconElement = doc.querySelector(optionsToFindFavicon.join(', '));
    if (faviconElement) {
      const faviconHref = faviconElement.getAttribute('href');
      if (faviconHref.startsWith('http')) {
        return faviconHref;
      }
      return new URL(faviconHref, url).href;
    }

    const defaultFavicon = new URL('/favicon.ico', url).href;
    const defaultFaviconResponse = await fetch(defaultFavicon);
    if (defaultFaviconResponse.ok) {
      return defaultFavicon;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error fetching favicon: ${error.message}`);
    return null;
  }
};

export default faviconFetcher;
