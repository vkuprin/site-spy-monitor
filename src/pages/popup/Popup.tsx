import React, { useState, useEffect, ReactElement } from 'react';
import { Button, Input, List, notification, Select } from 'antd';
import '@pages/popup/Popup.css';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import { CloseOutlined } from '@ant-design/icons';

import './styles.scss';
import useStorage from "@src/shared/hooks/useStorage";
import trackedWebsitesStorage, {websitesStorage} from "@src/shared/storages/trackedWebsitesStorage";

const Popup = (): ReactElement => {
  // const storageData = useStorage(websitesStorage);

  const [url, setUrl] = useState('');
  const [intervalTime, setIntervalTime] = useState<number>(15); // default value set to 15 seconds
  const [trackedWebsites, setTrackedWebsites] = useState<string[]>([]);
  const [checkCount, setCheckCount] = useState<Record<string, number>>({});
  const [hasChanged, setHasChanged] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadWebsites = async () => {
      const websites = await trackedWebsitesStorage.getAllUrls();
      setTrackedWebsites(websites);
    };
    loadWebsites();
  }, []);

  const handleStartTracking = async () => {
    if (url && intervalTime) {
      const newWebsite = {
        url: url,
        content: '',  // initially empty, can be populated later
      };
      await trackedWebsitesStorage.addWebsite(newWebsite);
      setTrackedWebsites(prev => [...prev, url]);
      setUrl('');
    }
  }

  const checkWebsiteChanges = async (url: string): Promise<void> => {
    const isSameVersion = await trackedWebsitesStorage.isVersionSame(url);
    if (!isSameVersion) {
      notification.open({
        message: 'Website Updated',
        description: `The website ${url} has been updated.`,
      });
      setHasChanged(prev => ({ ...prev, [url]: true }));
    }

    setCheckCount(prev => {
      const currentCount = prev[url] || 0;
      return { ...prev, [url]: currentCount + 1 };
    });
  }

  const handleRemoveWebsite = async (websiteUrl: string) => {
    await trackedWebsitesStorage.removeWebsite(websiteUrl);
    setTrackedWebsites(prev => prev.filter(w => w !== websiteUrl));
  }

  useEffect(() => {
    const intervals = trackedWebsites.map((website) => {
      return setInterval(async (): Promise<void> => {
        await checkWebsiteChanges(website);
      }, intervalTime * 1000);
    });

    return () => {
      intervals.forEach((interval) => {
        clearInterval(interval);
      });
    };
  }, [trackedWebsites, intervalTime, hasChanged]);

  return (
      <div className="container">
        <h1>Website Tracker</h1>
        <p>Enter the URL of a website to track:</p>
        <div className="btn-container">
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Website URL" />
          <Button className="btn-track" onClick={handleStartTracking}>
            Track
          </Button>
        </div>
        {url && (
            <>
              <p>Enter an interval to check for changes:</p>
              <Select
                  style={{ width: '100%' }}
                  placeholder="Interval"
                  onChange={(value) => setIntervalTime(value)}
                  value={intervalTime}
              >
                <Select.Option value={15}>15s</Select.Option>
                <Select.Option value={30}>30s</Select.Option>
                <Select.Option value={60}>1m</Select.Option>
              </Select>
            </>
        )}
        <List
            itemLayout="horizontal"
            dataSource={trackedWebsites}
            renderItem={(website) => (
                <List.Item
                    actions={[
                      <CloseOutlined key="list-close" onClick={async () => { await handleRemoveWebsite(website) }} />
                    ]}
                    style={{ backgroundColor: hasChanged[website] ? 'red' : 'green' }}
                >
                  <List.Item.Meta
                      avatar={
                        <img
                            style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              marginRight: '10px'
                            }}
                            src={`${website}/favicon.ico`}
                            alt=""
                        />
                      }
                      title={website}
                      description={`Counter: ${checkCount[website] || 0}, Next check in: ${intervalTime - ((checkCount[website] || 0) % intervalTime)}s`}
                  />
                </List.Item>
            )}
        />
      </div>
  );
}

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
