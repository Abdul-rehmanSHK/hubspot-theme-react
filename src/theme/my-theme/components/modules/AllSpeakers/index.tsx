import {
  ModuleFields,
  TextField,
  UrlField,
} from '@hubspot/cms-components/fields';
import { useState, useEffect } from 'react';

export function Component({ fieldValues }) {
  const heading = fieldValues.heading || 'All Speakers';
  // Handle UrlField structure - it can be a string or an object with url/href property
  const getUrl = (urlField) => {
    if (!urlField) return '#';
    if (typeof urlField === 'string') return urlField;
    if (typeof urlField === 'object') {
      return urlField.url || urlField.href || urlField.link || '#';
    }
    return '#';
  };

  const linkText = fieldValues.linkText || '';
  const linkUrl = getUrl(fieldValues.linkUrl) || '#';
  const ctaText = fieldValues.ctaText || 'Contact Us';
  const ctaUrl = getUrl(fieldValues.ctaUrl) || '#';
  const filterButtonText = fieldValues.filterButtonText || 'Filter by Topic';
  
  // HubDB API configuration
  const portalId = '39650877';
  const tableId = '146265866'; // past_speakers table ID
  
  // State for HubDB data - initialize as empty, will be populated by script
  const [speakers, setSpeakers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch speakers from HubDB using useEffect (fallback if hooks work)
  useEffect(() => {
    // This will only run if React hooks are supported in HubSpot environment
    const fetchSpeakers = async () => {
      try {
        const apiUrl = `https://api.hubapi.com/cms/v3/hubdb/tables/${tableId}/rows?portalId=${portalId}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        
        const data = await response.json();
        const transformedSpeakers = (data.results || []).map((row: any) => ({
          speakerName: row.values?.name || '',
          title: row.values?.title || '',
          company: row.values?.company || '',
          image: row.values?.image ? {
            src: row.values.image.url || '',
            alt: row.values.image.altText || row.values?.name || 'Speaker'
          } : null,
        }));
        
        setSpeakers(transformedSpeakers);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load');
        setLoading(false);
      }
    };

    fetchSpeakers();
  }, []);

  const moduleId = `all-speakers-${fieldValues.moduleInstanceId || Math.random().toString(36).slice(2)}`;
  const sectionId = fieldValues.sectionId || 'all-speakers';

  return (
    <div className="speakers-area" id={sectionId} data-speakers-id={moduleId}>
      <div className="container">
        <div className="speakers-inner">
          <div className="speakers-header-with-filter">
            <div className="speakers-text">
              <div className="speakers-heading-row">
                <h2>{heading}</h2>
                <div className="speakers-actions-wrapper">
                  <button className="transparent-btn speaker-search-btn" id={`speaker-search-btn-${moduleId}`}>
                    <i className="fa-solid fa-search"></i>
                  </button>
                  <button className="transparent-btn topic-filter-btn" id={`topic-filter-btn-${moduleId}`}>
                    {filterButtonText} <i className="fa-solid fa-filter"></i>
                  </button>
                </div>
              </div>
              {linkText && (
                <p>
                  <a href={linkUrl} className="speakers-link">{linkText}</a>
                </p>
              )}
            </div>
          </div>
          {/* Speakers will be loaded via JavaScript script below - Grid layout grouped by topic */}
          <div id={`speakers-grid-${moduleId}`} className="all-speakers-grid">
            {/* Topics and speakers will be inserted here by JavaScript */}
          </div>
          <div id={`speaker-loading-${moduleId}`} style={{ padding: '40px', textAlign: 'center', color: '#050d51' }}>
            Loading speakers...
          </div>
          <div id={`speaker-error-${moduleId}`} style={{ display: 'none', padding: '40px', textAlign: 'center', color: '#d32f2f' }}>
            Error loading speakers
          </div>
        </div>
      </div>

      {/* Side Panel for Topic Filter */}
      <div className="topic-filter-side-panel" id={`topic-filter-panel-${moduleId}`}>
        <div className="topic-filter-panel-overlay" id={`topic-filter-overlay-${moduleId}`}></div>
        <div className="topic-filter-panel-content" id={`topic-filter-content-${moduleId}`}>
          <div className="topic-filter-panel-header">
            <h3>Filter by Topic</h3>
            <button className="topic-filter-close-btn" id={`topic-filter-close-${moduleId}`}>
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
          <div className="topic-filter-panel-body" id={`topic-filter-list-${moduleId}`}>
            {/* Topics will be inserted here by JavaScript */}
          </div>
        </div>
      </div>

      {/* Search Modal */}
      <div className="speaker-search-modal" id={`speaker-search-modal-${moduleId}`}>
        <div className="speaker-search-overlay" id={`speaker-search-overlay-${moduleId}`}></div>
        <div className="speaker-search-content" id={`speaker-search-content-${moduleId}`}>
          <div className="speaker-search-header">
            <h3>Search Speakers</h3>
            <button className="speaker-search-close-btn" id={`speaker-search-close-${moduleId}`}>
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
          <div className="speaker-search-input-wrapper">
            <input 
              type="text" 
              className="speaker-search-input" 
              id={`speaker-search-input-${moduleId}`}
              placeholder="Search by name, company, or title..."
              autoComplete="off"
            />
            <i className="fa-solid fa-search speaker-search-icon"></i>
          </div>
          <div className="speaker-search-results" id={`speaker-search-results-${moduleId}`}>
            {/* Search results will be inserted here by JavaScript */}
          </div>
        </div>
      </div>

      {/* Fetch ALL speakers and display in grid grouped by topic */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
          (function() {
            const root = document.querySelector('[data-speakers-id="${moduleId}"]');
            if (!root) return;
            
            const portalId = '${portalId}';
            const tableId = '${tableId}';
            const moduleId = '${moduleId}';
            const gridContainer = root.querySelector('#speakers-grid-${moduleId}');
            const loadingDiv = root.querySelector('#speaker-loading-${moduleId}');
            const errorDiv = root.querySelector('#speaker-error-${moduleId}');
            
            // Store all speakers globally for search functionality
            let allSpeakersData = [];
            
            // Fetch ALL speakers from HubDB API (no filter - shows all featured and non-featured)
            async function fetchSpeakers() {
              try {
                const apiUrl = 'https://api.hubapi.com/cms/v3/hubdb/tables/' + tableId + '/rows?portalId=' + portalId;
                
                const response = await fetch(apiUrl);
                
                if (!response.ok) {
                  throw new Error('Failed to fetch: ' + response.status);
                }
                
                const data = await response.json();
                
                // Transform ALL speakers with topics
                const allSpeakers = (data.results || []).map(function(row) {
                  // Extract topic names from the topic array
                  const topics = (row.values?.topic || []).map(function(topicObj) {
                    return topicObj.name || '';
                  }).filter(function(name) {
                    return name && name.trim() !== '';
                  });
                  
                  return {
                    speakerName: row.values?.name || '',
                    title: row.values?.title || '',
                    company: row.values?.company || '',
                    image: row.values?.image ? {
                      src: row.values.image.url || '',
                      alt: row.values.image.altText || row.values?.name || 'Speaker'
                    } : null,
                    topics: topics
                  };
                });
                
                // Store speakers data globally for search
                allSpeakersData = allSpeakers;
                
                if (allSpeakers.length === 0) {
                  loadingDiv.innerHTML = 'No speakers found';
                  loadingDiv.style.display = 'block';
                  return;
                }
                
                // Group speakers by topic
                const topicMap = {};
                
                allSpeakers.forEach(function(speaker) {
                  if (speaker.topics && speaker.topics.length > 0) {
                    speaker.topics.forEach(function(topicName) {
                      if (!topicMap[topicName]) {
                        topicMap[topicName] = [];
                      }
                      topicMap[topicName].push(speaker);
                    });
                  } else {
                    // Speakers without topics go to "Other" category
                    if (!topicMap['Other']) {
                      topicMap['Other'] = [];
                    }
                    topicMap['Other'].push(speaker);
                  }
                });
                
                // Sort topics alphabetically
                const sortedTopics = Object.keys(topicMap).sort(function(a, b) {
                  return a.localeCompare(b);
                });
                
                // Populate side panel with topics
                const panelList = root.querySelector('#topic-filter-list-${moduleId}');
                if (panelList) {
                  // Add "ALL" option first (set as active by default)
                  const allItem = document.createElement('div');
                  allItem.className = 'topic-filter-panel-item active';
                  allItem.setAttribute('data-topic', 'all');
                  allItem.innerHTML = '<span>ALL</span><span class="topic-count">(' + allSpeakers.length + ')</span>';
                  panelList.appendChild(allItem);
                  
                  // Add each topic
                  sortedTopics.forEach(function(topicName) {
                    const topicItem = document.createElement('div');
                    topicItem.className = 'topic-filter-panel-item';
                    topicItem.setAttribute('data-topic', topicName);
                    const speakerCount = topicMap[topicName] ? topicMap[topicName].length : 0;
                    topicItem.innerHTML = '<span>' + topicName + '</span><span class="topic-count">(' + speakerCount + ')</span>';
                    panelList.appendChild(topicItem);
                  });
                }
                
                // Hide loading, show speakers
                loadingDiv.style.display = 'none';
                errorDiv.style.display = 'none';
                
                // Render topics and speakers in grid layout
                sortedTopics.forEach(function(topicName) {
                  const topicSection = document.createElement('div');
                  topicSection.className = 'topic-section';
                  topicSection.setAttribute('data-topic', topicName);
                  
                  const topicHeading = document.createElement('h3');
                  topicHeading.className = 'topic-heading';
                  topicHeading.textContent = topicName;
                  topicSection.appendChild(topicHeading);
                  
                  const speakersGrid = document.createElement('div');
                  speakersGrid.className = 'speakers-grid';
                  
                  const speakers = topicMap[topicName];
                  speakers.forEach(function(speaker) {
                    const speakerCard = document.createElement('div');
                    speakerCard.className = 'speaker-card';
                    
                    const imageSrc = speaker.image?.src || '';
                    const imageAlt = speaker.image?.alt || speaker.speakerName || 'Speaker';
                    
                    speakerCard.innerHTML = '<div class="team-member">' +
                      (imageSrc ? 
                        '<img src="' + imageSrc + '" alt="' + imageAlt + '" />' :
                        '<div style="width: 200px; height: 200px; border-radius: 50%; background: #06C7EE; display: flex; align-items: center; justify-content: center; color: #fff; margin: 0 auto;">No Image</div>'
                      ) +
                      '<div class="team-info">' +
                      (speaker.speakerName ? '<h4>' + speaker.speakerName + '</h4>' : '') +
                      (speaker.company ? '<p>' + speaker.company + '</p>' : '') +
                      (speaker.title ? '<span>' + speaker.title + '</span>' : '') +
                      '</div></div>';
                    
                    speakersGrid.appendChild(speakerCard);
                  });
                  
                  topicSection.appendChild(speakersGrid);
                  gridContainer.appendChild(topicSection);
                });
                
                // Initialize dropdown functionality
                initTopicFilter();
                
                // Initialize search functionality
                initSpeakerSearch();
                
              } catch (err) {
                loadingDiv.style.display = 'none';
                errorDiv.style.display = 'block';
                errorDiv.innerHTML = 'Error: ' + (err.message || 'Failed to load speakers');
              }
            }
            
            // Start fetching speakers
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', function() {
                setTimeout(fetchSpeakers, 100);
              });
            } else {
              setTimeout(fetchSpeakers, 100);
            }

            // Initialize topic filter side panel
            function initTopicFilter() {
              const filterBtn = root.querySelector('#topic-filter-btn-${moduleId}');
              const sidePanel = root.querySelector('#topic-filter-panel-${moduleId}');
              const panelOverlay = root.querySelector('#topic-filter-overlay-${moduleId}');
              const panelContent = root.querySelector('#topic-filter-content-${moduleId}');
              const closeBtn = root.querySelector('#topic-filter-close-${moduleId}');
              const panelItems = root.querySelectorAll('#topic-filter-list-${moduleId} .topic-filter-panel-item');
              const topicSections = root.querySelectorAll('.topic-section');
              
              if (!filterBtn || !sidePanel || !panelOverlay || !panelContent) return;
              
              // Open side panel on button click
              filterBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                sidePanel.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent body scroll when panel is open
              });
              
              // Close side panel functions
              function closePanel() {
                sidePanel.classList.remove('active');
                document.body.style.overflow = ''; // Restore body scroll
              }
              
              // Close on overlay click
              if (panelOverlay) {
                panelOverlay.addEventListener('click', closePanel);
              }
              
              // Close on close button click
              if (closeBtn) {
                closeBtn.addEventListener('click', closePanel);
              }
              
              // Close on Escape key
              document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && sidePanel.classList.contains('active')) {
                  closePanel();
                }
              });
              
              // Handle topic selection
              panelItems.forEach(function(item) {
                item.addEventListener('click', function(e) {
                  e.stopPropagation();
                  const selectedTopic = this.getAttribute('data-topic');
                  
                  // Remove active class from all items
                  panelItems.forEach(function(i) {
                    i.classList.remove('active');
                  });
                  
                  // Add active class to selected item
                  this.classList.add('active');
                  
                  // Filter topic sections
                  topicSections.forEach(function(section) {
                    const sectionTopic = section.getAttribute('data-topic');
                    if (selectedTopic === 'all' || sectionTopic === selectedTopic) {
                      section.style.display = 'block';
                    } else {
                      section.style.display = 'none';
                    }
                  });
                  
                  // Close panel after selection
                  setTimeout(closePanel, 300);
                });
              });
            }
            
            // Initialize speaker search modal
            function initSpeakerSearch() {
              const searchBtn = root.querySelector('#speaker-search-btn-${moduleId}');
              const searchModal = root.querySelector('#speaker-search-modal-${moduleId}');
              const searchOverlay = root.querySelector('#speaker-search-overlay-${moduleId}');
              const searchContent = root.querySelector('#speaker-search-content-${moduleId}');
              const closeBtn = root.querySelector('#speaker-search-close-${moduleId}');
              const searchInput = root.querySelector('#speaker-search-input-${moduleId}');
              const searchResults = root.querySelector('#speaker-search-results-${moduleId}');
              
              if (!searchBtn || !searchModal || !searchOverlay || !searchContent) return;
              
              // Open search modal on button click
              searchBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                searchModal.classList.add('active');
                document.body.style.overflow = 'hidden';
                // Focus on input after modal opens
                setTimeout(function() {
                  if (searchInput) {
                    searchInput.focus();
                  }
                }, 300);
              });
              
              // Close search modal functions
              function closeSearchModal() {
                searchModal.classList.remove('active');
                document.body.style.overflow = '';
                if (searchInput) {
                  searchInput.value = '';
                }
                if (searchResults) {
                  searchResults.innerHTML = '';
                }
              }
              
              // Close on overlay click
              if (searchOverlay) {
                searchOverlay.addEventListener('click', closeSearchModal);
              }
              
              // Close on close button click
              if (closeBtn) {
                closeBtn.addEventListener('click', closeSearchModal);
              }
              
              // Close on Escape key
              document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && searchModal.classList.contains('active')) {
                  closeSearchModal();
                }
              });
              
              // Search functionality
              if (searchInput && searchResults) {
                let searchTimeout;
                
                searchInput.addEventListener('input', function(e) {
                  clearTimeout(searchTimeout);
                  const query = this.value.trim().toLowerCase();
                  
                  // Debounce search
                  searchTimeout = setTimeout(function() {
                    if (query.length === 0) {
                      searchResults.innerHTML = '<div class="speaker-search-empty">Start typing to search speakers...</div>';
                      return;
                    }
                    
                    // Search in speaker name, company, and title
                    const matchingSpeakers = allSpeakersData.filter(function(speaker) {
                      const nameMatch = speaker.speakerName.toLowerCase().includes(query);
                      const companyMatch = speaker.company.toLowerCase().includes(query);
                      const titleMatch = speaker.title.toLowerCase().includes(query);
                      return nameMatch || companyMatch || titleMatch;
                    });
                    
                    // Display results
                    if (matchingSpeakers.length === 0) {
                      searchResults.innerHTML = '<div class="speaker-search-empty">No speakers found matching "' + query + '"</div>';
                    } else {
                      let resultsHTML = '<div class="speaker-search-results-count">Found ' + matchingSpeakers.length + ' speaker' + (matchingSpeakers.length !== 1 ? 's' : '') + '</div>';
                      resultsHTML += '<div class="speaker-search-results-grid">';
                      
                      matchingSpeakers.forEach(function(speaker) {
                        resultsHTML += '<div class="speaker-search-result-card">' +
                          '<div class="team-info">' +
                          (speaker.speakerName ? '<h4>' + speaker.speakerName + '</h4>' : '') +
                          (speaker.company ? '<p>' + speaker.company + '</p>' : '') +
                          (speaker.title ? '<span>' + speaker.title + '</span>' : '') +
                          '</div></div>';
                      });
                      
                      resultsHTML += '</div>';
                      searchResults.innerHTML = resultsHTML;
                    }
                  }, 300);
                });
              }
            }
          })();
        `,
        }}
      />
    </div>
  );
}

export const fields = (
  <ModuleFields>
    <TextField
      name="heading"
      label="Heading"
      default="All Speakers"
    />
    <TextField
      name="linkText"
      label="Link text"
      default="Contact Paul.Baier@GAIinsights.com or book an appointment to learn more."
      helpText="Text for the link (will be displayed in bold cyan)"
    />
    <UrlField
      name="linkUrl"
      label="Link URL"
      helpText="URL for the link (e.g., mailto:email@example.com or https://example.com)"
    />
    <TextField
      name="ctaText"
      label="CTA button text"
      default="Contact Us"
    />
    <UrlField
      name="ctaUrl"
      label="CTA button URL"
    />
    <TextField
      name="sectionId"
      label="Section ID"
      default="all-speakers"
      helpText="ID for anchor links (e.g., #all-speakers). Leave empty for no ID."
    />
    <TextField
      name="filterButtonText"
      label="Filter button text"
      default="Filter by Topic"
      helpText="Text displayed on the filter button"
    />
  </ModuleFields>
);

export const meta = {
  label: 'All Speakers',
};

