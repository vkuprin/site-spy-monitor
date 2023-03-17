import { browser, Tabs } from 'webextension-polyfill-ts'
import { Button, Input } from 'antd'
import React, { useState } from 'react'

import './styles.scss'
import saveWebsiteContext from '../../utils/saveWebsiteContext'
import isWebsiteVersionSame from '../../utils/isWebsiteVersionSame'
import formatURL from '../../utils/formatURL'

const openWebPage = async (url: string): Promise<Tabs.Tab> => {
  return await browser.tabs.create({ url })
}

const Popup = () => {
  const [url, setUrl] = useState('')

  const handleTrackByPage = async () => {
    console.log('handleTrackByPage')
    alert('handleTrackByPage')
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    try {
      const dom = await browser.tabs.sendMessage(tabs[0].id, { type: 'getDom' })
      console.log(dom)
      await saveWebsiteContext(formatURL(url))
      const isSameVersion = await isWebsiteVersionSame(url)
      console.log(`Is the website version the same? ${isSameVersion}`)
    } catch (error) {
      console.log(error)
    }
  }

  const handleOptionsButtonClick = async (): Promise<Tabs.Tab> => {
    return await openWebPage('options.html')
  }

  return (
    <section id="popup">
        <button
            id="options__button"
            type="button"
            onClick={handleOptionsButtonClick}
        >
            Options Page
        </button>
        <div className="links__holder">
            <ul>
                <li>
                    <Input placeholder="Enter URL" value={url} onChange={(e) => { setUrl(e.target.value) }} />
                    <Button onClick={handleTrackByPage}>Track by entire page</Button>
                </li>
            </ul>
        </div>
    </section>
  )
}

export default Popup
