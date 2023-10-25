import { db } from '../../../veextension/src/database'

const deleteWebsiteContext = async (websiteURL: string) => {
  try {
    const websiteId = await db.websites.where('url').equals(websiteURL).delete()
    console.log(`Website content deleted with ID: ${websiteId}`)
  } catch (error) {
    console.error('Error deleting website content:', error)
  }
}

export default deleteWebsiteContext
