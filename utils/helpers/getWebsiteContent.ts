const getWebsiteContent = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url, {
      // mode: 'no-cors', ToDo: during testing found that with no-cors it get's content actually
    });
    const htmlContent = await response.text();

    console.log('HTML-CONTENT', htmlContent);

    if (!htmlContent) {
      console.log('No content found');
      return '';
    }
    //
    // alert('NEW' + htmlContent);

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // Get the body content
    const body = doc.body;

    // Remove all script tags
    const scripts = Array.from(body.getElementsByTagName('script'));
    for (const script of scripts) {
      script.parentNode.removeChild(script);
    }

    // Remove all html tags and return the plain text
    const withoutScripts = body.innerHTML.replace(/<[^>]*>?/gm, '');
    return withoutScripts;
  } catch (error) {
    console.error('Error fetching website content:', error);
    return '';
  }
};

export default getWebsiteContent;
