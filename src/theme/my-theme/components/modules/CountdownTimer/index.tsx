import { ModuleFields, TextField, BooleanField } from '@hubspot/cms-components/fields';

export function Component({ fieldValues }: { fieldValues: Record<string, any> }) {
  const targetDate = fieldValues.targetDate || '2026-06-30';
  const heading = fieldValues.heading || 'Event Starts In';
  const subheading = fieldValues.subheading || '';
  const expiredMessage = fieldValues.expiredMessage || 'The Event Has Started!';
  const showHeading = fieldValues.showHeading !== false;
  const sectionId = fieldValues.sectionId || 'countdown-section';
  const sectionClass = fieldValues.sectionClass || 'countdown-section-area';

  // Unique ID per instance so multiple timers on one page don't collide
  const instanceId = `cd-${sectionId}`;

  const script = `
(function() {
  var targetDate = new Date('${targetDate}T00:00:00').getTime();
  var instanceId = '${instanceId}';

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    var now = Date.now();
    var diff = targetDate - now;

    var blocksEl  = document.getElementById(instanceId + '-blocks');
    var expiredEl = document.getElementById(instanceId + '-expired');
    if (!blocksEl) return;

    if (diff <= 0) {
      blocksEl.style.display  = 'none';
      if (expiredEl) expiredEl.style.display = 'block';
      return;
    }

    var days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours   = Math.floor((diff / (1000 * 60 * 60)) % 24);
    var minutes = Math.floor((diff / (1000 * 60)) % 60);
    var seconds = Math.floor((diff / 1000) % 60);

    var d = document.getElementById(instanceId + '-days');
    var h = document.getElementById(instanceId + '-hours');
    var m = document.getElementById(instanceId + '-minutes');
    var s = document.getElementById(instanceId + '-seconds');

    if (d) d.textContent = pad(days);
    if (h) h.textContent = pad(hours);
    if (m) m.textContent = pad(minutes);
    if (s) s.textContent = pad(seconds);
  }

  tick();
  setInterval(tick, 1000);
})();
  `;

  return (
    <section className={sectionClass} id={sectionId}>
      <div className="countdown-inner">
        {showHeading && heading && (
          <div className="countdown-heading-wrap">
            <h2 className="countdown-heading">{heading}</h2>
            {subheading && <p className="countdown-subheading">{subheading}</p>}
          </div>
        )}

        {/* Expired message — hidden by default, script shows it when time is up */}
        <div id={`${instanceId}-expired`} className="countdown-expired" style={{ display: 'none' }}>
          {expiredMessage}
        </div>

        {/* Countdown blocks — script updates these every second */}
        <div id={`${instanceId}-blocks`} className="countdown-blocks">
          <div className="countdown-block">
            <div id={`${instanceId}-days`} className="countdown-number">00</div>
            <div className="countdown-label">Days</div>
          </div>
          <div className="countdown-colon">:</div>
          <div className="countdown-block">
            <div id={`${instanceId}-hours`} className="countdown-number">00</div>
            <div className="countdown-label">Hours</div>
          </div>
          <div className="countdown-colon">:</div>
          <div className="countdown-block">
            <div id={`${instanceId}-minutes`} className="countdown-number">00</div>
            <div className="countdown-label">Minutes</div>
          </div>
          <div className="countdown-colon">:</div>
          <div className="countdown-block">
            <div id={`${instanceId}-seconds`} className="countdown-number">00</div>
            <div className="countdown-label">Seconds</div>
          </div>
        </div>

        <div className="countdown-date-display">
          {new Date(targetDate + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: script }} />
    </section>
  );
}

export const fields = (
  <ModuleFields>
    <TextField
      name="targetDate"
      label="Target Date"
      default="2026-06-30"
      helpText="Date for the countdown in YYYY-MM-DD format. Example: 2026-06-30"
    />
    <TextField
      name="heading"
      label="Heading"
      default="Event Starts In"
      helpText="Main heading above the countdown timer."
    />
    <TextField
      name="subheading"
      label="Subheading"
      default=""
      helpText="Optional subheading below the main heading."
    />
    <TextField
      name="expiredMessage"
      label="Expired Message"
      default="The Event Has Started!"
      helpText="Message to show after the countdown reaches zero."
    />
    <BooleanField
      name="showHeading"
      label="Show Heading"
      default={true}
      helpText="Toggle to show or hide the heading."
    />
    <TextField
      name="sectionId"
      label="Section ID"
      default="countdown-section"
      helpText="HTML id attribute for anchor links."
    />
    <TextField
      name="sectionClass"
      label="Section CSS Class"
      default="countdown-section-area"
      helpText="CSS class for the section wrapper."
    />
  </ModuleFields>
);

export const meta = {
  label: 'Countdown Timer',
};
