// BehindTheSite - Background Service Worker

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('BehindTheSite installed');
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_COMPANY_DATA') {
    // Could be used for more complex data fetching in the future
    sendResponse({ success: true });
  }
  return true;
});
