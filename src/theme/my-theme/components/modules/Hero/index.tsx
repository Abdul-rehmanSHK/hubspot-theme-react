import { ModuleFields, ImageField, TextField, UrlField, FileField, RepeatedFieldGroup, BooleanField, RichTextField, FormField } from '@hubspot/cms-components/fields';

export function Component({ fieldValues }) {
  // Handle UrlField structure - it can be a string or an object with url/href property
  // For video URLs, return empty string (not '#') to match VideoTestimonials behavior
  const getUrl = (urlField) => {
    if (!urlField) return '';
    if (typeof urlField === 'string') return urlField;
    if (typeof urlField === 'object') {
      return urlField.url || urlField.href || urlField.link || '';
    }
    return '';
  };

  // Separate function for non-video URLs that need '#' fallback
  const getUrlWithHash = (urlField) => {
    if (!urlField) return '#';
    if (typeof urlField === 'string') return urlField;
    if (typeof urlField === 'object') {
      return urlField.url || urlField.href || urlField.link || '#';
    }
    return '#';
  };

  // Convert video URLs to appropriate format (YouTube, Vimeo, direct video files, or embed URLs)
  const convertToEmbedUrl = (url, autoplay = false) => {
    if (!url || typeof url !== 'string') return '';

    const trimmedUrl = url.trim();
    if (!trimmedUrl) return '';

    // Check if it's a direct video file (mp4, webm, ogg, mov, etc.)
    const directVideoExtensions = /\.(mp4|webm|ogg|ogv|mov|m4v|avi|wmv|flv)(\?.*)?$/i;
    if (directVideoExtensions.test(trimmedUrl)) {
      // Return as-is for direct video files (will be handled by <video> tag)
      return trimmedUrl;
    }

    // YouTube handling
    // If already a YouTube embed URL, clean it up
    if (trimmedUrl.includes('youtube.com/embed/')) {
      const embedMatch = trimmedUrl.match(/youtube\.com\/embed\/([^&\n?#]+)/);
      if (embedMatch && embedMatch[1]) {
        const videoId = embedMatch[1];
        if (autoplay) {
          // Check if URL already has query parameters
          const hasParams = trimmedUrl.includes('?');
          if (hasParams) {
            // Append autoplay params to existing query string
            const separator = trimmedUrl.includes('&') ? '&' : '&';
            return `${trimmedUrl}${separator}autoplay=1&mute=1&loop=1&playlist=${videoId}`;
          }
          return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`;
        }
        // Return clean URL without autoplay
        return `https://www.youtube.com/embed/${videoId}`;
      }
      return trimmedUrl;
    }

    // Extract video ID from various YouTube URL formats
    let videoId = '';
    const watchMatch = trimmedUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/v\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (watchMatch && watchMatch[1]) {
      videoId = watchMatch[1];
    }

    if (!videoId) {
      const shortMatch = trimmedUrl.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
      if (shortMatch && shortMatch[1]) {
        videoId = shortMatch[1];
      }
    }

    // If we found a YouTube video ID, convert to embed format
    if (videoId) {
      if (autoplay) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`;
      }
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // Vimeo handling
    if (trimmedUrl.includes('vimeo.com/')) {
      // Extract Vimeo video ID
      const vimeoMatch = trimmedUrl.match(/vimeo\.com\/(?:.*\/)?(\d+)/);
      if (vimeoMatch && vimeoMatch[1]) {
        const vimeoId = vimeoMatch[1];
        if (autoplay) {
          return `https://player.vimeo.com/video/${vimeoId}?autoplay=1&muted=1&loop=1`;
        }
        return `https://player.vimeo.com/video/${vimeoId}`;
      }
      // If already a Vimeo embed URL, add autoplay params if needed
      if (trimmedUrl.includes('player.vimeo.com')) {
        if (autoplay && !trimmedUrl.includes('autoplay=1')) {
          const separator = trimmedUrl.includes('?') ? '&' : '?';
          return `${trimmedUrl}${separator}autoplay=1&muted=1&loop=1`;
        }
        return trimmedUrl;
      }
    }

    // If it looks like an embed URL (contains /embed/ or /player/), return as is
    if (trimmedUrl.includes('/embed/') || trimmedUrl.includes('/player/')) {
      return trimmedUrl;
    }

    // For any other URL, return as is (might be a direct video URL or other platform)
    return trimmedUrl;
  };

  // Check if URL is a direct video file (needs <video> tag instead of <iframe>)
  const isDirectVideoFile = (url) => {
    if (!url || typeof url !== 'string') return false;
    const directVideoExtensions = /\.(mp4|webm|ogg|ogv|mov|m4v|avi|wmv|flv)(\?.*)?$/i;
    return directVideoExtensions.test(url.trim());
  };

  // All values are now editable from content editor - no defaults, only show if content exists
  const headingOverride = (fieldValues.headingOverride || '').trim();
  const preTitle = fieldValues.preTitle || '';
  const title = fieldValues.title || '';
  const dateLine = fieldValues.dateLine || '';
  const locationLine = fieldValues.locationLine || '';
  const ctaText = fieldValues.ctaText || '';
  const ctaUrl = getUrlWithHash(fieldValues.ctaUrl) || '#';
  const ctaOpenInNewWindow = fieldValues.ctaOpenInNewWindow || false;
  const ctaText2 = (fieldValues.ctaText2 || '').trim();
  const ctaUrl2 = getUrlWithHash(fieldValues.ctaUrl2) || '#';
  const ctaOpenInNewWindow2 = fieldValues.ctaOpenInNewWindow2 || false;
  const rawDownArrowUrl = getUrlWithHash(fieldValues.downArrowUrl);
  const downArrowUrl = (rawDownArrowUrl && rawDownArrowUrl !== '#') ? rawDownArrowUrl : '';

  // Handle multiple subheadings - support both old single subheading and new repeated field group
  const subheadings = fieldValues.subheadings || [];
  const legacySubheading = fieldValues.subheading || '';

  // Convert legacy single subheading to array format for backward compatibility
  const allSubheadings = subheadings.length > 0
    ? subheadings.map((item: any) => item.text || item.subheading || '').filter((text: string) => text && text.trim())
    : (legacySubheading ? [legacySubheading] : []);

  // Sponsor slider checkbox
  const showSponsorSlider = fieldValues.showSponsorSlider || false;
  const showFeaturedPlusSponsorSlider = fieldValues.showFeaturedPlusSponsorSlider || false;
  const showAttendees = fieldValues.showAttendees || false;
  const showPastAttendees = fieldValues.showPastAttendees || false;
  const showPastSponsors = fieldValues.showPastSponsors || false;
  const sponsorSliderPreTitle = fieldValues.sponsorSliderPreTitle || '';

  // Handle autoplay setting
  const videoAutoplay = fieldValues.videoAutoplay === true || fieldValues.videoAutoplay === 'true';

  // Handle video: Check for URL first, then fall back to file upload
  // Use the same logic as VideoTestimonials component
  const rawVideoUrl = getUrl(fieldValues.videoUrl) || '';
  const processedVideoUrl = rawVideoUrl ? convertToEmbedUrl(rawVideoUrl, videoAutoplay) : '';

  // Fall back to file upload if no URL provided
  const videoFile = fieldValues.videoFile;
  let videoFileSrc = '';

  if (videoFile && !processedVideoUrl) {
    if (typeof videoFile === 'string') {
      videoFileSrc = videoFile;
    } else if (typeof videoFile === 'object') {
      // Try common property names
      videoFileSrc = videoFile.src || videoFile.url || videoFile.href || videoFile.path || '';
    }
  }

  // Determine which video source to use (prioritize URL over file)
  const hasVideoUrl = !!processedVideoUrl;
  const hasVideoFile = !!videoFileSrc;
  const isDirectVideo = hasVideoUrl && isDirectVideoFile(processedVideoUrl);
  const hasVideo = hasVideoUrl || hasVideoFile;

  const videoTitle = fieldValues.videoTitle || '';

  // Handle image upload
  const imageFile = fieldValues.imageFile;
  let imageFileSrc = '';

  if (imageFile) {
    if (typeof imageFile === 'string') {
      imageFileSrc = imageFile;
    } else if (typeof imageFile === 'object') {
      // Try common property names
      imageFileSrc = imageFile.src || imageFile.url || imageFile.href || imageFile.path || '';
    }
  }

  const hasImage = !!imageFileSrc;

  // Get background image from field or use default
  const bgImage = fieldValues.backgroundImage?.src || '/_hcms/themes/gai-world-2026-theme/assets/images/bg.jpg';
  const heroStyle = {
    backgroundImage: `url(${bgImage})`,
    backgroundSize: 'contain',
    backgroundPosition: 'top left',
    backgroundRepeat: 'no-repeat',
  };

  const sectionId = fieldValues.sectionId || '2025';
  const sectionClass = fieldValues.sectionClass || 'hero';

  // Form logic
  const selectedForm = fieldValues.selectedForm || null;
  let formId = '';
  let portalId = '39650877'; // Default portal ID
  let region = 'na1'; // Default region
  
  if (selectedForm) {
    if (typeof selectedForm === 'string') {
      formId = selectedForm.trim();
    } else if (typeof selectedForm === 'object' && selectedForm !== null) {
      formId = selectedForm.guid || 
               selectedForm.formId || 
               selectedForm.id || 
               selectedForm.value || 
               selectedForm.form_id ||
               (selectedForm.form && (selectedForm.form.guid || selectedForm.form.formId || selectedForm.form.id)) ||
               '';
      
      portalId = selectedForm.portalId || 
                 selectedForm.portal_id || 
                 (selectedForm.form && selectedForm.form.portalId) ||
                 '39650877';
      
      region = selectedForm.region || 
               (selectedForm.form && selectedForm.form.region) ||
               'na1';
      
      if (formId) formId = String(formId).trim();
    }
  }
  
  const formContainerId = `hs-form-container-${sectionId}-${formId ? formId.replace(/[^a-zA-Z0-9]/g, '') : 'empty'}`;

  return (
    <div className={sectionClass} id={sectionId} style={heroStyle}>
      <div className="container">
        <div className="hero-content">
          <div className="row g-5 align-items-center">
            <div className="col-md-12">
              <div className="left-area">
                {headingOverride ? (
                  <div className="heading heading-override" dangerouslySetInnerHTML={{ __html: headingOverride }} />
                ) : (
                  <>
                    {(preTitle || title) && (
                      <div className="heading">
                        {preTitle && <div className="pre-title">{preTitle}</div>}
                        {title && <h1>{title}</h1>}
                      </div>
                    )}
                    {(dateLine || locationLine) && (
                      <div className="location-div">
                        {dateLine && <span>{dateLine}</span>}
                        {dateLine && locationLine && <br />}
                        {locationLine && <span>{locationLine}</span>}
                      </div>
                    )}
                  </>
                )}

                {/* Hero Action Area (Discount, Buttons, Timer) */}
                <div className="hero-action-area">
                  {fieldValues.showCountdown && fieldValues.discountText && (
                    <div className="hero-discount-text">{fieldValues.discountText}</div>
                  )}

                  {(ctaText || ctaText2) && (
                    <div className="hero-cta-buttons">
                      {ctaText && (
                        <a
                          href={ctaUrl}
                          className="fill-btn"
                          {...(ctaOpenInNewWindow ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        >
                          {ctaText}
                        </a>
                      )}
                      {ctaText2 && (
                        <a
                          href={ctaUrl2}
                          className="fill-btn"
                          {...(ctaOpenInNewWindow2 ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        >
                          {ctaText2}
                        </a>
                      )}
                    </div>
                  )}

                  {/* Price Increase and Countdown Timer */}
                  {fieldValues.showCountdown && fieldValues.countdownDate && (
                    <div className="hero-countdown-container">
                      {fieldValues.priceIncreaseText && (
                        <div className="price-increase-text">{fieldValues.priceIncreaseText}</div>
                      )}
                      <div className="countdown-timer" id={`countdown-${sectionId}`}>
                        <div className="countdown-item">
                          <span className="days">00</span>
                          <label>Days</label>
                        </div>
                        <div className="countdown-item">
                          <span className="hours">00</span>
                          <label>Hours</label>
                        </div>
                        <div className="countdown-item">
                          <span className="minutes">00</span>
                          <label>Minutes</label>
                        </div>
                        <div className="countdown-item">
                          <span className="seconds">00</span>
                          <label>Seconds</label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* HubSpot Form Rendering */}
                  {formId && (
                    <div className="hero-form-wrapper" style={{ marginTop: '30px' }}>
                      <div id={formContainerId}></div>
                      <script
                        dangerouslySetInnerHTML={{
                          __html: `
                          (function() {
                            const containerId = '${formContainerId}';
                            const fId = '${formId}';
                            const pId = '${portalId}';
                            const reg = '${region}';
                            let retryCount = 0;
                            const maxRetries = 50;
                            
                            function initializeForm() {
                              const container = document.getElementById(containerId);
                              if (!container) {
                                retryCount++;
                                if (retryCount < maxRetries) {
                                  setTimeout(initializeForm, 100);
                                }
                                return;
                              }
                              
                              if (container.querySelector('iframe') || container.querySelector('.hs-form') || container.querySelector('form')) {
                                return;
                              }
                              
                              if (typeof hbspt !== 'undefined' && hbspt.forms && typeof hbspt.forms.create === 'function') {
                                try {
                                  hbspt.forms.create({
                                    portalId: pId,
                                    formId: fId,
                                    region: reg,
                                    target: '#' + containerId
                                  });
                                } catch (e) {
                                  console.error('Error creating HubSpot form in Hero:', e);
                                  container.innerHTML = '<div style="padding: 20px; text-align: center; color: #d32f2f; border: 2px dashed #ccc; border-radius: 5px;">Error loading form.</div>';
                                }
                              } else {
                                retryCount++;
                                if (retryCount < maxRetries) {
                                  setTimeout(initializeForm, 100);
                                } else {
                                  container.innerHTML = '<div style="padding: 20px; text-align: center; color: #d32f2f; border: 2px dashed #ccc; border-radius: 5px;">HubSpot forms script failed to load.</div>';
                                }
                              }
                            }
                            
                            setTimeout(initializeForm, 200);
                          })();
                        `,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-6 hide">
              {(hasVideo || hasImage) && (
                <div className="right-area">
                  <div className="banner-video">
                    {hasImage ? (
                      // Image file upload - display image with same dimensions as video (priority over video)
                      <img
                        src={imageFileSrc}
                        alt={fieldValues.imageAlt || 'Hero image'}
                        width="625"
                        height="380"
                        style={{ width: '100%', height: 'auto', maxWidth: '625px', display: 'block' }}
                      />
                    ) : hasVideo ? (
                      hasVideoUrl ? (
                        // Use URL (YouTube, Vimeo, or direct video file)
                        isDirectVideo ? (
                          // Direct video file from URL - use <video> tag
                          <video
                            width="625"
                            height="380"
                            controls
                            {...(videoAutoplay ? { autoPlay: true, loop: true, muted: true } : {})}
                            style={{ width: '100%', height: 'auto', maxWidth: '625px' }}
                          >
                            <source src={processedVideoUrl} type="video/mp4" />
                            <source src={processedVideoUrl} type="video/ogg" />
                            <source src={processedVideoUrl} type="video/webm" />
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          // Embed URL (YouTube, Vimeo, etc.) - use <iframe>
                          <iframe
                            width="625"
                            height="380"
                            src={processedVideoUrl}
                            title={videoTitle || 'Video'}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        )
                      ) : hasVideoFile ? (
                        // File upload - use <video> tag
                        <video
                          width="625"
                          height="380"
                          controls
                          {...(videoAutoplay ? { autoPlay: true, loop: true, muted: true } : {})}
                          style={{ width: '100%', height: 'auto', maxWidth: '625px' }}
                        >
                          <source src={videoFileSrc} type="video/mp4" />
                          <source src={videoFileSrc} type="video/ogg" />
                          <source src={videoFileSrc} type="video/webm" />
                          Your browser does not support the video tag.
                        </video>
                      ) : null
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </div>
          {showSponsorSlider && (
            <div className="hero-sponsor-slider-wrapper">
              {sponsorSliderPreTitle && (
                <div className="hero-sponsor-slider-pre-title">{sponsorSliderPreTitle}</div>
              )}
              <div className="hero-sponsor-slider" id={`hero-sponsor-slider-${sectionId}`}>
                <div className="hero-sponsor-slider-row">
                  <div className="hero-sponsor-slide-track" id={`hero-sponsor-track-${sectionId}`}>
                    {/* Sponsor logos will be inserted here by JavaScript */}
                  </div>
                </div>
              </div>
            </div>
          )}
          {showFeaturedPlusSponsorSlider && (
            <div className="hero-sponsor-slider-wrapper">
              {sponsorSliderPreTitle && (
                <div className="hero-sponsor-slider-pre-title">{sponsorSliderPreTitle}</div>
              )}
              <div className="hero-sponsor-slider" id={`hero-featured-plus-sponsor-slider-${sectionId}`}>
                <div className="hero-sponsor-slider-row">
                  <div className="hero-sponsor-slide-track" id={`hero-featured-plus-sponsor-track-${sectionId}`}>
                    {/* Featured Plus Sponsor logos will be inserted here by JavaScript */}
                  </div>
                </div>
              </div>
            </div>
          )}
          {showAttendees && (
            <div className="hero-sponsor-slider-wrapper">
              {sponsorSliderPreTitle && (
                <div className="hero-sponsor-slider-pre-title">{sponsorSliderPreTitle}</div>
              )}
              <div className="hero-sponsor-slider" id={`hero-attendees-slider-${sectionId}`}>
                <div className="hero-sponsor-slider-row">
                  <div className="hero-sponsor-slide-track" id={`hero-attendees-track-${sectionId}`}>
                    {/* Unranked sponsors (attendees) will be inserted here by JavaScript */}
                  </div>
                </div>
              </div>
            </div>
          )}
          {showPastAttendees && (
            <div className="hero-sponsor-slider-wrapper">
              {sponsorSliderPreTitle && (
                <div className="hero-sponsor-slider-pre-title">{sponsorSliderPreTitle}</div>
              )}
              <div className="hero-sponsor-slider" id={`hero-past-attendees-slider-${sectionId}`}>
                <div className="hero-sponsor-slider-row">
                  <div className="hero-sponsor-slide-track" id={`hero-past-attendees-track-${sectionId}`}>
                    {/* Past attendees will be inserted here by JavaScript */}
                  </div>
                </div>
              </div>
            </div>
          )}
          {showPastSponsors && (
            <div className="hero-sponsor-slider-wrapper">
              {sponsorSliderPreTitle && (
                <div className="hero-sponsor-slider-pre-title">{sponsorSliderPreTitle}</div>
              )}
              <div className="hero-sponsor-slider" id={`hero-past-sponsors-slider-${sectionId}`}>
                <div className="hero-sponsor-slider-row">
                  <div className="hero-sponsor-slide-track" id={`hero-past-sponsors-track-${sectionId}`}>
                    {/* Past sponsors will be inserted here by JavaScript */}
                  </div>
                </div>
              </div>
            </div>
          )}
          {allSubheadings.length > 0 && (
            <div className="hero-subheading-container">
              <h2 className="hero-subheading" id={`hero-subheading-${sectionId}`}>
                {allSubheadings.length === 1 ? allSubheadings[0] : ''}
              </h2>
              {allSubheadings.length > 1 && (
                <span className="typewriter-cursor">|</span>
              )}
            </div>
          )}
        </div>
        {downArrowUrl && (
          <a href={downArrowUrl} className="aero-btn">
            <i className="fa-solid fa-arrow-down"></i>
          </a>
        )}
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
          (function() {
            // Handle smooth scrolling for anchor links in hero section
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

            // Handle Hero CTA buttons (fill-btn) - both primary and second CTA
            const heroCtaBtns = document.querySelectorAll('.hero .fill-btn');
            heroCtaBtns.forEach(function(btn) {
              btn.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (!this.getAttribute('target') && href && href.startsWith('#')) {
                  handleAnchorClick(e, href);
                }
              });
            });

            // Handle down arrow button (aero-btn) - same logic as CTA button
            const aeroBtn = document.querySelector('.hero .aero-btn');
            if (aeroBtn) {
              aeroBtn.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                // Only handle if not opening in new window and is anchor link
                if (!this.getAttribute('target') && href && href.startsWith('#')) {
                  handleAnchorClick(e, href);
                }
                // If it's a regular URL (not anchor), let it navigate normally
                // If it's opening in new window, let it navigate normally
              });
            }
            
            // Fetch and display featured sponsors for hero slider
            const showSponsorSlider = ${JSON.stringify(showSponsorSlider)};
            if (showSponsorSlider) {
              const sponsorSliderContainer = document.getElementById('hero-sponsor-slider-${sectionId}');
              const sponsorTrack = document.getElementById('hero-sponsor-track-${sectionId}');
              
              if (sponsorSliderContainer && sponsorTrack) {
                const portalId = '39650877';
                const tableId = '146535020'; // sponsors table ID
                
                async function fetchFeaturedSponsors() {
                  try {
                    const apiUrl = 'https://api.hubapi.com/cms/v3/hubdb/tables/' + tableId + '/rows?portalId=' + portalId;
                    const response = await fetch(apiUrl);
                    
                    if (!response.ok) {
                      throw new Error('Failed to fetch sponsors: ' + response.status);
                    }
                    
                    const data = await response.json();
                    
                    // Filter only featured sponsors (featured === 1)
                    const featuredSponsors = (data.results || []).filter(function(row) {
                      return row.values?.featured === 1;
                    }).map(function(row) {
                      return {
                        image: row.values?.image ? {
                          src: row.values.image.url || '',
                          alt: row.values.image.altText || 'Sponsor'
                        } : null
                      };
                    }).filter(function(sponsor) {
                      return sponsor.image && sponsor.image.src;
                    });
                    
                    if (featuredSponsors.length === 0) {
                      sponsorSliderContainer.style.display = 'none';
                      return;
                    }
                    
                    const isSliderEnabled = featuredSponsors.length > 8;
                    const sponsorImages = isSliderEnabled ? [...featuredSponsors, ...featuredSponsors] : featuredSponsors;
                    
                    if (!isSliderEnabled) {
                      const row = sponsorSliderContainer.querySelector('.hero-sponsor-slider-row');
                      if (row) {
                        row.style.whiteSpace = 'normal';
                        row.style.overflow = 'visible';
                      }
                      sponsorTrack.style.justifyContent = 'center';
                      sponsorTrack.style.flexWrap = 'wrap';
                      sponsorTrack.style.width = '100%';
                    }
                    
                    // Clear existing content
                    sponsorTrack.innerHTML = '';
                    
                    // Create sponsor logo cards
                    sponsorImages.forEach(function(sponsor, idx) {
                      const card = document.createElement('div');
                      card.className = 'hero-sponsor-slide-card';
                      card.innerHTML = '<img src="' + sponsor.image.src + '" alt="' + (sponsor.image.alt || 'Sponsor ' + (idx + 1)) + '" />';
                      sponsorTrack.appendChild(card);
                    });
                    
                    // Start continuous scrolling animation
                    function startSponsorScroll() {
                      if (!isSliderEnabled) return;
                      const track = sponsorTrack;
                      if (!track) return;
                      
                      // Wait for all images to load to get accurate width calculation
                      const images = track.querySelectorAll('img');
                      let imagesLoaded = 0;
                      const totalImages = images.length;
                      
                      if (totalImages === 0) {
                        return;
                      }
                      
                      function checkImagesLoaded() {
                        images.forEach(function(img) {
                          if (img.complete && img.naturalWidth > 0) {
                            imagesLoaded++;
                          } else {
                            img.addEventListener('load', function() {
                              imagesLoaded++;
                              if (imagesLoaded === totalImages) {
                                initAnimation();
                              }
                            }, { once: true });
                            img.addEventListener('error', function() {
                              imagesLoaded++;
                              if (imagesLoaded === totalImages) {
                                initAnimation();
                              }
                            }, { once: true });
                          }
                        });
                        
                        if (imagesLoaded === totalImages) {
                          // Small delay to ensure layout is complete
                          setTimeout(initAnimation, 50);
                        }
                      }
                      
                      function initAnimation() {
                        // Force a reflow to ensure accurate width calculation
                        track.offsetWidth;
                        
                        // Recalculate width after images are loaded to ensure accuracy
                        const trackWidth = track.scrollWidth;
                        const halfWidth = trackWidth / 2;
                        
                        // Ensure we have a valid width
                        if (halfWidth <= 0) {
                          setTimeout(initAnimation, 100);
                          return;
                        }
                        
                        let position = 0;
                        const speed = 0.35; // pixels per frame
                        
                        function animate() {
                          position -= speed;
                          
                          // Reset position seamlessly when we've scrolled exactly half the track width
                          // Since we duplicated the content, resetting to 0 at -halfWidth creates seamless loop
                          // Use <= instead of == to handle any floating point precision issues
                          if (position <= -halfWidth) {
                            // Reset to 0 when we've scrolled exactly half width
                            // The duplicate content is now in the same position as the original was at start
                            position = 0;
                          }
                          
                          track.style.transform = 'translateX(' + position + 'px)';
                          requestAnimationFrame(animate);
                        }
                        
                        // Start animation
                        animate();
                      }
                      
                      // Check if images are already loaded or wait for them
                      checkImagesLoaded();
                    }
                    
                    // Start animation after logos are rendered
                    startSponsorScroll();
                    
                  } catch (err) {
                    console.warn('Error loading featured sponsors:', err);
                    sponsorSliderContainer.style.display = 'none';
                  }
                }
                
                // Start fetching sponsors
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', function() {
                    setTimeout(fetchFeaturedSponsors, 100);
                  });
                } else {
                  setTimeout(fetchFeaturedSponsors, 100);
                }
              }
            }
            
            // Fetch and display featured plus sponsors for hero slider
            const showFeaturedPlusSponsorSlider = ${JSON.stringify(showFeaturedPlusSponsorSlider)};
            if (showFeaturedPlusSponsorSlider) {
              const sponsorSliderContainer = document.getElementById('hero-featured-plus-sponsor-slider-${sectionId}');
              const sponsorTrack = document.getElementById('hero-featured-plus-sponsor-track-${sectionId}');
              
              if (sponsorSliderContainer && sponsorTrack) {
                const portalId = '39650877';
                const tableId = '146535020'; // sponsors table ID
                
                async function fetchFeaturedPlusSponsors() {
                  try {
                    const apiUrl = 'https://api.hubapi.com/cms/v3/hubdb/tables/' + tableId + '/rows?portalId=' + portalId;
                    const response = await fetch(apiUrl);
                    
                    if (!response.ok) {
                      throw new Error('Failed to fetch sponsors: ' + response.status);
                    }
                    
                    const data = await response.json();
                    
                    // Filter only featured plus sponsors (featured_plus === 1)
                    const featuredPlusSponsors = (data.results || []).filter(function(row) {
                      return row.values?.featured_plus === 1;
                    }).map(function(row) {
                      return {
                        image: row.values?.image ? {
                          src: row.values.image.url || '',
                          alt: row.values.image.altText || 'Sponsor'
                        } : null
                      };
                    }).filter(function(sponsor) {
                      return sponsor.image && sponsor.image.src;
                    });
                    
                    if (featuredPlusSponsors.length === 0) {
                      sponsorSliderContainer.style.display = 'none';
                      return;
                    }
                    
                    const isSliderEnabled = featuredPlusSponsors.length > 8;
                    const sponsorImages = isSliderEnabled ? [...featuredPlusSponsors, ...featuredPlusSponsors] : featuredPlusSponsors;
                    
                    if (!isSliderEnabled) {
                      const row = sponsorSliderContainer.querySelector('.hero-sponsor-slider-row');
                      if (row) {
                        row.style.whiteSpace = 'normal';
                        row.style.overflow = 'visible';
                      }
                      sponsorTrack.style.justifyContent = 'center';
                      sponsorTrack.style.flexWrap = 'wrap';
                      sponsorTrack.style.width = '100%';
                    }
                    
                    // Clear existing content
                    sponsorTrack.innerHTML = '';
                    
                    // Create sponsor logo cards
                    sponsorImages.forEach(function(sponsor, idx) {
                      const card = document.createElement('div');
                      card.className = 'hero-sponsor-slide-card';
                      card.innerHTML = '<img src="' + sponsor.image.src + '" alt="' + (sponsor.image.alt || 'Sponsor ' + (idx + 1)) + '" />';
                      sponsorTrack.appendChild(card);
                    });
                    
                    // Start continuous scrolling animation
                    function startSponsorScroll() {
                      if (!isSliderEnabled) return;
                      const track = sponsorTrack;
                      if (!track) return;
                      
                      // Wait for all images to load to get accurate width calculation
                      const images = track.querySelectorAll('img');
                      let imagesLoaded = 0;
                      const totalImages = images.length;
                      
                      if (totalImages === 0) {
                        return;
                      }
                      
                      function checkImagesLoaded() {
                        images.forEach(function(img) {
                          if (img.complete && img.naturalWidth > 0) {
                            imagesLoaded++;
                          } else {
                            img.addEventListener('load', function() {
                              imagesLoaded++;
                              if (imagesLoaded === totalImages) {
                                initAnimation();
                              }
                            }, { once: true });
                            img.addEventListener('error', function() {
                              imagesLoaded++;
                              if (imagesLoaded === totalImages) {
                                initAnimation();
                              }
                            }, { once: true });
                          }
                        });
                        
                        if (imagesLoaded === totalImages) {
                          // Small delay to ensure layout is complete
                          setTimeout(initAnimation, 50);
                        }
                      }
                      
                      function initAnimation() {
                        // Force a reflow to ensure accurate width calculation
                        track.offsetWidth;
                        
                        // Recalculate width after images are loaded to ensure accuracy
                        const trackWidth = track.scrollWidth;
                        const halfWidth = trackWidth / 2;
                        
                        // Ensure we have a valid width
                        if (halfWidth <= 0) {
                          setTimeout(initAnimation, 100);
                          return;
                        }
                        
                        let position = 0;
                        const speed = 0.35; // pixels per frame
                        
                        function animate() {
                          position -= speed;
                          
                          // Reset position seamlessly when we've scrolled exactly half the track width
                          // Since we duplicated the content, resetting to 0 at -halfWidth creates seamless loop
                          // Use <= instead of == to handle any floating point precision issues
                          if (position <= -halfWidth) {
                            // Reset to 0 when we've scrolled exactly half width
                            // The duplicate content is now in the same position as the original was at start
                            position = 0;
                          }
                          
                          track.style.transform = 'translateX(' + position + 'px)';
                          requestAnimationFrame(animate);
                        }
                        
                        // Start animation
                        animate();
                      }
                      
                      // Check if images are already loaded or wait for them
                      checkImagesLoaded();
                    }
                    
                    // Start animation after logos are rendered
                    startSponsorScroll();
                    
                  } catch (err) {
                    console.warn('Error loading featured plus sponsors:', err);
                    sponsorSliderContainer.style.display = 'none';
                  }
                }
                
                // Start fetching sponsors
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', function() {
                    setTimeout(fetchFeaturedPlusSponsors, 100);
                  });
                } else {
                  setTimeout(fetchFeaturedPlusSponsors, 100);
                }
              }
            }
            
            // Fetch and display unranked sponsors (attendees) for hero slider
            const showAttendees = ${JSON.stringify(showAttendees)};
            if (showAttendees) {
              const attendeesSliderContainer = document.getElementById('hero-attendees-slider-${sectionId}');
              const attendeesTrack = document.getElementById('hero-attendees-track-${sectionId}');
              
              if (attendeesSliderContainer && attendeesTrack) {
                const portalId = '39650877';
                const tableId = '146535020';
                
                async function fetchAttendees() {
                  try {
                    const apiUrl = 'https://api.hubapi.com/cms/v3/hubdb/tables/' + tableId + '/rows?portalId=' + portalId;
                    const response = await fetch(apiUrl);
                    
                    if (!response.ok) {
                      throw new Error('Failed to fetch sponsors: ' + response.status);
                    }
                    
                    const data = await response.json();
                    
                    // Unranked = no sponsor_rank or empty sponsor_rank array (attendees)
                    const unrankedSponsors = (data.results || []).filter(function(row) {
                      var r = row.values?.sponsor_rank;
                      return !r || !Array.isArray(r) || r.length === 0;
                    }).map(function(row) {
                      return {
                        image: row.values?.image ? {
                          src: row.values.image.url || '',
                          alt: row.values.image.altText || 'Sponsor'
                        } : null
                      };
                    }).filter(function(sponsor) {
                      return sponsor.image && sponsor.image.src;
                    });
                    
                    if (unrankedSponsors.length === 0) {
                      attendeesSliderContainer.style.display = 'none';
                      return;
                    }

                    const isSliderEnabled = unrankedSponsors.length > 8;
                    const sponsorImages = isSliderEnabled ? [...unrankedSponsors, ...unrankedSponsors] : unrankedSponsors;
                    
                    if (!isSliderEnabled) {
                      const row = attendeesSliderContainer.querySelector('.hero-sponsor-slider-row');
                      if (row) {
                        row.style.whiteSpace = 'normal';
                        row.style.overflow = 'visible';
                      }
                      attendeesTrack.style.justifyContent = 'center';
                      attendeesTrack.style.flexWrap = 'wrap';
                      attendeesTrack.style.width = '100%';
                    }

                    attendeesTrack.innerHTML = '';
                    sponsorImages.forEach(function(sponsor, idx) {
                      const card = document.createElement('div');
                      card.className = 'hero-sponsor-slide-card';
                      card.innerHTML = '<img src="' + sponsor.image.src + '" alt="' + (sponsor.image.alt || 'Sponsor ' + (idx + 1)) + '" />';
                      attendeesTrack.appendChild(card);
                    });
                    
                    function startAttendeesScroll() {
                      if (!isSliderEnabled) return;
                      const track = attendeesTrack;
                      if (!track) return;
                      const images = track.querySelectorAll('img');
                      var imagesLoaded = 0;
                      var totalImages = images.length;
                      if (totalImages === 0) return;
                      function checkImagesLoaded() {
                        images.forEach(function(img) {
                          if (img.complete && img.naturalWidth > 0) {
                            imagesLoaded++;
                          } else {
                            img.addEventListener('load', function() {
                              imagesLoaded++;
                              if (imagesLoaded === totalImages) initAnimation();
                            }, { once: true });
                            img.addEventListener('error', function() {
                              imagesLoaded++;
                              if (imagesLoaded === totalImages) initAnimation();
                            }, { once: true });
                          }
                        });
                        if (imagesLoaded === totalImages) setTimeout(initAnimation, 50);
                      }
                      function initAnimation() {
                        track.offsetWidth;
                        var trackWidth = track.scrollWidth;
                        var halfWidth = trackWidth / 2;
                        if (halfWidth <= 0) {
                          setTimeout(initAnimation, 100);
                          return;
                        }
                        var position = 0;
                        var speed = 0.35;
                        function animate() {
                          position -= speed;
                          if (position <= -halfWidth) position = 0;
                          track.style.transform = 'translateX(' + position + 'px)';
                          requestAnimationFrame(animate);
                        }
                        animate();
                      }
                      checkImagesLoaded();
                    }
                    startAttendeesScroll();
                  } catch (err) {
                    console.warn('Error loading attendees (unranked sponsors):', err);
                    attendeesSliderContainer.style.display = 'none';
                  }
                }
                
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', function() {
                    setTimeout(fetchAttendees, 100);
                  });
                } else {
                  setTimeout(fetchAttendees, 100);
                }
              }
            }

            // Fetch and display past attendees slider (table: 240083827)
            const showPastAttendees = ${JSON.stringify(showPastAttendees)};
            if (showPastAttendees) {
              const pastAttendeesSliderContainer = document.getElementById('hero-past-attendees-slider-${sectionId}');
              const pastAttendeesTrack = document.getElementById('hero-past-attendees-track-${sectionId}');
              if (pastAttendeesSliderContainer && pastAttendeesTrack) {
                async function fetchPastAttendees() {
                  try {
                    const apiUrl = 'https://api.hubapi.com/cms/v3/hubdb/tables/240083827/rows?portalId=39650877';
                    const response = await fetch(apiUrl);
                    if (!response.ok) throw new Error('Failed to fetch past attendees: ' + response.status);
                    const data = await response.json();
                    const items = (data.results || []).map(function(row) {
                      return {
                        image: row.values?.image ? {
                          src: row.values.image.url || '',
                          alt: row.values.image.altText || 'Past Attendee'
                        } : null
                      };
                    }).filter(function(x) { return x.image && x.image.src; });
                    if (items.length === 0) {
                      pastAttendeesSliderContainer.style.display = 'none';
                      return;
                    }

                    const isSliderEnabled = items.length > 8;
                    const images = isSliderEnabled ? [...items, ...items] : items;
                    
                    if (!isSliderEnabled) {
                      const row = pastAttendeesSliderContainer.querySelector('.hero-sponsor-slider-row');
                      if (row) {
                        row.style.whiteSpace = 'normal';
                        row.style.overflow = 'visible';
                      }
                      pastAttendeesTrack.style.justifyContent = 'center';
                      pastAttendeesTrack.style.flexWrap = 'wrap';
                      pastAttendeesTrack.style.width = '100%';
                    }

                    pastAttendeesTrack.innerHTML = '';
                    images.forEach(function(item, idx) {
                      const card = document.createElement('div');
                      card.className = 'hero-sponsor-slide-card';
                      card.innerHTML = '<img src="' + item.image.src + '" alt="' + (item.image.alt || 'Past Attendee ' + (idx + 1)) + '" />';
                      pastAttendeesTrack.appendChild(card);
                    });
                    function startScroll() {
                      if (!isSliderEnabled) return;
                      const track = pastAttendeesTrack;
                      if (!track) return;
                      const imgs = track.querySelectorAll('img');
                      var loaded = 0;
                      var total = imgs.length;
                      if (total === 0) return;
                      function checkLoaded() {
                        imgs.forEach(function(img) {
                          if (img.complete && img.naturalWidth > 0) {
                            loaded++;
                          } else {
                            img.addEventListener('load', function() { loaded++; if (loaded === total) init(); }, { once: true });
                            img.addEventListener('error', function() { loaded++; if (loaded === total) init(); }, { once: true });
                          }
                        });
                        if (loaded === total) setTimeout(init, 50);
                      }
                      function init() {
                        track.offsetWidth;
                        var halfWidth = track.scrollWidth / 2;
                        if (halfWidth <= 0) { setTimeout(init, 100); return; }
                        var pos = 0;
                        var speed = 0.35;
                        function animate() {
                          pos -= speed;
                          if (pos <= -halfWidth) pos = 0;
                          track.style.transform = 'translateX(' + pos + 'px)';
                          requestAnimationFrame(animate);
                        }
                        animate();
                      }
                      checkLoaded();
                    }
                    startScroll();
                  } catch (err) {
                    console.warn('Error loading past attendees:', err);
                    pastAttendeesSliderContainer.style.display = 'none';
                  }
                }
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', function() { setTimeout(fetchPastAttendees, 100); });
                } else {
                  setTimeout(fetchPastAttendees, 100);
                }
              }
            }

            // Fetch and display past sponsors slider (table: 240083829)
            const showPastSponsors = ${JSON.stringify(showPastSponsors)};
            if (showPastSponsors) {
              const pastSponsorsSliderContainer = document.getElementById('hero-past-sponsors-slider-${sectionId}');
              const pastSponsorsTrack = document.getElementById('hero-past-sponsors-track-${sectionId}');
              if (pastSponsorsSliderContainer && pastSponsorsTrack) {
                async function fetchPastSponsors() {
                  try {
                    const apiUrl = 'https://api.hubapi.com/cms/v3/hubdb/tables/240083829/rows?portalId=39650877';
                    const response = await fetch(apiUrl);
                    if (!response.ok) throw new Error('Failed to fetch past sponsors: ' + response.status);
                    const data = await response.json();
                    const items = (data.results || []).map(function(row) {
                      return {
                        image: row.values?.image ? {
                          src: row.values.image.url || '',
                          alt: row.values.image.altText || 'Past Sponsor'
                        } : null
                      };
                    }).filter(function(x) { return x.image && x.image.src; });
                    if (items.length === 0) {
                      pastSponsorsSliderContainer.style.display = 'none';
                      return;
                    }

                    const isSliderEnabled = items.length > 8;
                    const images = isSliderEnabled ? [...items, ...items] : items;
                    
                    if (!isSliderEnabled) {
                      const row = pastSponsorsSliderContainer.querySelector('.hero-sponsor-slider-row');
                      if (row) {
                        row.style.whiteSpace = 'normal';
                        row.style.overflow = 'visible';
                      }
                      pastSponsorsTrack.style.justifyContent = 'center';
                      pastSponsorsTrack.style.flexWrap = 'wrap';
                      pastSponsorsTrack.style.width = '100%';
                    }

                    pastSponsorsTrack.innerHTML = '';
                    images.forEach(function(item, idx) {
                      const card = document.createElement('div');
                      card.className = 'hero-sponsor-slide-card';
                      card.innerHTML = '<img src="' + item.image.src + '" alt="' + (item.image.alt || 'Past Sponsor ' + (idx + 1)) + '" />';
                      pastSponsorsTrack.appendChild(card);
                    });
                    function startScroll() {
                      if (!isSliderEnabled) return;
                      const track = pastSponsorsTrack;
                      if (!track) return;
                      const imgs = track.querySelectorAll('img');
                      var loaded = 0;
                      var total = imgs.length;
                      if (total === 0) return;
                      function checkLoaded() {
                        imgs.forEach(function(img) {
                          if (img.complete && img.naturalWidth > 0) {
                            loaded++;
                          } else {
                            img.addEventListener('load', function() { loaded++; if (loaded === total) init(); }, { once: true });
                            img.addEventListener('error', function() { loaded++; if (loaded === total) init(); }, { once: true });
                          }
                        });
                        if (loaded === total) setTimeout(init, 50);
                      }
                      function init() {
                        track.offsetWidth;
                        var halfWidth = track.scrollWidth / 2;
                        if (halfWidth <= 0) { setTimeout(init, 100); return; }
                        var pos = 0;
                        var speed = 0.35;
                        function animate() {
                          pos -= speed;
                          if (pos <= -halfWidth) pos = 0;
                          track.style.transform = 'translateX(' + pos + 'px)';
                          requestAnimationFrame(animate);
                        }
                        animate();
                      }
                      checkLoaded();
                    }
                    startScroll();
                  } catch (err) {
                    console.warn('Error loading past sponsors:', err);
                    pastSponsorsSliderContainer.style.display = 'none';
                  }
                }
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', function() { setTimeout(fetchPastSponsors, 100); });
                } else {
                  setTimeout(fetchPastSponsors, 100);
                }
              }
            }
            
            // Typewriter animation for multiple subheadings
            const subheadingElement = document.getElementById('hero-subheading-${sectionId}');
            const cursorElement = document.querySelector('.hero-subheading-container .typewriter-cursor');
            const subheadings = ${JSON.stringify(allSubheadings)};
            
            if (subheadingElement && subheadings.length > 1) {
              let currentIndex = 0;
              let currentText = '';
              let isTyping = true;
              let isDeleting = false;
              let typingSpeed = 50; // milliseconds per character (typing speed)
              let deletingSpeed = 10; // milliseconds per character (deleting speed - faster)
              let waitTime = 2000; // milliseconds to wait after typing completes
              let timeoutId = null;
              
              function typeWriter() {
                const fullText = subheadings[currentIndex];
                
                if (isTyping && !isDeleting) {
                  // Typing phase
                  if (currentText.length < fullText.length) {
                    currentText = fullText.substring(0, currentText.length + 1);
                    subheadingElement.textContent = currentText;
                    timeoutId = setTimeout(typeWriter, typingSpeed);
                  } else {
                    // Finished typing, wait before deleting
                    isTyping = false;
                    timeoutId = setTimeout(function() {
                      isDeleting = true;
                      typeWriter();
                    }, waitTime);
                  }
                } else if (isDeleting) {
                  // Deleting phase (backspace effect)
                  if (currentText.length > 0) {
                    currentText = currentText.substring(0, currentText.length - 1);
                    subheadingElement.textContent = currentText;
                    timeoutId = setTimeout(typeWriter, deletingSpeed);
                  } else {
                    // Finished deleting, move to next subheading
                    isDeleting = false;
                    isTyping = true;
                    currentIndex = (currentIndex + 1) % subheadings.length;
                    timeoutId = setTimeout(typeWriter, 100); // Small delay before starting next
                  }
                }
              }
              
              // Start the typewriter animation
              if (subheadings.length > 0) {
                typeWriter();
              }
              
              // Clean up on unmount
              const heroSection = document.querySelector('[id="${sectionId}"]');
              if (heroSection) {
                heroSection.addEventListener('cms:unmount', function() {
                  if (timeoutId) {
                    clearTimeout(timeoutId);
                  }
                });
              }
            }

            // Event Countdown Logic
            if (${fieldValues.showCountdown === true}) {
                function initCountdown() {
                    const sectionId = '${sectionId}';
                    const countdownContainer = document.getElementById('countdown-' + sectionId);
                    const rawDate = "${fieldValues.countdownDate || ''}";
                    
                    if (!rawDate) {
                        console.warn('Hero Countdown: No date provided');
                        return;
                    }

                    const targetDate = new Date(rawDate).getTime();
                    const discountEndedMsg = "${fieldValues.discountEndedMessage || 'DISCOUNT HAS ENDED'}";

                    if (countdownContainer && !isNaN(targetDate)) {
                        const daysSpan = countdownContainer.querySelector('.days');
                        const hoursSpan = countdownContainer.querySelector('.hours');
                        const minutesSpan = countdownContainer.querySelector('.minutes');
                        const secondsSpan = countdownContainer.querySelector('.seconds');

                        function updateTimer() {
                            const now = new Date().getTime();
                            const distance = targetDate - now;

                            if (distance <= 0) {
                                // Show the discount ended message
                                const timerParent = countdownContainer.parentElement;
                                if (timerParent) {
                                    timerParent.innerHTML = '<div class="discount-ended-message">' + discountEndedMsg + '</div>';
                                }
                                
                                // Hide the discount text above the button
                                const discountText = document.querySelector('#' + sectionId + ' .hero-discount-text');
                                if (discountText) discountText.style.display = 'none';

                                clearInterval(timerInterval);
                                return;
                            }

                            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                            if (daysSpan) daysSpan.textContent = days < 10 ? "0" + days : days;
                            if (hoursSpan) hoursSpan.textContent = hours < 10 ? "0" + hours : hours;
                            if (minutesSpan) minutesSpan.textContent = minutes < 10 ? "0" + minutes : minutes;
                            if (secondsSpan) secondsSpan.textContent = seconds < 10 ? "0" + seconds : seconds;
                        }

                        const timerInterval = setInterval(updateTimer, 1000);
                        updateTimer();
                    } else {
                        console.error('Hero Countdown: Invalid date format: ', rawDate);
                    }
                }

                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', initCountdown);
                } else {
                    initCountdown();
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
      name="preTitle"
      label="Text above title"
      helpText="Text displayed above the main title (e.g., '4th Annual'). Leave empty to hide."
    />
    <TextField
      name="title"
      label="Title (h1)"
      helpText="Main heading - will be displayed in bold. Leave empty to hide."
    />
    <TextField
      name="dateLine"
      label="Date line"
      helpText="First line of date/location info. Leave empty to hide."
    />
    <TextField
      name="locationLine"
      label="Location line"
      helpText="Second line of date/location info. Leave empty to hide."
    />
    <RichTextField
      name="headingOverride"
      label="Heading override (rich text)"
      default=""
      helpText="Optional. When set, this content is shown instead of the four fields above (text above title, title, date line, location). Leave empty to use those fields."
    />
    <TextField
      name="ctaText"
      label="CTA button text"
      helpText="Text for the call-to-action button. Leave empty to hide the button."
    />
    <UrlField
      name="ctaUrl"
      label="CTA button URL"
      helpText="Link URL for the call-to-action button"
    />
    <BooleanField
      name="ctaOpenInNewWindow"
      label="Open CTA in new window"
      default={false}
      helpText="Check this to open the CTA button link in a new window/tab"
    />
    <TextField
      name="ctaText2"
      label="Second CTA button text"
      helpText="Optional second button shown to the right of the main CTA. Leave empty to hide."
    />
    <UrlField
      name="ctaUrl2"
      label="Second CTA button URL"
      helpText="Link URL for the second CTA button"
    />
    <BooleanField
      name="ctaOpenInNewWindow2"
      label="Open second CTA in new window"
      default={false}
      helpText="Check to open the second CTA link in a new window/tab"
    />
    <UrlField
      name="downArrowUrl"
      label="Down arrow button URL"
      helpText="Link URL for the down arrow button. Use #sectionid for smooth scrolling to a section, or any URL/page link. Leave empty to hide the button."
    />
    <BooleanField
      name="showSponsorSlider"
      label="Show Sponsor Slider"
      default={false}
      helpText="Check this to display featured sponsor logos sliding above the subheading. Logos will be fetched from the Sponsors HubDB table (featured: 1 only)."
    />
    <BooleanField
      name="showFeaturedPlusSponsorSlider"
      label="Show Featured Plus Sponsor Slider"
      default={false}
      helpText="Check this to display featured plus sponsor logos sliding above the subheading. Logos will be fetched from the Sponsors HubDB table (featured_plus: 1 only)."
    />
    <BooleanField
      name="showAttendees"
      label="Show Attendees"
      default={false}
      helpText="Check this to display unranked sponsors (no sponsor rank assigned in HubDB) sliding in the hero section, using the same slider style as sponsor sliders."
    />
    <BooleanField
      name="showPastAttendees"
      label="Show Past Attendees"
      default={false}
      helpText="Check this to display past attendees sliding in the hero section. Images will be fetched from HubDB table 240083827."
    />
    <BooleanField
      name="showPastSponsors"
      label="Past Sponsors"
      default={false}
      helpText="Check this to display past sponsors sliding in the hero section. Images will be fetched from HubDB table 240083829."
    />
    <BooleanField
      name="showCountdown"
      label="Show Countdown"
      default={false}
      helpText="Check this to display a countdown timer for the event."
    />
    <TextField
      name="countdownDate"
      label="Countdown Date"
      helpText="Target date for the event (e.g., 'September 28, 2026 09:00:00')."
    />
    <TextField
      name="discountText"
      label="Discount Text"
      default="GET $1000 OFF"
      helpText="Displayed above the CTA button in the hero section."
    />
    <TextField
      name="priceIncreaseText"
      label="Price Increase Text"
      default="PRICE INCREASE"
      helpText="Displayed above the countdown timer."
    />
    <TextField
      name="discountEndedMessage"
      label="Discount Ended Message"
      default="DISCOUNT HAS ENDED"
      helpText="Message shown when the countdown reaches zero."
    />
    <TextField
      name="sponsorSliderPreTitle"
      label="Text above sponsor slider"
      helpText="Text displayed above the sponsor slider logos (e.g., 'Our Sponsors'). Leave empty to hide. Only shown when sponsor slider is enabled."
    />
    <RepeatedFieldGroup
      name="subheadings"
      label="Subheadings (h2)"
      helpText="Add multiple subheadings that will be displayed with typewriter animation. Each subheading will type out, wait, then delete before showing the next one."
      required={false}
      children={[
        <TextField
          name="text"
          label="Subheading text"
          required={true}
          helpText="Text for this subheading"
        />,
      ]}
    />
    <UrlField
      name="videoUrl"
      label="Video URL (optional)"
      helpText="YouTube, Vimeo, or direct video file URL. Leave empty if uploading a file."
    />
    <FileField
      name="videoFile"
      label="Video File (optional)"
      required={false}
      helpText="Upload a video file (MP4, OGG, WEBM, etc.). Leave empty if using a URL. URL takes priority over file upload."
      acceptedFormats="video/*"
    />
    <BooleanField
      name="videoAutoplay"
      label="Autoplay video"
      default={false}
      helpText="Check to autoplay the video in loop with muted audio when the page loads. Users can still manually stop or unmute the video."
    />
    <FileField
      name="imageFile"
      label="Image File (optional)"
      required={false}
      helpText="Upload an image file (JPG, PNG, WEBP, etc.). Will be displayed in the same area as video with same dimensions (625x380). Image takes priority over video if both are provided."
      acceptedFormats="image/*"
    />
    <TextField
      name="imageAlt"
      label="Image alt text"
      helpText="Alternative text for the image (for accessibility). Leave empty for default."
    />
    <TextField
      name="videoTitle"
      label="Video title"
      helpText="Title/description for the video iframe (only used for embedded videos)"
    />
    <ImageField
      name="backgroundImage"
      label="Background image"
      helpText="Upload the hero section background image"
    />
    <TextField
      name="sectionId"
      label="Section ID"
      default="2025"
      helpText="ID for anchor links (e.g., #2025). Leave empty for no ID."
    />
    <TextField
      name="sectionClass"
      label="Section CSS Class"
      default="hero"
      helpText="Custom CSS class for this section. Default: hero"
    />
    <FormField
      name="selectedForm"
      label="Select HubSpot Form"
      helpText="Choose a form from your HubSpot account. The form will be displayed in the hero content area."
    />
  </ModuleFields>
);

export const meta = {
  label: 'Hero',
};
