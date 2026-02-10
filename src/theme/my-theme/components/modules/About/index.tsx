import { ModuleFields, TextField, UrlField, RichTextField } from '@hubspot/cms-components/fields';

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

  const stats = [
    { number: fieldValues.stat1Number, label: fieldValues.stat1Label },
    { number: fieldValues.stat2Number, label: fieldValues.stat2Label },
    { number: fieldValues.stat3Number, label: fieldValues.stat3Label },
  ];

  const moduleId = `about-${fieldValues.moduleInstanceId || Math.random().toString(36).slice(2)}`;
  const sectionId = fieldValues.sectionId || 'about-area';
  const ctaUrl = getUrl(fieldValues.ctaUrl) || '#';
  const sectionClass = fieldValues.sectionClass || 'about-section';

  return (
    <div className={sectionClass} id={sectionId} data-about-id={moduleId}>
      <div className="container">
        <div className="about-inner">
          <div className="row align-items-flex-start">
            <div className="col-md-4 custom-45">
              <div className="about-carousel">
                <div className="stats-carousel" id="statsCarousel">
                  <div className="carousel-track">
                    {stats.map((item, idx) => (
                      <div
                        key={idx}
                        className={`stats-slide ${idx === 0 ? 'active' : ''}`}
                      >
                        <div className="box">
                          <h2>
                            {item.number.includes('+') ? (
                              <>
                                {item.number.replace('+', '')}
                                <span>+</span>
                              </>
                            ) : (
                              item.number
                            )}
                          </h2>
                          <p>{item.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="carousel-controls">
                  <div className="dots">
                    {stats.map((_, idx) => (
                      <span
                        key={idx}
                        className={`dot ${idx === 0 ? 'active' : ''}`}
                        data-index={idx}
                      ></span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-8 custom-md-full">
              <div className="about-content">
                {fieldValues.content && (
                  <div dangerouslySetInnerHTML={{ __html: fieldValues.content }} />
                )}
                {fieldValues.ctaText && (
                  <a href={ctaUrl} className="transparent-btn about-cta-btn">
                    {fieldValues.ctaText}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simple vanilla JS slider controls, scoped to this module instance */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
          (function() {
            const root = document.querySelector('[data-about-id="${moduleId}"]');
            if (!root) return;
            const track = root.querySelector('.carousel-track');
            const slides = Array.from(root.querySelectorAll('.stats-slide'));
            const dots = Array.from(root.querySelectorAll('.dot'));
            if (!slides.length || !dots.length || !track) return;
            let idx = 0;
            // Lock each slide to full width of the carousel container
            const container = root.querySelector('.stats-carousel');
            const updateWidths = () => {
              const width = container.getBoundingClientRect().width;
              slides.forEach((s) => {
                s.style.minWidth = width + 'px';
                s.style.maxWidth = width + 'px';
              });
              track.style.width = width * slides.length + 'px';
              return width;
            };
            let slideWidth = updateWidths();

            track.style.display = 'flex';
            track.style.transition = 'transform 0.5s ease';
            const activate = (i) => {
              slides.forEach((s, n) => s.classList.toggle('active', n === i));
              dots.forEach((d, n) => d.classList.toggle('active', n === i));
              track.style.transform = 'translateX(' + (-i * slideWidth) + 'px)';
            };
            dots.forEach((dot, n) => {
              dot.addEventListener('click', () => {
                idx = n;
                activate(idx);
              });
            });
            const timer = setInterval(() => {
              idx = (idx + 1) % slides.length;
              activate(idx);
            }, 3000);
            activate(0);
            // adjust on resize
            window.addEventListener('resize', () => {
              slideWidth = updateWidths();
              activate(idx);
            });
            // clean up if editor hot swaps
            root.addEventListener('cms:unmount', () => clearInterval(timer));
          })();
        `,
        }}
      />

      {/* Separate script block for smooth scrolling - same as Hero section */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
          (function() {
            // Handle smooth scrolling for About CTA button
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

            // Handle About CTA button
            const aboutCtaBtn = document.querySelector('.about-section .about-cta-btn');
            if (aboutCtaBtn) {
              aboutCtaBtn.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                // Only handle if not opening in new window and is anchor link
                if (!this.getAttribute('target') && href && href.startsWith('#')) {
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
    <RichTextField
      name="content"
      label="Content"
      default="<h2>What is GAI World?</h2><p>GAI World (Generative AI World) is a major international conference focused on practical, real-world applications of generative artificial intelligence in business. It brings together industry leaders, AI experts, and enterprise professionals...</p>"
      helpText="Add your heading and paragraph content here. Use the heading format for titles and regular text for paragraphs."
    />
    <TextField name="ctaText" label="CTA text" default="Learn More" />
    <UrlField name="ctaUrl" label="CTA URL" helpText="Enter URL or section ID (e.g., #contact-us)" />

    <TextField name="stat1Number" label="Stat 1 number" default="350+" />
    <TextField name="stat1Label" label="Stat 1 label" default="Speakers" />
    <TextField name="stat2Number" label="Stat 2 number" default="500,000+" />
    <TextField name="stat2Label" label="Stat 2 label" default="Livestream Views" />
    <TextField name="stat3Number" label="Stat 3 number" default="13,000+" />
    <TextField name="stat3Label" label="Stat 3 label" default="In-person Attendees" />
    <TextField
      name="sectionId"
      label="Section ID"
      default="about-area"
      helpText="ID for anchor links (e.g., #about-area). Leave empty for no ID."
    />
    <TextField
      name="sectionClass"
      label="Section CSS Class"
      default="about-section"
      helpText="Custom CSS class for this section. Default: about-section"
    />
  </ModuleFields>
);

export const meta = {
  label: 'About (What is GAI World?)',
};

