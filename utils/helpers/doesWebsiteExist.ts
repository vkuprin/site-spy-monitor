const doesWebsiteExist = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

export default doesWebsiteExist;
