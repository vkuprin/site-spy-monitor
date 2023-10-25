import React, { useState, useEffect, type ReactElement } from 'react'
import { Button, Input, List, notification, Select } from 'antd'
import '@pages/popup/Popup.css';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import getAllTrackedWebsites from "@root/utils/helpers/getAllTrackedWebsites";
import isWebsiteVersionSame from "@root/utils/helpers/isWebsiteVersionSame";
import deleteWebsiteContext from "@root/utils/helpers/deleteWebsiteContext";
import saveWebsiteContext from "@root/utils/helpers/saveWebsiteContext";
import { CloseOutlined } from '@ant-design/icons'

import './styles.scss'

const Popup = (): ReactElement => {
  const [url, setUrl] = useState('')
  const [intervalTime, setIntervalTime] = useState<number>()
  const [trackedWebsites, setTrackedWebsites] = useState<string[]>([])
  const [checkCount, setCheckCount] = useState<Record<string, number>>({})
  const [hasChanged, setHasChanged] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const loadWebsites = async (): Promise<void> => {
      const websites = await getAllTrackedWebsites()
      setTrackedWebsites(websites)
    }
    void loadWebsites().then()
  }, [])

  useEffect(() => {
    const checkWebsiteChanges = async (url: string): Promise<void> => {
      try {
        const isSameVersion = await isWebsiteVersionSame(url)
        if (!isSameVersion) {
          notification.open({
            message: 'Website Update',
            description: `The website ${url} has changed since you started tracking it!`
          })
          setHasChanged((prev) => ({ ...prev, [url]: true }))
        }
        setCheckCount((prevCount) => ({ ...prevCount, [url]: (prevCount[url] || 0) + 1 }))
      } catch (error) {
        console.error(error)
      }
    }

    const intervals = trackedWebsites.map((website) =>
        setInterval(async (): Promise<void> => {
          await checkWebsiteChanges(website)
        }, intervalTime * 1000)
    )

    return () => {
      intervals.forEach((interval) => {
        clearInterval(interval)
      })
    }
  }, [trackedWebsites, intervalTime, hasChanged])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value)
  }

  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseInt(e.target.value, 10)
    setIntervalTime(time)
  }

  const handleRemoveWebsite = async (websiteUrl: string) => {
    try {
      await deleteWebsiteContext(websiteUrl)
      setTrackedWebsites((websites) => websites.filter((site) => site !== websiteUrl))
      setCheckCount((prevCount) => {
        const { [websiteUrl]: _, ...newCount } = prevCount
        return newCount
      })
      setHasChanged((prevChanged) => {
        const { [websiteUrl]: _, ...newChanged } = prevChanged
        return newChanged
      })
    } catch (error) {
      console.error(error)
    }
  }

  const handleStartTracking = async (): Promise<void> => {
    if (!url) return

    if (!intervalTime) {
      notification.open({
        message: 'Enter Interval',
        description: 'Please enter an interval to check for changes.'
      })
      return
    }

    if (isNaN(intervalTime) || intervalTime < 15) {
      notification.open({
        message: 'Invalid Interval',
        description: 'Please enter a valid interval.'
      })
      return
    }

    try {
      // eslint-disable-next-line no-new
      new URL(url)
    } catch (_) {
      notification.open({
        message: 'Invalid URL',
        description: `The URL ${url} is not valid.`
      })
      return
    }

    // Check if URL is already tracked
    if (trackedWebsites.includes(url)) {
      notification.open({
        message: 'Already Tracked',
        description: `The website ${url} is already being tracked.`
      })
      return
    }

    try {
      const response = await fetch(url, { mode: 'no-cors' }) // We're not actually interested in the response, just whether a response is received
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
    } catch (error) {
      notification.open({
        message: 'Website Unreachable',
        description: `The website at ${url} could not be reached.`
      })
      return
    }

    try {
      await saveWebsiteContext(url)
      setTrackedWebsites((websites) => [...websites, url])
      setCheckCount((prevCount) => ({ ...prevCount, [url]: 0 }))
      setHasChanged((prevChanged) => ({ ...prevChanged, [url]: false }))
    } catch (error) {
      console.error(error)
    }
  }

  return (
      <div className="container">
        <h1>Website Tracker</h1>
        <p>Enter the URL of a website to track:</p>
        <div className="btn-container">
          <Input value={url} onChange={handleChange} placeholder="Website URL" />
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
                  onChange={setIntervalTime}
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
            renderItem={(website) => {
              return (
                  <List.Item
                      actions={[
                        <CloseOutlined key="list-close" onClick={async () => { await handleRemoveWebsite(website) }} />
                      ]}
                      style={{ backgroundColor: hasChanged[url] ? 'red' : 'green' }}
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
                        description={`Counter: ${(checkCount[website] !== 0) || 0}`}
                    />
                  </List.Item>
              )
            }}
        />
      </div>
  )
}

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
