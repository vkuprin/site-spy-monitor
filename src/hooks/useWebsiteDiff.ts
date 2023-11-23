import { useState } from 'react';
import trackedWebsitesStorage from '@src/shared/storages/trackedWebsitesStorage';

const useWebsiteDiff = () => {
  const [websiteDiffs, setWebsiteDiffs] = useState({});
  const [loadingDiff, setLoading] = useState(false);

  const checkWebsiteChanges = async (websiteUrl: string) => {
    setLoading(true);
    const isSameVersion = await trackedWebsitesStorage.isVersionSame(websiteUrl);
    if (!isSameVersion) {
      const changes = await trackedWebsitesStorage.saveContent(websiteUrl);
      setWebsiteDiffs(prevDiffs => ({ ...prevDiffs, [websiteUrl]: changes }));
    }
    setLoading(false);
  };

  return { websiteDiffs, checkWebsiteChanges, loadingDiff };
};

export default useWebsiteDiff;
