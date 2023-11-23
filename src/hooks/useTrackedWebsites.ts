import { useEffect, useState } from 'react';
import trackedWebsitesStorage from '@src/shared/storages/trackedWebsitesStorage';

const useTrackedWebsites = () => {
  const [trackedWebsites, setTrackedWebsites] = useState([]);
  const [loadingTrackedWebsites, setLoadingTrackedWebsites] = useState(false);

  useEffect(() => {
    const loadTrackedWebsites = async () => {
      const websites = await trackedWebsitesStorage.getAllUrls();
      setTrackedWebsites(websites);
    };

    loadTrackedWebsites();
  }, []);

  const addTrackedWebsite = async (websiteUrl: string) => {
    setLoadingTrackedWebsites(true);
    const newWebsite = {
      url: websiteUrl,
      content: '',
    };
    await trackedWebsitesStorage.addWebsite(newWebsite);
    await trackedWebsitesStorage.saveContent(websiteUrl);
    setTrackedWebsites(prevWebsites => [...prevWebsites, websiteUrl]);
    setLoadingTrackedWebsites(false);
  };

  const removeTrackedWebsite = async (websiteUrl: string) => {
    await trackedWebsitesStorage.removeWebsite(websiteUrl);
    setTrackedWebsites(prevWebsites => prevWebsites.filter(website => website !== websiteUrl));
  };

  return { trackedWebsites, addTrackedWebsite, removeTrackedWebsite, loadingTrackedWebsites };
};

export default useTrackedWebsites;
