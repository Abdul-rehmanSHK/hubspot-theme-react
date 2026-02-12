import {
  ModuleFields,
  TextField,
  UrlField,
  RichTextField,
} from '@hubspot/cms-components/fields';
import { useState, useEffect } from 'react';

export function Component({ fieldValues }) {
  const heading = fieldValues.heading || '<h2>Previous Speakers</h2>';
  // Handle UrlField structure - it can be a string or an object with url/href property
  const getUrl = (urlField) => {
    if (!urlField) return '#';
    if (typeof urlField === 'string') return urlField;
    if (typeof urlField === 'object') {
      return urlField.url || urlField.href || urlField.link || '#';
    }
    return '#';
  };

  const ctaText = fieldValues.ctaText || '';
  const ctaUrl = getUrl(fieldValues.ctaUrl) || '#';
  
  // HubDB API configuration
  const portalId = '39650877';
  const tableId = '146265866'; // past_speakers table ID
  
  // State for HubDB data - initialize as empty, will be populated by script
  const [speakers, setSpeakers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch speakers from HubDB using useEffect (fallback if hooks work)
  useEffect(() => {
    // This will only run if React hooks are supported in HubSpot environment
    const fetchSpeakers = async () => {
      try {
        const apiUrl = `https://api.hubapi.com/cms/v3/hubdb/tables/${tableId}/rows?portalId=${portalId}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        
        const data = await response.json();
        const transformedSpeakers = (data.results || []).map((row: any) => ({
          speakerName: row.values?.name || '',
          title: row.values?.title || '',
          company: row.values?.company || '',
          image: row.values?.image ? {
            src: row.values.image.url || '',
            alt: row.values.image.altText || row.values?.name || 'Speaker'
          } : null,
        }));
        
        setSpeakers(transformedSpeakers);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load');
        setLoading(false);
      }
    };

    fetchSpeakers();
  }, []);

  const moduleId = `featured-speakers-${fieldValues.moduleInstanceId || Math.random().toString(36).slice(2)}`;
  const sectionId = fieldValues.sectionId || 'featured-speakers';
  const sectionClass = fieldValues.sectionClass || 'speakers-area';

  return (
    <div className={sectionClass} id={sectionId} data-speakers-id={moduleId}>
      <div className="container">
        <div className="speakers-inner">
          <div className="row">
            <div className="col-md-8">
              <div className="speakers-text">
                {heading && (
                  <div className="speakers-heading" dangerouslySetInnerHTML={{ __html: heading }} />
                )}
              </div>
            </div>
            <div className="col-md-4">
              {ctaText && (
                <div className="speakers-btn">
                  <a href={ctaUrl} className="transparent-btn speakers-cta-btn">{ctaText}</a>
                </div>
              )}
            </div>
          </div>
          {/* Speakers will be loaded via JavaScript script below */}
          <div className="speaker-slider swiper">
            <div className="swiper-wrapper" id={`speaker-wrapper-${moduleId}`}>
              {/* Speakers will be inserted here by JavaScript */}
            </div>
            <div className="slider-controls-under-active">
              <div className="swiper-button-prev">
                <i className="fa-solid fa-arrow-left"></i>
              </div>
              <div className="swiper-button-next">
                <i className="fa-solid fa-arrow-right"></i>
              </div>
            </div>
          </div>
          <div id={`speaker-loading-${moduleId}`} style={{ padding: '40px', textAlign: 'center', color: '#050d51' }}>
            Loading speakers...
          </div>
          <div id={`speaker-error-${moduleId}`} style={{ display: 'none', padding: '40px', textAlign: 'center', color: '#d32f2f' }}>
            Error loading speakers
          </div>
        </div>
      </div>

      {/* Fetch featured speakers and initialize Swiper */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
          (function() {
            const root = document.querySelector('[data-speakers-id="${moduleId}"]');
            if (!root) return;
            
            const portalId = '${portalId}';
            const tableId = '${tableId}';
            const moduleId = '${moduleId}';
            const wrapper = root.querySelector('#speaker-wrapper-${moduleId}');
            const loadingDiv = root.querySelector('#speaker-loading-${moduleId}');
            const errorDiv = root.querySelector('#speaker-error-${moduleId}');
            let swiperInstance = null;
            
            // Fetch FEATURED speakers from HubDB API (featured === 1)
            async function fetchSpeakers() {
              try {
                const apiUrl = 'https://api.hubapi.com/cms/v3/hubdb/tables/' + tableId + '/rows?portalId=' + portalId;
                
                const response = await fetch(apiUrl);
                
                if (!response.ok) {
                  throw new Error('Failed to fetch: ' + response.status);
                }
                
                const data = await response.json();
                
                // Transform and filter for FEATURED speakers only (featured === 1)
                const speakers = (data.results || [])
                  .filter(function(row) {
                    return row.values?.featured === 1;
                  })
                  .map(function(row) {
                    return {
                      speakerName: row.values?.name || '',
                      title: row.values?.title || '',
                      company: row.values?.company || '',
                      image: row.values?.image ? {
                        src: row.values.image.url || '',
                        alt: row.values.image.altText || row.values?.name || 'Speaker'
                      } : null
                    };
                  });
                
                if (speakers.length === 0) {
                  loadingDiv.innerHTML = 'No featured speakers found';
                  loadingDiv.style.display = 'block';
                  return;
                }
                
                // Hide loading, show speakers
                loadingDiv.style.display = 'none';
                errorDiv.style.display = 'none';
                
                // Render speakers
                speakers.forEach(function(speaker, idx) {
                  const slide = document.createElement('div');
                  slide.className = 'swiper-slide';
                  
                  const imageSrc = speaker.image?.src || '';
                  const imageAlt = speaker.image?.alt || speaker.speakerName || 'Speaker ' + (idx + 1);
                  
                  slide.innerHTML = '<div class="team-member">' +
                    (imageSrc ? 
                      '<img src="' + imageSrc + '" alt="' + imageAlt + '" />' :
                      '<div style="width: 200px; height: 200px; border-radius: 50%; background: #06C7EE; display: flex; align-items: center; justify-content: center; color: #fff; margin: 0 auto;">No Image</div>'
                    ) +
                    '<div class="team-info">' +
                    (speaker.speakerName ? '<h4>' + speaker.speakerName + '</h4>' : '') +
                    (speaker.company ? '<p>' + speaker.company + '</p>' : '') +
                    (speaker.title ? '<span>' + speaker.title + '</span>' : '') +
                    '</div></div>';
                  
                  wrapper.appendChild(slide);
                });
                
                // Initialize Swiper after speakers are rendered
                initSwiper();
                
              } catch (err) {
                loadingDiv.style.display = 'none';
                errorDiv.style.display = 'block';
                errorDiv.innerHTML = 'Error: ' + (err.message || 'Failed to load speakers');
              }
            }
            
            // Initialize Swiper - matching Video Testimonials smooth behavior
            function initSwiper() {
              const slider = root.querySelector('.speaker-slider');
              if (!slider) {
                setTimeout(initSwiper, 100);
                return;
              }
              
              // Check if Swiper is already initialized
              if (slider.swiper) {
                return;
              }
              
              // Wait for Swiper library
              if (typeof Swiper === 'undefined') {
                setTimeout(initSwiper, 100);
                return;
              }
              
              // Check if slides exist
              const slides = slider.querySelectorAll('.swiper-slide');
              if (slides.length === 0) {
                setTimeout(initSwiper, 100);
                return;
              }
              
              // Get navigation buttons
              const nextBtn = root.querySelector('.swiper-button-next');
              const prevBtn = root.querySelector('.swiper-button-prev');
              
              // Initialize Swiper with exact same config as Video Testimonials for smooth sliding
              swiperInstance = new Swiper(slider, {
                slidesPerView: 3,
                spaceBetween: 30,
                centeredSlides: false,
                loop: true,
                loopAdditionalSlides: 0,
                grabCursor: true,
                watchSlidesProgress: true,
                speed: 600,
                autoplay: {
                  delay: 3000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: false,
                },
                navigation: {
                  nextEl: nextBtn,
                  prevEl: prevBtn,
                },
                breakpoints: {
                  0: {
                    slidesPerView: 1,
                    spaceBetween: 20,
                  },
                  768: {
                    slidesPerView: 2,
                    spaceBetween: 25,
                  },
                  1024: {
                    slidesPerView: 5,
                    spaceBetween: 30,
                  },
                },
              });
              
              // Click to activate specific slide
              setTimeout(function() {
                root.querySelectorAll('.speaker-slider .swiper-slide').forEach(function(slide) {
                  slide.addEventListener('click', function() {
                    if (swiperInstance) {
                      const realIndex = swiperInstance.getSlideIndex(slide);
                      if (realIndex !== undefined && realIndex !== null) {
                        swiperInstance.slideToLoop(realIndex);
                      }
                    }
                  });
                });
              }, 200);
            }
            
            // Start fetching speakers
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', function() {
                setTimeout(fetchSpeakers, 100);
              });
            } else {
              setTimeout(fetchSpeakers, 100);
            }
            
            // Clean up on unmount
            root.addEventListener('cms:unmount', function() {
              if (swiperInstance && swiperInstance.destroy) {
                swiperInstance.destroy(true, true);
              }
            });

            // Handle smooth scrolling for Speakers CTA button
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

            const speakersCtaBtn = root.querySelector('.speakers-cta-btn');
            if (speakersCtaBtn) {
              speakersCtaBtn.addEventListener('click', function(e) {
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
    <RichTextField
      name="heading"
      label="Heading"
      default="<h2>Previous Speakers</h2>"
      helpText="Add your heading content here. Use H2 for the main heading."
    />
    <TextField
      name="ctaText"
      label="CTA button text"
      helpText="Leave empty to hide the CTA button"
    />
    <UrlField
      name="ctaUrl"
      label="CTA button URL"
    />
    <TextField
      name="sectionId"
      label="Section ID"
      default="featured-speakers"
      helpText="ID for anchor links (e.g., #featured-speakers). Leave empty for no ID."
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
  label: 'Featured Speakers',
};

