console.log('hello world from content script')

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getDom') {
    const dom = document.documentElement.outerHTML
    sendResponse({ dom })
  }
})
