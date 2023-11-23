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
import { CloseOutlined, EyeFilled, PlusCircleOutlined, MinusCircleOutlined, ReloadOutlined } from '@ant-design/icons';

import './styles.scss';

import doesWebsiteExist from '@root/utils/helpers/doesWebsiteExist';
import truncate from '@root/utils/helpers/truncate';
import fetchWebsiteSize from '@root/utils/helpers/fetchWebsiteSize';
import removePrefix from '@root/utils/helpers/removePrefix';
import useTrackedWebsites from '@src/hooks/useTrackedWebsites';
import useWebsiteDiff from '@src/hooks/useWebsiteDiff';

const Popup = (): ReactElement => {
  const [open, setOpen] = useState<boolean>(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [url, setUrl] = useState<string>('');
  const [urlPrefix, setUrlPrefix] = useState<string>('https://');
  const [intervalTime, setIntervalTime] = useState<number>(30);
  const [buttonText, setButtonText] = useState<string>('Track Current Website');

  const { websiteDiffs, checkWebsiteChanges, loadingDiff } = useWebsiteDiff();

  const { trackedWebsites, addTrackedWebsite, removeTrackedWebsite, loadingTrackedWebsites } = useTrackedWebsites();

  useEffect(() => {
    if (url) {
      setButtonText('Start Tracking Entered Website');
    } else {
      setButtonText('Track Current Website');
    }
  }, [url]);

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
    if (!url) {
      await trackCurrentWebsite();
      return;
    }

    if (url && intervalTime) {
      const exists = await doesWebsiteExist(urlPrefix + url);

      if (!exists) {
        showPopconfirm();
      } else {
        const complex = await checkWebsiteComplexity(urlPrefix + url);
        if (complex) {
          notification.open({
            message: 'Complex Website Detected',
            description: `The website ${urlPrefix + url} appears to be too complex for effective tracking`,
            placement: 'top',
          });
          return;
        }
        await checkSize();
        await addTrackedWebsite(urlPrefix + url);
      }
    }
  };

  const showPopconfirm = () => {
    setOpen(true);
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

  const checkWebsiteComplexity = async websiteUrl => {
    try {
      const response = await fetch(websiteUrl);
      const html = await response.text();

      // Check for common SPA root element IDs (not just 'root')
      const spaIdentifiers = ['root', 'app', 'main'];
      const isSPA = spaIdentifiers.some(id => html.includes(`<div id="${id}"></div>`));

      // Check for elements or scripts that are typically used by SPAs
      if (isSPA || html.includes('<script type="module"') || html.includes('</router-view>')) {
        console.log('SPA website detected');
        return true;
      }

      // Check for SSR-specific patterns, like server-rendered content markers
      if (html.includes('data-server-rendered') || html.includes('__NEXT_DATA__')) {
        console.log('SSR website detected');
        return false;
      }

      // Fallback for unknown or more traditional websites
      console.log('Traditional or undetermined website type');
      return false;
    } catch (error) {
      console.error('Error checking website complexity:', error);
      return 'Error';
    }
  };

  const handleConfirm = () => {
    setConfirmLoading(true);
    setTimeout(() => {
      addTrackedWebsite(urlPrefix + url);
      setOpen(false);
      setConfirmLoading(false);
    }, 2000);
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

  const trackCurrentWebsite = async () => {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
        const activeTab = tabs[0];
        const complex = await checkWebsiteComplexity(activeTab.url);

        if (complex) {
          notification.open({
            message: 'Complex Website Detected',
            description: `The website ${activeTab.url} appears to be too complex for effective tracking`,
            placement: 'top',
          });
          return;
        }

        if (activeTab && activeTab.url) {
          await addTrackedWebsite(activeTab.url);
        }
      });
    } catch (error) {
      console.error('Error tracking current website:', error);
    }
  };

  const handleIntervalChange = (value: number) => {
    setIntervalTime(value);
    chrome.storage.local.set({ intervalTime: value });
  };

  useEffect(() => {
    const protocolPattern = /^(http:\/\/|https:\/\/)/;
    const match = url.match(protocolPattern);

    if (match) {
      setUrlPrefix(match[0]); // Set the dropdown to the matched protocol
      setUrl(url.replace(protocolPattern, '')); // Remove the protocol from the URL
    }
  }, [url]);

  const themeMode = 'dark';

  return (
    <ConfigProvider
      theme={{
        algorithm: [themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm, theme.compactAlgorithm],
      }}>
      <div className="container">
        <header className="header">
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions */}
          <EyeFilled />
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
                  setUrlPrefix(match[0]);
                  setUrl(inputVal.replace(protocolPattern, ''));
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
            <Select.Option value={30}>30 seconds</Select.Option>
            <Select.Option value={60}>1 minute</Select.Option>
            <Select.Option value={120}>2 minutes</Select.Option>
            <Select.Option value={300}>5 minutes</Select.Option>
            <Select.Option value={604800}>1 week</Select.Option>
            <Select.Option value={1209600}>2 weeks</Select.Option>
            <Select.Option value={2592000}>1 month</Select.Option>
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
            loading={loadingDiff || loadingTrackedWebsites}
            style={{ color: themeMode === 'dark' ? '#fff' : '#000' }}>
            {buttonText}
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
                    {truncate(removePrefix(website), 20)}
                    <div className="list__item--icons">
                      <ReloadOutlined onClick={() => checkWebsiteChanges(website)} />
                      <CloseOutlined onClick={() => removeTrackedWebsite(website)} />
                    </div>
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
