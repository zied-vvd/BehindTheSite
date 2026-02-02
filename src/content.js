// BehindTheSite - Content Script
// Injects transparency banner into web pages

(async function() {
  'use strict';

  const GITHUB_DATA_URL = 'https://raw.githubusercontent.com/zied-vvd/BehindTheSite/main/data/companies.json';

  // Extract root domain from hostname
  function getRootDomain(hostname) {
    const parts = hostname.split('.');
    if (parts.length <= 2) return hostname;
    // Handle common TLDs like .co.uk, .com.au
    const knownTwoPartTlds = ['co.uk', 'com.au', 'co.nz', 'co.jp', 'com.br'];
    const lastTwo = parts.slice(-2).join('.');
    if (knownTwoPartTlds.includes(lastTwo)) {
      return parts.slice(-3).join('.');
    }
    return parts.slice(-2).join('.');
  }

  // Fetch company data from GitHub
  async function fetchCompanyData() {
    try {
      // First try to get from cache
      const cached = await chrome.storage.local.get(['companyData', 'lastFetch']);
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;

      if (cached.companyData && cached.lastFetch && (now - cached.lastFetch) < oneHour) {
        return cached.companyData;
      }

      // Fetch fresh data
      const response = await fetch(GITHUB_DATA_URL);
      if (!response.ok) {
        // Fall back to bundled data if GitHub fetch fails
        return getBundledData();
      }

      const data = await response.json();
      await chrome.storage.local.set({ companyData: data, lastFetch: now });
      return data;
    } catch (error) {
      console.log('BehindTheSite: Using bundled data', error);
      return getBundledData();
    }
  }

  // Bundled fallback data
  function getBundledData() {
    return {
      "amazon.com": {
        "name": "Amazon.com, Inc.",
        "shareholders": [
          { "name": "Vanguard Group", "percentage": 7.1 },
          { "name": "BlackRock", "percentage": 6.4 },
          { "name": "Jeff Bezos", "percentage": 9.5 }
        ],
        "country": "USA",
        "flags": []
      },
      "google.com": {
        "name": "Alphabet Inc.",
        "shareholders": [
          { "name": "Vanguard Group", "percentage": 7.4 },
          { "name": "BlackRock", "percentage": 6.3 },
          { "name": "Larry Page", "percentage": 6.0 }
        ],
        "country": "USA",
        "flags": []
      },
      "tiktok.com": {
        "name": "ByteDance Ltd.",
        "shareholders": [
          { "name": "ByteDance (Private)", "percentage": 100 }
        ],
        "country": "China",
        "flags": ["chinese-owned"]
      },
      "youtube.com": {
        "name": "YouTube (Alphabet Inc.)",
        "shareholders": [
          { "name": "Vanguard Group", "percentage": 7.4 },
          { "name": "BlackRock", "percentage": 6.3 }
        ],
        "country": "USA",
        "flags": []
      }
    };
  }

  // Create badge HTML
  function createBadge(text, type = 'default') {
    const badge = document.createElement('span');
    badge.className = `bts-badge bts-badge-${type}`;
    badge.textContent = text;
    return badge;
  }

  // Create the banner element
  function createBanner(companyInfo) {
    const banner = document.createElement('div');
    banner.id = 'bts-banner';
    banner.className = 'bts-banner';

    const content = document.createElement('div');
    content.className = 'bts-content';

    // Company name
    const name = document.createElement('span');
    name.className = 'bts-company-name';
    name.textContent = companyInfo.name;
    content.appendChild(name);

    // Separator
    content.appendChild(document.createTextNode(' · '));

    // Country badge
    const countryBadge = createBadge(`🌍 ${companyInfo.country}`, 'country');
    content.appendChild(countryBadge);

    // Top shareholders
    if (companyInfo.shareholders && companyInfo.shareholders.length > 0) {
      const topShareholders = companyInfo.shareholders.slice(0, 3);
      topShareholders.forEach(sh => {
        const badge = createBadge(`${sh.name} (${sh.percentage}%)`, 'shareholder');
        content.appendChild(badge);
      });
    }

    // Special flags
    if (companyInfo.flags && companyInfo.flags.length > 0) {
      companyInfo.flags.forEach(flag => {
        const flagLabels = {
          'chinese-owned': '🇨🇳 Chinese Owned',
          'russian-ties': '🇷🇺 Russian Ties',
          'state-owned': '🏛️ State Owned',
          'controversial': '⚠️ Controversial'
        };
        const label = flagLabels[flag] || flag;
        const badge = createBadge(label, 'warning');
        content.appendChild(badge);
      });
    }

    banner.appendChild(content);

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'bts-close';
    closeBtn.innerHTML = '×';
    closeBtn.title = 'Close banner';
    closeBtn.addEventListener('click', () => {
      banner.remove();
      document.body.style.marginTop = '';
    });
    banner.appendChild(closeBtn);

    return banner;
  }

  // Main initialization
  async function init() {
    const hostname = window.location.hostname;
    const domain = getRootDomain(hostname);

    const companyData = await fetchCompanyData();
    const companyInfo = companyData[domain] || companyData[hostname];

    if (!companyInfo) {
      // No data for this site
      return;
    }

    // Check if banner already exists
    if (document.getElementById('bts-banner')) {
      return;
    }

    const banner = createBanner(companyInfo);
    document.body.insertBefore(banner, document.body.firstChild);

    // Push page content down
    document.body.style.marginTop = '48px';
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
