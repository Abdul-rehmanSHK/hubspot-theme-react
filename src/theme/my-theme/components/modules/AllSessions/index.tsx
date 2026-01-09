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
    <div className={sectionClass} id={sectionId} data-sessions-id={moduleId}>
      <div className="container">
        <div className="sessions-inner">
          <div className="row justify-content-center align-items-baseline">
            <div className="col-md-12">
              <div className="speakers-text">
                <h2>{heading}</h2>
              </div>
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
          </div>
        </div>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
          (function() {
            const root = document.querySelector('[data-sessions-id="${moduleId}"]');
            if (!root) return;
            
            const portalId = '39650877';
            const tableId = '148056649'; // sessions table ID
            const loadingDiv = root.querySelector('#sessions-loading-${moduleId}');
            const errorDiv = root.querySelector('#sessions-error-${moduleId}');
            const tableWrapper = root.querySelector('#sessions-table-wrapper-${moduleId}');
            
            // Helper function to format time from milliseconds timestamp
            function formatTime(timestamp) {
              const date = new Date(timestamp);
              const hours = date.getHours();
              const minutes = date.getMinutes();
              const ampm = hours >= 12 ? 'pm' : 'am';
              const displayHours = hours % 12 || 12;
              return displayHours + ':' + (minutes < 10 ? '0' + minutes : minutes) + ampm;
            }
            
            // Helper function to get time in minutes from start of day
            function getMinutesFromStartOfDay(timestamp) {
              const date = new Date(timestamp);
              return date.getHours() * 60 + date.getMinutes();
            }
            
            // Generate time slots (whole hours + 15-minute intervals)
            function generateTimeSlots(minTime, maxTime) {
              const slots = [];
              const minDate = new Date(minTime);
              const maxDate = new Date(maxTime);
              
              // Round down to nearest hour for start
              const startHour = minDate.getHours();
              const startSlot = new Date(minDate);
              startSlot.setHours(startHour, 0, 0, 0);
              
              // Round up to nearest hour for end
              const endHour = maxDate.getHours();
              const endMinutes = maxDate.getMinutes();
              const endSlot = new Date(maxDate);
              if (endMinutes > 0) {
                endSlot.setHours(endHour + 1, 0, 0, 0);
              } else {
                endSlot.setHours(endHour, 0, 0, 0);
              }
              
              // Generate slots: whole hours and 15-minute intervals
              let current = new Date(startSlot);
              while (current <= endSlot) {
                slots.push(new Date(current));
                current = new Date(current.getTime() + 15 * 60 * 1000); // Add 15 minutes
              }
              
              return slots;
            }
            
            // Calculate position and height for session box
            function calculateSessionPosition(session, timeSlots, slotHeight) {
              const startDate = new Date(session.start_time);
              const endDate = new Date(session.end_time);
              
              const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
              const endMinutes = endDate.getHours() * 60 + endDate.getMinutes();
              const duration = endMinutes - startMinutes;
              
              // Find the slot index for start time - find the slot that is at or just before start time
              let startSlotIndex = 0;
              for (let i = 0; i < timeSlots.length; i++) {
                const slotDate = timeSlots[i];
                const slotMinutes = slotDate.getHours() * 60 + slotDate.getMinutes();
                if (slotMinutes <= startMinutes) {
                  startSlotIndex = i;
                } else {
                  break;
                }
              }
              
              // Get the start slot's time
              const startSlotDate = timeSlots[startSlotIndex];
              const startSlotMinutes = startSlotDate.getHours() * 60 + startSlotDate.getMinutes();
              
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
            
            async function fetchSessions() {
              try {
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
                  
                  const speakers = (row.values?.speaker || []).map(function(s) {
                    return s.name || '';
                  }).filter(function(name) {
                    return name && name.trim() !== '';
                  });
                  
                  return {
                    id: row.id,
                    title: row.values?.session_title || 'Untitled Session',
                    start_time: row.values?.start_time || 0,
                    end_time: row.values?.end_time || 0,
                    room: room,
                    speakers: speakers,
                    description: row.values?.description || ''
                  };
                }).filter(function(session) {
                  return session.start_time > 0 && session.end_time > 0;
                });
                
                if (processedSessions.length === 0) {
                  loadingDiv.innerHTML = 'No valid sessions found';
                  loadingDiv.style.display = 'block';
                  return;
                }
                
                // Find min and max times
                const allStartTimes = processedSessions.map(function(s) { return s.start_time; });
                const allEndTimes = processedSessions.map(function(s) { return s.end_time; });
                const minTime = Math.min.apply(null, allStartTimes);
                const maxTime = Math.max.apply(null, allEndTimes);
                
                // Get unique rooms
                const uniqueRooms = [];
                const roomSet = new Set();
                processedSessions.forEach(function(session) {
                  if (!roomSet.has(session.room)) {
                    roomSet.add(session.room);
                    uniqueRooms.push(session.room);
                  }
                });
                
                // Generate time slots
                const timeSlots = generateTimeSlots(minTime, maxTime);
                
                // Create table structure
                const slotHeight = 120; // Height of each 15-minute slot in pixels (doubled from 60)
                
                // Create table
                const table = document.createElement('table');
                table.className = 'sessions-schedule-table';
                
                // Create header row with rooms
                const thead = document.createElement('thead');
                const headerRow = document.createElement('tr');
                
                // First cell is empty (for time column)
                const timeHeaderCell = document.createElement('th');
                timeHeaderCell.className = 'sessions-time-header';
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
                tableWrapper.appendChild(table);
                
                // Now place session boxes
                // First, make all room cells position relative
                const allRoomCells = tbody.querySelectorAll('.sessions-room-cell');
                allRoomCells.forEach(function(cell) {
                  cell.style.position = 'relative';
                });
                
                processedSessions.forEach(function(session) {
                  const roomIndex = uniqueRooms.indexOf(session.room);
                  if (roomIndex === -1) return;
                  
                  const position = calculateSessionPosition(session, timeSlots, slotHeight);
                  
                  // Find the starting cell based on start time
                  const startSlotIndex = position.startSlotIndex;
                  const startCell = tbody.querySelector('td[data-room="' + session.room + '"][data-slot-index="' + startSlotIndex + '"]');
                  
                  if (!startCell) return;
                  
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
                  
                  // Append to the starting cell
                  startCell.appendChild(sessionBox);
                });
                
                // Hide loading, show table
                loadingDiv.style.display = 'none';
                errorDiv.style.display = 'none';
                tableWrapper.style.display = 'block';
                
              } catch (err) {
                console.error('Error loading sessions:', err);
                loadingDiv.style.display = 'none';
                errorDiv.style.display = 'block';
                errorDiv.innerHTML = 'Error: ' + (err.message || 'Failed to load sessions');
              }
            }
            
            // Start fetching sessions
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', function() {
                setTimeout(fetchSessions, 100);
              });
            } else {
              setTimeout(fetchSessions, 100);
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

