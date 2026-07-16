import {
  ModuleFields,
  TextField,
  FormField,
  RichTextField,
  BooleanField,
} from '@hubspot/cms-components/fields';

export function Component({ fieldValues }) {
  const sectionId = fieldValues.sectionId || 'contact-us';
  const sectionClass = fieldValues.sectionClass || 'help-area';

  // Get selected form from FormField
  // FormField returns an object with form information
  const selectedForm = fieldValues.selectedForm || null;

  // Extract form details from FormField value
  // FormField can return: { guid, name, portalId, region } or just a string GUID
  let formId = '';
  let portalId = '39650877'; // Default portal ID
  let region = 'na1'; // Default region

  if (selectedForm) {
    if (typeof selectedForm === 'string') {
      // If it's just a string, it's the form GUID
      formId = selectedForm.trim();
    } else if (typeof selectedForm === 'object' && selectedForm !== null) {
      // If it's an object, extract properties
      // Try multiple possible property names
      formId = selectedForm.guid ||
        selectedForm.formId ||
        selectedForm.id ||
        selectedForm.value ||
        selectedForm.form_id ||
        (selectedForm.form && (selectedForm.form.guid || selectedForm.form.formId || selectedForm.form.id)) ||
        '';

      // Extract portal ID
      portalId = selectedForm.portalId ||
        selectedForm.portal_id ||
        (selectedForm.form && selectedForm.form.portalId) ||
        '39650877';

      // Extract region
      region = selectedForm.region ||
        (selectedForm.form && selectedForm.form.region) ||
        'na1';

      // Clean up formId
      if (formId) {
        formId = String(formId).trim();
      }
    }
  }

  // Create unique container ID for this form instance
  const formContainerId = `hs-form-container-${sectionId}-${formId ? formId.replace(/[^a-zA-Z0-9]/g, '') : 'empty'}`;

  return (
    <div className={sectionClass} id={sectionId}>
      <div className="container">
        <div className="help-inner">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="help-content">
                {fieldValues.content && (
                  <div dangerouslySetInnerHTML={{ __html: fieldValues.content }} />
                )}
                {(fieldValues.atcLabel || '').trim() && (
                  <div style={{ marginTop: '30px' }}>
                    <div
                      className="atc-widget"
                      data-atc-title={fieldValues.atcTitle}
                      data-atc-start={fieldValues.atcStart}
                      data-atc-end={fieldValues.atcEnd}
                      data-atc-description={fieldValues.atcDescription}
                      data-atc-location={fieldValues.atcLocation}
                      data-atc-label={fieldValues.atcLabel}
                    >
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="col-md-6">
              <div className="contact-form">
                {formId ? (
                  <>
                    <div id={formContainerId}></div>
                    <script
                      dangerouslySetInnerHTML={{
                        __html: `
                        (function() {
                          const containerId = '${formContainerId}';
                          const formId = '${formId}';
                          const portalId = '${portalId}';
                          const region = '${region}';
                          let retryCount = 0;
                          const maxRetries = 50; // 5 seconds max wait time
                          
                          function initializeForm() {
                            const container = document.getElementById(containerId);
                            if (!container) {
                              retryCount++;
                              if (retryCount < maxRetries) {
                                setTimeout(initializeForm, 100);
                              }
                              return;
                            }
                            
                            // Check if form is already initialized
                            if (container.querySelector('iframe') || container.querySelector('.hs-form') || container.querySelector('form')) {
                              return;
                            }
                            
                            // Check if hbspt is available
                            if (typeof hbspt !== 'undefined' && hbspt.forms && typeof hbspt.forms.create === 'function') {
                              try {
                                hbspt.forms.create({
                                  portalId: portalId,
                                  formId: formId,
                                  region: region,
                                  target: '#' + containerId
                                });
                              } catch (e) {
                                console.error('Error creating HubSpot form:', e);
                                container.innerHTML = '<div style="padding: 20px; text-align: center; color: #d32f2f; border: 2px dashed #ccc; border-radius: 5px;">Error loading form. Please check the form ID.</div>';
                              }
                            } else {
                              // Wait for HubSpot forms script to load
                              retryCount++;
                              if (retryCount < maxRetries) {
                                setTimeout(initializeForm, 100);
                              } else {
                                // Script didn't load, show error
                                container.innerHTML = '<div style="padding: 20px; text-align: center; color: #d32f2f; border: 2px dashed #ccc; border-radius: 5px;">HubSpot forms script failed to load. Please refresh the page.</div>';
                              }
                            }
                          }
                          
                          // Start initialization after a short delay to ensure DOM is ready
                          function startInit() {
                            setTimeout(initializeForm, 200);
                          }
                          
                          if (document.readyState === 'loading') {
                            document.addEventListener('DOMContentLoaded', startInit);
                          } else {
                            startInit();
                          }
                        })();
                      `,
                      }}
                    />
                  </>
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#666', border: '2px dashed #ccc', borderRadius: '5px' }}>
                    Please select a form in the content editor
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
    .atc-widget * { box-sizing: border-box; }
    .atc-widget { position: relative; display: inline-block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }

    .atc-btn {
      display: inline-flex; align-items: center; gap: 8px;
      background: #fbcc24;
      border-radius: 50px;
      color: #020e26;
      font-size: 18px;
      font-weight: 600;
      padding: 15px 30px;
      text-decoration: none;
      text-transform: capitalize;
      transition: .3s ease-in-out;
      border: 0;
      line-height: normal;
      cursor: pointer;
      user-select: none;
      letter-spacing: 0.01em;
    }
    .atc-btn:hover { background: #f0bc10; box-shadow: 0 6px 18px rgba(251,204,36,0.40); transform: translateY(-2px); }
    .atc-btn:active { transform: translateY(0); box-shadow: none; }
    .atc-btn svg { flex-shrink: 0; }

    .atc-dropdown {
      display: none; position: absolute; top: calc(100% + 6px); left: 0; z-index: 9999;
      min-width: 230px; border-radius: 10px;
      background: #fff; border: 1px solid #e5e7eb;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      overflow: hidden; animation: atcFadeIn 0.15s ease;
    }
    .atc-dropdown.atc-open { display: block; }

    @keyframes atcFadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .atc-dropdown a {
      display: flex; align-items: center; gap: 12px;
      padding: 11px 16px; text-decoration: none;
      color: #111827; font-size: 14px; font-weight: 500;
      transition: background 0.12s;
    }
    .atc-dropdown a:hover { background: #f3f4f6; }
    .atc-dropdown a img, .atc-dropdown a svg { width: 20px; height: 20px; flex-shrink: 0; }

    .atc-details {
      margin-top: 10px; padding: 14px 18px; border-radius: 10px;
      background: #f8faff; border: 1px solid #e0e7ff;
      font-size: 13.5px; color: #374151; line-height: 1.6;
      max-width: 360px;
    }
    .atc-details-title { font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 6px; }
    .atc-details-row { display: flex; gap: 8px; margin-bottom: 3px; }
    .atc-details-icon { flex-shrink: 0; margin-top: 2px; }
    ` }} />
      <script dangerouslySetInnerHTML={{
        __html: `
(function () {
  'use strict';
  function pad(n) { return String(n).padStart(2, '0'); }
  function toUTC(isoString) {
    var d = new Date(isoString);
    return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + 'Z';
  }
  function enc(s) { return encodeURIComponent(s || ''); }
  function googleURL(ev) {
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + enc(ev.title) + '&dates=' + toUTC(ev.start) + '/' + toUTC(ev.end) + '&details=' + enc(ev.description) + '&location=' + enc(ev.location);
  }
  function yahooURL(ev) {
    var start = new Date(ev.start);
    var end = new Date(ev.end);
    var dur = Math.round((end - start) / 60000);
    var hh = pad(Math.floor(dur / 60));
    var mm = pad(dur % 60);
    return 'https://calendar.yahoo.com/?v=60&view=d&type=20&title=' + enc(ev.title) + '&st=' + toUTC(ev.start) + '&dur=' + hh + mm + '&desc=' + enc(ev.description) + '&in_loc=' + enc(ev.location);
  }
  function outlookLiveURL(ev) {
    return 'https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=' + enc(ev.title) + '&startdt=' + enc(ev.start) + '&enddt=' + enc(ev.end) + '&body=' + enc(ev.description) + '&location=' + enc(ev.location);
  }
  function office365URL(ev) {
    return 'https://outlook.office.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=' + enc(ev.title) + '&startdt=' + enc(ev.start) + '&enddt=' + enc(ev.end) + '&body=' + enc(ev.description) + '&location=' + enc(ev.location);
  }
  function icsDataURI(ev) {
    var uid = 'atc-' + Date.now() + '@add-to-calendar-widget';
    var ics = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Add To Calendar Widget//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT','UID:' + uid,'DTSTART:' + toUTC(ev.start),'DTEND:' + toUTC(ev.end),'SUMMARY:' + (ev.title || '').replace(/\\n/g, '\\\\n'),'DESCRIPTION:' + (ev.description || '').replace(/\\n/g, '\\\\n'),'LOCATION:' + (ev.location || '').replace(/\\n/g, '\\\\n'),'END:VEVENT','END:VCALENDAR'].join('\\r\\n');
    return 'data:text/calendar;charset=utf8,' + encodeURIComponent(ics);
  }
  var icons = {
    calendar: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    chevron: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
    clock: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    pin: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    note: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  };
  var providerIcons = {
    google: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#4285F4" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.8 2.5 30.2 0 24 0 14.7 0 6.7 5.4 2.9 13.3l7.8 6C12.5 13 17.8 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.5c0-1.6-.1-3.2-.4-4.7H24v9h12.4c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7-10 7-17.3z"/><path fill="#FBBC05" d="M10.7 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.8-6A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.9 10.7l7.8-6z"/><path fill="#EA4335" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.2-7.7 2.2-6.2 0-11.5-4.2-13.3-9.8l-7.8 6C6.7 42.6 14.7 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg>',
    apple: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>',
    outlook: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#1976D2" d="M28 8h15a1 1 0 0 1 1 1v30a1 1 0 0 1-1 1H28V8z"/><path fill="#fff" d="M30 14h11v3H30zm0 6h11v3H30zm0 6h11v3H30zm0 6h11v3H30z"/><path fill="#1565C0" d="M4 10l24-2v32L4 38z"/><ellipse cx="16" cy="24" rx="6" ry="8" fill="#fff"/><ellipse cx="16" cy="24" rx="4" ry="6" fill="#1976D2"/></svg>',
    yahoo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#7B1FBE" d="M0 0h48v48H0z"/><text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-size="22" font-family="Arial Black,sans-serif" font-weight="900">Y!</text></svg>',
    office365: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#E74025" d="M27 6 8 12v24l19 6V6z"/><path fill="#FF8C00" d="M27 6l13 4v28l-13 4V6z"/><path fill="#fff" d="M17 19h14v2H17zm0 4h14v2H17zm0 4h14v2H17z" opacity=".6"/></svg>',
  };
  function formatDisplay(isoString) {
    try {
      var d = new Date(isoString);
      return d.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) { return isoString; }
  }
  function buildWidget(el) {
    if (el.dataset.atcInitialized) return;
    el.dataset.atcInitialized = "true";
    var ev = {
      title: el.dataset.atcTitle || 'Event',
      start: el.dataset.atcStart || '',
      end: el.dataset.atcEnd || '',
      description: el.dataset.atcDescription || '',
      location: el.dataset.atcLocation || '',
    };
    var label = el.dataset.atcLabel || 'Add to Calendar';
    var theme = el.dataset.atcTheme === 'dark' ? 'atc-dark' : '';
    var showDetails = el.dataset.atcDetails !== 'false';
    el.classList.add('atc-widget');
    if (theme) el.classList.add(theme);
    var btn = document.createElement('button');
    btn.className = 'atc-btn';
    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = icons.calendar + '<span>' + label + '</span>' + icons.chevron;
    var dropdown = document.createElement('div');
    dropdown.className = 'atc-dropdown';
    dropdown.setAttribute('role', 'menu');
    var providers = [
      { name: 'Google Calendar', icon: providerIcons.google, href: googleURL(ev), target: '_blank' },
      { name: 'Apple Calendar', icon: providerIcons.apple, href: icsDataURI(ev), download: ev.title + '.ics' },
      { name: 'Outlook (Live)', icon: providerIcons.outlook, href: outlookLiveURL(ev), target: '_blank' },
      { name: 'Outlook 365', icon: providerIcons.office365, href: office365URL(ev), target: '_blank' },
      { name: 'Yahoo Calendar', icon: providerIcons.yahoo, href: yahooURL(ev), target: '_blank' },
      { name: 'Download .ics', icon: providerIcons.apple, href: icsDataURI(ev), download: ev.title + '.ics' },
    ];
    providers.forEach(function (p) {
      var a = document.createElement('a');
      a.innerHTML = p.icon + '<span>' + p.name + '</span>';
      a.href = p.href;
      if (p.target) a.target = p.target;
      if (p.download) a.download = p.download;
      a.setAttribute('role', 'menuitem');
      dropdown.appendChild(a);
    });
    el.appendChild(btn);
    el.appendChild(dropdown);
    if (showDetails && ev.title) {
      var card = document.createElement('div');
      card.className = 'atc-details';
      var rows = '<div class="atc-details-title">' + ev.title + '</div>';
      if (ev.start) {
        rows += '<div class="atc-details-row"><span class="atc-details-icon">' + icons.clock + '</span><span>' + formatDisplay(ev.start) + (ev.end ? ' – ' + formatDisplay(ev.end) : '') + '</span></div>';
      }
      if (ev.location) {
        rows += '<div class="atc-details-row"><span class="atc-details-icon">' + icons.pin + '</span><span>' + ev.location + '</span></div>';
      }
      if (ev.description) {
        rows += '<div class="atc-details-row"><span class="atc-details-icon">' + icons.note + '</span><span>' + ev.description + '</span></div>';
      }
      card.innerHTML = rows;
      el.appendChild(card);
    }
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = dropdown.classList.toggle('atc-open');
      btn.setAttribute('aria-expanded', open);
    });
    document.addEventListener('click', function () {
      dropdown.classList.remove('atc-open');
      btn.setAttribute('aria-expanded', 'false');
    });
    dropdown.addEventListener('click', function (e) { e.stopPropagation(); });
  }
  function init() {
    var widgets = document.querySelectorAll('.atc-widget[data-atc-title]');
    widgets.forEach(buildWidget);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  // Also run every 500ms to catch dynamically added widgets
  setInterval(init, 500);
})();
` }} />
    </div>
  );
}

export const fields = (
  <ModuleFields>
    <RichTextField
      name="content"
      label="Contact Content"
      default="<h2>Contact Us Today</h2><p>GAI Insights is the premier source of GenAI news, research, and learning communities for companies and AI vendors.</p>"
      helpText="Add your contact heading and description here. Use H2 for the heading and P for the paragraph text."
    />
    <FormField
      name="selectedForm"
      label="Select HubSpot Form"
      helpText="Choose a form from your HubSpot account. The form will be displayed in this section."
    />
    <TextField
      name="atcLabel"
      label="Button Label (controls show/hide)"
      default=""
      helpText="Enter text to show the Save The Date button (e.g. 'Save The Date'). Leave empty to hide the button."
    />
    <TextField
      name="atcTitle"
      label="Event Title"
      default="GAI WORLD 2026"
    />
    <TextField
      name="atcStart"
      label="Start Datetime"
      default="2026-09-28T09:00"
      helpText="Format: YYYY-MM-DDTHH:MM"
    />
    <TextField
      name="atcEnd"
      label="End Datetime"
      default="2026-09-30T18:00"
      helpText="Format: YYYY-MM-DDTHH:MM"
    />
    <TextField
      name="atcDescription"
      label="Event Description"
      default="Join us for GAI WORLD 2026 — three days of AI innovation, keynotes, demos, and networking."
    />
    <TextField
      name="atcLocation"
      label="Event Location"
      default="Hynes Convention Center | Boston, MA"
    />
    <TextField
      name="sectionId"
      label="Section ID"
      default="contact-us"
      helpText="ID for anchor links (e.g., #contact-us). Leave empty for no ID."
    />
    <TextField
      name="sectionClass"
      label="Section CSS Class"
      default="help-area"
      helpText="Custom CSS class for this section. Default: help-area"
    />
  </ModuleFields>
);

export const meta = {
  label: 'Contact Us Today',
};

