// BehindTheSite - Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  const companyCountEl = document.getElementById('company-count');
  const lastUpdateEl = document.getElementById('last-update');
  const refreshBtn = document.getElementById('refresh-btn');
  const contributeBtn = document.getElementById('contribute-btn');

  // Load stats from storage
  async function loadStats() {
    const data = await chrome.storage.local.get(['companyData', 'lastFetch']);

    if (data.companyData) {
      const count = Object.keys(data.companyData).length;
      companyCountEl.textContent = count.toString();
    } else {
      companyCountEl.textContent = '4 (bundled)';
    }

    if (data.lastFetch) {
      const date = new Date(data.lastFetch);
      lastUpdateEl.textContent = date.toLocaleDateString();
    } else {
      lastUpdateEl.textContent = 'Never';
    }
  }

  // Refresh data from GitHub
  refreshBtn.addEventListener('click', async () => {
    refreshBtn.textContent = 'Refreshing...';
    refreshBtn.disabled = true;

    try {
      // Clear cache to force refresh
      await chrome.storage.local.remove(['companyData', 'lastFetch']);

      // Reload the current tab to trigger fresh fetch
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        await chrome.tabs.reload(tab.id);
      }

      await loadStats();
      refreshBtn.textContent = 'Refreshed!';
    } catch (error) {
      console.error('Refresh failed:', error);
      refreshBtn.textContent = 'Failed';
    }

    setTimeout(() => {
      refreshBtn.textContent = 'Refresh Data';
      refreshBtn.disabled = false;
    }, 2000);
  });

  // Open contribution page
  contributeBtn.addEventListener('click', () => {
    chrome.tabs.create({
      url: 'https://github.com/zied-vvd/BehindTheSite/blob/main/CONTRIBUTING.md'
    });
  });

  // Initial load
  await loadStats();
});
