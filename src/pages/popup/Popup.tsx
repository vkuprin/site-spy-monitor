import React, { ReactElement, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Collapse,
  ConfigProvider,
  Empty,
  Input,
  List,
  notification,
  Popconfirm,
  Select,
  Spin,
  theme,
  Tooltip,
} from 'antd';
import '@pages/popup/Popup.css';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import { CloseOutlined, EyeFilled, MinusCircleOutlined, PlusCircleOutlined, ReloadOutlined } from '@ant-design/icons';

import './styles.scss';

import doesWebsiteExist from '@root/utils/helpers/doesWebsiteExist';
import truncate from '@root/utils/helpers/truncate';
import fetchWebsiteSize from '@root/utils/helpers/fetchWebsiteSize';
import removePrefix from '@root/utils/helpers/removePrefix';
import useTrackedWebsites from '@src/hooks/useTrackedWebsites';
import useWebsiteDiff from '@src/hooks/useWebsiteDiff';
import { spaIdentifiers, themeMode, URL_PREFIX_OPTIONS } from '@src/constants/global';

const Header = (): ReactElement => (
  <header className="header">
    <EyeFilled />
    <h1>Site Spy</h1>
  </header>
);

interface UrlInputProps {
  url: string;
  setUrlPrefix: (value: string) => void;
  setUrl: (value: string) => void;
}

const URLInput = ({ url, setUrlPrefix, setUrl }: UrlInputProps): ReactElement => {
  const selectBefore = (
    <Select defaultValue="https://" style={{ width: 75, textAlign: 'center' }} onChange={setUrlPrefix}>
      {URL_PREFIX_OPTIONS.map(option => (
        <Select.Option key={option} value={option}>
          {option}
        </Select.Option>
      ))}
    </Select>
  );

  return (
    <Input
      addonBefore={selectBefore}
      value={url}
      onChange={e => setUrl(e.target.value)}
      placeholder="Enter website URL to monitor"
    />
  );
};

const Popup = (): ReactElement => {
  const [open, setOpen] = useState<boolean>(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [url, setUrl] = useState<string>('');
  const [urlPrefix, setUrlPrefix] = useState<string>('https://');
  const [buttonText, setButtonText] = useState<string>('Track Current Website');

  const { websiteDiffs, checkWebsiteChanges, loadingDiff } = useWebsiteDiff();

  const { trackedWebsites, addTrackedWebsite, removeTrackedWebsite, loadingTrackedWebsites, faviconUrls } =
    useTrackedWebsites();

  useEffect(() => {
    if (url) {
      setButtonText('Start Tracking Entered Website');
    } else {
      setButtonText('Track Current Website');
    }
  }, [url]);

  useEffect(() => {
    const protocolPattern = /^(http:\/\/|https:\/\/)/;
    const match = url.match(protocolPattern);

    if (match) {
      setUrlPrefix(match[0]); // Set the dropdown to the matched protocol
      setUrl(url.replace(protocolPattern, '')); // Remove the protocol from the URL
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
      setUrl('');
      return;
    }

    if (url) {
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

  const checkWebsiteComplexity = async (websiteUrl: string) => {
    try {
      const response = await fetch(websiteUrl);
      const html = await response.text();

      // Check for common SPA root element IDs (not just 'root')
      const isSPA = spaIdentifiers.some(id => html.includes(`<div id="${id}"></div>`));

      if (isSPA || html.includes('<script type="module"') || html.includes('</router-view>')) {
        console.log('SPA website detected');
        return true;
      }

      if (html.includes('data-server-rendered') || html.includes('__NEXT_DATA__')) {
        console.log('SSR website detected');
        return false;
      }

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

  const handleCheckAllWebsites = async () => {
    for (const website of trackedWebsites) {
      await checkWebsiteChanges(website);
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: [themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm, theme.compactAlgorithm],
      }}>
      <div className="container">
        <Header />
        <div className="container-selector">
          <h1 className="container-selector__title">Enter full website URL to track:</h1>
          <div className="btn-container">
            <URLInput url={url} setUrlPrefix={setUrlPrefix} setUrl={setUrl} />
          </div>
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
        {trackedWebsites.length > 0 && (
          <div className="container-selector">
            <Button
              className="btn--check-all"
              onClick={handleCheckAllWebsites}
              loading={loadingDiff || loadingTrackedWebsites}
              disabled={trackedWebsites.length === 0}
              style={{ width: '100%', marginBottom: 20 }}>
              Check All Websites
            </Button>
          </div>
        )}
        <List
          itemLayout="horizontal"
          dataSource={trackedWebsites}
          locale={{
            emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Results will be displayed here" />,
          }}
          grid={{ gutter: 16, xs: 1 }}
          renderItem={website => (
            <List.Item>
              <Card
                title={
                  <span
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}>
                    <img className="favicon" src={faviconUrls[website]} alt="favicon" />
                    <a href={website} target="_blank" rel="noreferrer" className="list__item--title">
                      {truncate(removePrefix(website), 20)}
                    </a>
                    <div className="list__item--icons">
                      <ReloadOutlined
                        onClick={() => {
                          return checkWebsiteChanges(website);
                        }}
                      />
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
