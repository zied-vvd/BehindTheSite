// BehindTheSite - Onboarding Flow

// Map concerns to suggested tags
const concernToTags = {
  environment: [
    { id: 'oil-industry', label: 'Oil & Gas Industry', icon: '🛢️' },
    { id: 'deforestation', label: 'Linked to Deforestation', icon: '🌲' },
    { id: 'carbon-heavy', label: 'High Carbon Footprint', icon: '💨' },
    { id: 'plastic-producer', label: 'Major Plastic Producer', icon: '🥤' },
    { id: 'green-certified', label: 'Green Certified', icon: '✅', positive: true }
  ],
  peace: [
    { id: 'russian-ties', label: 'Russian Ties', icon: '🇷🇺' },
    { id: 'israeli-ties', label: 'Israeli Ties', icon: '🇮🇱' },
    { id: 'weapons-manufacturer', label: 'Weapons Manufacturer', icon: '🔫' },
    { id: 'military-contractor', label: 'Military Contractor', icon: '🎖️' },
    { id: 'conflict-minerals', label: 'Uses Conflict Minerals', icon: '⛏️' },
    { id: 'sanctioned-country', label: 'Sanctioned Country Ties', icon: '🚫' }
  ],
  labor: [
    { id: 'poor-labor', label: 'Poor Labor Practices', icon: '⚠️' },
    { id: 'child-labor', label: 'Child Labor Concerns', icon: '🧒' },
    { id: 'union-busting', label: 'Anti-Union History', icon: '🚷' },
    { id: 'fair-trade', label: 'Fair Trade Certified', icon: '✅', positive: true },
    { id: 'living-wage', label: 'Pays Living Wage', icon: '💰', positive: true }
  ],
  privacy: [
    { id: 'chinese-owned', label: 'Chinese Owned', icon: '🇨🇳' },
    { id: 'data-harvesting', label: 'Data Harvesting', icon: '📊' },
    { id: 'surveillance', label: 'Surveillance Tech', icon: '👁️' },
    { id: 'data-breaches', label: 'History of Data Breaches', icon: '🔓' },
    { id: 'privacy-focused', label: 'Privacy Focused', icon: '🛡️', positive: true }
  ],
  local: [
    { id: 'foreign-owned', label: 'Foreign Owned', icon: '🌐' },
    { id: 'tax-haven', label: 'Uses Tax Havens', icon: '🏝️' },
    { id: 'local-business', label: 'Local Business', icon: '🏪', positive: true },
    { id: 'hq-overseas', label: 'HQ Overseas', icon: '✈️' }
  ],
  ethics: [
    { id: 'monopoly', label: 'Monopoly/Anti-competitive', icon: '🏰' },
    { id: 'tax-avoidance', label: 'Tax Avoidance', icon: '💸' },
    { id: 'lobbying', label: 'Heavy Political Lobbying', icon: '🏛️' },
    { id: 'ceo-pay-ratio', label: 'Extreme CEO Pay Ratio', icon: '📈' },
    { id: 'b-corp', label: 'B Corp Certified', icon: '✅', positive: true }
  ],
  health: [
    { id: 'tobacco', label: 'Tobacco Industry', icon: '🚬' },
    { id: 'alcohol', label: 'Alcohol Industry', icon: '🍺' },
    { id: 'pharma-controversy', label: 'Pharma Controversies', icon: '💊' },
    { id: 'processed-food', label: 'Ultra-Processed Food', icon: '🍟' },
    { id: 'gambling', label: 'Gambling Industry', icon: '🎰' }
  ],
  democracy: [
    { id: 'state-owned', label: 'State Owned', icon: '🏛️' },
    { id: 'authoritarian-ties', label: 'Authoritarian Country Ties', icon: '⛓️' },
    { id: 'media-manipulation', label: 'Media Manipulation', icon: '📺' },
    { id: 'election-interference', label: 'Election Interference', icon: '🗳️' },
    { id: 'censorship', label: 'Practices Censorship', icon: '🔇' }
  ]
};

// Concern labels for display
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

// State
let selectedConcerns = new Set();
let selectedTags = new Set();
let customTags = [];

// DOM Elements
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');

// Step 1: Concern selection
document.querySelectorAll('.concern-item').forEach(item => {
  item.addEventListener('click', () => {
    const concern = item.dataset.concern;
    item.classList.toggle('selected');

    if (selectedConcerns.has(concern)) {
      selectedConcerns.delete(concern);
    } else {
      selectedConcerns.add(concern);
    }

    document.getElementById('step1Next').disabled = selectedConcerns.size === 0;
  });
});

document.getElementById('step1Next').addEventListener('click', () => {
  showStep(2);
  renderSuggestedTags();
});

