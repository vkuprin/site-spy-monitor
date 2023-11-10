import React, { useState, useEffect, ReactElement } from 'react';
import {
  Button,
  Input,
  List,
  notification,
  Select,
  ConfigProvider,
  theme,
  Popconfirm,
  Card,
  Spin,
  Empty,
  Collapse,
  Tooltip,
} from 'antd';
import '@pages/popup/Popup.css';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import { CloseOutlined, EyeFilled, PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';

import './styles.scss';

import trackedWebsitesStorage from '@src/shared/storages/trackedWebsitesStorage';
import doesWebsiteExist from '@root/utils/helpers/doesWebsiteExist';
import truncate from '@root/utils/helpers/truncate';
import * as diff from 'diff';
import fetchWebsiteSize from '@root/utils/helpers/fetchWebsiteSize';

const getDefaultThemeState = async () => {
  return await chrome.storage.local.get('themeMode');
};

const Popup = (): ReactElement => {
  const [websiteDiffs, setWebsiteDiffs] = useState<Record<string, diff.Change[]>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [url, setUrl] = useState<string>('');
  const [urlPrefix, setUrlPrefix] = useState<string>('https://');
  const [intervalTime, setIntervalTime] = useState<number>(30);
  const [trackedWebsites, setTrackedWebsites] = useState<string[]>([]);
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const loadWebsites = async () => {
      const websites = await trackedWebsitesStorage.getAllUrls();
      setTrackedWebsites(websites);
    };
    loadWebsites();
  }, []);

  useEffect(() => {
    const loadTheme = async () => {
      const { themeMode } = await getDefaultThemeState();
      setThemeMode(themeMode);
      const html = document.querySelector('html');
      html.style.setProperty('color-scheme', themeMode);
    };
    loadTheme();
  }, []);

  const toggleTheme = () => {
    const html = document.querySelector('html');
    html.style.setProperty('color-scheme', themeMode === 'dark' ? 'light' : 'dark');
    setThemeMode(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
    chrome.storage.local.set({ themeMode: themeMode === 'dark' ? 'light' : 'dark' });
  };

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

  const checkSize = async () => {
    const size = await fetchWebsiteSize(urlPrefix + url);
    const sizeCheck = size > 999999;

    if (sizeCheck) {
      notification.open({
        message: 'Please wait',
        description: (
          <>
            The website <br />{' '}
            {
              <span style={{ color: '#53a1b3' }}>
                <a href={urlPrefix + url}>{url}</a>
              </span>
            }
            <br /> is too big to track
          </>
        ),
        placement: 'top',
      });
    }

    return sizeCheck;
  };

  const handleStartTracking = async () => {
    if (url && intervalTime) {
      const exists = await doesWebsiteExist(urlPrefix + url);

      if (!exists) {
        showPopconfirm(); // Show the Popconfirm if the website doesn't exist
      } else {
        await checkSize();
        await addToTrackedWebsites(urlPrefix + url); // Directly add the website if it exists
      }
    }
  };

  const showPopconfirm = () => {
    setOpen(true);
  };

  const checkWebsiteChanges = async (url: string): Promise<void> => {
    setLoading(true);
    const isSameVersion = await trackedWebsitesStorage.isVersionSame(url);
    if (!isSameVersion) {
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
      addToTrackedWebsites(urlPrefix + url);
      setOpen(false);
      setConfirmLoading(false);
    }, 2000); // Here, we're simulating an async operation with a timeout of 2 seconds
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const { Option } = Select;

  const selectBefore = (
    <Select
      value={urlPrefix}
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

  const handleIntervalChange = (value: number) => {
    setIntervalTime(value);
    chrome.storage.local.set({ intervalTime: value });
  };

  // Effect to update the protocol dropdown and remove the protocol from the URL input
  useEffect(() => {
    const protocolPattern = /^(http:\/\/|https:\/\/)/;
    const match = url.match(protocolPattern);

    if (match) {
      setUrlPrefix(match[0]); // Set the dropdown to the matched protocol
      setUrl(url.replace(protocolPattern, '')); // Remove the protocol from the URL
    }
  }, [url]);

  return (
    <ConfigProvider
      theme={{
        algorithm: [themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm, theme.compactAlgorithm],
      }}>
      <div className="container">
        <header className="header">
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions */}
          <EyeFilled onClick={toggleTheme} />
          <h1 style={{ cursor: 'pointer' }}>Site Spy</h1>
        </header>
        <div className="container-selector">
          <h1 className="container-selector__title">Enter full website URL to track:</h1>
          <div className="btn-container">
            <Input
              addonBefore={selectBefore}
              value={url}
              onChange={e => {
                const inputVal = e.target.value;
                const protocolPattern = /^(http:\/\/|https:\/\/)/;
                const match = inputVal.match(protocolPattern);

                if (match) {
                  setUrlPrefix(match[0]); // Set the dropdown to the matched protocol
                  setUrl(inputVal.replace(protocolPattern, '')); // Remove the protocol from the URL
                } else {
                  setUrl(inputVal); // Set URL normally if no protocol match
                }
              }}
              placeholder="Enter website URL to monitor"
            />
          </div>
        </div>
        <div className="container-selector">
          <h1 className="container-selector__title">Check every:</h1>
          <Select
            className="input--full-width"
            placeholder="Interval"
            onChange={handleIntervalChange}
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
          <Button
            className="btn--track text--white"
            onClick={handleStartTracking}
            loading={loading}
            style={{ color: themeMode === 'dark' ? '#fff' : '#000' }}>
            Start Tracking
          </Button>
        </Popconfirm>
        <List
          itemLayout="horizontal"
          dataSource={trackedWebsites}
          locale={{
            emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Results will be displayed here" />,
          }}
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
                <Collapse>
                  <>
                    {websiteDiffs[website]?.map((change, index) => {
                      return (
                        <div key={index}>
                          {change.added && (
                            <>
                              <Tooltip title="Added content">
                                <PlusCircleOutlined style={{ color: 'lightgreen' }} />
                              </Tooltip>
                              <span style={{ backgroundColor: 'green' }}>{change.value}</span>
                            </>
                          )}
                          {change.removed && (
                            <>
                              <Tooltip title="Removed content">
                                <MinusCircleOutlined style={{ color: 'lightcoral' }} />
                              </Tooltip>
                              <span style={{ backgroundColor: 'red' }}>{change.value}</span>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </>
                </Collapse>
              </Card>
            </List.Item>
          )}
        />
      </div>
    </ConfigProvider>
  );
};

export default withErrorBoundary(
  withSuspense(Popup, <Spin size="large" />),
  <div>Error Occur, please reload extension</div>,
);
