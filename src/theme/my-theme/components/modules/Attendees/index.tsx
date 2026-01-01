import { ModuleFields, RepeatedFieldGroup, ImageField, TextField, UrlField } from '@hubspot/cms-components/fields';

const logoPath = (src?: string) =>
  src ? src : '';

export function Component({ fieldValues }) {
  // Handle UrlField structure - it can be a string or an object with url/href property
  const getUrl = (urlField) => {
    if (!urlField) return '#';
    if (typeof urlField === 'string') return urlField;
    if (typeof urlField === 'object') {
      return urlField.url || urlField.href || urlField.link || '#';
    }
    return '#';
  };

  const heading = fieldValues.heading || 'Attendees of GAI World';
  const ctaText = fieldValues.ctaText || 'Become a Sponsor';
  const ctaUrl = getUrl(fieldValues.ctaUrl) || '#';

  const top = (fieldValues.topLogos || []).map((item: any) => logoPath(item?.image?.src)).filter(Boolean);
  const bottom = (fieldValues.bottomLogos || []).map((item: any) => logoPath(item?.image?.src)).filter(Boolean);

  // Duplicate arrays for seamless infinite scroll
  const topImages = [...top, ...top];
  const bottomImages = [...bottom, ...bottom];
  const sectionId = fieldValues.sectionId || 'become-a-sponsor-or-exhibitor';

  return (
    <div className="announcements-area" id={sectionId}>
      <div className="container">
        <div className="logo-slider">
          <h2>{heading}</h2>
          <div className="event-slider">
            <div className="slider-row top-row" id="topRow">
              <div className="slide-track">
                {topImages.map((src, idx) => (
                  <div className="slide-card" key={`top-${idx}`}>
                    <img src={src} alt={`Logo ${idx + 1}`} />
                  </div>
                ))}
              </div>
            </div>

            <div className="slider-row bottom-row" id="bottomRow">
              <div className="slide-track">
                {bottomImages.map((src, idx) => (
                  <div className="slide-card" key={`bottom-${idx}`}>
                    <img src={src} alt={`Logo ${idx + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <a href={ctaUrl} className="transparent-btn attendees-cta-btn">
            {ctaText}
          </a>
        </div>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
          (function() {
            function startContinuousScroll(rowSelector, direction = 'left', speed = 0.35) {
              const row = document.querySelector(rowSelector);
              if (!row) return;
              const track = row.querySelector('.slide-track');
              if (!track) return;
              
              // Ensure seamless loop by checking track width
              const trackWidth = track.scrollWidth;
              const halfWidth = trackWidth / 2;
              
              // For right-moving sliders, start from negative position for seamless loop
              let position = direction === 'right' ? -halfWidth : 0;
              
              function animate() {
                position += (direction === 'left' ? -speed : speed);
                
                // Reset position when we've scrolled exactly half the track width
                // This creates seamless loop since we duplicated the content
                if (direction === 'left') {
                  // Moving left: reset when position reaches -halfWidth
                  if (position <= -halfWidth) {
                    position = 0;
                  }
                } else {
                  // Moving right: reset when position reaches 0
                  if (position >= 0) {
                    position = -halfWidth;
                  }
                }
                
                track.style.transform = 'translateX(' + position + 'px)';
                requestAnimationFrame(animate);
              }
              
              animate();
            }

            startContinuousScroll('#topRow', 'right', 0.35);
            startContinuousScroll('#bottomRow', 'left', 0.35);

            // Handle smooth scrolling for Attendees CTA button
            function handleAnchorClick(e, href) {
              if (href && href.startsWith('#') && href.length > 1) {
                e.preventDefault();
                const targetId = href.substring(1);
                const target = document.getElementById(targetId);
                if (target) {
                  target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                  });
                }
              }
            }

            const attendeesCtaBtn = document.querySelector('.announcements-area .attendees-cta-btn');
            if (attendeesCtaBtn) {
              attendeesCtaBtn.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href && href.startsWith('#')) {
                  handleAnchorClick(e, href);
                }
              });
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
    <TextField name="heading" label="Heading" default="Attendees of GAI World" />
    <TextField name="ctaText" label="CTA text" default="Become a Sponsor" />
    <UrlField name="ctaUrl" label="CTA URL" />

    <RepeatedFieldGroup
      name="topLogos"
      label="Top row logos"
      children={[<ImageField name="image" label="Logo image" required={true} />]}
    />

    <RepeatedFieldGroup
      name="bottomLogos"
      label="Bottom row logos"
      children={[<ImageField name="image" label="Logo image" required={true} />]}
    />
    <TextField
      name="sectionId"
      label="Section ID"
      default="become-a-sponsor-or-exhibitor"
      helpText="ID for anchor links (e.g., #become-a-sponsor-or-exhibitor). Leave empty for no ID."
    />
  </ModuleFields>
);

export const meta = {
  label: 'Attendees of GAI World',
};
