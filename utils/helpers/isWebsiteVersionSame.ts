import { db } from '../../../veextension/src/database'
import getWebsiteContent from './getWebsiteContent'

const isWebsiteVersionSame = async (url: string) => {
  try {
    const currentContent = await getWebsiteContent(url)

    const website = await db.websites.get({ url })

    const previousContent = website?.content || ''

    // Compare the current content with the previously saved content
    return previousContent === currentContent
  } catch (error) {
    console.error('Error comparing website versions:', error)
    return false
  }
}

export default isWebsiteVersionSame
