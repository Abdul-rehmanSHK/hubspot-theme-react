import {
  ModuleFields,
  TextField,
  ColorField,
  BooleanField,
  UrlField,
} from '@hubspot/cms-components/fields';

export function Component({ fieldValues }) {
  const heading = fieldValues.heading || 'PAST ATTENDEES';
  const sponsorHeading = fieldValues.sponsorHeading || 'PAST SPONSORS';
  const bgColor = fieldValues.backgroundColor?.color || 'transparent';
  const sectionId = fieldValues.sectionId || 'past-attendees-banner';
  const showPastAttendees = fieldValues.showPastAttendees !== false;
  const showPastSponsors = fieldValues.showPastSponsors === true;

  const ctaText = fieldValues.ctaText || '';
  const ctaUrl = fieldValues.ctaUrl?.url || fieldValues.ctaUrl?.href || '#';
  const ctaOpenInNewWindow = fieldValues.ctaOpenInNewWindow || false;

  const containerStyle = {
    backgroundColor: bgColor,
    width: '100%',
    padding: '60px 0',
  };

  const customClass = fieldValues.customClass || '';

  return (
    <div className={`past-attendees-logo-banner ${customClass}`} id={sectionId} style={containerStyle}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          #${sectionId} .hero-sponsor-slide-card {
            background: transparent !important;
            box-shadow: none !important;
            width: 180px;
          }
          #${sectionId} .hero-sponsor-slide-card img {
            max-width: 150px;
            filter: brightness(0) invert(1);
            opacity: 0.9;
            transition: opacity 0.3s;
          }
          #${sectionId} .hero-sponsor-slide-card img:hover {
            opacity: 1;
          }
          #${sectionId} .hero-sponsor-slider-pre-title {
            margin-bottom: 30px;
            font-weight: bold;
            letter-spacing: 2px;
            font-size: 24px;
            text-align: center;
            color: #06C7EE;
          }
          .past-attendees-logo-banner .hero-sponsor-slider-wrapper {
            width: 100%;
            margin-bottom: 40px;
          }
          .past-attendees-logo-banner .hero-sponsor-slider-wrapper:last-of-type {
            margin-bottom: 20px;
          }
          .past-attendees-logo-banner .hero-sponsor-bottom-title {
            text-align: center;
            font-size: 18px;
            color: #ffffff;
            margin: 20px auto 30px;
            max-width: 800px;
            opacity: 0.8;
          }
          .past-attendees-logo-banner .banner-cta-container {
            margin-top: 30px;
            display: flex;
            justify-content: center;
            width: 100%;
          }
          .past-attendees-logo-banner .fill-btn {
            background: #06C7EE;
            color: #fff;
            padding: 12px 35px;
            border-radius: 5px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            text-decoration: none;
            transition: all 0.3s ease;
            display: inline-block;
          }
          .past-attendees-logo-banner .fill-btn:hover {
            opacity: 0.8;
            transform: translateY(-2px);
          }
        `,
        }}
      />
      <div className="container">
        {showPastAttendees && (
          <div className="hero-sponsor-slider-wrapper">
            {heading && (
              <div className="hero-sponsor-slider-pre-title">{heading}</div>
            )}
            <div className="hero-sponsor-slider" id={`hero-past-attendees-slider-${sectionId}`}>
              <div className="hero-sponsor-slider-row">
                <div
                  className="hero-sponsor-slide-track"
                  id={`hero-past-attendees-track-${sectionId}`}
                >
                  {/* JS Injection */}
                </div>
              </div>
            </div>
          </div>
        )}

        {showPastSponsors && (
          <div className="hero-sponsor-slider-wrapper">
            {sponsorHeading && (
              <div className="hero-sponsor-slider-pre-title">{sponsorHeading}</div>
            )}
            <div className="hero-sponsor-slider" id={`hero-past-sponsors-slider-${sectionId}`}>
              <div className="hero-sponsor-slider-row">
                <div
                  className="hero-sponsor-slide-track"
                  id={`hero-past-sponsors-track-${sectionId}`}
                >
                  {/* JS Injection */}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subheading rendered before CTA */}
        {sponsorsubHeading && (
          <div className="hero-sponsor-bottom-title">
            {sponsorsubHeading}
          </div>
        )}

        {ctaText && (
          <div className="banner-cta-container">
            <a
              href={ctaUrl}
              className="fill-btn"
              {...(ctaOpenInNewWindow ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {ctaText}
            </a>
          </div>
        )}
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
          (function() {
            const sectionId = '${sectionId}';
            const portalId = '39650877';
            
            function initSlider(type, tableId) {
              const sliderId = 'hero-' + type + '-slider-' + sectionId;
              const trackId = 'hero-' + type + '-track-' + sectionId;
              const container = document.getElementById(sliderId);
              const track = document.getElementById(trackId);
              
              if (!container || !track) return;
              
              async function fetchData() {
                try {
                  const apiUrl = 'https://api.hubapi.com/cms/v3/hubdb/tables/' + tableId + '/rows?portalId=' + portalId;
                  const response = await fetch(apiUrl);
                  if (!response.ok) throw new Error('Failed to fetch data');
                  const data = await response.json();
                  
                  const items = (data.results || []).map(function(row) {
                    return {
                      image: row.values?.image ? {
                        src: row.values.image.url || '',
                        alt: row.values.image.altText || 'Logo'
                      } : null
                    };
                  }).filter(function(x) { return x.image && x.image.src; });
                  
                  if (items.length === 0) {
                    container.closest('.hero-sponsor-slider-wrapper').style.display = 'none';
                    return;
                  }
                  
                  const images = [...items, ...items];
                  track.innerHTML = '';
                  
                  images.forEach(function(item, idx) {
                    const card = document.createElement('div');
                    card.className = 'hero-sponsor-slide-card';
                    card.innerHTML = '<img src="' + item.image.src + '" alt="' + (item.image.alt || 'Logo ' + (idx + 1)) + '" />';
                    track.appendChild(card);
                  });
                  
                  function startScroll() {
                    const imgs = track.querySelectorAll('img');
                    let loadedCount = 0;
                    if (imgs.length === 0) return;
                    
                    function checkLoaded() {
                      imgs.forEach(function(img) {
                        if (img.complete) {
                          loadedCount++;
                        } else {
                          img.addEventListener('load', function() {
                            loadedCount++;
                            if (loadedCount === imgs.length) initAnimation();
                          }, { once: true });
                        }
                      });
                      if (loadedCount === imgs.length) setTimeout(initAnimation, 50);
                    }
                    
                    function initAnimation() {
                      const halfWidth = track.scrollWidth / 2;
                      if (halfWidth <= 0) {
                        setTimeout(initAnimation, 100);
                        return;
                      }
                      let position = 0;
                      const speed = 0.35;
                      function animate() {
                        position -= speed;
                        if (position <= -halfWidth) position = 0;
                        track.style.transform = 'translateX(' + position + 'px)';
                        requestAnimationFrame(animate);
                      }
                      animate();
                    }
                    checkLoaded();
                  }
                  startScroll();
                } catch (err) {
                  console.warn('Error loading ' + type + ':', err);
                  container.style.display = 'none';
                }
              }
              fetchData();
            }
            
            const run = () => {
              ${showPastAttendees ? "initSlider('past-attendees', '240083827');" : ""}
              ${showPastSponsors ? "initSlider('past-sponsors', '240083829');" : ""}
            };

            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', run);
            } else {
              run();
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
      label="Past Attendees Heading"
      default="PAST ATTENDEES"
    />
    <TextField
      name="sponsorHeading"
      label="Past Sponsors Heading"
      default="PAST SPONSORS"
    />
    <BooleanField
      name="showPastAttendees"
      label="Show Past Attendees"
      default={true}
    />
    <BooleanField
      name="showPastSponsors"
      label="Show Past Sponsors"
      default={false}
    />
    <TextField
      name="sponsorsubHeading"
      label="Past Sponsors sub Heading"
      default="Backed by sponsors and partners across the AI ecosystem"
    />
    <ColorField
      name="backgroundColor"
      label="Background Color"
      default={{ color: '#ffffff', opacity: 0 }}
    />
    <TextField
      name="sectionId"
      label="Custom Section ID"
    />
    <TextField
      name="customClass"
      label="Custom CSS Class"
      helpText="Optional CSS class to add to the module wrapper for custom styling."
    />
    <TextField
      name="ctaText"
      label="Button Text"
      helpText="Text for the button (e.g., 'View All Sponsors'). Leave empty to hide."
    />
    <UrlField
      name="ctaUrl"
      label="Button URL"
      helpText="Where the button should link to."
    />
    <BooleanField
      name="ctaOpenInNewWindow"
      label="Open link in new window"
      default={false}
    />
  </ModuleFields>
);

export const meta = {
  label: 'Past Attendees Logo Banner',
};