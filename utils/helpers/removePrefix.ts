const removePrefix = (url: string): string => {
  const prefixRegex = /^(?:https?:\/\/)?(?:www\.)?/i;
  return url.replace(prefixRegex, '');
};

export default removePrefix;
