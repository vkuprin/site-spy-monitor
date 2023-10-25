import { db } from '../../../veextension/src/database'

const getAllTrackedWebsites = async () => {
  try {
    const websites = await db.websites.toArray()
    console.log('All tracked websites:', websites)
    return websites.map(website => website.url) // assuming each website object has a url property
  } catch (error) {
    console.error('Error retrieving all tracked websites:', error)
    return []
  }
}

export default getAllTrackedWebsites
