import { useEffect, useState } from 'react';
import trackedWebsitesStorage from '@src/shared/storages/trackedWebsitesStorage';

const useTrackedWebsites = () => {
  const [trackedWebsites, setTrackedWebsites] = useState([]);
  const [loadingTrackedWebsites, setLoadingTrackedWebsites] = useState(false);

  // Load tracked websites from storage on mount
  useEffect(() => {
    const loadTrackedWebsites = async () => {
      const websites = await trackedWebsitesStorage.getAllUrls();
      setTrackedWebsites(websites);
    };

    loadTrackedWebsites();
  }, []);

  // Function to add a new website to the tracked list
  const addTrackedWebsite = async (websiteUrl: string) => {
    setLoadingTrackedWebsites(true);
    const newWebsite = {
      url: websiteUrl,
      content: '', // Assuming content is a part of your website structure
    };
    await trackedWebsitesStorage.addWebsite(newWebsite);
    await trackedWebsitesStorage.saveContent(websiteUrl); // Fetch and save the current content
    setTrackedWebsites(prevWebsites => [...prevWebsites, websiteUrl]);
    setLoadingTrackedWebsites(false);
  };

  // Function to remove a website from the tracked list
  const removeTrackedWebsite = async (websiteUrl: string) => {
    await trackedWebsitesStorage.removeWebsite(websiteUrl);
    setTrackedWebsites(prevWebsites => prevWebsites.filter(website => website !== websiteUrl));
  };

  return { trackedWebsites, addTrackedWebsite, removeTrackedWebsite, loadingTrackedWebsites };
};

export default useTrackedWebsites;
