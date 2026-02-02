// BehindTheSite - Popup Script

const concernLabels = {
  environment: '🌍 Environment',
  peace: '🕊️ Peace',
  labor: '👷 Labor Rights',
  privacy: '🔒 Privacy',
  local: '🏠 Support Local',
  ethics: '⚖️ Corporate Ethics',
  health: '🏥 Public Health',
  democracy: '🗳️ Democracy'
};

document.addEventListener('DOMContentLoaded', async () => {
  const notSetupView = document.getElementById('notSetup');
  const mainView = document.getElementById('mainView');
  const companyCountEl = document.getElementById('company-count');
  const concernsListEl = document.getElementById('concerns-list');
  const tagsListEl = document.getElementById('tags-list');

  // Check if onboarding completed
  const { preferences } = await chrome.storage.sync.get(['preferences']);

  if (!preferences || !preferences.onboardingComplete) {
    notSetupView.style.display = 'block';
    mainView.style.display = 'none';
  } else {
    notSetupView.style.display = 'none';
    mainView.style.display = 'block';
    renderPreferences(preferences);
  }

  // Load company count
  const data = await chrome.storage.local.get(['companyData']);
  if (data.companyData) {
    companyCountEl.textContent = Object.keys(data.companyData).length.toString();
  } else {
    companyCountEl.textContent = '4 (bundled)';
  }

  // Render user preferences
  function renderPreferences(prefs) {
    // Concerns
    concernsListEl.innerHTML = '';
    if (prefs.concerns && prefs.concerns.length > 0) {
      prefs.concerns.forEach(concern => {
        const pill = document.createElement('span');
        pill.className = 'tag-pill';
        pill.textContent = concernLabels[concern] || concern;
        concernsListEl.appendChild(pill);
      });
    } else {
      concernsListEl.innerHTML = '<span class="empty-state">None selected</span>';
    }

    // Tags
    tagsListEl.innerHTML = '';
    if (prefs.tags && prefs.tags.length > 0) {
      // Show first 6 tags, then "+X more"
      const displayTags = prefs.tags.slice(0, 6);
      const remaining = prefs.tags.length - 6;

      displayTags.forEach(tag => {
        const pill = document.createElement('span');
        pill.className = 'tag-pill';
        // Clean up tag display
        if (tag.startsWith('custom:')) {
          pill.textContent = '🏷️ ' + tag.replace('custom:', '');
        } else {
          pill.textContent = tag.replace(/-/g, ' ');
        }
        tagsListEl.appendChild(pill);
      });

      if (remaining > 0) {
        const more = document.createElement('span');
        more.className = 'tag-pill';
        more.textContent = `+${remaining} more`;
        tagsListEl.appendChild(more);
      }
    } else {
      tagsListEl.innerHTML = '<span class="empty-state">Showing all available info</span>';
    }
  }

  // Helper to open onboarding in a new tab
  function openOnboarding() {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/onboarding.html') });
  }

  // Setup wizard button (always visible in header)
  document.getElementById('setup-wizard-btn').addEventListener('click', openOnboarding);

  // Refresh icon button
  document.getElementById('refresh-icon-btn').addEventListener('click', async () => {
    const btn = document.getElementById('refresh-icon-btn');
    btn.innerHTML = '<span>⏳</span>';
    try {
      await chrome.storage.local.remove(['companyData', 'lastFetch']);
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) await chrome.tabs.reload(tab.id);
      btn.innerHTML = '<span>✅</span>';
    } catch (e) {
      btn.innerHTML = '<span>❌</span>';
    }
    setTimeout(() => { btn.innerHTML = '<span>🔄</span>'; }, 1500);
  });

  // Start setup button
  document.getElementById('start-setup-btn')?.addEventListener('click', openOnboarding);

  // Edit preferences button
  document.getElementById('edit-preferences-btn')?.addEventListener('click', openOnboarding);

  // Refresh button
  document.getElementById('refresh-btn').addEventListener('click', async () => {
    const btn = document.getElementById('refresh-btn');
    btn.textContent = 'Refreshing...';
    btn.disabled = true;

    try {
      await chrome.storage.local.remove(['companyData', 'lastFetch']);
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        await chrome.tabs.reload(tab.id);
      }
      btn.textContent = 'Refreshed!';
    } catch (error) {
      console.error('Refresh failed:', error);
      btn.textContent = 'Failed';
    }

    setTimeout(() => {
      btn.textContent = 'Refresh Data';
      btn.disabled = false;
    }, 2000);
  });

  // Contribute button
  document.getElementById('contribute-btn').addEventListener('click', () => {
    chrome.tabs.create({
      url: 'https://github.com/zied-vvd/BehindTheSite/blob/main/CONTRIBUTING.md'
    });
  });
});
