const removePrefix = (url: string): string => {
  const prefixRegex = /^(?:https?:\/\/)?(?:www\.)?/i;
  const result = url.replace(prefixRegex, ''); //ToDo: make this as an optional parameter

  return result.replace(/\/$/, '');
};

export default removePrefix;
