import { useEffect, useState } from 'react';
import trackedWebsitesStorage from '@src/shared/storages/trackedWebsitesStorage';
import faviconFetcher from '@root/utils/helpers/faviconFetcher';

const useTrackedWebsites = () => {
  const [trackedWebsites, setTrackedWebsites] = useState([]);
  const [loadingTrackedWebsites, setLoadingTrackedWebsites] = useState(false);
  const [faviconUrls, setFaviconUrls] = useState({});

  useEffect(() => {
    // if (!trackedWebsites.length) return;
    const fetchFavicon = async () => {
      const favicons = await Promise.all(trackedWebsites.map(website => faviconFetcher(website)));
      const faviconUrls = trackedWebsites.reduce((acc, website, index) => {
        console.log(website, favicons[index]);
        acc[website] = favicons[index];
        return acc;
      }, {});

      setFaviconUrls(faviconUrls);
    };

    fetchFavicon();
  }, [trackedWebsites]);

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

  return { trackedWebsites, addTrackedWebsite, removeTrackedWebsite, loadingTrackedWebsites, faviconUrls };
};

export default useTrackedWebsites;
