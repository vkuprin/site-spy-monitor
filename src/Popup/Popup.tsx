import * as React from 'react'
import { browser, Tabs } from 'webextension-polyfill-ts'

import './styles.scss'

async function openWebPage (url: string): Promise<any> {
  return await browser.tabs.create({ url })
}

const Popup: React.FC = () => {
  return (
    <section id="popup">
      <h2>WEB-EXTENSION-STARTER</h2>
      <button
        id="options__button"
        type="button"
        onClick={async (): Promise<Tabs.Tab> => {
          return await openWebPage('options.html')
        }}
      >
        Options Page
      </button>
      <div className="links__holder">
        <ul>
          <li>
            <button
              type="button"
              onClick={async (): Promise<Tabs.Tab> => {
                return await openWebPage(
                  'https://github.com/abhijithvijayan/web-extension-starter'
                )
              }}
            >
              GitHub
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={async (): Promise<Tabs.Tab> => {
                return await openWebPage(
                  'https://www.buymeacoffee.com/abhijithvijayan'
                )
              }}
            >
              Buy Me A Coffee
            </button>
          </li>
        </ul>
      </div>
    </section>
  )
}

export default Popup
