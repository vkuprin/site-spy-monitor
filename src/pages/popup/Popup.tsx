import React, { useState, useEffect, ReactElement } from 'react';
import { Button, Input, List, notification, Select, ConfigProvider, theme, Popconfirm, Card, Modal } from 'antd';
import '@pages/popup/Popup.css';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import { CloseOutlined } from '@ant-design/icons';

import './styles.scss';

import trackedWebsitesStorage from '@src/shared/storages/trackedWebsitesStorage';
import doesWebsiteExist from '@root/utils/helpers/doesWebsiteExist';

const Popup = (): ReactElement => {
  // const storageData = useStorage(websitesStorage);
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [url, setUrl] = useState('');
  const [intervalTime, setIntervalTime] = useState<number>(15);
  const [trackedWebsites, setTrackedWebsites] = useState<string[]>([]);
  const [hasChanged, setHasChanged] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadWebsites = async () => {
      const websites = await trackedWebsitesStorage.getAllUrls();
      setTrackedWebsites(websites);
    };
    loadWebsites();
  }, []);

  const addToTrackedWebsites = async (websiteUrl: string) => {
    const newWebsite = {
      url: websiteUrl,
      content: '', // initially empty, can be populated later
    };
    await trackedWebsitesStorage.addWebsite(newWebsite);
    setTrackedWebsites(prev => [...prev, websiteUrl]);
    setUrl('');
  };

  const handleStartTracking = async () => {
    if (url && intervalTime) {
      const exists = await doesWebsiteExist(url);
      if (!exists) {
        showPopconfirm(); // Show the Popconfirm if the website doesn't exist
      } else {
        addToTrackedWebsites(url); // Directly add the website if it exists
      }
    }
  };

  const showPopconfirm = () => {
    setOpen(true);
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

  const handleConfirm = () => {
    setConfirmLoading(true);
    setTimeout(() => {
      addToTrackedWebsites(url);
      setOpen(false);
      setConfirmLoading(false);
    }, 2000); // Here, we're simulating an async operation with a timeout of 2 seconds
  };

  const handleCancel = () => {
    console.log('Clicked cancel button');
    setOpen(false);
  };

  const truncate = (str: string, n: number) => {
    return str.length > n ? str.slice(0, n - 1) + '...' : str;
  };

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
        <Popconfirm
          title={`The website ${url} does not seem to exist. Do you still want to add it?`}
          open={open}
          onConfirm={handleConfirm}
          okButtonProps={{ loading: confirmLoading }}
          onCancel={handleCancel}>
          <Button className="btn--track text--white" onClick={handleStartTracking}>
            Track
          </Button>
        </Popconfirm>
        <List
          itemLayout="horizontal"
          dataSource={trackedWebsites}
          grid={{
            gutter: 16,
            xs: 1,
            sm: 2,
            md: 4,
            lg: 4,
            xl: 6,
            xxl: 3,
          }}
          renderItem={website => (
            <List.Item>
              <Card
                title={
                  <span
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}>
                    <img className="favicon" src={`${website}/favicon.ico`} alt="" />
                    {truncate(website, 20)}
                    <CloseOutlined onClick={() => handleRemoveWebsite(website)} />
                  </span>
                }>
                {/* Put here exactly what has changed like info */}
              </Card>
            </List.Item>
          )}
        />
      </div>
    </ConfigProvider>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
