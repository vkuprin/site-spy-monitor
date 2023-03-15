import { createHash } from 'crypto'

const getHtmlContentHash = (html: string) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const mainContent = doc.body.innerText
  const hash = createHash('sha256')
  hash.update(mainContent)
  return hash.digest('hex')
}

export default getHtmlContentHash
