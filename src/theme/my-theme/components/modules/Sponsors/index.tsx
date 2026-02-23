import {
  ModuleFields,
  TextField,
  UrlField,
} from '@hubspot/cms-components/fields';
import { useState, useEffect } from 'react';

export function Component({ fieldValues }) {
  const heading = fieldValues.heading || 'Sponsors';
  // Handle UrlField structure - it can be a string or an object with url/href property
  const getUrl = (urlField) => {
    if (!urlField) return '#';
    if (typeof urlField === 'string') return urlField;
    if (typeof urlField === 'object') {
      return urlField.url || urlField.href || urlField.link || '#';
    }
    return '#';
  };

  // HubDB API configuration
  const portalId = '39650877';
  const tableId = '146535020'; // sponsors table ID
  const sponsorRankTableId = '146800017'; // sponsor_rank table ID (update this with actual table ID)

  // State for HubDB data - initialize as empty, will be populated by script
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch sponsors from HubDB using useEffect (fallback if hooks work)
  useEffect(() => {
    // This will only run if React hooks are supported in HubSpot environment
    const fetchSponsors = async () => {
      try {
        const apiUrl = `https://api.hubapi.com/cms/v3/hubdb/tables/${tableId}/rows?portalId=${portalId}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }

        const data = await response.json();
        const transformedSponsors = (data.results || []).map((row: any) => ({
          image: row.values?.image ? {
            src: row.values.image.url || '',
            alt: row.values.image.altText || 'Sponsor'
          } : null,
        }));

        setSponsors(transformedSponsors);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load');
        setLoading(false);
      }
    };

    fetchSponsors();
  }, []);

  const moduleId = `sponsors-${fieldValues.moduleInstanceId || Math.random().toString(36).slice(2)}`;
  const sectionId = fieldValues.sectionId || 'sponsors';
  const sectionClass = fieldValues.sectionClass || 'speakers-area';

  return (
    <div className={sectionClass} id={sectionId} data-sponsors-id={moduleId}>
      <div className="container">
        <div className="speakers-inner">
          <div className="row justify-content-center align-items-baseline">
            <div className="col-md-12">
              <div className="speakers-text">
                <h2>{heading}</h2>
              </div>
            </div>
          </div>
          {/* Desktop: Chips filter - Full width, centered */}
          <div className="row">
            <div className="col-12">
              <div className="rank-filter-chips-wrapper">
                <div className="rank-filter-chips" id={`rank-filter-chips-${moduleId}`}>
                  {/* Chips will be inserted here by JavaScript */}
                </div>
                {/* Mobile: Dropdown filter */}
                <div className="topic-filter-dropdown rank-filter-dropdown-mobile">
                  <button className="transparent-btn topic-filter-btn" id={`rank-filter-btn-${moduleId}`}>
                    ALL <i className="fa-solid fa-chevron-down"></i>
                  </button>
                  <div className="topic-dropdown-menu" id={`rank-dropdown-${moduleId}`} style={{ display: 'none' }}>
                    <div className="topic-dropdown-item" data-rank="all">ALL</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Sponsors will be loaded via JavaScript script below - Grid layout grouped by rank */}
          <div id={`sponsors-grid-${moduleId}`} className="all-speakers-grid">
            {/* Ranks and sponsors will be inserted here by JavaScript */}
          </div>
          <div id={`sponsor-loading-${moduleId}`} style={{ padding: '40px', textAlign: 'center', color: '#050d51' }}>
            Loading sponsors...
          </div>
          <div id={`sponsor-error-${moduleId}`} style={{ display: 'none', padding: '40px', textAlign: 'center', color: '#d32f2f' }}>
            Error loading sponsors
          </div>
        </div>
      </div>

      {/* Fetch ALL sponsors and display in grid grouped by rank */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
          (function() {
            const root = document.querySelector('[data-sponsors-id="${moduleId}"]');
            if (!root) return;
            
            const portalId = '${portalId}';
            const tableId = '${tableId}';
            const sponsorRankTableId = '${sponsorRankTableId}';
            const moduleId = '${moduleId}';
            const gridContainer = root.querySelector('#sponsors-grid-${moduleId}');
            const loadingDiv = root.querySelector('#sponsor-loading-${moduleId}');
            const errorDiv = root.querySelector('#sponsor-error-${moduleId}');
            
            // Fetch ALL sponsors from HubDB API
            async function fetchSponsors() {
              try {
                // Step 1: Fetch sponsors
                const sponsorsApiUrl = 'https://api.hubapi.com/cms/v3/hubdb/tables/' + tableId + '/rows?portalId=' + portalId;
                const sponsorsResponse = await fetch(sponsorsApiUrl);
                
                if (!sponsorsResponse.ok) {
                  throw new Error('Failed to fetch sponsors: ' + sponsorsResponse.status);
                }
                
                const sponsorsData = await sponsorsResponse.json();
                
                // Step 2: Fetch sponsor ranks to get order field
                const ranksApiUrl = 'https://api.hubapi.com/cms/v3/hubdb/tables/' + sponsorRankTableId + '/rows?portalId=' + portalId;
                const ranksResponse = await fetch(ranksApiUrl);
                
                if (!ranksResponse.ok) {
                  throw new Error('Failed to fetch sponsor ranks: ' + ranksResponse.status);
                }
                
                const ranksData = await ranksResponse.json();
                
                // Step 3: Create a map of rank ID to rank data (including order)
                const rankById = {};
                (ranksData.results || []).forEach(function(rankRow) {
                  if (rankRow.id) {
                    rankById[rankRow.id] = {
                      name: rankRow.values?.name || rankRow.name || '',
                      order: rankRow.values?.order !== undefined && rankRow.values?.order !== null ? parseFloat(rankRow.values.order) : null
                    };
                  }
                });
                
                // Step 4: Transform sponsors and attach order from rank table.
                // If a sponsor has no sponsor_rank assigned, treat it as "Others" and show in Others category.
                // Only sponsors that have a sponsor rank set (or assigned Others) are shown.
                const RANK_OTHERS = 'Others';
                const allSponsorsRaw = (sponsorsData.results || []).map(function(row) {
                  const ranks = (row.values?.sponsor_rank || []).map(function(rankRef) {
                    const rankId = rankRef.id;
                    const rankData = rankById[rankId] || null;
                    if (rankData && rankData.name) {
                      return { name: rankData.name, order: rankData.order };
                    }
                    return { name: rankRef.name || '', order: null };
                  }).filter(function(rank) {
                    return rank.name && rank.name.trim() !== '';
                  });
                  const effectiveRanks = ranks.length > 0 ? ranks : [{ name: RANK_OTHERS, order: null }];
                  return {
                    image: row.values?.image ? {
                      src: row.values.image.url || '',
                      alt: row.values.image.altText || 'Sponsor'
                    } : null,
                    ranks: effectiveRanks,
                    link: row.values?.link || ''
                  };
                });
                
                // Only show sponsors that have a sponsor rank set (we've assigned "Others" to the rest, so all have a rank)
                const allSponsors = allSponsorsRaw.filter(function(sponsor) {
                  return sponsor.ranks && sponsor.ranks.length > 0;
                });
                
                if (allSponsors.length === 0) {
                  loadingDiv.innerHTML = 'No sponsors found';
                  loadingDiv.style.display = 'block';
                  return;
                }
                
                const rankMap = {};
                const rankOrderMap = {};
                allSponsors.forEach(function(sponsor) {
                  sponsor.ranks.forEach(function(rankObj) {
                    const rankName = rankObj.name;
                    if (!rankMap[rankName]) {
                      rankMap[rankName] = [];
                      if (rankObj.order !== null && rankObj.order !== undefined) {
                        rankOrderMap[rankName] = rankObj.order;
                      }
                    }
                    rankMap[rankName].push(sponsor);
                  });
                });
                
                // Sort ranks by order (ascending - lowest first), then alphabetically for ties or missing orders
                const sortedRanks = Object.keys(rankMap).sort(function(a, b) {
                  const orderA = rankOrderMap[a] !== undefined ? rankOrderMap[a] : null;
                  const orderB = rankOrderMap[b] !== undefined ? rankOrderMap[b] : null;
                  
                  // If both have orders, sort by order (ascending)
                  if (orderA !== null && orderB !== null) {
                    return orderA - orderB;
                  }
                  
                  // If only A has order, A comes first
                  if (orderA !== null && orderB === null) {
                    return -1;
                  }
                  
                  // If only B has order, B comes first
                  if (orderA === null && orderB !== null) {
                    return 1;
                  }
                  
                  // If neither has order, sort alphabetically
                  return a.localeCompare(b);
                });
                
                // Populate dropdown with ranks (for mobile)
                const dropdownMenu = root.querySelector('#rank-dropdown-${moduleId}');
                if (dropdownMenu) {
                  sortedRanks.forEach(function(rankName) {
                    const dropdownItem = document.createElement('div');
                    dropdownItem.className = 'topic-dropdown-item';
                    dropdownItem.setAttribute('data-rank', rankName);
                    dropdownItem.textContent = rankName;
                    dropdownMenu.appendChild(dropdownItem);
                  });
                }
                
                // Populate chips with ranks (for desktop)
                const chipsContainer = root.querySelector('#rank-filter-chips-${moduleId}');
                if (chipsContainer) {
                  // Add "ALL" chip
                  const allChip = document.createElement('button');
                  allChip.className = 'rank-filter-chip active';
                  allChip.setAttribute('data-rank', 'all');
                  allChip.textContent = 'ALL';
                  chipsContainer.appendChild(allChip);
                  
                  // Add rank chips
                  sortedRanks.forEach(function(rankName) {
                    const chip = document.createElement('button');
                    chip.className = 'rank-filter-chip';
                    chip.setAttribute('data-rank', rankName);
                    chip.textContent = rankName;
                    chipsContainer.appendChild(chip);
                  });
                }
                
                // Hide loading, show sponsors
                loadingDiv.style.display = 'none';
                errorDiv.style.display = 'none';
                
                // Render ranks and sponsors in grid layout
                sortedRanks.forEach(function(rankName) {
                  const rankSection = document.createElement('div');
                  rankSection.className = 'topic-section';
                  rankSection.setAttribute('data-rank', rankName);
                  
                  const rankHeading = document.createElement('h3');
                  rankHeading.className = 'topic-heading';
                  rankHeading.textContent = rankName;
                  rankSection.appendChild(rankHeading);
                  
                  const sponsorsGrid = document.createElement('div');
                  sponsorsGrid.className = 'sponsors-grid';
                  
                  const sponsors = rankMap[rankName];
                  sponsors.forEach(function(sponsor) {
                    const imageSrc = sponsor.image?.src || '';
                    const imageAlt = sponsor.image?.alt || 'Sponsor';
                    const imageUrl = sponsor.link || '';
                    
                    const cardContent = imageSrc ? 
                      '<img src="' + imageSrc + '" alt="' + imageAlt + '" />' :
                      '<div style="width: 200px; height: 150px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #999; margin: 0 auto;">No Image</div>';

                    if (imageUrl) {
                      const anchor = document.createElement('a');
                      anchor.href = imageUrl;
                      anchor.target = '_blank';
                      anchor.style.textDecoration = 'none';
                      anchor.style.display = 'block';
                      anchor.innerHTML = '<div class="sponsor-card">' + cardContent + '</div>';
                      sponsorsGrid.appendChild(anchor);
                    } else {
                      const sponsorCard = document.createElement('div');
                      sponsorCard.className = 'sponsor-card';
                      sponsorCard.innerHTML = cardContent;
                      sponsorsGrid.appendChild(sponsorCard);
                    }
                  });
                  
                  rankSection.appendChild(sponsorsGrid);
                  gridContainer.appendChild(rankSection);
                });
                
                // Initialize dropdown functionality
                initRankFilter();
                
              } catch (err) {
                loadingDiv.style.display = 'none';
                errorDiv.style.display = 'block';
                errorDiv.innerHTML = 'Error: ' + (err.message || 'Failed to load sponsors');
              }
            }
            
            // Start fetching sponsors
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', function() {
                setTimeout(fetchSponsors, 100);
              });
            } else {
              setTimeout(fetchSponsors, 100);
            }

            // Filter function - shared by both chips and dropdown
            function filterByRank(selectedRank) {
              const rankSections = root.querySelectorAll('.topic-section[data-rank]');
              
              // Filter rank sections
              rankSections.forEach(function(section) {
                const sectionRank = section.getAttribute('data-rank');
                if (selectedRank === 'all' || sectionRank === selectedRank) {
                  section.style.display = 'block';
                } else {
                  section.style.display = 'none';
                }
              });
            }
            
            // Initialize rank filter (chips for desktop, dropdown for mobile)
            function initRankFilter() {
              const filterBtn = root.querySelector('#rank-filter-btn-${moduleId}');
              const dropdownMenu = root.querySelector('#rank-dropdown-${moduleId}');
              const dropdownItems = root.querySelectorAll('#rank-dropdown-${moduleId} .topic-dropdown-item');
              const rankChips = root.querySelectorAll('#rank-filter-chips-${moduleId} .rank-filter-chip');
              
              // Desktop: Handle chip clicks
              rankChips.forEach(function(chip) {
                chip.addEventListener('click', function(e) {
                  e.preventDefault();
                  const selectedRank = this.getAttribute('data-rank');
                  
                  // Update active chip
                  rankChips.forEach(function(c) {
                    c.classList.remove('active');
                  });
                  this.classList.add('active');
                  
                  // Filter sections
                  filterByRank(selectedRank);
                });
              });
              
              // Mobile: Handle dropdown
              if (filterBtn && dropdownMenu) {
                // Toggle dropdown on button click
                filterBtn.addEventListener('click', function(e) {
                  e.stopPropagation();
                  const isOpen = dropdownMenu.style.display === 'block';
                  dropdownMenu.style.display = isOpen ? 'none' : 'block';
                });
                
                // Close dropdown when clicking outside
                document.addEventListener('click', function(e) {
                  if (!filterBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                    dropdownMenu.style.display = 'none';
                  }
                });
                
                // Handle rank selection from dropdown
                dropdownItems.forEach(function(item) {
                  item.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const selectedRank = this.getAttribute('data-rank');
                    
                    // Update button text
                    const displayText = selectedRank === 'all' ? 'ALL' : selectedRank;
                    filterBtn.innerHTML = displayText + ' <i class="fa-solid fa-chevron-down"></i>';
                    
                    // Filter sections
                    filterByRank(selectedRank);
                    
                    // Close dropdown
                    dropdownMenu.style.display = 'none';
                  });
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
      default="Sponsors"
    />
    <TextField
      name="sectionId"
      label="Section ID"
      default="sponsors"
      helpText="ID for anchor links (e.g., #sponsors). Leave empty for no ID."
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
  label: 'Sponsors',
};

