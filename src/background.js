// BehindTheSite - Background Service Worker

// Open onboarding on first install
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Check if onboarding was already completed (shouldn't be on fresh install)
    const { preferences } = await chrome.storage.sync.get(['preferences']);

    if (!preferences?.onboardingComplete) {
      chrome.tabs.create({
        url: chrome.runtime.getURL('src/onboarding.html')
      });
    }
  }
  console.log('BehindTheSite installed/updated:', details.reason);
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_COMPANY_DATA') {
    sendResponse({ success: true });
  }

  if (message.type === 'OPEN_ONBOARDING') {
    chrome.tabs.create({
      url: chrome.runtime.getURL('src/onboarding.html')
    });
    sendResponse({ success: true });
  }

  return true;
});
