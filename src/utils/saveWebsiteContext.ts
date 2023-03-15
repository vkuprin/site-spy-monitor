import { db } from '../database'

const saveWebsiteContext = async (url: string) => {
  try {
    // Fetch the HTML content of the website
    const response = await fetch(url)
    const htmlContent = await response.text()

    // Save the content to the Dexie database
    const savedId = await db.websites.add({
      url,
      content: htmlContent
    })

    console.log(`Website content saved with ID: ${savedId}`)
  } catch (error) {
    console.error('Error fetching and saving website content:', error)
  }
}

export default saveWebsiteContext
