import {
  ModuleFields,
  TextField,
} from '@hubspot/cms-components/fields';

export function Component({ fieldValues }) {
  const heading = fieldValues.heading || 'All Sessions';
  const sectionId = fieldValues.sectionId || 'all-sessions';
  const sectionClass = fieldValues.sectionClass || 'sessions-area';

  const moduleId = `all-sessions-${fieldValues.moduleInstanceId || Math.random().toString(36).slice(2)}`;

  return (
    <>
      <div className={sectionClass} id={sectionId} data-sessions-id={moduleId}>
        <div className="container">
          <div className="sessions-inner">
            <div className="row justify-content-center align-items-baseline">
              <div className="col-md-12">
                <div className="speakers-text sessions-header-row">
                  <h2>{heading}</h2>
                  <div className="sessions-view-toggle">
                    <button className="sessions-view-chip active" id={`grid-view-btn-${moduleId}`} data-view="grid">
                      Grid View
                    </button>
                    <button className="sessions-view-chip" id={`calendar-view-btn-${moduleId}`} data-view="calendar">
                      Calendar
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="sessions-filters-row" id={`sessions-filters-row-${moduleId}`} style={{ display: 'none' }}>
              <div className="sessions-date-filter" id={`sessions-date-filter-${moduleId}`}>
                <select id={`date-select-${moduleId}`} className="sessions-date-select">
                  {/* Options will be populated by JavaScript */}
                </select>
              </div>
              <div className="sessions-time-filter" id={`sessions-time-filter-${moduleId}`}>
                <div className="sessions-time-slider-container">
                  <span className="sessions-time-slider-label" id={`time-start-label-${moduleId}`}>9:00am</span>
                  <div className="sessions-time-slider-wrapper">
                    <div className="sessions-time-slider-track" id={`time-slider-track-${moduleId}`}>
                      <div className="sessions-time-slider-range" id={`time-slider-range-${moduleId}`}></div>
                      <div className="sessions-time-slider-handle sessions-time-slider-handle-min" id={`time-slider-handle-min-${moduleId}`}></div>
                      <div className="sessions-time-slider-handle sessions-time-slider-handle-max" id={`time-slider-handle-max-${moduleId}`}></div>
                    </div>
                  </div>
                  <span className="sessions-time-slider-label" id={`time-end-label-${moduleId}`}>6:00pm</span>
                </div>
              </div>
              <div className="sessions-actions-wrapper">
                <button className="transparent-btn topic-filter-btn" id={`session-topic-filter-btn-${moduleId}`}>
                  Filter by Topic <i className="fa-solid fa-filter"></i>
                </button>
                <button className="transparent-btn speaker-search-btn" id={`session-search-btn-${moduleId}`}>
                  <i className="fa-solid fa-search"></i>
                </button>
              </div>
            </div>
            <div className="sessions-schedule-container" id={`sessions-schedule-${moduleId}`}>
              <div className="sessions-loading" id={`sessions-loading-${moduleId}`}>
                Loading sessions...
              </div>
              <div className="sessions-error" id={`sessions-error-${moduleId}`} style={{ display: 'none' }}>
                Error loading sessions. Please try again later.
              </div>
              <div className="sessions-table-wrapper" id={`sessions-table-wrapper-${moduleId}`} style={{ display: 'none' }}>
                {/* Schedule table will be inserted here by JavaScript */}
              </div>
              <div className="sessions-grid-wrapper" id={`sessions-grid-wrapper-${moduleId}`} style={{ display: 'none' }}>
                {/* Grid view cards will be inserted here by JavaScript */}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <script
        dangerouslySetInnerHTML={{
          __html: `
          (function() {
            const moduleId = '${moduleId}';
            const root = document.querySelector('[data-sessions-id="' + moduleId + '"]');
            if (!root) return;
            
            const portalId = '39650877';
            const tableId = '148056649'; // sessions table ID
            const speakersTableId = '146265866'; // speakers table ID
            const loadingDiv = root.querySelector('#sessions-loading-' + moduleId);
            const errorDiv = root.querySelector('#sessions-error-' + moduleId);
            const tableWrapper = root.querySelector('#sessions-table-wrapper-' + moduleId);
            const gridWrapper = root.querySelector('#sessions-grid-wrapper-' + moduleId);
            const filtersRowDiv = root.querySelector('#sessions-filters-row-' + moduleId);
            const dateFilterDiv = root.querySelector('#sessions-date-filter-' + moduleId);
            const dateSelect = root.querySelector('#date-select-' + moduleId);
            const timeFilterDiv = root.querySelector('#sessions-time-filter-' + moduleId);
            const timeSliderTrack = root.querySelector('#time-slider-track-' + moduleId);
            const timeSliderRange = root.querySelector('#time-slider-range-' + moduleId);
            const timeHandleMin = root.querySelector('#time-slider-handle-min-' + moduleId);
            const timeHandleMax = root.querySelector('#time-slider-handle-max-' + moduleId);
            const timeStartLabel = root.querySelector('#time-start-label-' + moduleId);
            const timeEndLabel = root.querySelector('#time-end-label-' + moduleId);
            const gridViewBtn = root.querySelector('#grid-view-btn-' + moduleId);
            const calendarViewBtn = root.querySelector('#calendar-view-btn-' + moduleId);
            
            // Current view state
            let currentView = 'grid'; // Default to grid view
            
            // Time range filter state
            let minTimeOfDay = null; // Minimum time for selected day (in minutes from start of day)
            let maxTimeOfDay = null; // Maximum time for selected day (in minutes from start of day)
            let selectedMinTime = null; // Selected start time (in minutes from start of day)
            let selectedMaxTime = null; // Selected end time (in minutes from start of day)
            
            // Store all sessions for filtering
            let allSessions = [];
            let uniqueDates = [];
            let isInitialLoad = true; // Track if this is the first load
            let selectedDateToPreserve = null; // Store selected date to preserve on re-render
            let allSpeakersData = {}; // Store speakers by ID for quick lookup
            let allSessionsData = []; // Store all sessions for search functionality
            let selectedTopic = 'all'; // Store selected topic filter
            let searchQuery = ''; // Store search query
            
            // Helper function to format date and time for grid view: "Wed • Sep 3 • 9:30am - 10:30am"
            function formatDateTimeRange(startTime, endTime) {
              const startDate = new Date(startTime);
              const endDate = new Date(endTime);
              
              // Format date part: "Wed • Sep 3"
              const dateStr = startDate.toLocaleDateString("en-US", {
                timeZone: "UTC",
                weekday: "short",
                month: "short",
                day: "numeric"
              }).replace(",", "");
              
              // Format time part: "9:30am - 10:30am" (PST)
              const startPST = getPSTTime(startTime);
              const endPST = getPSTTime(endTime);
              
              const startHours = startPST.hours;
              const startMinutes = startPST.minutes;
              const endHours = endPST.hours;
              const endMinutes = endPST.minutes;
              
              const startAmpm = startHours >= 12 ? 'pm' : 'am';
              const endAmpm = endHours >= 12 ? 'pm' : 'am';
              const startDisplayHours = startHours % 12 || 12;
              const endDisplayHours = endHours % 12 || 12;
              
              const startTimeStr = startDisplayHours + ':' + (startMinutes < 10 ? '0' + startMinutes : startMinutes) + startAmpm;
              const endTimeStr = endDisplayHours + ':' + (endMinutes < 10 ? '0' + endMinutes : endMinutes) + endAmpm;
              
              return dateStr + ' • ' + startTimeStr + ' - ' + endTimeStr;
            }
            
            // Fetch speakers data
            async function fetchSpeakers() {
              try {
                const apiUrl = 'https://api.hubapi.com/cms/v3/hubdb/tables/' + speakersTableId + '/rows?portalId=' + portalId;
                const response = await fetch(apiUrl);
                
                if (!response.ok) {
                  console.warn('Failed to fetch speakers:', response.status);
                  return {}; // Return empty object if fetch fails
                }
                
                const data = await response.json();
                const speakersMap = {};
                
                (data.results || []).forEach(function(row) {
                  const speakerId = row.id;
                  const topics = (row.values?.topic || []).map(function(topicObj) {
                    return topicObj.name || '';
                  }).filter(function(name) {
                    return name && name.trim() !== '';
                  });
                  
                  speakersMap[speakerId] = {
                    id: speakerId,
                    name: row.values?.name || '',
                    title: row.values?.title || '',
                    company: row.values?.company || '',
                    image: row.values?.image ? {
                      src: row.values.image.url || '',
                      alt: row.values.image.altText || row.values?.name || 'Speaker'
                    } : null,
                    topics: topics,
                    description: row.values?.description || '',
                    linkedin_profile: row.values?.linkedin_profile || '',
                    portfolio_site: row.values?.portfolio_site || ''
                  };
                });
                
                return speakersMap;
              } catch (err) {
                console.warn('Error fetching speakers:', err);
                return {}; // Return empty object on error
              }
            }
            
            // Helper function to format date from timestamp (UTC)
            function formatDate(timestamp) {
              const ts = parseInt(timestamp, 10);
              if (isNaN(ts) || ts === 0) return '';
              const dateStr = new Date(ts).toLocaleDateString("en-US", {
                timeZone: "UTC",
                weekday: "short",
                month: "short",
                day: "numeric"
              });
              return dateStr.replace(",", " -");
            }
            
            // Helper function to normalize timestamp to midnight UTC for date comparison
            function normalizeToMidnightUTC(timestamp) {
              const date = new Date(timestamp);
              return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
            }
            
            // Helper function to get minutes from start of day (PST) for a timestamp
            function getMinutesFromStartOfDayPST(timestamp) {
              const pstTime = getPSTTime(timestamp);
              return pstTime.hours * 60 + pstTime.minutes;
            }
            
            // Helper function to format minutes to time string (e.g., 540 minutes = "9:00am")
            function formatMinutesToTime(minutes) {
              const hours = Math.floor(minutes / 60);
              const mins = minutes % 60;
              const ampm = hours >= 12 ? 'pm' : 'am';
              const displayHours = hours % 12 || 12;
              return displayHours + ':' + (mins < 10 ? '0' + mins : mins) + ampm;
            }
            
            // Helper function to get date timestamp from session (for comparison)
            function getDateTimestamp(session) {
              // Get the date from the session's date field
              if (session.date) {
                // If date is an array, get the first element
                if (Array.isArray(session.date) && session.date.length > 0) {
                  // Check if it's an object with a 'name' property (from API) or just a value (stored format)
                  const dateValue = (typeof session.date[0] === 'object' && session.date[0].name) 
                    ? session.date[0].name 
                    : session.date[0];
                  const ts = parseInt(dateValue, 10);
                  if (!isNaN(ts) && ts > 0) {
                    // Normalize to midnight UTC for proper date comparison
                    return normalizeToMidnightUTC(ts);
                  }
                } else if (typeof session.date === 'string' || typeof session.date === 'number') {
                  const ts = parseInt(session.date, 10);
                  if (!isNaN(ts) && ts > 0) {
                    return normalizeToMidnightUTC(ts);
                  }
                }
              }
              // Fallback: use start_time to determine date (in UTC)
              return normalizeToMidnightUTC(session.start_time);
            }
            
            // Helper function to get PST hours and minutes from timestamp
            function getPSTTime(timestamp) {
              const date = new Date(timestamp);
              // Use Intl.DateTimeFormat to get PST time parts
              const formatter = new Intl.DateTimeFormat("en-US", {
                timeZone: "UTC",
                hour: "numeric",
                minute: "2-digit",
                hour12: false
              });
              const parts = formatter.formatToParts(date);
              const hours = parseInt(parts.find(p => p.type === 'hour').value, 10);
              const minutes = parseInt(parts.find(p => p.type === 'minute').value, 10);
              return {
                hours: hours,
                minutes: minutes
              };
            }
            
            // Helper function to format time from milliseconds timestamp (PST)
            function formatTime(timestamp) {
              const pstTime = getPSTTime(timestamp);
              const hours = pstTime.hours;
              const minutes = pstTime.minutes;
              const ampm = hours >= 12 ? 'pm' : 'am';
              const displayHours = hours % 12 || 12;
              return displayHours + ':' + (minutes < 10 ? '0' + minutes : minutes) + ampm;
            }
            
            // Helper function to get time in minutes from start of day (PST)
            function getMinutesFromStartOfDay(timestamp) {
              const pstTime = getPSTTime(timestamp);
              return pstTime.hours * 60 + pstTime.minutes;
            }
            
            // Helper function to get minutes from start of day (PST) for a timestamp (alias for consistency)
            function getMinutesFromStartOfDayPST(timestamp) {
              return getMinutesFromStartOfDay(timestamp);
            }
            
            // Helper function to format minutes to time string (e.g., 540 minutes = "9:00am")
            function formatMinutesToTime(minutes) {
              const hours = Math.floor(minutes / 60);
              const mins = minutes % 60;
              const ampm = hours >= 12 ? 'pm' : 'am';
              const displayHours = hours % 12 || 12;
              return displayHours + ':' + (mins < 10 ? '0' + mins : mins) + ampm;
            }
            
            // Initialize time slider
            function initializeTimeSlider(sessions) {
              if (!sessions || sessions.length === 0) {
                if (timeFilterDiv) {
                  timeFilterDiv.style.display = 'none';
                }
                return;
              }
              
              // Calculate min and max times for the day (in minutes from start of day, PST)
              const times = sessions.map(function(session) {
                return {
                  start: getMinutesFromStartOfDayPST(session.start_time),
                  end: getMinutesFromStartOfDayPST(session.end_time)
                };
              });
              
              minTimeOfDay = Math.min.apply(null, times.map(function(t) { return t.start; }));
              maxTimeOfDay = Math.max.apply(null, times.map(function(t) { return t.end; }));
              
              // Round down to nearest hour for min, round up to nearest hour for max
              minTimeOfDay = Math.floor(minTimeOfDay / 60) * 60;
              maxTimeOfDay = Math.ceil(maxTimeOfDay / 60) * 60;
              
              // Set initial selected range to full range (only if not already set)
              if (selectedMinTime === null || selectedMinTime < minTimeOfDay) {
                selectedMinTime = minTimeOfDay;
              }
              if (selectedMaxTime === null || selectedMaxTime > maxTimeOfDay) {
                selectedMaxTime = maxTimeOfDay;
              }
              
              // Ensure selected times are within bounds
              selectedMinTime = Math.max(minTimeOfDay, Math.min(selectedMinTime, maxTimeOfDay));
              selectedMaxTime = Math.max(minTimeOfDay, Math.min(selectedMaxTime, maxTimeOfDay));
              
              // Update slider (this will also update labels)
              updateTimeSlider();
            }
            
            // Update time slider visual position and labels
            function updateTimeSlider() {
              if (!timeSliderTrack || !timeHandleMin || !timeHandleMax || !timeSliderRange) return;
              if (minTimeOfDay === null || maxTimeOfDay === null) return;
              if (selectedMinTime === null || selectedMaxTime === null) return;
              
              const totalRange = maxTimeOfDay - minTimeOfDay;
              if (totalRange === 0) return;
              
              const minPercent = ((selectedMinTime - minTimeOfDay) / totalRange) * 100;
              const maxPercent = ((selectedMaxTime - minTimeOfDay) / totalRange) * 100;
              
              // Update handle positions
              timeHandleMin.style.left = minPercent + '%';
              timeHandleMax.style.left = maxPercent + '%';
              
              // Update range line
              timeSliderRange.style.left = minPercent + '%';
              timeSliderRange.style.width = (maxPercent - minPercent) + '%';
              
              // Update labels to show selected times (not min/max of day)
              if (timeStartLabel) {
                timeStartLabel.textContent = formatMinutesToTime(selectedMinTime);
              }
              if (timeEndLabel) {
                timeEndLabel.textContent = formatMinutesToTime(selectedMaxTime);
              }
            }
            
            // Setup time slider event listeners
            function setupTimeSlider() {
              if (!timeSliderTrack || !timeHandleMin || !timeHandleMax) return;
              
              let isDraggingMin = false;
              let isDraggingMax = false;
              
              // Helper to get position from mouse/touch event
              function getPositionFromEvent(e) {
                const rect = timeSliderTrack.getBoundingClientRect();
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const percent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
                return percent;
              }
              
              // Helper to convert percent to minutes
              function percentToMinutes(percent) {
                if (minTimeOfDay === null || maxTimeOfDay === null) return 0;
                const totalRange = maxTimeOfDay - minTimeOfDay;
                return minTimeOfDay + (percent / 100) * totalRange;
              }
              
              // Helper to snap to nearest 15 minutes
              function snapToQuarterHour(minutes) {
                return Math.round(minutes / 15) * 15;
              }
              
              // Mouse down handlers
              timeHandleMin.addEventListener('mousedown', function(e) {
                e.preventDefault();
                isDraggingMin = true;
              });
              
              timeHandleMax.addEventListener('mousedown', function(e) {
                e.preventDefault();
                isDraggingMax = true;
              });
              
              // Touch start handlers
              timeHandleMin.addEventListener('touchstart', function(e) {
                e.preventDefault();
                isDraggingMin = true;
              });
              
              timeHandleMax.addEventListener('touchstart', function(e) {
                e.preventDefault();
                isDraggingMax = true;
              });
              
              // Mouse move handler
              function handleMove(e) {
                if (!isDraggingMin && !isDraggingMax) return;
                
                const percent = getPositionFromEvent(e);
                const minutes = snapToQuarterHour(percentToMinutes(percent));
                
                if (isDraggingMin) {
                  // Ensure min doesn't exceed max
                  if (selectedMaxTime !== null && minutes >= selectedMaxTime) {
                    selectedMinTime = Math.max(minTimeOfDay, selectedMaxTime - 15);
                  } else {
                    selectedMinTime = Math.max(minTimeOfDay, minutes);
                  }
                  // Update slider and labels immediately (smooth update)
                  updateTimeSlider();
                  // Only re-render table on mouse up to avoid performance issues
                } else if (isDraggingMax) {
                  // Ensure max doesn't go below min
                  if (selectedMinTime !== null && minutes <= selectedMinTime) {
                    selectedMaxTime = Math.min(maxTimeOfDay, selectedMinTime + 15);
                  } else {
                    selectedMaxTime = Math.min(maxTimeOfDay, minutes);
                  }
                  // Update slider and labels immediately (smooth update)
                  updateTimeSlider();
                  // Only re-render table on mouse up to avoid performance issues
                }
              }
              
              // Mouse up handler - re-render table when dragging ends
              function handleEnd() {
                if (isDraggingMin || isDraggingMax) {
                  // Re-render table when drag ends
                  renderTable();
                }
                isDraggingMin = false;
                isDraggingMax = false;
              }
              
              // Use requestAnimationFrame for smooth updates during drag
              let rafId = null;
              function smoothHandleMove(e) {
                if (rafId) {
                  cancelAnimationFrame(rafId);
                }
                rafId = requestAnimationFrame(function() {
                  handleMove(e);
                });
              }
              
              document.addEventListener('mousemove', smoothHandleMove);
              document.addEventListener('mouseup', handleEnd);
              document.addEventListener('touchmove', smoothHandleMove, { passive: false });
              document.addEventListener('touchend', handleEnd);
            }
            
            // Helper function to find UTC timestamp for a specific PST hour/minute on a given date
            function findUTCTimestampForPST(baseTimestamp, targetPSTHour, targetPSTMinute) {
              // Get the PST date string for the base timestamp
              const baseDate = new Date(baseTimestamp);
              const pstDateStr = baseDate.toLocaleString("en-US", { 
                timeZone: "America/Los_Angeles",
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              });
              
              // Create a date string in PST format with target hour/minute
              const targetTimeStr = String(targetPSTHour).padStart(2, '0') + ':' + String(targetPSTMinute).padStart(2, '0') + ':00';
              const targetPSTString = pstDateStr + ', ' + targetTimeStr;
              
              // Parse as if it's local time, then adjust
              // We'll use a binary search approach: try different UTC timestamps until PST matches
              const dateParts = pstDateStr.split('/');
              const year = parseInt(dateParts[2], 10);
              const month = parseInt(dateParts[0], 10) - 1; // JS months are 0-indexed
              const day = parseInt(dateParts[1], 10);
              
              // Create a date object assuming it's in PST (we'll adjust)
              // PST is UTC-8 (or UTC-7 during DST), so we need to find the right UTC time
              // Start with an estimate: PST time + 8 hours (approximate)
              let estimate = new Date(Date.UTC(year, month, day, targetPSTHour + 8, targetPSTMinute, 0));
              
              // Refine by checking actual PST time and adjusting
              for (let i = 0; i < 5; i++) {
                const checkPST = getPSTTime(estimate.getTime());
                if (checkPST.hours === targetPSTHour && checkPST.minutes === targetPSTMinute) {
                  return estimate;
                }
                // Adjust: if PST is ahead, subtract time; if behind, add time
                const diffHours = checkPST.hours - targetPSTHour;
                const diffMinutes = checkPST.minutes - targetPSTMinute;
                const totalDiffMinutes = diffHours * 60 + diffMinutes;
                estimate = new Date(estimate.getTime() - totalDiffMinutes * 60 * 1000);
              }
              
              return estimate;
            }
            
            // Generate time slots (whole hours + 15-minute intervals) in PST
            function generateTimeSlots(minTime, maxTime) {
              const slots = [];
              
              // Get PST times for min and max
              const minPST = getPSTTime(minTime);
              const maxPST = getPSTTime(maxTime);
              
              // Round down to nearest hour for start (in PST)
              const startHour = minPST.hours;
              
              // Round up to nearest hour for end (in PST)
              const endHour = maxPST.minutes > 0 ? maxPST.hours + 1 : maxPST.hours;
              
              // Find the UTC timestamp for the start hour in PST
              let currentSlot = findUTCTimestampForPST(minTime, startHour, 0);
              
              // Generate slots: iterate and check PST time
              while (true) {
                const slotPST = getPSTTime(currentSlot.getTime());
                
                // Stop if we've passed the end hour
                if (slotPST.hours > endHour || (slotPST.hours === endHour && slotPST.minutes > 0)) {
                  break;
                }
                
                slots.push(new Date(currentSlot));
                currentSlot = new Date(currentSlot.getTime() + 15 * 60 * 1000); // Add 15 minutes
              }
              
              return slots;
            }
            
            // Calculate position and height for session box (using PST)
            function calculateSessionPosition(session, timeSlots, slotHeight) {
              // Get PST times for session start and end
              const startPST = getPSTTime(session.start_time);
              const endPST = getPSTTime(session.end_time);
              
              const startMinutes = startPST.hours * 60 + startPST.minutes;
              const endMinutes = endPST.hours * 60 + endPST.minutes;
              const duration = endMinutes - startMinutes;
              
              // Find the slot index for start time - find the slot that is at or just before start time
              let startSlotIndex = 0;
              for (let i = 0; i < timeSlots.length; i++) {
                const slotPST = getPSTTime(timeSlots[i].getTime());
                const slotMinutes = slotPST.hours * 60 + slotPST.minutes;
                if (slotMinutes <= startMinutes) {
                  startSlotIndex = i;
                } else {
                  break;
                }
              }
              
              // Get the start slot's time in PST
              const startSlotPST = getPSTTime(timeSlots[startSlotIndex].getTime());
              const startSlotMinutes = startSlotPST.hours * 60 + startSlotPST.minutes;
              
              // Calculate offset within the start slot's row (0, 15, 30, or 45 minutes into the 120px row)
              // This is the difference between the session start time and the slot's start time
              const offsetInRow = startMinutes - startSlotMinutes;
              const top = (offsetInRow / 15) * slotHeight;
              
              // Calculate height in pixels based on duration
              const height = (duration / 15) * slotHeight;
              
              return {
                top: top,
                height: height,
                startSlotIndex: startSlotIndex
              };
            }
            
            // Render grid view
            function renderGridView(sessions) {
              // Clear grid wrapper
              gridWrapper.innerHTML = '';
              
              // Sort sessions by start time (minimum time first)
              const sortedSessions = sessions.slice().sort(function(a, b) {
                return a.start_time - b.start_time;
              });
              
              // Create grid container
              const gridContainer = document.createElement('div');
              gridContainer.className = 'sessions-grid-container';
              
              sortedSessions.forEach(function(session) {
                const card = document.createElement('div');
                card.className = 'sessions-grid-card';
                
                // Date and time
                const dateTimeDiv = document.createElement('div');
                dateTimeDiv.className = 'sessions-card-datetime';
                dateTimeDiv.textContent = formatDateTimeRange(session.start_time, session.end_time);
                card.appendChild(dateTimeDiv);
                
                // Session title
                const titleDiv = document.createElement('div');
                titleDiv.className = 'sessions-card-title';
                titleDiv.textContent = session.title;
                card.appendChild(titleDiv);
                
                // Speaker images and names
                if (session.speakerIds && session.speakerIds.length > 0) {
                  const speakersDiv = document.createElement('div');
                  speakersDiv.className = 'sessions-card-speakers';
                  
                  // Speaker images
                  const imagesDiv = document.createElement('div');
                  imagesDiv.className = 'sessions-card-speaker-images';
                  
                  const speakerNames = [];
                  const speakerTopics = [];
                  
                  session.speakerIds.forEach(function(speakerId) {
                    const speaker = allSpeakersData[speakerId];
                    if (speaker) {
                      // Add image
                      if (speaker.image && speaker.image.src) {
                        const img = document.createElement('img');
                        img.src = speaker.image.src;
                        img.alt = speaker.image.alt || speaker.name;
                        img.className = 'sessions-card-speaker-image';
                        imagesDiv.appendChild(img);
                      }
                      
                      // Collect names and topics
                      if (speaker.name) {
                        speakerNames.push(speaker.name);
                      }
                      if (speaker.topics && speaker.topics.length > 0) {
                        speakerTopics.push.apply(speakerTopics, speaker.topics);
                      }
                    }
                  });
                  
                  speakersDiv.appendChild(imagesDiv);
                  
                  // Speaker names
                  if (speakerNames.length > 0) {
                    const namesDiv = document.createElement('div');
                    namesDiv.className = 'sessions-card-speaker-names';
                    namesDiv.textContent = speakerNames.join(', ');
                    speakersDiv.appendChild(namesDiv);
                  }
                  
                  // Speaker topics (unique, comma separated)
                  if (speakerTopics.length > 0) {
                    const uniqueTopics = Array.from(new Set(speakerTopics));
                    const topicsDiv = document.createElement('div');
                    topicsDiv.className = 'sessions-card-speaker-topics';
                    topicsDiv.textContent = uniqueTopics.join(', ');
                    speakersDiv.appendChild(topicsDiv);
                  }
                  
                  card.appendChild(speakersDiv);
                }
                
                // Add click event to open session detail modal
                card.style.cursor = 'pointer';
                card.setAttribute('data-session-id', session.id);
                card.addEventListener('click', function() {
                  openSessionDetailModal(session);
                });
                
                gridContainer.appendChild(card);
              });
              
              gridWrapper.appendChild(gridContainer);
              
              // Hide loading, show grid
              loadingDiv.style.display = 'none';
              errorDiv.style.display = 'none';
              tableWrapper.style.display = 'none';
              gridWrapper.style.display = 'block';
            }
            
            async function fetchSessions() {
              try {
                // Fetch speakers first
                allSpeakersData = await fetchSpeakers();
                
                const apiUrl = 'https://api.hubapi.com/cms/v3/hubdb/tables/' + tableId + '/rows?portalId=' + portalId;
                const response = await fetch(apiUrl);
                
                if (!response.ok) {
                  throw new Error('Failed to fetch sessions: ' + response.status);
                }
                
                const data = await response.json();
                const sessions = data.results || [];
                
                if (sessions.length === 0) {
                  loadingDiv.innerHTML = 'No sessions found';
                  loadingDiv.style.display = 'block';
                  return;
                }
                
                // Extract and process sessions
                const processedSessions = sessions.map(function(row) {
                  const room = row.values?.room && row.values.room.length > 0 
                    ? row.values.room[0].name 
                    : 'Unknown Room';
                  
                  // Extract speaker IDs and names
                  const speakerIds = (row.values?.speaker || []).map(function(s) {
                    return s.id || '';
                  }).filter(function(id) {
                    return id && id.trim() !== '';
                  });
                  
                  const speakers = (row.values?.speaker || []).map(function(s) {
                    return s.name || '';
                  }).filter(function(name) {
                    return name && name.trim() !== '';
                  });
                  
                  // Extract date from row.values.date
                  const dateValue = row.values?.date && row.values.date.length > 0
                    ? row.values.date[0].name || row.values.date[0]
                    : null;
                  
                  return {
                    id: row.id,
                    title: row.values?.session_title || 'Untitled Session',
                    start_time: row.values?.start_time || 0,
                    end_time: row.values?.end_time || 0,
                    room: room,
                    speakerIds: speakerIds,
                    speakers: speakers,
                    description: row.values?.description || '',
                    date: dateValue ? [dateValue] : null
                  };
                }).filter(function(session) {
                  return session.start_time > 0 && session.end_time > 0;
                });
                
                // Store all sessions
                allSessions = processedSessions;
                // Store all sessions for search functionality
                allSessionsData = processedSessions;
                
                // Extract unique dates and sort them
                const dateSet = new Set();
                processedSessions.forEach(function(session) {
                  const dateTs = getDateTimestamp(session);
                  if (dateTs > 0) {
                    dateSet.add(dateTs);
                  }
                });
                
                uniqueDates = Array.from(dateSet).sort(function(a, b) {
                  return a - b; // Sort from low to high
                });
                
                // Populate date filter dropdown and get selected date
                let normalizedSelectedDate = null;
                const ALL_DAYS_VALUE = 'all';
                
                if (uniqueDates.length > 0) {
                  dateSelect.innerHTML = '';
                  
                  // Only add "All Days" option if in grid view (not available in calendar view)
                  if (currentView === 'grid') {
                    const allDaysOption = document.createElement('option');
                    allDaysOption.value = ALL_DAYS_VALUE;
                    allDaysOption.textContent = 'All Days';
                    dateSelect.appendChild(allDaysOption);
                  }
                  
                  // Add date options
                  uniqueDates.forEach(function(dateTs) {
                    const option = document.createElement('option');
                    option.value = dateTs;
                    // Format the date for display (dateTs is already normalized to midnight UTC)
                    option.textContent = formatDate(dateTs);
                    dateSelect.appendChild(option);
                  });
                  
                  // Set selected date: use preserved selection if available, otherwise use minimum date (only on initial load)
                  if (isInitialLoad) {
                    // On initial load, use minimum date (not "All Days")
                    dateSelect.value = uniqueDates[0];
                    normalizedSelectedDate = uniqueDates[0];
                    selectedDateToPreserve = uniqueDates[0]; // Store for future use
                    isInitialLoad = false; // Mark that initial load is complete
                  } else if (selectedDateToPreserve === ALL_DAYS_VALUE) {
                    // User selected "All Days" - but if in calendar view, switch to minimum date
                    if (currentView === 'calendar') {
                      dateSelect.value = uniqueDates[0];
                      normalizedSelectedDate = uniqueDates[0];
                      selectedDateToPreserve = uniqueDates[0]; // Update preserved selection
                    } else {
                      // Grid view - allow "All Days"
                      dateSelect.value = ALL_DAYS_VALUE;
                      normalizedSelectedDate = ALL_DAYS_VALUE;
                    }
                  } else if (selectedDateToPreserve && typeof selectedDateToPreserve === 'number' && uniqueDates.includes(selectedDateToPreserve)) {
                    // On subsequent loads (date change), use the preserved selection (must be a valid date)
                    dateSelect.value = selectedDateToPreserve;
                    normalizedSelectedDate = selectedDateToPreserve;
                  } else {
                    // Fallback: use minimum date if preserved selection is invalid
                    dateSelect.value = uniqueDates[0];
                    normalizedSelectedDate = uniqueDates[0];
                    selectedDateToPreserve = uniqueDates[0];
                  }
                  
                  if (filtersRowDiv) {
                    filtersRowDiv.style.display = 'flex';
                  }
                } else {
                  if (filtersRowDiv) {
                    filtersRowDiv.style.display = 'none';
                  }
                }
                
                // Filter sessions by selected date
                let filteredSessions;
                if (normalizedSelectedDate === ALL_DAYS_VALUE) {
                  // Show all sessions when "All Days" is selected
                  filteredSessions = processedSessions;
                } else {
                  // Filter by specific date
                  filteredSessions = processedSessions.filter(function(session) {
                    const sessionDateTs = getDateTimestamp(session);
                    return sessionDateTs === normalizedSelectedDate;
                  });
                }
                
                // Initialize time slider with date-filtered sessions
                initializeTimeSlider(filteredSessions);
                
                // Filter by time range if time filter is active
                if (selectedMinTime !== null && selectedMaxTime !== null && minTimeOfDay !== null && maxTimeOfDay !== null) {
                  filteredSessions = filteredSessions.filter(function(session) {
                    const sessionStartMinutes = getMinutesFromStartOfDayPST(session.start_time);
                    const sessionEndMinutes = getMinutesFromStartOfDayPST(session.end_time);
                    
                    // Include session if it overlaps with selected time range
                    // Session overlaps if: session starts before selected end AND session ends after selected start
                    return sessionStartMinutes < selectedMaxTime && sessionEndMinutes > selectedMinTime;
                  });
                }
                
                // Filter by topic if topic filter is active
                if (selectedTopic !== 'all') {
                  filteredSessions = filteredSessions.filter(function(session) {
                    // Check if any speaker in this session has the selected topic
                    if (session.speakerIds && session.speakerIds.length > 0) {
                      return session.speakerIds.some(function(speakerId) {
                        const speaker = allSpeakersData[speakerId];
                        if (speaker && speaker.topics) {
                          return speaker.topics.includes(selectedTopic);
                        }
                        return false;
                      });
                    }
                    return false;
                  });
                }
                
                // Filter by search query if search is active
                if (searchQuery && searchQuery.trim().length > 0) {
                  const query = searchQuery.trim().toLowerCase();
                  filteredSessions = filteredSessions.filter(function(session) {
                    // Search in session title
                    const titleMatch = session.title && session.title.toLowerCase().includes(query);
                    return titleMatch;
                  });
                }
                
                if (filteredSessions.length === 0) {
                  loadingDiv.innerHTML = 'No sessions found for selected filters';
                  loadingDiv.style.display = 'block';
                  tableWrapper.style.display = 'none';
                  gridWrapper.style.display = 'none';
                  return;
                }
                
                // Find min and max times from filtered sessions
                const allStartTimes = filteredSessions.map(function(s) { return s.start_time; });
                const allEndTimes = filteredSessions.map(function(s) { return s.end_time; });
                const minTime = Math.min.apply(null, allStartTimes);
                const maxTime = Math.max.apply(null, allEndTimes);
                
                // Get unique rooms from filtered sessions
                const uniqueRooms = [];
                const roomSet = new Set();
                filteredSessions.forEach(function(session) {
                  if (!roomSet.has(session.room)) {
                    roomSet.add(session.room);
                    uniqueRooms.push(session.room);
                  }
                });
                
                // Generate time slots (needed for both views)
                const timeSlots = generateTimeSlots(minTime, maxTime);
                
                // Only build table if calendar view is selected
                if (currentView === 'calendar') {
                  // Clear table wrapper before building (in case switching views)
                  if (tableWrapper) {
                    tableWrapper.innerHTML = '';
                  }
                  
                  // Create table structure
                  const slotHeight = 120; // Height of each 15-minute slot in pixels (doubled from 60)
                  
                  // Create table
                  const table = document.createElement('table');
                  table.className = 'sessions-schedule-table';
                  
                  // Create header row with rooms
                  const thead = document.createElement('thead');
                  const headerRow = document.createElement('tr');
                  
                  // First cell contains navigation arrows (for time column)
                  const timeHeaderCell = document.createElement('th');
                  timeHeaderCell.className = 'sessions-time-header';
                  
                  // Create navigation box with left/right arrows
                  const navBox = document.createElement('div');
                  navBox.className = 'sessions-nav-box';
                  navBox.id = 'sessions-nav-box-' + moduleId;
                  
                  // Left arrow button
                  const leftArrowBtn = document.createElement('button');
                  leftArrowBtn.className = 'sessions-nav-arrow sessions-nav-arrow-left';
                  leftArrowBtn.id = 'sessions-nav-left-' + moduleId;
                  leftArrowBtn.setAttribute('aria-label', 'Scroll left');
                  leftArrowBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 15L7 10L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                  
                  // Right arrow button
                  const rightArrowBtn = document.createElement('button');
                  rightArrowBtn.className = 'sessions-nav-arrow sessions-nav-arrow-right';
                  rightArrowBtn.id = 'sessions-nav-right-' + moduleId;
                  rightArrowBtn.setAttribute('aria-label', 'Scroll right');
                  rightArrowBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 5L13 10L8 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                  
                  navBox.appendChild(leftArrowBtn);
                  navBox.appendChild(rightArrowBtn);
                  timeHeaderCell.appendChild(navBox);
                  
                  headerRow.appendChild(timeHeaderCell);
                  
                  // Add room headers
                  uniqueRooms.forEach(function(room) {
                    const th = document.createElement('th');
                    th.className = 'sessions-room-header';
                    const roomName = document.createElement('h3');
                    roomName.className = 'sessions-room-name';
                    roomName.textContent = room;
                    th.appendChild(roomName);
                    headerRow.appendChild(th);
                  });
                  
                  thead.appendChild(headerRow);
                  table.appendChild(thead);
                  
                  // Create tbody
                  const tbody = document.createElement('tbody');
                  
                  // Create rows for each time slot
                  timeSlots.forEach(function(slot, slotIndex) {
                    const tr = document.createElement('tr');
                    tr.className = 'sessions-time-row';
                    tr.setAttribute('data-slot-index', slotIndex);
                    
                    // Time cell
                    const timeCell = document.createElement('td');
                    const minutes = slot.getMinutes();
                    
                    // Show time label only for whole hours (no labels for 15, 30, 45)
                    if (minutes === 0) {
                      timeCell.className = 'sessions-time-cell sessions-time-cell-whole-hour';
                      // Don't add top border to first row
                      if (slotIndex === 0) {
                        timeCell.style.borderTop = 'none';
                      }
                      const timeLabel = document.createElement('h3');
                      timeLabel.className = 'sessions-time-label';
                      timeLabel.textContent = formatTime(slot.getTime());
                      timeCell.appendChild(timeLabel);
                    } else {
                      // No label for 15, 30, 45 intervals - just empty cell, no border
                      timeCell.className = 'sessions-time-cell sessions-time-cell-interval';
                    }
                    
                    tr.appendChild(timeCell);
                    
                    // Room cells (empty cells for positioning)
                    uniqueRooms.forEach(function(room) {
                      const td = document.createElement('td');
                      td.className = 'sessions-room-cell';
                      td.setAttribute('data-room', room);
                      td.setAttribute('data-slot-index', slotIndex);
                      tr.appendChild(td);
                    });
                    
                    tbody.appendChild(tr);
                  });
                  
                  table.appendChild(tbody);
                  if (tableWrapper) {
                    tableWrapper.appendChild(table);
                    // Ensure table displays correctly
                    table.style.display = 'table';
                    table.style.width = '100%';
                    table.style.borderSpacing = '0';
                  }
                  
                  // Now place session boxes
                  // First, make all room cells position relative
                  const allRoomCells = tbody.querySelectorAll('.sessions-room-cell');
                  allRoomCells.forEach(function(cell) {
                    cell.style.position = 'relative';
                  });
                  
                  // Track maximum bottom position of all sessions
                  let maxBottomPosition = 0;
                  
                  filteredSessions.forEach(function(session) {
                    const roomIndex = uniqueRooms.indexOf(session.room);
                    if (roomIndex === -1) return;
                    
                    const position = calculateSessionPosition(session, timeSlots, slotHeight);
                    
                    // Find the starting cell based on start time
                    const startSlotIndex = position.startSlotIndex;
                    const startCell = tbody.querySelector('td[data-room="' + session.room + '"][data-slot-index="' + startSlotIndex + '"]');
                    
                    if (!startCell) return;
                    
                    // Calculate bottom position of this session (top + height)
                    const sessionBottom = position.top + position.height;
                    if (sessionBottom > maxBottomPosition) {
                      maxBottomPosition = sessionBottom;
                    }
                    
                    // Create session box
                    const sessionBox = document.createElement('div');
                    sessionBox.className = 'sessions-session-box';
                    sessionBox.style.position = 'absolute';
                    sessionBox.style.top = position.top + 'px';
                    sessionBox.style.left = '8px';
                    sessionBox.style.width = 'calc(100% - 16px)';
                    sessionBox.style.height = position.height + 'px';
                    sessionBox.style.zIndex = '5';
                    sessionBox.style.margin = '0';
                    sessionBox.style.paddingTop = '0';
                    sessionBox.style.paddingBottom = '0';
                    
                    // Add session content
                    const sessionTitle = document.createElement('div');
                    sessionTitle.className = 'sessions-session-title';
                    sessionTitle.textContent = session.title;
                    sessionBox.appendChild(sessionTitle);
                    
                    const sessionTime = document.createElement('div');
                    sessionTime.className = 'sessions-session-time';
                    sessionTime.textContent = formatTime(session.start_time) + ' - ' + formatTime(session.end_time);
                    sessionBox.appendChild(sessionTime);
                    
                    // Add click event to open session detail modal
                    sessionBox.style.cursor = 'pointer';
                    sessionBox.setAttribute('data-session-id', session.id);
                    sessionBox.addEventListener('click', function() {
                      openSessionDetailModal(session);
                    });
                    
                    // Append to the starting cell
                    startCell.appendChild(sessionBox);
                  });
                  
                  // After all sessions are placed, calculate and set wrapper height
                  if (tableWrapper) {
                    setTimeout(function() {
                      // Get actual header height
                      const theadElement = table.querySelector('thead');
                      const tbodyElement = table.querySelector('tbody');
                      const theadHeight = theadElement ? theadElement.offsetHeight : 60;
                      
                      // Calculate required height: header + maximum session bottom position + padding
                      // If no sessions, use time slots height as fallback
                      let requiredHeight;
                      if (maxBottomPosition > 0) {
                        // Use the maximum bottom position of sessions, add header and padding
                        requiredHeight = theadHeight + maxBottomPosition + 20; // 20px padding at bottom
                      } else {
                        // Fallback: use time slots height if no sessions
                        requiredHeight = theadHeight + (timeSlots.length * slotHeight);
                      }
                      
                      // Set explicit height to show all sessions without vertical scrolling
                      tableWrapper.style.height = requiredHeight + 'px';
                      tableWrapper.style.overflowY = 'hidden';
                      tableWrapper.style.maxHeight = 'none';
                      
                      // Ensure table grows naturally to show all rows
                      if (table) {
                        table.style.height = 'auto';
                        table.style.minHeight = requiredHeight + 'px';
                        table.style.display = 'table';
                      }
                      if (tbodyElement) {
                        tbodyElement.style.display = 'table-row-group';
                        tbodyElement.style.height = 'auto';
                      }
                      
                      // Force a reflow to ensure all rows are rendered and visible
                      void tableWrapper.offsetHeight;
                      void table.offsetHeight;
                    }, 100);
                    
                    // Initialize navigation arrows after table is rendered
                    setTimeout(function() {
                      initNavigationArrows();
                    }, 150);
                  }
                }
                
                // Render based on current view
                if (currentView === 'grid') {
                  // Hide table, show grid
                  if (tableWrapper) {
                    tableWrapper.style.display = 'none';
                  }
                  renderGridView(filteredSessions);
                } else {
                  // Calendar view - Hide loading and grid, show table
                  if (loadingDiv) {
                    loadingDiv.style.display = 'none';
                  }
                  if (errorDiv) {
                    errorDiv.style.display = 'none';
                  }
                  if (gridWrapper) {
                    gridWrapper.style.display = 'none';
                  }
                  if (tableWrapper) {
                    // Ensure table is visible
                    tableWrapper.style.display = 'block';
                    // Force a reflow to ensure display
                    tableWrapper.offsetHeight;
                  }
                }
                
              } catch (err) {
                console.error('Error loading sessions:', err);
                loadingDiv.style.display = 'none';
                errorDiv.style.display = 'block';
                errorDiv.innerHTML = 'Error: ' + (err.message || 'Failed to load sessions');
              }
            }
            
            // Render grid view
            function renderGridView(sessions) {
              // Clear grid wrapper
              gridWrapper.innerHTML = '';
              
              // Sort sessions by start time (minimum time first)
              const sortedSessions = sessions.slice().sort(function(a, b) {
                return a.start_time - b.start_time;
              });
              
              // Create grid container
              const gridContainer = document.createElement('div');
              gridContainer.className = 'sessions-grid-container';
              
              sortedSessions.forEach(function(session) {
                const card = document.createElement('div');
                card.className = 'sessions-grid-card';
                
                // Date and time
                const dateTimeDiv = document.createElement('div');
                dateTimeDiv.className = 'sessions-card-datetime';
                dateTimeDiv.textContent = formatDateTimeRange(session.start_time, session.end_time);
                card.appendChild(dateTimeDiv);
                
                // Session title
                const titleDiv = document.createElement('div');
                titleDiv.className = 'sessions-card-title';
                titleDiv.textContent = session.title;
                card.appendChild(titleDiv);
                
                // Speaker images and names
                if (session.speakerIds && session.speakerIds.length > 0) {
                  const speakersDiv = document.createElement('div');
                  speakersDiv.className = 'sessions-card-speakers';
                  
                  // Speaker images
                  const imagesDiv = document.createElement('div');
                  imagesDiv.className = 'sessions-card-speaker-images';
                  
                  const speakerNames = [];
                  const speakerTopics = [];
                  
                  session.speakerIds.forEach(function(speakerId) {
                    const speaker = allSpeakersData[speakerId];
                    if (speaker) {
                      // Add image
                      if (speaker.image && speaker.image.src) {
                        const img = document.createElement('img');
                        img.src = speaker.image.src;
                        img.alt = speaker.image.alt || speaker.name;
                        img.className = 'sessions-card-speaker-image';
                        imagesDiv.appendChild(img);
                      }
                      
                      // Collect names and topics
                      if (speaker.name) {
                        speakerNames.push(speaker.name);
                      }
                      if (speaker.topics && speaker.topics.length > 0) {
                        speakerTopics.push.apply(speakerTopics, speaker.topics);
                      }
                    }
                  });
                  
                  speakersDiv.appendChild(imagesDiv);
                  
                  // Speaker names
                  if (speakerNames.length > 0) {
                    const namesDiv = document.createElement('div');
                    namesDiv.className = 'sessions-card-speaker-names';
                    namesDiv.textContent = speakerNames.join(', ');
                    speakersDiv.appendChild(namesDiv);
                  }
                  
                  // Speaker topics (unique, comma separated)
                  if (speakerTopics.length > 0) {
                    const uniqueTopics = Array.from(new Set(speakerTopics));
                    const topicsDiv = document.createElement('div');
                    topicsDiv.className = 'sessions-card-speaker-topics';
                    topicsDiv.textContent = uniqueTopics.join(', ');
                    speakersDiv.appendChild(topicsDiv);
                  }
                  
                  card.appendChild(speakersDiv);
                }
                
                // Add click event to open session detail modal
                card.style.cursor = 'pointer';
                card.setAttribute('data-session-id', session.id);
                card.addEventListener('click', function() {
                  openSessionDetailModal(session);
                });
                
                gridContainer.appendChild(card);
              });
              
              gridWrapper.appendChild(gridContainer);
              
              // Hide loading, show grid
              loadingDiv.style.display = 'none';
              errorDiv.style.display = 'none';
              tableWrapper.style.display = 'none';
              gridWrapper.style.display = 'block';
            }
            
            // Function to render table (called on initial load and date filter change)
            function renderTable() {
              // Clear existing table and grid
              if (tableWrapper) {
                tableWrapper.innerHTML = '';
                tableWrapper.style.display = 'none';
              }
              if (gridWrapper) {
                gridWrapper.innerHTML = '';
                gridWrapper.style.display = 'none';
              }
              if (loadingDiv) {
                loadingDiv.style.display = 'block';
                loadingDiv.innerHTML = 'Loading sessions...';
              }
              if (errorDiv) {
                errorDiv.style.display = 'none';
              }
              fetchSessions();
            }
            
            // Add event listener for date filter change
            if (dateSelect) {
              dateSelect.addEventListener('change', function() {
                // Store the selected date before re-rendering
                const selectedValue = this.value;
                if (selectedValue === 'all') {
                  selectedDateToPreserve = 'all';
                } else if (selectedValue) {
                  selectedDateToPreserve = parseInt(selectedValue, 10);
                }
                renderTable();
              });
            }
            
            // Add event listeners for view toggle
            if (gridViewBtn && calendarViewBtn) {
              // Set initial active state (grid view is default)
              gridViewBtn.classList.add('active');
              calendarViewBtn.classList.remove('active');
              
              gridViewBtn.addEventListener('click', function() {
                currentView = 'grid';
                gridViewBtn.classList.add('active');
                calendarViewBtn.classList.remove('active');
                renderTable();
              });
              
              calendarViewBtn.addEventListener('click', function() {
                currentView = 'calendar';
                calendarViewBtn.classList.add('active');
                gridViewBtn.classList.remove('active');
                
                // If "All Days" is selected, switch to minimum date (calendar view doesn't support "All Days")
                // Check if uniqueDates is available, otherwise it will be handled in fetchSessions
                if (selectedDateToPreserve === 'all' && uniqueDates.length > 0) {
                  selectedDateToPreserve = uniqueDates[0];
                  if (dateSelect) {
                    dateSelect.value = uniqueDates[0];
                  }
                } else if (selectedDateToPreserve === 'all') {
                  // Reset so it picks minimum date in fetchSessions when uniqueDates is populated
                  selectedDateToPreserve = null;
                }
                
                renderTable();
              });
            }
            
            // Setup time slider after DOM is ready
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', function() {
                setTimeout(function() {
                  setupTimeSlider();
                }, 200);
              });
            } else {
              setTimeout(function() {
                setupTimeSlider();
              }, 200);
            }
            
            // Function to update the topic filter button text
            function updateTopicFilterButtonText() {
              const filterBtn = root.querySelector('#session-topic-filter-btn-' + moduleId);
              if (!filterBtn) return;
              
              // Get the filter icon (preserve it)
              const icon = filterBtn.querySelector('i');
              const iconHTML = icon ? icon.outerHTML : '<i class="fa-solid fa-filter"></i>';
              
              let buttonText = 'Filter by Topic';
              
              // If a specific topic is selected (not 'all'), show the topic name
              if (selectedTopic && selectedTopic !== 'all') {
                buttonText = selectedTopic;
                
                // Truncate if text is too long (max 20 characters, then add "..")
                const maxLength = 20;
                if (buttonText.length > maxLength) {
                  buttonText = buttonText.substring(0, maxLength - 2) + '..';
                }
              }
              
              // Update button text while preserving the icon
              // Add space before icon for proper spacing
              filterBtn.innerHTML = buttonText + ' ' + iconHTML;
            }
            
            // Initialize topic filter side panel
            function initSessionTopicFilter() {
              const filterBtn = root.querySelector('#session-topic-filter-btn-' + moduleId);
              // Modals/panels are outside section container, so use document instead of root
              const sidePanel = document.querySelector('#session-topic-filter-panel-' + moduleId);
              const panelOverlay = document.querySelector('#session-topic-filter-overlay-' + moduleId);
              const panelContent = document.querySelector('#session-topic-filter-content-' + moduleId);
              const closeBtn = document.querySelector('#session-topic-filter-close-' + moduleId);
              const panelList = document.querySelector('#session-topic-filter-list-' + moduleId);
              
              if (!filterBtn || !sidePanel || !panelOverlay || !panelContent) return;
              
              // Collect all unique topics from speakers associated with sessions
              function collectTopicsFromSessions() {
                const topicSet = new Set();
                const topicCountMap = {};
                
                allSessionsData.forEach(function(session) {
                  if (session.speakerIds && session.speakerIds.length > 0) {
                    session.speakerIds.forEach(function(speakerId) {
                      const speaker = allSpeakersData[speakerId];
                      if (speaker && speaker.topics && speaker.topics.length > 0) {
                        speaker.topics.forEach(function(topic) {
                          topicSet.add(topic);
                          if (!topicCountMap[topic]) {
                            topicCountMap[topic] = 0;
                          }
                          topicCountMap[topic]++;
                        });
                      }
                    });
                  }
                });
                
                const sortedTopics = Array.from(topicSet).sort();
                
                // Populate panel with topics
                if (panelList) {
                  panelList.innerHTML = '';
                  
                  // Add "ALL" option first
                  const allItem = document.createElement('div');
                  // Set active class based on current selectedTopic
                  allItem.className = selectedTopic === 'all' ? 'topic-filter-panel-item active' : 'topic-filter-panel-item';
                  allItem.setAttribute('data-topic', 'all');
                  allItem.innerHTML = '<span>ALL</span><span class="topic-count">(' + allSessionsData.length + ')</span>';
                  panelList.appendChild(allItem);
                  
                  // Add each topic
                  sortedTopics.forEach(function(topicName) {
                    const topicItem = document.createElement('div');
                    // Set active class based on current selectedTopic
                    topicItem.className = selectedTopic === topicName ? 'topic-filter-panel-item active' : 'topic-filter-panel-item';
                    topicItem.setAttribute('data-topic', topicName);
                    const sessionCount = topicCountMap[topicName] || 0;
                    topicItem.innerHTML = '<span>' + topicName + '</span><span class="topic-count">(' + sessionCount + ')</span>';
                    panelList.appendChild(topicItem);
                  });
                  
                  // Add event listeners to topic items
                  const panelItems = panelList.querySelectorAll('.topic-filter-panel-item');
                  panelItems.forEach(function(item) {
                    item.addEventListener('click', function(e) {
                      e.stopPropagation();
                      const selectedTopicValue = this.getAttribute('data-topic');
                      
                      // Remove active class from all items
                      panelItems.forEach(function(i) {
                        i.classList.remove('active');
                      });
                      
                      // Add active class to selected item
                      this.classList.add('active');
                      
                      // Update selected topic
                      selectedTopic = selectedTopicValue;
                      
                      // Update button text to show selected topic
                      updateTopicFilterButtonText();
                      
                      // Re-render table with new filter
                      renderTable();
                      
                      // Close panel after selection
                      setTimeout(function() {
                        sidePanel.classList.remove('active');
                        document.body.style.overflow = '';
                      }, 300);
                    });
                  });
                }
              }
              
              // Update button text on initial load
              updateTopicFilterButtonText();
              
              // Open side panel on button click
              filterBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                // Collect topics before opening (in case sessions have loaded)
                collectTopicsFromSessions();
                sidePanel.classList.add('active');
                document.body.style.overflow = 'hidden';
              });
              
              // Close side panel functions
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
            }
            
            // Initialize session search modal
            function initSessionSearch() {
              const searchBtn = root.querySelector('#session-search-btn-' + moduleId);
              // Modals/panels are outside section container, so use document instead of root
              const searchModal = document.querySelector('#session-search-modal-' + moduleId);
              const searchOverlay = document.querySelector('#session-search-overlay-' + moduleId);
              const searchContent = document.querySelector('#session-search-content-' + moduleId);
              const closeBtn = document.querySelector('#session-search-close-' + moduleId);
              const searchInput = document.querySelector('#session-search-input-' + moduleId);
              const searchResults = document.querySelector('#session-search-results-' + moduleId);
              
              if (!searchBtn || !searchModal || !searchOverlay || !searchContent) return;
              
              // Open search modal on button click
              searchBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                searchModal.classList.add('active');
                document.body.style.overflow = 'hidden';
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
                  searchQuery = '';
                }
                if (searchResults) {
                  searchResults.innerHTML = '';
                }
                // Re-render table to show all sessions
                renderTable();
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
                  const query = this.value.trim();
                  
                  // Debounce search
                  searchTimeout = setTimeout(function() {
                    searchQuery = query.toLowerCase();
                    
                    if (query.length === 0) {
                      searchResults.innerHTML = '<div class="speaker-search-empty">Start typing to search sessions...</div>';
                      // Re-render table to show all sessions
                      renderTable();
                      return;
                    }
                    
                    // Search in session titles
                    const matchingSessions = allSessionsData.filter(function(session) {
                      return session.title && session.title.toLowerCase().includes(searchQuery);
                    });
                    
                    // Display results
                    if (matchingSessions.length === 0) {
                      searchResults.innerHTML = '<div class="speaker-search-empty">No sessions found matching "' + query + '"</div>';
                    } else {
                      let resultsHTML = '<div class="speaker-search-results-count">Found ' + matchingSessions.length + ' session' + (matchingSessions.length !== 1 ? 's' : '') + '</div>';
                      resultsHTML += '<div class="speaker-search-results-grid">';
                      
                      matchingSessions.forEach(function(session) {
                        const dateTime = formatDateTimeRange(session.start_time, session.end_time);
                        resultsHTML += '<div class="speaker-search-result-card" data-session-id="' + session.id + '">' +
                          '<div class="team-info">' +
                          '<h4>' + (session.title || 'Untitled Session') + '</h4>' +
                          '<p>' + dateTime + '</p>' +
                          (session.room ? '<span>' + session.room + '</span>' : '') +
                          '</div></div>';
                      });
                      
                      resultsHTML += '</div>';
                      searchResults.innerHTML = resultsHTML;
                      
                      // Add click handlers to result cards
                      const resultCards = searchResults.querySelectorAll('.speaker-search-result-card');
                      resultCards.forEach(function(card) {
                        card.addEventListener('click', function() {
                          const sessionId = this.getAttribute('data-session-id');
                          // Close modal and filter to show this session
                          closeSearchModal();
                          // You could scroll to the session or highlight it here
                        });
                      });
                    }
                    
                    // Re-render table with search filter
                    renderTable();
                  }, 300);
                });
              }
            }
            
            // Initialize search and filter after DOM is ready
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', function() {
                setTimeout(function() {
                  initSessionSearch();
                  initSessionTopicFilter();
                }, 300);
              });
            } else {
              setTimeout(function() {
                initSessionSearch();
                initSessionTopicFilter();
              }, 300);
            }
            
            // Initialize duplicate header replacement for calendar view
            function initStickyHeaderReplacement() {
              const pageHeader = document.querySelector('header.header');
              if (!pageHeader) return;
              
              let isHeaderReplaced = false;
              let scrollTimeout = null;
              let theadElement = null;
              let duplicateHeader = null;
              
              function createDuplicateHeader() {
                if (!theadElement) return null;
                
                // Get the header row from thead
                const headerRow = theadElement.querySelector('tr');
                if (!headerRow) return null;
                
                // Create a duplicate header container
                const duplicate = document.createElement('div');
                duplicate.id = 'calendar-duplicate-header-' + moduleId;
                duplicate.className = 'calendar-duplicate-header';
                
                // Create a table structure matching the original (no scroll wrapper needed)
                const duplicateTable = document.createElement('table');
                duplicateTable.className = 'sessions-schedule-table calendar-duplicate-table';
                duplicateTable.style.width = '100%';
                duplicateTable.style.borderSpacing = '0';
                duplicateTable.style.minWidth = '800px';
                
                const duplicateThead = document.createElement('thead');
                const duplicateRow = headerRow.cloneNode(true);
                duplicateThead.appendChild(duplicateRow);
                duplicateTable.appendChild(duplicateThead);
                
                // Clone navigation arrows for duplicate header and add event listeners
                const duplicateNavBox = duplicateRow.querySelector('.sessions-nav-box');
                if (duplicateNavBox) {
                  const duplicateLeftBtn = duplicateNavBox.querySelector('.sessions-nav-arrow-left');
                  const duplicateRightBtn = duplicateNavBox.querySelector('.sessions-nav-arrow-right');
                  
                  if (duplicateLeftBtn && duplicateRightBtn) {
                    // Update IDs to avoid conflicts
                    duplicateLeftBtn.id = 'sessions-nav-left-duplicate-' + moduleId;
                    duplicateRightBtn.id = 'sessions-nav-right-duplicate-' + moduleId;
                    
                    // Add event listeners for duplicate header arrows
                    duplicateLeftBtn.addEventListener('click', function() {
                      if (tableWrapper) {
                        const columnWidth = tableWrapper.querySelector('.sessions-room-header')?.offsetWidth || 200;
                        const targetScrollLeft = Math.max(0, tableWrapper.scrollLeft - columnWidth);
                        tableWrapper.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
                      }
                    });
                    
                    duplicateRightBtn.addEventListener('click', function() {
                      if (tableWrapper) {
                        const columnWidth = tableWrapper.querySelector('.sessions-room-header')?.offsetWidth || 200;
                        const targetScrollLeft = tableWrapper.scrollLeft + columnWidth;
                        tableWrapper.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
                      }
                    });
                  }
                }
                
                duplicate.appendChild(duplicateTable);
                
                // Position it at the top (initially hidden above)
                duplicate.style.position = 'fixed';
                duplicate.style.top = '0';
                duplicate.style.left = '0';
                duplicate.style.right = '0';
                duplicate.style.zIndex = '1000';
                duplicate.style.transform = 'translateY(-100%)';
                duplicate.style.opacity = '0';
                duplicate.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
                duplicate.style.backgroundColor = '#f8f5ee';
                duplicate.style.display = 'block';
                duplicate.style.visibility = 'visible';
                // Explicitly set overflow to hidden (not auto) to prevent scrollbar
                duplicate.style.setProperty('overflow', 'hidden', 'important');
                duplicate.style.setProperty('overflow-x', 'hidden', 'important');
                duplicate.style.setProperty('overflow-y', 'hidden', 'important');
                
                // Add to body first
                document.body.appendChild(duplicate);
                
                // Force a reflow to ensure the element is in the DOM
                void duplicate.offsetHeight;
                
                return duplicate;
              }
              
              function removeDuplicateHeader() {
                if (duplicateHeader) {
                  duplicateHeader.remove();
                  duplicateHeader = null;
                }
              }
              
              function syncHorizontalScroll() {
                if (duplicateHeader && isHeaderReplaced && tableWrapper) {
                  const scrollLeft = tableWrapper.scrollLeft;
                  const duplicateTable = duplicateHeader.querySelector('.calendar-duplicate-table');
                  if (duplicateTable) {
                    // Move the table horizontally to match the scroll position
                    duplicateTable.style.marginLeft = (-scrollLeft) + 'px';
                  }
                }
              }
              
              function handleScroll() {
                // Only work in calendar view
                if (currentView !== 'calendar') {
                  // Reset if not in calendar view
                  if (isHeaderReplaced) {
                    pageHeader.style.transform = '';
                    pageHeader.style.opacity = '';
                    pageHeader.style.transition = '';
                    removeDuplicateHeader();
                    isHeaderReplaced = false;
                    theadElement = null;
                  }
                  return;
                }
                
                if (!tableWrapper || tableWrapper.style.display === 'none') return;
                
                const table = tableWrapper.querySelector('.sessions-schedule-table');
                if (!table) return;
                
                if (!theadElement) {
                  theadElement = table.querySelector('thead');
                }
                if (!theadElement) return;
                
                const tableRect = table.getBoundingClientRect();
                const headerRect = pageHeader.getBoundingClientRect();
                const headerHeight = headerRect.height;
                const tableTop = tableRect.top;
                
                // Get the thead element to calculate its height
                const theadRect = theadElement.getBoundingClientRect();
                const theadHeight = theadRect.height;
                
                // Calculate when the full calendar header is hidden below the page header
                // The duplicate header should slide down when the entire thead has passed the page header
                const triggerPoint = headerHeight - theadHeight;
                
                // Check if the full calendar header has been hidden below the page header
                if (tableTop <= triggerPoint && !isHeaderReplaced) {
                  // Replace page header with duplicate calendar header
                  pageHeader.style.transform = 'translateY(-100%)';
                  pageHeader.style.opacity = '0';
                  pageHeader.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
                  isHeaderReplaced = true;
                  
                  // Create and show duplicate header
                  if (!duplicateHeader) {
                    duplicateHeader = createDuplicateHeader();
                  }
                  
                  if (duplicateHeader) {
                    // Get the table wrapper position to align duplicate header
                    const tableWrapperRect = tableWrapper.getBoundingClientRect();
                    
                    // Position duplicate header to match table wrapper exactly
                    duplicateHeader.style.left = tableWrapperRect.left + 'px';
                    duplicateHeader.style.width = tableWrapperRect.width + 'px';
                    duplicateHeader.style.right = 'auto';
                    
                    // Ensure it's visible and positioned correctly
                    duplicateHeader.style.display = 'block';
                    duplicateHeader.style.visibility = 'visible';
                    
                    // Explicitly ensure overflow is hidden (not auto) to prevent scrollbar
                    duplicateHeader.style.setProperty('overflow', 'hidden', 'important');
                    duplicateHeader.style.setProperty('overflow-x', 'hidden', 'important');
                    duplicateHeader.style.setProperty('overflow-y', 'hidden', 'important');
                    
                    // Add borders to match the real calendar header (table wrapper borders)
                    // Get the table wrapper's computed styles to match borders exactly
                    const tableWrapperStyles = window.getComputedStyle(tableWrapper);
                    const tableWrapperBorderLeft = tableWrapperStyles.borderLeftWidth;
                    const tableWrapperBorderRight = tableWrapperStyles.borderRightWidth;
                    const tableWrapperBorderLeftColor = tableWrapperStyles.borderLeftColor;
                    const tableWrapperBorderRightColor = tableWrapperStyles.borderRightColor;
                    
                    // Apply the same left and right borders as the table wrapper
                    if (tableWrapperBorderLeft && tableWrapperBorderLeft !== '0px') {
                      duplicateHeader.style.borderLeft = tableWrapperBorderLeft + ' solid ' + tableWrapperBorderLeftColor;
                    }
                    
                    if (tableWrapperBorderRight && tableWrapperBorderRight !== '0px') {
                      duplicateHeader.style.borderRight = tableWrapperBorderRight + ' solid ' + tableWrapperBorderRightColor;
                    }
                    
                    // Sync horizontal scroll
                    syncHorizontalScroll();
                    
                    // Force a reflow to ensure initial styles are applied
                    void duplicateHeader.offsetHeight;
                    
                    // Show duplicate header (slide down) - use double requestAnimationFrame for smooth animation
                    requestAnimationFrame(function() {
                      requestAnimationFrame(function() {
                        if (duplicateHeader && isHeaderReplaced) {
                          duplicateHeader.style.transform = 'translateY(0)';
                          duplicateHeader.style.opacity = '1';
                        }
                      });
                    });
                  }
                } else if (tableTop > headerHeight && isHeaderReplaced) {
                  // Restore page header
                  pageHeader.style.transform = '';
                  pageHeader.style.opacity = '';
                  pageHeader.style.transition = '';
                  isHeaderReplaced = false;
                  
                  // Hide and remove duplicate header (slide up)
                  if (duplicateHeader) {
                    duplicateHeader.style.transform = 'translateY(-100%)';
                    duplicateHeader.style.opacity = '0';
                    setTimeout(function() {
                      removeDuplicateHeader();
                    }, 300);
                  }
                }
                
                // Sync horizontal scroll
                syncHorizontalScroll();
              }
              
              // Sync horizontal scroll when table wrapper scrolls
              if (tableWrapper) {
                tableWrapper.addEventListener('scroll', function() {
                  syncHorizontalScroll();
                }, { passive: true });
              }
              
              // Throttle scroll events for performance
              function throttledScroll() {
                if (scrollTimeout) {
                  cancelAnimationFrame(scrollTimeout);
                }
                scrollTimeout = requestAnimationFrame(handleScroll);
              }
              
              // Listen to scroll events
              window.addEventListener('scroll', throttledScroll, { passive: true });
              
              // Check on initial load and view changes
              setTimeout(function() {
                handleScroll();
              }, 500);
            }
            
            // Initialize sticky header replacement after a short delay
            setTimeout(function() {
              initStickyHeaderReplacement();
            }, 1000);
            
            // Initialize navigation arrows for column scrolling
            function initNavigationArrows() {
              // Only initialize if in calendar view
              if (currentView !== 'calendar') return;
              
              const leftArrowBtn = root.querySelector('#sessions-nav-left-' + moduleId);
              const rightArrowBtn = root.querySelector('#sessions-nav-right-' + moduleId);
              
              if (!leftArrowBtn || !rightArrowBtn || !tableWrapper) {
                // Retry after a short delay if buttons aren't found yet
                setTimeout(function() {
                  initNavigationArrows();
                }, 200);
                return;
              }
              
              // Remove any existing event listeners by cloning the buttons
              // This prevents duplicate listeners when re-initializing
              const newLeftBtn = leftArrowBtn.cloneNode(true);
              const newRightBtn = rightArrowBtn.cloneNode(true);
              leftArrowBtn.parentNode.replaceChild(newLeftBtn, leftArrowBtn);
              rightArrowBtn.parentNode.replaceChild(newRightBtn, rightArrowBtn);
              
              // Get the width of one room column (first room header)
              function getColumnWidth() {
                const firstRoomHeader = tableWrapper.querySelector('.sessions-room-header');
                if (firstRoomHeader) {
                  return firstRoomHeader.offsetWidth;
                }
                // Fallback: use min-width if available
                return 200; // Default min-width from CSS
              }
              
              // Smooth scroll function
              function scrollTable(direction) {
                if (!tableWrapper) return;
                
                const columnWidth = getColumnWidth();
                const currentScrollLeft = tableWrapper.scrollLeft;
                const scrollAmount = columnWidth;
                
                let targetScrollLeft;
                if (direction === 'left') {
                  targetScrollLeft = Math.max(0, currentScrollLeft - scrollAmount);
                } else {
                  targetScrollLeft = currentScrollLeft + scrollAmount;
                }
                
                // Smooth scroll
                tableWrapper.scrollTo({
                  left: targetScrollLeft,
                  behavior: 'smooth'
                });
              }
              
              // Add click event listeners to the new buttons
              newLeftBtn.addEventListener('click', function() {
                scrollTable('left');
              });
              
              newRightBtn.addEventListener('click', function() {
                scrollTable('right');
              });
            }
            
            // Initialize navigation arrows after table is rendered
            setTimeout(function() {
              initNavigationArrows();
            }, 1100);
            
            // Helper function to strip HTML tags from text (for plain text)
            function stripHtmlTags(html) {
              if (!html) return '';
              // Create a temporary div element
              const tmp = document.createElement('div');
              // Set the HTML content
              tmp.innerHTML = html;
              // Return the text content (automatically strips all HTML tags)
              return tmp.textContent || tmp.innerText || '';
            }
            
            // Helper function to remove only <span> tags while preserving other HTML (like links)
            function removeSpanTags(html) {
              if (!html) return '';
              // Create a temporary div element
              const tmp = document.createElement('div');
              // Set the HTML content
              tmp.innerHTML = html;
              
              // Find all span elements and replace them with their text content
              const spans = tmp.querySelectorAll('span');
              spans.forEach(function(span) {
                const parent = span.parentNode;
                // Replace span with its text content
                while (span.firstChild) {
                  parent.insertBefore(span.firstChild, span);
                }
                parent.removeChild(span);
              });
              
              // Return the cleaned HTML
              return tmp.innerHTML;
            }
            
            // Function to open session detail modal
            function openSessionDetailModal(session) {
              const modal = document.querySelector('#session-detail-modal-' + moduleId);
              const overlay = document.querySelector('#session-detail-overlay-' + moduleId);
              const content = document.querySelector('#session-detail-content-' + moduleId);
              const body = document.querySelector('#session-detail-body-' + moduleId);
              const closeBtn = document.querySelector('#session-detail-close-' + moduleId);
              const headerTitle = document.querySelector('#session-detail-modal-' + moduleId + ' .session-detail-header h3');
              
              if (!modal || !body) return;
              
              // Update header title to show session title instead of "Session Details"
              if (headerTitle && session.title) {
                headerTitle.textContent = session.title;
              }
              
              // Clear previous content
              body.innerHTML = '';
              
              // Date and time (formatted like grid view)
              const dateTimeDiv = document.createElement('div');
              dateTimeDiv.className = 'session-detail-datetime';
              dateTimeDiv.textContent = formatDateTimeRange(session.start_time, session.end_time);
              body.appendChild(dateTimeDiv);
              
              // Session description (strip HTML tags like <span>)
              if (session.description && session.description.trim()) {
                const descDiv = document.createElement('div');
                descDiv.className = 'session-detail-description';
                // Strip HTML tags from description before displaying
                descDiv.textContent = stripHtmlTags(session.description);
                body.appendChild(descDiv);
              }
              
              // Session topics
              if (session.speakerIds && session.speakerIds.length > 0) {
                const topicSet = new Set();
                session.speakerIds.forEach(function(speakerId) {
                  const speaker = allSpeakersData[speakerId];
                  if (speaker && speaker.topics && speaker.topics.length > 0) {
                    speaker.topics.forEach(function(topic) {
                      topicSet.add(topic);
                    });
                  }
                });
                
                if (topicSet.size > 0) {
                  const topicsDiv = document.createElement('div');
                  topicsDiv.className = 'session-detail-topics';
                  const topicsLabel = document.createElement('div');
                  topicsLabel.className = 'session-detail-label';
                  topicsLabel.textContent = 'Topics:';
                  topicsDiv.appendChild(topicsLabel);
                  
                  const topicsList = document.createElement('div');
                  topicsList.className = 'session-detail-topics-list';
                  Array.from(topicSet).forEach(function(topic) {
                    const topicTag = document.createElement('span');
                    topicTag.className = 'session-detail-topic-tag';
                    topicTag.textContent = topic;
                    topicsList.appendChild(topicTag);
                  });
                  topicsDiv.appendChild(topicsList);
                  body.appendChild(topicsDiv);
                }
              }
              
              // Speakers section
              if (session.speakerIds && session.speakerIds.length > 0) {
                const speakersDiv = document.createElement('div');
                speakersDiv.className = 'session-detail-speakers';
                const speakersLabel = document.createElement('div');
                speakersLabel.className = 'session-detail-label';
                speakersLabel.textContent = 'Speakers:';
                speakersDiv.appendChild(speakersLabel);
                
                const speakersList = document.createElement('div');
                speakersList.className = 'session-detail-speakers-list';
                
                session.speakerIds.forEach(function(speakerId) {
                  const speaker = allSpeakersData[speakerId];
                  if (speaker) {
                    const speakerCard = document.createElement('div');
                    speakerCard.className = 'session-detail-speaker-card';
                    
                    // Speaker image
                    if (speaker.image && speaker.image.src) {
                      const img = document.createElement('img');
                      img.src = speaker.image.src;
                      img.alt = speaker.image.alt || speaker.name;
                      img.className = 'session-detail-speaker-image';
                      speakerCard.appendChild(img);
                    }
                    
                    // Speaker info
                    const speakerInfo = document.createElement('div');
                    speakerInfo.className = 'session-detail-speaker-info';
                    
                    if (speaker.name) {
                      const nameDiv = document.createElement('div');
                      nameDiv.className = 'session-detail-speaker-name';
                      nameDiv.textContent = speaker.name;
                      speakerInfo.appendChild(nameDiv);
                    }
                    
                    // Show description if available (richtext field from HubDB)
                    if (speaker.description && speaker.description.trim()) {
                      const descDiv = document.createElement('div');
                      descDiv.className = 'session-detail-speaker-description';
                      // Remove only <span> tags while preserving other HTML (like links)
                      descDiv.innerHTML = removeSpanTags(speaker.description);
                      speakerInfo.appendChild(descDiv);
                    }
                    
                    // Legacy bio field (keep for backward compatibility)
                    if (speaker.bio) {
                      const bioDiv = document.createElement('div');
                      bioDiv.className = 'session-detail-speaker-bio';
                      bioDiv.textContent = speaker.bio;
                      speakerInfo.appendChild(bioDiv);
                    }
                    
                    // Social media links (below description, above topics)
                    if ((speaker.linkedin_profile && speaker.linkedin_profile.trim()) || 
                        (speaker.portfolio_site && speaker.portfolio_site.trim())) {
                      const socialDiv = document.createElement('div');
                      socialDiv.className = 'session-detail-speaker-social';
                      
                      // LinkedIn link
                      if (speaker.linkedin_profile && speaker.linkedin_profile.trim()) {
                        const linkedinLink = document.createElement('a');
                        linkedinLink.href = speaker.linkedin_profile;
                        linkedinLink.target = '_blank';
                        linkedinLink.rel = 'noopener noreferrer';
                        linkedinLink.className = 'session-detail-speaker-social-link';
                        linkedinLink.setAttribute('aria-label', 'LinkedIn Profile');
                        linkedinLink.innerHTML = '<i class="fa-brands fa-linkedin"></i>';
                        socialDiv.appendChild(linkedinLink);
                      }
                      
                      // Portfolio site link
                      if (speaker.portfolio_site && speaker.portfolio_site.trim()) {
                        const portfolioLink = document.createElement('a');
                        portfolioLink.href = speaker.portfolio_site;
                        portfolioLink.target = '_blank';
                        portfolioLink.rel = 'noopener noreferrer';
                        portfolioLink.className = 'session-detail-speaker-social-link';
                        portfolioLink.setAttribute('aria-label', 'Portfolio Site');
                        portfolioLink.innerHTML = '<i class="fa-solid fa-globe"></i>';
                        socialDiv.appendChild(portfolioLink);
                      }
                      
                      speakerInfo.appendChild(socialDiv);
                    }
                    
                    if (speaker.topics && speaker.topics.length > 0) {
                      const speakerTopicsDiv = document.createElement('div');
                      speakerTopicsDiv.className = 'session-detail-speaker-topics';
                      speaker.topics.forEach(function(topic) {
                        const topicTag = document.createElement('span');
                        topicTag.className = 'session-detail-speaker-topic-tag';
                        topicTag.textContent = topic;
                        speakerTopicsDiv.appendChild(topicTag);
                      });
                      speakerInfo.appendChild(speakerTopicsDiv);
                    }
                    
                    speakerCard.appendChild(speakerInfo);
                    speakersList.appendChild(speakerCard);
                  }
                });
                
                speakersDiv.appendChild(speakersList);
                body.appendChild(speakersDiv);
              }
              
              // Show modal
              modal.classList.add('active');
              document.body.style.overflow = 'hidden';
              
              // Close modal functions
              function closeModal() {
                modal.classList.remove('active');
                document.body.style.overflow = '';
              }
              
              // Close on overlay click
              if (overlay) {
                overlay.onclick = closeModal;
              }
              
              // Close on close button click
              if (closeBtn) {
                closeBtn.onclick = closeModal;
              }
              
              // Close on Escape key
              const escapeHandler = function(e) {
                if (e.key === 'Escape' && modal.classList.contains('active')) {
                  closeModal();
                  document.removeEventListener('keydown', escapeHandler);
                }
              };
              document.addEventListener('keydown', escapeHandler);
            }
            
            // Start fetching sessions
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', function() {
                setTimeout(renderTable, 100);
              });
            } else {
              setTimeout(renderTable, 100);
            }
          })();
        `,
        }}
      />

      {/* Side Panel for Topic Filter - Outside section container */}
      <div className="topic-filter-side-panel" id={`session-topic-filter-panel-${moduleId}`}>
        <div className="topic-filter-panel-overlay" id={`session-topic-filter-overlay-${moduleId}`}></div>
        <div className="topic-filter-panel-content" id={`session-topic-filter-content-${moduleId}`}>
          <div className="topic-filter-panel-header">
            <h3>Filter by Topic</h3>
            <button className="topic-filter-close-btn" id={`session-topic-filter-close-${moduleId}`}>
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
          <div className="topic-filter-panel-body" id={`session-topic-filter-list-${moduleId}`}>
            {/* Topics will be inserted here by JavaScript */}
          </div>
        </div>
      </div>

      {/* Search Modal - Outside section container */}
      <div className="speaker-search-modal" id={`session-search-modal-${moduleId}`}>
        <div className="speaker-search-overlay" id={`session-search-overlay-${moduleId}`}></div>
        <div className="speaker-search-content" id={`session-search-content-${moduleId}`}>
          <div className="speaker-search-header">
            <h3>Search Sessions</h3>
            <button className="speaker-search-close-btn" id={`session-search-close-${moduleId}`}>
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
          <div className="speaker-search-input-wrapper">
            <input 
              type="text" 
              className="speaker-search-input" 
              id={`session-search-input-${moduleId}`}
              placeholder="Search by session name..."
              autoComplete="off"
            />
            <i className="fa-solid fa-search speaker-search-icon"></i>
          </div>
          <div className="speaker-search-results" id={`session-search-results-${moduleId}`}>
            {/* Search results will be inserted here by JavaScript */}
          </div>
        </div>
      </div>

      {/* Session Detail Modal - Outside section container */}
      <div className="session-detail-modal" id={`session-detail-modal-${moduleId}`}>
        <div className="session-detail-overlay" id={`session-detail-overlay-${moduleId}`}></div>
        <div className="session-detail-content" id={`session-detail-content-${moduleId}`}>
          <div className="session-detail-header">
            <h3>Session Details</h3>
            <button className="session-detail-close-btn" id={`session-detail-close-${moduleId}`}>
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
          <div className="session-detail-body" id={`session-detail-body-${moduleId}`}>
            {/* Session details will be inserted here by JavaScript */}
          </div>
        </div>
      </div>
    </>
  );
}

export const fields = (
  <ModuleFields>
    <TextField
      name="heading"
      label="Heading"
      default="All Sessions"
    />
    <TextField
      name="sectionId"
      label="Section ID (optional)"
      helpText="ID for anchor links (e.g., #all-sessions). Leave empty for no ID."
    />
    <TextField
      name="sectionClass"
      label="Section CSS Class"
      default="sessions-area"
      helpText="Custom CSS class for this section. Default: sessions-area"
    />
  </ModuleFields>
);

export const meta = {
  label: 'All Sessions',
};