// Step 2: Tag selection
function renderSuggestedTags() {
  const container = document.getElementById('suggestedTags');
  container.innerHTML = '';

  selectedConcerns.forEach(concern => {
    const tags = concernToTags[concern] || [];
    if (tags.length === 0) return;

    const section = document.createElement('div');
    section.className = 'tags-section';

    const title = document.createElement('p');
    title.className = 'tags-section-title';
    title.textContent = `Based on "${concernLabels[concern]}"`;
    section.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'tags-grid';

    tags.forEach(tag => {
      const tagEl = document.createElement('div');
      tagEl.className = 'tag-item' + (selectedTags.has(tag.id) ? ' selected' : '');
      tagEl.dataset.tagId = tag.id;
      tagEl.innerHTML = `<span class="tag-icon">${tag.icon}</span> ${tag.label}`;

      tagEl.addEventListener('click', () => {
        tagEl.classList.toggle('selected');
        if (selectedTags.has(tag.id)) {
          selectedTags.delete(tag.id);
        } else {
          selectedTags.add(tag.id);
        }
      });

      grid.appendChild(tagEl);
    });

    section.appendChild(grid);
    container.appendChild(section);
  });

  // Render custom tags if any
  if (customTags.length > 0) {
    renderCustomTagsSection();
  }
}

function renderCustomTagsSection() {
  let section = document.getElementById('customTagsSection');
  if (!section) {
    section = document.createElement('div');
    section.className = 'tags-section';
    section.id = 'customTagsSection';

    const title = document.createElement('p');
    title.className = 'tags-section-title';
    title.textContent = 'Your custom tags';
    section.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'tags-grid';
    grid.id = 'customTagsGrid';
    section.appendChild(grid);

    document.getElementById('suggestedTags').appendChild(section);
  }

  const grid = document.getElementById('customTagsGrid');
  grid.innerHTML = '';

  customTags.forEach(tag => {
    const tagEl = document.createElement('div');
    tagEl.className = 'tag-item selected';
    tagEl.innerHTML = `🏷️ ${tag}`;
    grid.appendChild(tagEl);
  });
}

document.getElementById('addCustomTag').addEventListener('click', () => {
  const input = document.getElementById('customTagInput');
  const value = input.value.trim();

  if (value && !customTags.includes(value)) {
    customTags.push(value);
    selectedTags.add('custom:' + value);
    renderCustomTagsSection();
    input.value = '';
  }
});

document.getElementById('customTagInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('addCustomTag').click();
  }
});

document.getElementById('step2Back').addEventListener('click', () => showStep(1));
document.getElementById('step2Next').addEventListener('click', () => {
  showStep(3);
  renderSummary();
});

// Step 3: Summary
function renderSummary() {
  const concernsContainer = document.getElementById('summaryConcerns');
  const tagsContainer = document.getElementById('summaryTags');

  concernsContainer.innerHTML = '';
  tagsContainer.innerHTML = '';

  if (selectedConcerns.size === 0) {
    concernsContainer.innerHTML = '<span class="empty-state">None selected</span>';
  } else {
    selectedConcerns.forEach(concern => {
      const tag = document.createElement('span');
      tag.className = 'summary-tag';
      tag.textContent = concernLabels[concern];
      concernsContainer.appendChild(tag);
    });
  }

  if (selectedTags.size === 0) {
    tagsContainer.innerHTML = '<span class="empty-state">None selected - you\'ll see all available info</span>';
  } else {
    // Get tag labels
    const allTags = Object.values(concernToTags).flat();
    selectedTags.forEach(tagId => {
      const tag = document.createElement('span');
      tag.className = 'summary-tag';

      if (tagId.startsWith('custom:')) {
        tag.textContent = '🏷️ ' + tagId.replace('custom:', '');
      } else {
        const tagData = allTags.find(t => t.id === tagId);
        tag.textContent = tagData ? `${tagData.icon} ${tagData.label}` : tagId;
      }

      tagsContainer.appendChild(tag);
    });
  }
}

document.getElementById('step3Back').addEventListener('click', () => showStep(2));
document.getElementById('finishSetup').addEventListener('click', async () => {
  // Save preferences
  const preferences = {
    concerns: Array.from(selectedConcerns),
    tags: Array.from(selectedTags),
    customTags: customTags,
    onboardingComplete: true,
    setupDate: Date.now()
  };

  await chrome.storage.sync.set({ preferences });

  // Close onboarding tab
  window.close();
});

// Navigation helper
function showStep(stepNum) {
  step1.classList.remove('active');
  step2.classList.remove('active');
  step3.classList.remove('active');

  document.getElementById(`step${stepNum}`).classList.add('active');
}

// Check if already onboarded
chrome.storage.sync.get(['preferences'], (result) => {
  if (result.preferences?.onboardingComplete) {
    // Load existing preferences for editing
    selectedConcerns = new Set(result.preferences.concerns || []);
    selectedTags = new Set(result.preferences.tags || []);
    customTags = result.preferences.customTags || [];

    // Update UI
    document.querySelectorAll('.concern-item').forEach(item => {
      if (selectedConcerns.has(item.dataset.concern)) {
        item.classList.add('selected');
      }
    });
    document.getElementById('step1Next').disabled = selectedConcerns.size === 0;
  }
});
