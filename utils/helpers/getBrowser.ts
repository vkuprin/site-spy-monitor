const getBrowser = () => {
  if (process.env.__FIREFOX__) {
    return browser;
  } else {
    return chrome;
  }
};

export default getBrowser;
