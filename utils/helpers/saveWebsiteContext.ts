import { db } from '../../../veextension/src/database'
import * as diff from 'diff'
import getWebsiteContent from './getWebsiteContent'

const saveWebsiteContext = async (url: string): Promise<diff.Change[]> => {
  try {
    const withoutScripts = await getWebsiteContent(url)

    // Update database
    await db.websites.put({
      url,
      content: withoutScripts
    })
  } catch (error) {
    console.error('Error saving website content:', error)
    return []
  }
}

export default saveWebsiteContext
