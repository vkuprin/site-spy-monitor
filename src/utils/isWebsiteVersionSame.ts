import getHtmlContentHash from './getHtmlContextHash'
import { db } from '../database'

const isWebsiteVersionSame = async (url: string) => {
  try {
    // Fetch the HTML content of the website
    const response = await fetch(url)
    const currentHtmlContent = await response.text()
    const currentHash = getHtmlContentHash(currentHtmlContent)

    // Retrieve the content from the database
    const savedWebsite = await db.websites.where('url').equals(url).first()

    if (!savedWebsite) {
      throw new Error('Website not found in the database')
    }

    const savedHash = getHtmlContentHash(savedWebsite.content)

    // Compare the current content hash with the saved content hash
    return currentHash === savedHash
  } catch (error) {
    console.error('Error comparing website versions:', error)
    return false
  }
}

export default isWebsiteVersionSame
