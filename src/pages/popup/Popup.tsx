import React, { useState, useEffect, ReactElement } from 'react';
import { Button, Input, List, notification, Select, ConfigProvider, theme, Popconfirm, Card, Spin } from 'antd';
import '@pages/popup/Popup.css';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import { CloseOutlined } from '@ant-design/icons';

import './styles.scss';

import trackedWebsitesStorage from '@src/shared/storages/trackedWebsitesStorage';
import doesWebsiteExist from '@root/utils/helpers/doesWebsiteExist';
import truncate from '@root/utils/helpers/truncate';
import * as diff from 'diff';

const Popup = (): ReactElement => {
  // const storageData = useStorage(websitesStorage);
  const [websiteDiffs, setWebsiteDiffs] = useState<Record<string, diff.Change[]>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [url, setUrl] = useState<string>('');
  const [urlPrefix, setUrlPrefix] = useState<string>('https://');
  const [intervalTime, setIntervalTime] = useState<number>(30);
  const [trackedWebsites, setTrackedWebsites] = useState<string[]>([]);

  useEffect(() => {
    const loadWebsites = async () => {
      const websites = await trackedWebsitesStorage.getAllUrls();
      setTrackedWebsites(websites);
    };
    loadWebsites();
  }, []);

  const addToTrackedWebsites = async (websiteUrl: string) => {
    setLoading(true);
    const newWebsite = {
      url: websiteUrl,
      content: '', // will be replaced shortly after
    };
    await trackedWebsitesStorage.addWebsite(newWebsite);
    await trackedWebsitesStorage.saveContent(websiteUrl); // fetch and save the current content
    setTrackedWebsites(prev => [...prev, websiteUrl]);
    setUrl('');
    setLoading(false);
  };

  const handleStartTracking = async () => {
    if (url && intervalTime) {
      const exists = await doesWebsiteExist(urlPrefix + url);
      if (!exists) {
        showPopconfirm(); // Show the Popconfirm if the website doesn't exist
      } else {
        addToTrackedWebsites(urlPrefix + url); // Directly add the website if it exists
      }
    }
    setUrl('');
  };

  const showPopconfirm = () => {
    setOpen(true);
  };

  const checkWebsiteChanges = async (url: string): Promise<void> => {
    setLoading(true);
    const isSameVersion = await trackedWebsitesStorage.isVersionSame(url);
    if (!isSameVersion) {
      // notification.open({
      //   message: 'Website Updated',
      //   description: `The website ${url} has been updated.`,
      // });
      // setHasChanged(prev => ({ ...prev, [urlPrefix + url]: true }));
      const changes = await trackedWebsitesStorage.saveContent(url);
      setWebsiteDiffs(prev => ({ ...prev, [url]: changes }));

      notification.open({
        message: 'Website Updated',
        description: `The website ${url} has been updated.`,
        placement: 'bottomRight',
      });
    }
    setLoading(false);
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
  }, [trackedWebsites, intervalTime]);

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

  const { Option } = Select;

  const selectBefore = (
    <Select
      defaultValue="https://"
      onChange={value => setUrlPrefix(value)}
      style={{
        width: 75,
        textAlign: 'center',
      }}>
      <Option value="https://">https://</Option>
      <Option value="http://">http://</Option>
    </Select>
  );

  return (
    <ConfigProvider
      theme={{
        algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
      }}>
      <div className="container">
        <header className="header">
          <h1 style={{ marginLeft: 10 }}>Vee Tracker</h1>
        </header>
        <div className="container-selector">
          <h1 className="container-selector__title">Enter full website URL to track:</h1>
          <div className="btn-container">
            <Input addonBefore={selectBefore} onChange={e => setUrl(e.target.value)} placeholder="example.com" />
          </div>
        </div>
        <div className="container-selector">
          <h1 className="container-selector__title">Enter an interval to check for changes:</h1>
          <Select
            className="input--full-width"
            placeholder="Interval"
            onChange={value => setIntervalTime(value)}
            value={intervalTime}>
            <Select.Option value={30}>30s</Select.Option>
            <Select.Option value={60}>1m</Select.Option>
            <Select.Option value={120}>2m</Select.Option>
            <Select.Option value={300}>5m</Select.Option>
          </Select>
        </div>
        <Popconfirm
          title={`The website ${urlPrefix + url} does not seem to exist. Do you still want to add it?`}
          open={open}
          onConfirm={handleConfirm}
          okButtonProps={{ loading: confirmLoading }}
          onCancel={handleCancel}>
          <Button className="btn--track text--white" onClick={handleStartTracking} loading={loading}>
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
                {websiteDiffs[website]?.map((change, index) => {
                  if (change.added) {
                    return (
                      <span key={index} style={{ backgroundColor: 'green' }}>
                        <h1>New changes</h1>
                        {change.value}
                      </span>
                    );
                  } else if (change.removed) {
                    return (
                      <span key={index} style={{ backgroundColor: 'red' }}>
                        <h1>Removed changes</h1>
                        {change.value}
                      </span>
                    );
                  }
                  return null;
                })}
              </Card>
            </List.Item>
          )}
        />
      </div>
    </ConfigProvider>
  );
};

export default withErrorBoundary(
  withSuspense(Popup, <div> Loading ... </div>),
  <div> Error Occur, please reload extension </div>,
);
