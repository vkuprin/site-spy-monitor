const formatURL = (clientWebSiteUrl: string | URL) => {
  try {
    const url = new URL(clientWebSiteUrl)
    if (url.protocol === 'http:') {
      url.protocol = 'https:'
    }
    if (url.protocol === 'https:') {
      url.protocol = 'https:'
    }
    if (url.protocol === '') {
      url.protocol = 'https:'
    }
    return url.href
  } catch (e) {
    return `https://${clientWebSiteUrl}`
  }
}

export default formatURL
