import * as diff from 'diff';
import getWebsiteContent from '@root/utils/helpers/getWebsiteContent';
import { createStorage, StorageType } from '@src/shared/storages/base'; // Adjust the path as needed

type TrackedWebsite = {
  url: string;
  content?: string;
};

type TrackedWebsitesList = TrackedWebsite[];

export const websitesStorage = createStorage<TrackedWebsitesList>('tracked-websites-key', [], {
  storageType: StorageType.Local,
});

export type TrackedWebsitesStorage = {
  getAllUrls: () => Promise<string[]>;
  getAll: () => Promise<TrackedWebsite[]>;
  addWebsite: (website: TrackedWebsite) => Promise<void>;
  removeWebsite: (url: string) => Promise<void>;
  isVersionSame: (url: string) => Promise<boolean>;
  saveContent: (url: string) => Promise<diff.Change[]>;
};

const trackedWebsitesStorage: TrackedWebsitesStorage = {
  getAllUrls: async () => {
    try {
      const websites = await websitesStorage.get();
      return websites.map(website => website.url);
    } catch (error) {
      console.error('Error retrieving all tracked websites:', error);
      return [];
    }
  },

  getAll: websitesStorage.get,

  addWebsite: async (website: TrackedWebsite) => {
    try {
      const websites = await websitesStorage.get();
      websites.push(website);
      await websitesStorage.set(websites);
    } catch (error) {
      console.error('Error adding website:', error);
    }
  },

  removeWebsite: async (url: string) => {
    try {
      const websites = await websitesStorage.get();
      const updatedWebsites = websites.filter(w => w.url !== url);
      await websitesStorage.set(updatedWebsites);
    } catch (error) {
      console.error('Error deleting website:', error);
    }
  },

  isVersionSame: async (url: string) => {
    try {
      const currentContent = await getWebsiteContent(url);
      const websites = await websitesStorage.get();
      const website = websites.find(w => w.url === url);
      const previousContent = website?.content || '';

      console.log('CURRENT', currentContent);
      console.log('WEBSITES');
      console.log('WEBSITE', website);
      console.log('PREVIOUS', previousContent);
      return previousContent === currentContent;
    } catch (error) {
      console.error('Error comparing website versions:', error);
      return false;
    }
  },

  saveContent: async (url: string): Promise<diff.Change[]> => {
    try {
      const currentContent = await getWebsiteContent(url);
      const websites = await websitesStorage.get();
      const websiteIndex = websites.findIndex(w => w.url === url);
      const previousContent = websiteIndex !== -1 ? websites[websiteIndex].content : '';
      const changes = diff.diffChars(previousContent, currentContent); // get the differences

      if (websiteIndex !== -1) {
        websites[websiteIndex].content = currentContent;
      } else {
        websites.push({ url, content: currentContent });
      }
      await websitesStorage.set(websites);

      return changes;
    } catch (error) {
      console.error('Error saving website content:', error);
      return [];
    }
  },
};

export default trackedWebsitesStorage;
