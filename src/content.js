// BehindTheSite - Content Script
// Injects transparency banner into web pages

(async function() {
  'use strict';

  const GITHUB_DATA_URL = 'https://raw.githubusercontent.com/zied-vvd/BehindTheSite/main/data/dist/companies.json';

  // All available flag labels
  const FLAG_LABELS = {
    // Ownership & Country
    'chinese-owned': { label: '🇨🇳 Chinese Owned', type: 'warning' },
    'russian-ties': { label: '🇷🇺 Russian Ties', type: 'warning' },
    'israeli-ties': { label: '🇮🇱 Israeli Ties', type: 'warning' },
    'state-owned': { label: '🏛️ State Owned', type: 'warning' },
    'foreign-owned': { label: '🌐 Foreign Owned', type: 'info' },
    'sanctioned-country': { label: '🚫 Sanctioned Country', type: 'warning' },
    'authoritarian-ties': { label: '⛓️ Authoritarian Ties', type: 'warning' },

    // Environment
    'oil-industry': { label: '🛢️ Oil & Gas', type: 'warning' },
    'deforestation': { label: '🌲 Deforestation Links', type: 'warning' },
    'carbon-heavy': { label: '💨 High Carbon', type: 'warning' },
    'plastic-producer': { label: '🥤 Major Plastic Producer', type: 'warning' },
    'green-certified': { label: '✅ Green Certified', type: 'positive' },

    // Peace & Conflict
    'weapons-manufacturer': { label: '🔫 Weapons Manufacturer', type: 'warning' },
    'military-contractor': { label: '🎖️ Military Contractor', type: 'warning' },
    'conflict-minerals': { label: '⛏️ Conflict Minerals', type: 'warning' },

    // Labor
    'poor-labor': { label: '⚠️ Poor Labor Practices', type: 'warning' },
    'child-labor': { label: '🧒 Child Labor Concerns', type: 'warning' },
    'union-busting': { label: '🚷 Anti-Union', type: 'warning' },
    'fair-trade': { label: '✅ Fair Trade', type: 'positive' },
    'living-wage': { label: '💰 Living Wage', type: 'positive' },

    // Privacy
    'data-harvesting': { label: '📊 Data Harvesting', type: 'warning' },
    'surveillance': { label: '👁️ Surveillance Tech', type: 'warning' },
    'data-breaches': { label: '🔓 Data Breaches', type: 'warning' },
    'privacy-focused': { label: '🛡️ Privacy Focused', type: 'positive' },

    // Ethics
    'monopoly': { label: '🏰 Monopoly', type: 'warning' },
    'tax-avoidance': { label: '💸 Tax Avoidance', type: 'warning' },
    'tax-haven': { label: '🏝️ Uses Tax Havens', type: 'warning' },
    'lobbying': { label: '🏛️ Heavy Lobbying', type: 'info' },
    'ceo-pay-ratio': { label: '📈 Extreme CEO Pay', type: 'warning' },
    'b-corp': { label: '✅ B Corp', type: 'positive' },

    // Health
    'tobacco': { label: '🚬 Tobacco', type: 'warning' },
    'alcohol': { label: '🍺 Alcohol', type: 'info' },
    'pharma-controversy': { label: '💊 Pharma Controversy', type: 'warning' },
    'processed-food': { label: '🍟 Ultra-Processed', type: 'warning' },
    'gambling': { label: '🎰 Gambling', type: 'warning' },

    // Democracy
    'media-manipulation': { label: '📺 Media Manipulation', type: 'warning' },
    'election-interference': { label: '🗳️ Election Issues', type: 'warning' },
    'censorship': { label: '🔇 Censorship', type: 'warning' },

    // Legacy/general
    'controversial': { label: '⚠️ Controversial', type: 'warning' }
  };

  // Entity type labels
  const ENTITY_TYPE_LABELS = {
    'institution': '🏦 Investment Firm',
    'individual': '👤 Individual',
    'fund': '💼 Fund',
    'government': '🏛️ Government',
    'nonprofit': '🎗️ Nonprofit',
    'private': '🔒 Private Company',
    'other': '📋 Other',
    'unknown': '❓ Unknown'
  };

  // Extract root domain from hostname
  function getRootDomain(hostname) {
    const parts = hostname.split('.');
    if (parts.length <= 2) return hostname;
    const knownTwoPartTlds = ['co.uk', 'com.au', 'co.nz', 'co.jp', 'com.br'];
    const lastTwo = parts.slice(-2).join('.');
    if (knownTwoPartTlds.includes(lastTwo)) {
      return parts.slice(-3).join('.');
    }
    return parts.slice(-2).join('.');
  }

  // Get user preferences
  async function getUserPreferences() {
    try {
      const { preferences } = await chrome.storage.sync.get(['preferences']);
      return preferences || null;
    } catch (error) {
      console.log('BehindTheSite: Could not load preferences', error);
      return null;
    }
  }

  // Get hidden sites (sites dismissed for 30 days)
  async function getHiddenSites() {
    try {
      const { hiddenSites } = await chrome.storage.local.get(['hiddenSites']);
      return hiddenSites || {};
    } catch (error) {
      console.log('BehindTheSite: Could not load hidden sites', error);
      return {};
    }
  }

  // Hide banner for a site for 30 days
  async function hideSiteFor30Days(domain) {
    try {
      const hiddenSites = await getHiddenSites();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      hiddenSites[domain] = Date.now() + thirtyDays;
      await chrome.storage.local.set({ hiddenSites });
      console.log(`BehindTheSite: Banner hidden for ${domain} for 30 days`);
    } catch (error) {
      console.log('BehindTheSite: Could not save hidden site', error);
    }
  }

  // Check if site is hidden
  async function isSiteHidden(domain) {
    const hiddenSites = await getHiddenSites();
    const hiddenUntil = hiddenSites[domain];
    if (!hiddenUntil) return false;

    // Check if still hidden
    if (Date.now() < hiddenUntil) {
      return true;
    }

    // Expired - clean up
    delete hiddenSites[domain];
    await chrome.storage.local.set({ hiddenSites });
    return false;
  }

  // Fetch company data from GitHub
  async function fetchCompanyData() {
    try {
      const cached = await chrome.storage.local.get(['companyData', 'lastFetch']);
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;

      if (cached.companyData && cached.lastFetch && (now - cached.lastFetch) < oneHour) {
        return cached.companyData;
      }

      const response = await fetch(GITHUB_DATA_URL);
      if (!response.ok) {
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
          { "name": "Vanguard Group", "percentage": 7.1, "type": "institution" },
          { "name": "BlackRock", "percentage": 6.4, "type": "institution" },
          { "name": "Jeff Bezos", "percentage": 9.5, "type": "individual" }
        ],
        "country": "USA",
        "flags": ["poor-labor", "monopoly", "tax-avoidance"],
        "flagsData": []
      },
      "google.com": {
        "name": "Alphabet Inc.",
        "shareholders": [
          { "name": "Vanguard Group", "percentage": 7.4, "type": "institution" },
          { "name": "BlackRock", "percentage": 6.3, "type": "institution" },
          { "name": "Larry Page", "percentage": 6.0, "type": "individual" }
        ],
        "country": "USA",
        "flags": ["data-harvesting", "monopoly", "lobbying"],
        "flagsData": []
      }
    };
  }

  // Create badge HTML
  function createBadge(text, type = 'default', clickable = false) {
    const badge = document.createElement('span');
    badge.className = `bts-badge bts-badge-${type}${clickable ? ' bts-clickable' : ''}`;
    badge.textContent = text;
    return badge;
  }

  // Filter flags based on user preferences
  function filterFlags(flags, preferences) {
    if (!preferences || !preferences.tags || preferences.tags.length === 0) {
      return flags;
    }
    const userTags = new Set(preferences.tags);
    return flags.filter(flag => userTags.has(flag));
  }

  // Create details panel for expanded info
  function createDetailsPanel() {
    const panel = document.createElement('div');
    panel.id = 'bts-details-panel';
    panel.className = 'bts-details-panel';
    panel.style.display = 'none';
    return panel;
  }

  // Show shareholder details
  function showShareholderDetails(panel, shareholder, banner) {
    const typeLabel = ENTITY_TYPE_LABELS[shareholder.type] || ENTITY_TYPE_LABELS['unknown'];

    let html = `
      <div class="bts-details-header">
        <span class="bts-details-title">${shareholder.name}</span>
        <span class="bts-details-type">${typeLabel}</span>
        <button class="bts-details-close">×</button>
      </div>
      <div class="bts-details-body">
    `;

    if (shareholder.percentage) {
      html += `<div class="bts-details-stat"><strong>Ownership:</strong> ${shareholder.percentage}%</div>`;
    }

    if (shareholder.country) {
      html += `<div class="bts-details-stat"><strong>Country:</strong> ${shareholder.country}</div>`;
    }

    if (shareholder.description) {
      html += `<div class="bts-details-desc">${shareholder.description}</div>`;
    }

    // Add search links
    html += `
      <div class="bts-details-links">
        <a href="https://en.wikipedia.org/wiki/${encodeURIComponent(shareholder.name)}" target="_blank" rel="noopener">Wikipedia</a>
        <a href="https://www.google.com/search?q=${encodeURIComponent(shareholder.name + ' investor')}" target="_blank" rel="noopener">Google</a>
        <a href="https://news.google.com/search?q=${encodeURIComponent(shareholder.name)}" target="_blank" rel="noopener">News</a>
      </div>
    `;

    html += '</div>';
    panel.innerHTML = html;
    panel.style.display = 'block';
    document.body.style.marginTop = '148px'; // Expand for panel

    // Close button
    panel.querySelector('.bts-details-close').addEventListener('click', () => {
      panel.style.display = 'none';
      document.body.style.marginTop = '48px';
    });
  }

  // Show flag details
  function showFlagDetails(panel, flagId, flagData, companyInfo) {
    const flagLabel = FLAG_LABELS[flagId] || { label: flagId, type: 'info' };
    const fullFlagData = (companyInfo.flagsData || []).find(f => f.id === flagId) || {};

    let html = `
      <div class="bts-details-header">
        <span class="bts-details-title">${flagLabel.label}</span>
        <span class="bts-details-type bts-badge-${flagLabel.type}">${flagData.category || 'Tag'}</span>
        <button class="bts-details-close">×</button>
      </div>
      <div class="bts-details-body">
    `;

    if (fullFlagData.definition) {
      html += `<div class="bts-details-definition"><strong>Definition:</strong> ${fullFlagData.definition}</div>`;
    }

    if (fullFlagData.justification) {
      html += `<div class="bts-details-justification"><strong>Why this applies:</strong> ${fullFlagData.justification}</div>`;
    }

    // Show sources
    if (fullFlagData.sources && fullFlagData.sources.length > 0) {
      html += `<div class="bts-details-sources"><strong>Sources:</strong><ul>`;
      fullFlagData.sources.forEach(source => {
        if (source.url) {
          html += `<li><a href="${source.url}" target="_blank" rel="noopener">${source.title || source.url}</a> <span class="bts-source-type">(${source.type})</span></li>`;
        } else {
          html += `<li>${source.title} <span class="bts-source-type">(${source.type})</span></li>`;
        }
      });
      html += '</ul></div>';
    }

    // Add search links
    html += `
      <div class="bts-details-links">
        <a href="https://news.google.com/search?q=${encodeURIComponent(companyInfo.name + ' ' + flagLabel.label.replace(/[^\w\s]/g, ''))}" target="_blank" rel="noopener">Related News</a>
      </div>
    `;

    html += '</div>';
    panel.innerHTML = html;
    panel.style.display = 'block';
    document.body.style.marginTop = '148px';

    // Close button
    panel.querySelector('.bts-details-close').addEventListener('click', () => {
      panel.style.display = 'none';
      document.body.style.marginTop = '48px';
    });
  }

  // Create the banner element
  function createBanner(companyInfo, preferences) {
    const wrapper = document.createElement('div');
    wrapper.id = 'bts-wrapper';
    wrapper.className = 'bts-wrapper';

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

    // Details panel (hidden initially)
    const detailsPanel = createDetailsPanel();

    // Top shareholders (clickable)
    if (companyInfo.shareholders && companyInfo.shareholders.length > 0) {
      const topShareholders = companyInfo.shareholders.slice(0, 3);
      topShareholders.forEach(sh => {
        const pct = sh.percentage != null ? ` (${sh.percentage}%)` : '';
        const badge = createBadge(`${sh.name}${pct}`, 'shareholder', true);
        badge.addEventListener('click', () => {
          showShareholderDetails(detailsPanel, sh, banner);
        });
        content.appendChild(badge);
      });
    }

    // Filtered flags based on user preferences (clickable)
    const flags = companyInfo.flags || [];
    const filteredFlags = filterFlags(flags, preferences);
    const flagsData = companyInfo.flagsData || [];

    filteredFlags.forEach(flag => {
      const flagInfo = FLAG_LABELS[flag];
      const flagData = flagsData.find(f => f.id === flag) || {};

      if (flagInfo) {
        const badge = createBadge(flagInfo.label, flagInfo.type, true);
        badge.addEventListener('click', () => {
          showFlagDetails(detailsPanel, flag, flagData, companyInfo);
        });
        content.appendChild(badge);
      } else {
        const badge = createBadge(`🏷️ ${flag}`, 'info', true);
        badge.addEventListener('click', () => {
          showFlagDetails(detailsPanel, flag, {}, companyInfo);
        });
        content.appendChild(badge);
      }
    });

    banner.appendChild(content);

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'bts-close';
    closeBtn.innerHTML = '×';
    closeBtn.title = 'Hide for 30 days on this site';
    closeBtn.addEventListener('click', async () => {
      const domain = getRootDomain(window.location.hostname);
      await hideSiteFor30Days(domain);
      wrapper.remove();
      document.body.style.marginTop = '';
    });
    banner.appendChild(closeBtn);

    wrapper.appendChild(banner);
    wrapper.appendChild(detailsPanel);

    return wrapper;
  }

  // Check if we should show banner based on preferences
  function shouldShowBanner(companyInfo, preferences) {
    if (!preferences || !preferences.onboardingComplete) {
      return true;
    }

    if (preferences.tags && preferences.tags.length > 0) {
      const userTags = new Set(preferences.tags);
      const companyFlags = companyInfo.flags || [];
      const hasMatch = companyFlags.some(flag => userTags.has(flag));
      return hasMatch;
    }

    return true;
  }

  // Main initialization
  async function init() {
    const hostname = window.location.hostname;
    const domain = getRootDomain(hostname);

    if (await isSiteHidden(domain)) {
      console.log('BehindTheSite: Banner hidden for this site (user dismissed)');
      return;
    }

    const [companyData, preferences] = await Promise.all([
      fetchCompanyData(),
      getUserPreferences()
    ]);

    const companyInfo = companyData[domain] || companyData[hostname];

    if (!companyInfo) {
      return;
    }

    if (!shouldShowBanner(companyInfo, preferences)) {
      return;
    }

    if (document.getElementById('bts-wrapper')) {
      return;
    }

    const banner = createBanner(companyInfo, preferences);
    document.body.insertBefore(banner, document.body.firstChild);
    document.body.style.marginTop = '48px';
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
