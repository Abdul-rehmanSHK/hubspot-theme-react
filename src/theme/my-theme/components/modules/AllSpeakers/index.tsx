import {
  ModuleFields,
  TextField,
  UrlField,
  BooleanField,
  ChoiceField,
} from '@hubspot/cms-components/fields';

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
  const speakerTypeFilterButtonText = fieldValues.speakerTypeFilterButtonText || 'Filter by Speaker Type';
  
  // HubDB API configuration
  const portalId = '39650877';
  //const tableId = '146265866'; // past_speakers table ID
  const tableId = '323606672'; // Speakers 2026 table ID
  // Filter options - handle BooleanField values (can be boolean, string "true"/"false", or undefined)
  const showAllSpeakers = fieldValues.showAllSpeakers !== false && fieldValues.showAllSpeakers !== 'false';
  const showFeaturedFemales = fieldValues.showFeaturedFemales === true || fieldValues.showFeaturedFemales === 'true';
  const showFeaturedAll = fieldValues.showFeaturedAll === true || fieldValues.showFeaturedAll === 'true';
  const showRoundtableLeaders = fieldValues.showRoundtableLeaders === true || fieldValues.showRoundtableLeaders === 'true';
  const showSteeringCommittee = fieldValues.showSteeringCommittee === true || fieldValues.showSteeringCommittee === 'true';
  const genderFilter = fieldValues.genderFilter || '';
  const hideSearchIcon = fieldValues.hideSearchIcon === true || fieldValues.hideSearchIcon === 'true';
  const hideTopicFilter = fieldValues.hideTopicFilter === true || fieldValues.hideTopicFilter === 'true';
  const hideSpeakerTypeFilter = fieldValues.hideSpeakerTypeFilter === true || fieldValues.hideSpeakerTypeFilter === 'true';

  const moduleId = `all-speakers-${fieldValues.moduleInstanceId || Math.random().toString(36).slice(2)}`;
  const sectionId = fieldValues.sectionId || 'all-speakers';
  const sectionClass = fieldValues.sectionClass || 'speakers-area';

  return (
    <div className={sectionClass} id={sectionId} data-speakers-id={moduleId}>
      <div className="container">
        <div className="speakers-inner">
          <div className="speakers-header-with-filter">
            <div className="speakers-text">
              <div className="speakers-heading-row">
                <h2>{heading}</h2>
                <div className="speakers-actions-wrapper">
                  {!hideSearchIcon && (
                    <button className="transparent-btn speaker-search-btn" id={`speaker-search-btn-${moduleId}`}>
                      <i className="fa-solid fa-search"></i>
                    </button>
                  )}
                  {!hideTopicFilter && (
                    <button className="transparent-btn topic-filter-btn" id={`topic-filter-btn-${moduleId}`}>
                      {filterButtonText} <i className="fa-solid fa-filter"></i>
                    </button>
                  )}
                  {!hideSpeakerTypeFilter && (
                    <button className="transparent-btn topic-filter-btn" id={`speaker-type-filter-btn-${moduleId}`}>
                      {speakerTypeFilterButtonText} <i className="fa-solid fa-filter"></i>
                    </button>
                  )}
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

      {/* Side Panel for Speaker Type Filter (reuses topic-filter panel styles) */}
      <div className="topic-filter-side-panel" id={`speaker-type-filter-panel-${moduleId}`}>
        <div className="topic-filter-panel-overlay" id={`speaker-type-filter-overlay-${moduleId}`}></div>
        <div className="topic-filter-panel-content" id={`speaker-type-filter-content-${moduleId}`}>
          <div className="topic-filter-panel-header">
            <h3>Filter by Speaker Type</h3>
            <button className="topic-filter-close-btn" id={`speaker-type-filter-close-${moduleId}`}>
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
          <div className="topic-filter-panel-body" id={`speaker-type-filter-list-${moduleId}`}>
            {/* Speaker types will be inserted here by JavaScript */}
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
              placeholder="Search by speaker name..."
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
            
            // Filter settings from editor (passed as template variables)
            const showAllSpeakers = ${showAllSpeakers};
            const showFeaturedFemales = ${showFeaturedFemales};
            const showFeaturedAll = ${showFeaturedAll};
            const showRoundtableLeaders = ${showRoundtableLeaders};
            const showSteeringCommittee = ${showSteeringCommittee};
            const genderFilter = '${genderFilter}';
            const hideSearchIcon = ${hideSearchIcon};
            const hideTopicFilter = ${hideTopicFilter};
            const hideSpeakerTypeFilter = ${hideSpeakerTypeFilter};
            
            // Store all speakers globally for search functionality
            let allSpeakersData = [];

            // Shared filter state so Topic + Speaker Type filters combine
            let selectedTopic = 'all';
            let selectedSpeakerType = 'all';

            // Apply both the topic and speaker-type filters together.
            // Topic filter shows/hides whole topic sections; speaker-type filter
            // shows/hides individual cards, then hides any section left empty.
            function applyFilters() {
              const topicSections = root.querySelectorAll('.topic-section');
              topicSections.forEach(function(section) {
                const sectionTopic = section.getAttribute('data-topic');
                const topicMatch = (selectedTopic === 'all' || sectionTopic === selectedTopic);
                if (!topicMatch) {
                  section.style.display = 'none';
                  return;
                }
                const cards = section.querySelectorAll('.speaker-card');
                let visibleCount = 0;
                cards.forEach(function(card) {
                  const types = (card.getAttribute('data-speaker-type') || '').split('|');
                  const typeMatch = (selectedSpeakerType === 'all' || types.indexOf(selectedSpeakerType) !== -1);
                  if (typeMatch) {
                    card.style.display = '';
                    visibleCount++;
                  } else {
                    card.style.display = 'none';
                  }
                });
                section.style.display = visibleCount > 0 ? 'block' : 'none';
              });
            }
            
            // Fetch ALL speakers from HubDB API (no filter - shows all featured and non-featured)
            async function fetchSpeakers() {
              try {
                // Clear existing grid content before re-rendering
                if (gridContainer) {
                  gridContainer.innerHTML = '';
                }
                
                // Show loading state
                if (loadingDiv) {
                  loadingDiv.style.display = 'block';
                  loadingDiv.innerHTML = 'Loading speakers...';
                }
                if (errorDiv) {
                  errorDiv.style.display = 'none';
                }
                
                const apiUrl = 'https://api.hubapi.com/cms/v3/hubdb/tables/' + tableId + '/rows?portalId=' + portalId;
                
                const response = await fetch(apiUrl);
                
                if (!response.ok) {
                  throw new Error('Failed to fetch: ' + response.status);
                }
                
                const data = await response.json();
                
                // Transform ALL speakers with topics and gender
                const allSpeakers = (data.results || []).map(function(row) {
                  // Extract topic names from the topic array
                  const topics = (row.values?.topic || []).map(function(topicObj) {
                    return topicObj.name || '';
                  }).filter(function(name) {
                    return name && name.trim() !== '';
                  });

                  // Extract speaker type names from the speaker_type array (multi-value)
                  const speakerTypes = (row.values?.speaker_type || []).map(function(typeObj) {
                    return typeObj.name || '';
                  }).filter(function(name) {
                    return name && name.trim() !== '';
                  });

                  // Extract gender from row.values.gender (can be object with name property)
                  const gender = row.values?.gender?.name || row.values?.gender || '';
                  
                  // Extract featured (can be 1/0 or true/false)
                  const featured = row.values?.featured === 1 || row.values?.featured === true || row.values?.featured === '1';
                  
                  // Extract leader (can be 1/0 or true/false)
                  const leader = row.values?.leader === 1 || row.values?.leader === true || row.values?.leader === '1';
                  
                  // Extract steering_committee (can be 1/0 or true/false)
                  const steeringCommittee = row.values?.steering_committee === 1 || row.values?.steering_committee === true || row.values?.steering_committee === '1';
                  
                  return {
                    speakerName: row.values?.name || '',
                    title: row.values?.title || '',
                    company: row.values?.company || '',
                    image: row.values?.image ? {
                      src: row.values.image.url || '',
                      alt: row.values.image.altText || row.values?.name || 'Speaker'
                    } : null,
                    topics: topics,
                    speakerTypes: speakerTypes,
                    gender: gender.toLowerCase(), // Normalize to lowercase for comparison
                    featured: featured,
                    leader: leader,
                    steeringCommittee: steeringCommittee
                  };
                });
                
                // Apply filter based on editor settings (mutually exclusive)
                let filteredSpeakers = allSpeakers;
                let skipTopicGrouping = false; // Flag to skip topic grouping for special filters
                
                if (showFeaturedFemales) {
                  // If "Show Featured Females" is checked, filter to female AND featured speakers
                  filteredSpeakers = allSpeakers.filter(function(speaker) {
                    return speaker.gender === 'female' && speaker.featured === true;
                  });
                  skipTopicGrouping = true;
                } else if (showFeaturedAll) {
                  // If "Show Featured All" is checked, filter to featured speakers
                  filteredSpeakers = allSpeakers.filter(function(speaker) {
                    return speaker.featured === true;
                  });
                  skipTopicGrouping = true;
                } else if (showRoundtableLeaders) {
                  // If "Show Roundtable Leaders" is checked, filter to leaders only
                  filteredSpeakers = allSpeakers.filter(function(speaker) {
                    return speaker.leader === true;
                  });
                  skipTopicGrouping = true;
                } else if (showSteeringCommittee) {
                  // If "Show Steering Committee" is checked, filter to steering committee members only
                  filteredSpeakers = allSpeakers.filter(function(speaker) {
                    return speaker.steeringCommittee === true;
                  });
                  skipTopicGrouping = true;
                } else if (genderFilter) {
                  // If a specific gender is selected, filter to speakers of that gender only
                  filteredSpeakers = allSpeakers.filter(function(speaker) {
                    return speaker.gender === genderFilter.toLowerCase();
                  });
                  skipTopicGrouping = true;
                }
                // If "Show All Speakers" is checked (or no filter/gender is selected), show all speakers
                
                // Store filtered speakers for search (so search only searches within displayed speakers)
                allSpeakersData = filteredSpeakers;
                
                if (filteredSpeakers.length === 0) {
                  loadingDiv.innerHTML = 'No speakers found';
                  loadingDiv.style.display = 'block';
                  return;
                }
                
                // Hide/show topic filter button based on filter type and hideTopicFilter setting
                const topicFilterBtn = root.querySelector('#topic-filter-btn-${moduleId}');
                if (topicFilterBtn) {
                  if (skipTopicGrouping || hideTopicFilter) {
                    topicFilterBtn.style.display = 'none';
                  } else {
                    topicFilterBtn.style.display = '';
                  }
                }
            
                // Hide/show topic filter button based on filter type and hideSpeakerTypeFilter setting
                const speakerTypeFilterBtn = root.querySelector('#speaker-type-filter-btn-${moduleId}');
                if (speakerTypeFilterBtn) {
                  if (skipTopicGrouping || hideSpeakerTypeFilter) {
                    speakerTypeFilterBtn.style.display = 'none';
                  } else {
                    speakerTypeFilterBtn.style.display = '';
                  }
                }
            
                // Hide/show search button based on hideSearchIcon setting
                const searchBtn = root.querySelector('#speaker-search-btn-${moduleId}');
                if (searchBtn) {
                  if (hideSearchIcon) {
                    searchBtn.style.display = 'none';
                  } else {
                    searchBtn.style.display = '';
                  }
                }
                
                // Hide loading, show speakers
                loadingDiv.style.display = 'none';
                errorDiv.style.display = 'none';
                
                if (skipTopicGrouping) {
                  // Render speakers without topic grouping (for Featured Females and Roundtable Leaders)
                  const speakersGrid = document.createElement('div');
                  speakersGrid.className = 'speakers-grid';
                  
                  filteredSpeakers.forEach(function(speaker) {
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
                  
                  gridContainer.appendChild(speakersGrid);
                } else {
                  // Group speakers by topic and preserve API order (for All Speakers)
                  const topicMap = {};
                  const topicOrder = []; // Track order of topics as they appear in API response
                  
                  filteredSpeakers.forEach(function(speaker) {
                    if (speaker.topics && speaker.topics.length > 0) {
                      speaker.topics.forEach(function(topicName) {
                        if (!topicMap[topicName]) {
                          topicMap[topicName] = [];
                          // Add to order array only when first encountered (preserves API order)
                          topicOrder.push(topicName);
                        }
                        topicMap[topicName].push(speaker);
                      });
                    } else {
                      // Speakers without topics go to "Other" category
                      if (!topicMap['Other']) {
                        topicMap['Other'] = [];
                        topicOrder.push('Other');
                      }
                      topicMap['Other'].push(speaker);
                    }
                  });
                  
                  // Use topics in the order they appeared in API response (no sorting)
                  const sortedTopics = topicOrder;
                  
                  // Populate side panel with topics
                  const panelList = root.querySelector('#topic-filter-list-${moduleId}');
                  if (panelList) {
                    // Add "ALL" option first (set as active by default)
                    const allItem = document.createElement('div');
                    allItem.className = 'topic-filter-panel-item active';
                    allItem.setAttribute('data-topic', 'all');
                    allItem.innerHTML = '<span>ALL</span><span class="topic-count">(' + filteredSpeakers.length + ')</span>';
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
                  
                  // Build speaker type counts and populate the Speaker Type side panel
                  const speakerTypeMap = {};
                  const speakerTypeOrder = [];
                  filteredSpeakers.forEach(function(speaker) {
                    (speaker.speakerTypes || []).forEach(function(typeName) {
                      if (!speakerTypeMap[typeName]) {
                        speakerTypeMap[typeName] = 0;
                        speakerTypeOrder.push(typeName);
                      }
                      speakerTypeMap[typeName]++;
                    });
                  });

                  const speakerTypeList = root.querySelector('#speaker-type-filter-list-${moduleId}');
                  if (speakerTypeList) {
                    // Add "ALL" option first (active by default)
                    const allTypeItem = document.createElement('div');
                    allTypeItem.className = 'topic-filter-panel-item active';
                    allTypeItem.setAttribute('data-speaker-type', 'all');
                    allTypeItem.innerHTML = '<span>ALL</span><span class="topic-count">(' + filteredSpeakers.length + ')</span>';
                    speakerTypeList.appendChild(allTypeItem);

                    speakerTypeOrder.forEach(function(typeName) {
                      const typeItem = document.createElement('div');
                      typeItem.className = 'topic-filter-panel-item';
                      typeItem.setAttribute('data-speaker-type', typeName);
                      typeItem.innerHTML = '<span>' + typeName + '</span><span class="topic-count">(' + speakerTypeMap[typeName] + ')</span>';
                      speakerTypeList.appendChild(typeItem);
                    });
                  }

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
                      speakerCard.setAttribute('data-speaker-type', (speaker.speakerTypes || []).join('|'));

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
                }
                
                // Initialize dropdown functionality
                initTopicFilter();

                // Initialize speaker type filter functionality
                initSpeakerTypeFilter();

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

                  // Remove active class from all items
                  panelItems.forEach(function(i) {
                    i.classList.remove('active');
                  });
                  
                  // Add active class to selected item
                  this.classList.add('active');

                  // Update shared topic state and re-apply combined filters
                  selectedTopic = this.getAttribute('data-topic');
                  applyFilters();

                  // Close panel after selection
                  setTimeout(closePanel, 300);
                });
              });
            }

            // Initialize speaker type filter side panel
            function initSpeakerTypeFilter() {
              const filterBtn = root.querySelector('#speaker-type-filter-btn-${moduleId}');
              const sidePanel = root.querySelector('#speaker-type-filter-panel-${moduleId}');
              const panelOverlay = root.querySelector('#speaker-type-filter-overlay-${moduleId}');
              const panelContent = root.querySelector('#speaker-type-filter-content-${moduleId}');
              const closeBtn = root.querySelector('#speaker-type-filter-close-${moduleId}');
              const panelItems = root.querySelectorAll('#speaker-type-filter-list-${moduleId} .topic-filter-panel-item');

              if (!filterBtn || !sidePanel || !panelOverlay || !panelContent) return;

              // Open side panel on button click
              filterBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                sidePanel.classList.add('active');
                document.body.style.overflow = 'hidden';
              });

              // Close side panel function
              function closePanel() {
                sidePanel.classList.remove('active');
                document.body.style.overflow = '';
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

              // Handle speaker type selection
              panelItems.forEach(function(item) {
                item.addEventListener('click', function(e) {
                  e.stopPropagation();

                  // Remove active class from all items
                  panelItems.forEach(function(i) {
                    i.classList.remove('active');
                  });

                  // Add active class to selected item
                  this.classList.add('active');

                  // Update shared speaker-type state and re-apply combined filters
                  selectedSpeakerType = this.getAttribute('data-speaker-type');
                  applyFilters();

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
                    
                    // Search only in speaker name
                    const matchingSpeakers = allSpeakersData.filter(function(speaker) {
                      const name = (speaker.speakerName || '').toLowerCase();
                      return name.includes(query);
                    });
                    
                    // Display results: rounded small image above name, then name, company, role
                    if (matchingSpeakers.length === 0) {
                      searchResults.innerHTML = '<div class="speaker-search-empty">No speakers found matching "' + query + '"</div>';
                    } else {
                      let resultsHTML = '<div class="speaker-search-results-count">Found ' + matchingSpeakers.length + ' speaker' + (matchingSpeakers.length !== 1 ? 's' : '') + '</div>';
                      resultsHTML += '<div class="speaker-search-results-grid">';
                      
                      matchingSpeakers.forEach(function(speaker) {
                        const imageSrc = speaker.image?.src || '';
                        const imageAlt = speaker.image?.alt || speaker.speakerName || 'Speaker';
                        const imgHTML = imageSrc
                          ? '<div class="speaker-search-result-avatar"><img src="' + imageSrc + '" alt="' + imageAlt + '" /></div>'
                          : '<div class="speaker-search-result-avatar speaker-search-result-avatar-placeholder">No Image</div>';
                        resultsHTML += '<div class="speaker-search-result-card">' +
                          imgHTML +
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
    <BooleanField
      name="showAllSpeakers"
      label="Show All Speakers"
      default={true}
      helpText="Show all speakers grouped by topics. Default: checked"
    />
    <BooleanField
      name="showFeaturedFemales"
      label="Show Featured Females"
      default={false}
      helpText="Show only female speakers who are featured. Speakers will not be grouped by topics."
    />
    <BooleanField
      name="showFeaturedAll"
      label="Show Featured All"
      default={false}
      helpText="Show only speakers who are featured. Speakers will not be grouped by topics."
    />
    <BooleanField
      name="showRoundtableLeaders"
      label="Show Roundtable Leaders"
      default={false}
      helpText="Show only roundtable leaders (speakers with leader: 1). Speakers will not be grouped by topics."
    />
    <BooleanField
      name="showSteeringCommittee"
      label="Show Steering Committee"
      default={false}
      helpText="Show only steering committee members (speakers with steering_committee: 1). Speakers will not be grouped by topics."
    />
    <ChoiceField
      name="genderFilter"
      label="Filter by Gender"
      display="select"
      default=""
      choices={[
        ['', 'None (no gender filter)'],
        ['male', 'Male'],
        ['female', 'Female'],
        ['other', 'Other'],
      ]}
      helpText="By default nothing is selected and no gender filter is applied. Select a gender to show only speakers of that gender. Only applies when 'Show Featured Females', 'Show Featured All', 'Show Roundtable Leaders', and 'Show Steering Committee' are all unchecked. Speakers will not be grouped by topics."
    />
    <BooleanField
      name="hideSearchIcon"
      label="Don't show search icon"
      default={false}
      helpText="Check to hide the search icon button. Default: unchecked (search icon will be shown)."
    />
    <BooleanField
      name="hideTopicFilter"
      label="Don't show topic filter button"
      default={false}
      helpText="Check to hide the topic filter button. Default: unchecked (topic filter button will be shown)."
    />
    <BooleanField
      name="hideSpeakerTypeFilter"
      label="Don't show Speaker type filter button"
      default={false}
      helpText="Check to hide the Speaker type filter button. Default: unchecked (speaker type filter button will be shown)."
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
      helpText="Text displayed on the topic filter button"
    />
    <TextField
      name="speakerTypeFilterButtonText"
      label="Speaker type filter button text"
      default="Filter by Speaker Type"
      helpText="Text displayed on the speaker type filter button"
    />
    <TextField
      name="sectionClass"
      label="Section CSS Class"
      default="speakers-area"
      helpText="Custom CSS class for this section. Default: speakers-area"
    />
  </ModuleFields>
);

export const meta = {
  label: 'All Speakers',
};

