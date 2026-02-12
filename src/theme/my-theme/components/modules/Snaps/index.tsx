import { ModuleFields, RepeatedFieldGroup, ImageField, TextField, UrlField, BooleanField, RichTextField } from '@hubspot/cms-components/fields';

const imagePath = (src?: string) =>
  src ? src : '';

// Helper function to extract URL from UrlField
const getUrl = (urlField: any): string => {
  if (!urlField) return '#';
  if (typeof urlField === 'string') return urlField;
  if (typeof urlField === 'object') {
    return urlField.url || urlField.href || urlField.value || '#';
  }
  return '#';
};

export function Component({ fieldValues }) {
  const content = fieldValues.content || '<h2>Learn from Dozens of Breakouts</h2><p>Breakout sessions focused on case studies. Tracks for Financial Services, Healthcare, Sales and Marketing, and Technology</p>';
  const buttonText = fieldValues.buttonText || '';
  const buttonLink = getUrl(fieldValues.buttonLink);
  const buttonOpenInNewWindow = fieldValues.buttonOpenInNewWindow || false;

  const top = (fieldValues.topSnaps || []).map((item: any) => imagePath(item?.image?.src)).filter(Boolean);
  const bottom = (fieldValues.bottomSnaps || []).map((item: any) => imagePath(item?.image?.src)).filter(Boolean);

  // Duplicate arrays for seamless infinite scroll
  const topImages = [...top, ...top];
  const bottomImages = [...bottom, ...bottom];

  const moduleId = `snaps-${fieldValues.moduleInstanceId || Math.random().toString(36).slice(2)}`;
  const sectionId = fieldValues.sectionId;
  const sectionClass = fieldValues.sectionClass || 'snaps-area';

  return (
    <div className={sectionClass} id={sectionId || undefined} data-snaps-id={moduleId}>
      <div className="container">
        <div className="snaps-text">
          <div className="snaps-content-wrapper">
            <div className="snaps-content" dangerouslySetInnerHTML={{ __html: content }} />
            {buttonText && (
              <div className="snaps-button-desktop">
                <a
                  href={buttonLink}
                  className="transparent-btn snaps-cta-btn"
                  target={buttonOpenInNewWindow ? '_blank' : undefined}
                  rel={buttonOpenInNewWindow ? 'noopener noreferrer' : undefined}
                >
                  {buttonText}
                </a>
              </div>
            )}
          </div>
          {buttonText && (
            <div className="snaps-button-mobile">
              <a
                href={buttonLink}
                className="transparent-btn snaps-cta-btn"
                target={buttonOpenInNewWindow ? '_blank' : undefined}
                rel={buttonOpenInNewWindow ? 'noopener noreferrer' : undefined}
              >
                {buttonText}
              </a>
            </div>
          )}
        </div>
      </div>
      <div className="event-slider">
        <div className="slider-row top-row" id={`topRow-${moduleId}`}>
          <div className="slide-track">
            {topImages.map((src, idx) => (
              <div className="slide-card" key={`top-snap-${idx}`}>
                <img src={src} alt={`Snap ${idx + 1}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="slider-row bottom-row" id={`bottomRow-${moduleId}`}>
          <div className="slide-track">
            {bottomImages.map((src, idx) => (
              <div className="slide-card" key={`bottom-snap-${idx}`}>
                <img src={src} alt={`Snap ${idx + 1}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="image-modal" id={`imageModal-${moduleId}`}>
          <span className="close-modal">&times;</span>
          <img id={`modalImg-${moduleId}`} />
        </div>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
          (function() {
            const root = document.querySelector('[data-snaps-id="${moduleId}"]');
            if (!root) return;
            
            function startContinuousScroll(rowSelector, direction = 'left', speed = 0.35) {
              const row = root.querySelector(rowSelector);
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

            startContinuousScroll('#topRow-${moduleId}', 'left', 0.35);
            startContinuousScroll('#bottomRow-${moduleId}', 'right', 0.35);

            // Handle smooth scrolling for Snaps CTA button
            function handleAnchorClick(e, href) {
              // Only handle anchor links (starting with #) on same page
              if (href && href.startsWith('#') && href.length > 1) {
                e.preventDefault();
                const targetId = href.substring(1); // Remove the #
                const target = document.getElementById(targetId);
                if (target) {
                  target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                  });
                }
              }
            }

            // Handle Snaps CTA button
            const snapsCtaBtn = root.querySelector('.snaps-cta-btn');
            if (snapsCtaBtn) {
              snapsCtaBtn.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                // Only handle if not opening in new window and is anchor link
                if (!this.getAttribute('target') && href && href.startsWith('#')) {
                  handleAnchorClick(e, href);
                }
              });
            }

            const modal = root.querySelector('#imageModal-${moduleId}');
            const modalImg = root.querySelector('#modalImg-${moduleId}');
            if (modal && modalImg) {
              root.addEventListener('click', function (e) {
                const img = e.target.closest('.slide-card img');
                if (!img) return;
                modalImg.src = img.src;
                modal.style.display = 'flex';
              });
              const closeBtn = modal.querySelector('.close-modal');
              if (closeBtn) {
                closeBtn.addEventListener('click', function () { 
                  modal.style.display = 'none'; 
                });
              }
              // Close on background click
              modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                  modal.style.display = 'none';
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
    <RichTextField
      name="content"
      label="Content"
      default="<h2>Learn from Dozens of Breakouts</h2><p>Breakout sessions focused on case studies. Tracks for Financial Services, Healthcare, Sales and Marketing, and Technology</p>"
      helpText="Add your heading and description here. Use H2 for the heading and P for the paragraph text."
    />
    <TextField
      name="buttonText"
      label="Button Text"
      helpText="Enter text for the button. Leave empty to hide the button."
    />
    <UrlField
      name="buttonLink"
      label="Button Link"
      helpText="Link URL for the button (can be internal page or external URL)"
    />
    <BooleanField
      name="buttonOpenInNewWindow"
      label="Open Button Link in New Window"
      default={false}
      helpText="Check to open the button link in a new tab/window"
    />
    <RepeatedFieldGroup
      name="topSnaps"
      label="Top row snap images"
      children={[<ImageField name="image" label="Snap image" required={true} />]}
    />

    <RepeatedFieldGroup
      name="bottomSnaps"
      label="Bottom row snap images"
      children={[<ImageField name="image" label="Snap image" required={true} />]}
    />
    <TextField
      name="sectionId"
      label="Section ID (optional)"
      helpText="ID for anchor links (e.g., #snaps). Leave empty for no ID."
    />
    <TextField
      name="sectionClass"
      label="Section CSS Class"
      default="snaps-area"
      helpText="Custom CSS class for this section. Default: snaps-area"
    />
  </ModuleFields>
);

export const meta = {
  label: 'Snaps From GAI Insights',
};

