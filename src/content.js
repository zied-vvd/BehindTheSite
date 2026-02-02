// BehindTheSite - Content Script
// Injects transparency banner into web pages

(async function() {
  'use strict';

  const GITHUB_DATA_URL = 'https://raw.githubusercontent.com/zied-vvd/BehindTheSite/main/data/companies.json';

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
          { "name": "Vanguard Group", "percentage": 7.1 },
          { "name": "BlackRock", "percentage": 6.4 },
          { "name": "Jeff Bezos", "percentage": 9.5 }
        ],
        "country": "USA",
        "flags": ["poor-labor", "monopoly", "tax-avoidance"]
      },
      "google.com": {
        "name": "Alphabet Inc.",
        "shareholders": [
          { "name": "Vanguard Group", "percentage": 7.4 },
          { "name": "BlackRock", "percentage": 6.3 },
          { "name": "Larry Page", "percentage": 6.0 }
        ],
        "country": "USA",
        "flags": ["data-harvesting", "monopoly", "lobbying"]
      },
      "tiktok.com": {
        "name": "ByteDance Ltd.",
        "shareholders": [
          { "name": "ByteDance (Private)", "percentage": 100 }
        ],
        "country": "China",
        "flags": ["chinese-owned", "data-harvesting", "censorship"]
      },
      "youtube.com": {
        "name": "YouTube (Alphabet Inc.)",
        "shareholders": [
          { "name": "Vanguard Group", "percentage": 7.4 },
          { "name": "BlackRock", "percentage": 6.3 }
        ],
        "country": "USA",
        "flags": ["data-harvesting"]
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

  // Filter flags based on user preferences
  function filterFlags(flags, preferences) {
    if (!preferences || !preferences.tags || preferences.tags.length === 0) {
      // No preferences = show all flags
      return flags;
    }

    const userTags = new Set(preferences.tags);
    return flags.filter(flag => userTags.has(flag));
  }

  // Create the banner element
  function createBanner(companyInfo, preferences) {
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

    // Top shareholders (always show)
    if (companyInfo.shareholders && companyInfo.shareholders.length > 0) {
      const topShareholders = companyInfo.shareholders.slice(0, 3);
      topShareholders.forEach(sh => {
        const pct = sh.percentage != null ? ` (${sh.percentage}%)` : '';
        const badge = createBadge(`${sh.name}${pct}`, 'shareholder');
        content.appendChild(badge);
      });
    }

    // Filtered flags based on user preferences
    const flags = companyInfo.flags || [];
    const filteredFlags = filterFlags(flags, preferences);

    filteredFlags.forEach(flag => {
      const flagData = FLAG_LABELS[flag];
      if (flagData) {
        const badge = createBadge(flagData.label, flagData.type);
        content.appendChild(badge);
      } else {
        // Custom or unknown flag
        const badge = createBadge(`🏷️ ${flag}`, 'info');
        content.appendChild(badge);
      }
    });

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

  // Check if we should show banner based on preferences
  function shouldShowBanner(companyInfo, preferences) {
    // Always show if no preferences set (not onboarded yet)
    if (!preferences || !preferences.onboardingComplete) {
      return true;
    }

    // If user has tags selected, only show if there's a match
    if (preferences.tags && preferences.tags.length > 0) {
      const userTags = new Set(preferences.tags);
      const companyFlags = companyInfo.flags || [];

      // Check for any matching flag
      const hasMatch = companyFlags.some(flag => userTags.has(flag));
      return hasMatch;
    }

    // No tags selected = show all
    return true;
  }

  // Main initialization
  async function init() {
    const hostname = window.location.hostname;
    const domain = getRootDomain(hostname);

    // Load data and preferences in parallel
    const [companyData, preferences] = await Promise.all([
      fetchCompanyData(),
      getUserPreferences()
    ]);

    const companyInfo = companyData[domain] || companyData[hostname];

    if (!companyInfo) {
      return;
    }

    // Check if we should show based on user preferences
    if (!shouldShowBanner(companyInfo, preferences)) {
      return;
    }

    // Check if banner already exists
    if (document.getElementById('bts-banner')) {
      return;
    }

    const banner = createBanner(companyInfo, preferences);
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
