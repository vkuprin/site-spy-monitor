import * as React from 'react'
import { browser, Tabs } from 'webextension-polyfill-ts'
import { Button } from 'antd'

import './styles.scss'

const openWebPage = async (url: string): Promise<any> => await browser.tabs.create({ url })

const Popup: React.FC = () => {
  return (
    <section id="popup">
       <h2>Veextension</h2>
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
              <li><Button>Track by element</Button></li>
              <li><Button>Track by entire page</Button></li>
          </ul>
      </div>
    </section>
  )
}

export default Popup
