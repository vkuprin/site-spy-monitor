const getWebsiteContent = async (url: string): Promise<string> => {
  const response = await fetch(url);

  // Check if the fetch was successful
  if (!response.ok) {
    console.error(`HTTP error! status: ${response.status}`);
    return '';
  }

  const htmlContent = await response.text();

  if (!htmlContent) {
    console.error('No content found');
    return '';
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  // Get the body content
  const body = doc.body;

  // Remove all script tags
  const scripts = Array.from(body.getElementsByTagName('script'));
  for (const script of scripts) {
    script.parentNode?.removeChild(script);
  }

  // Remove all unwanted elements or tags (e.g., style)
  // You can extend this to remove more elements if needed
  const unwantedTags = ['style', 'link', 'meta'];
  unwantedTags.forEach(tagName => {
    const elements = Array.from(body.getElementsByTagName(tagName));
    for (const element of elements) {
      element.parentNode?.removeChild(element);
    }
  });

  // Remove all html tags and return the plain text
  return body.textContent || '';
};

export default getWebsiteContent;
