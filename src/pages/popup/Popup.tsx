import React, { useState, useEffect, ReactElement } from 'react';
import { Button, Input, List, notification, Select, ConfigProvider, theme } from 'antd';
import '@pages/popup/Popup.css';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import { CloseOutlined, GlobalOutlined } from '@ant-design/icons';

import './styles.scss';

import trackedWebsitesStorage from '@src/shared/storages/trackedWebsitesStorage';

const Popup = (): ReactElement => {
  // const storageData = useStorage(websitesStorage);

  const [url, setUrl] = useState('');
  const [intervalTime, setIntervalTime] = useState<number>(15);
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
        content: '', // initially empty, can be populated later
      };
      await trackedWebsitesStorage.addWebsite(newWebsite);
      setTrackedWebsites(prev => [...prev, url]);
      setUrl('');
    }
  };

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
  };

  const handleRemoveWebsite = async (websiteUrl: string) => {
    await trackedWebsitesStorage.removeWebsite(websiteUrl);
    setTrackedWebsites(prev => prev.filter(w => w !== websiteUrl));
  };

  useEffect(() => {
    const intervals = trackedWebsites.map(website => {
      return setInterval(async (): Promise<void> => {
        await checkWebsiteChanges(website);
      }, intervalTime * 1000);
    });

    return () => {
      intervals.forEach(interval => {
        clearInterval(interval);
      });
    };
  }, [trackedWebsites, intervalTime, hasChanged]);

  return (
    <ConfigProvider
      theme={{
        algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
      }}>
      <div className="container">
        <header className="header">
          <h1
            style={{
              marginLeft: 10,
            }}>
            Vee Tracker
          </h1>
        </header>
        <div className="container-selector">
          <h1 className="container-selector__title">Enter the URL of a website to track:</h1>
          <div className="btn-container">
            <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="Website URL" />
          </div>
        </div>
        <div className="container-selector">
          <h1 className="container-selector__title">Enter an interval to check for changes:</h1>
          <Select
            className="input--full-width"
            placeholder="Interval"
            onChange={value => setIntervalTime(value)}
            value={intervalTime}>
            <Select.Option value={15}>15s</Select.Option>
            <Select.Option value={30}>30s</Select.Option>
            <Select.Option value={60}>1m</Select.Option>
          </Select>
        </div>
        <Button className="btn--track text--white" onClick={handleStartTracking}>
          Track
        </Button>
        <List
          itemLayout="horizontal"
          dataSource={trackedWebsites}
          renderItem={website => (
            <List.Item
              actions={[
                <CloseOutlined
                  key="list-close"
                  onClick={async () => {
                    await handleRemoveWebsite(website);
                  }}
                />,
              ]}
              className={`border--dynamic ${hasChanged[website] ? 'border--red' : 'border--green'}`}>
              <List.Item.Meta
                avatar={<img className="favicon" src={`${website}/favicon.ico`} alt="" />}
                title={<span className="list__meta-title">{website}</span>}
                description={
                  <span className="list__meta-description">
                    Counter: {checkCount[website] || 0}, Next check in:
                    {intervalTime - ((checkCount[website] || 0) % intervalTime)}s
                  </span>
                }
              />
            </List.Item>
          )}
        />
      </div>
    </ConfigProvider>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
