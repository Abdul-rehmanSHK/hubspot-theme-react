import { ModuleFields, ImageField, TextField, UrlField, FileField, RepeatedFieldGroup } from '@hubspot/cms-components/fields';

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
  const convertToEmbedUrl = (url) => {
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
        return `https://www.youtube.com/embed/${embedMatch[1]}`;
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
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Vimeo handling
    if (trimmedUrl.includes('vimeo.com/')) {
      // Extract Vimeo video ID
      const vimeoMatch = trimmedUrl.match(/vimeo\.com\/(?:.*\/)?(\d+)/);
      if (vimeoMatch && vimeoMatch[1]) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
      }
      // If already a Vimeo embed URL, return as is
      if (trimmedUrl.includes('player.vimeo.com')) {
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
  const preTitle = fieldValues.preTitle || '';
  const title = fieldValues.title || '';
  const dateLine = fieldValues.dateLine || '';
  const locationLine = fieldValues.locationLine || '';
  const ctaText = fieldValues.ctaText || '';
  const ctaUrl = getUrlWithHash(fieldValues.ctaUrl) || '#';
  const rawDownArrowUrl = getUrlWithHash(fieldValues.downArrowUrl);
  const downArrowUrl = (rawDownArrowUrl && rawDownArrowUrl !== '#') ? rawDownArrowUrl : '';
  
  // Handle multiple subheadings - support both old single subheading and new repeated field group
  const subheadings = fieldValues.subheadings || [];
  const legacySubheading = fieldValues.subheading || '';
  
  // Convert legacy single subheading to array format for backward compatibility
  const allSubheadings = subheadings.length > 0 
    ? subheadings.map((item: any) => item.text || item.subheading || '').filter((text: string) => text && text.trim())
    : (legacySubheading ? [legacySubheading] : []);
  
  // Handle video: Check for URL first, then fall back to file upload
  // Use the same logic as VideoTestimonials component
  const rawVideoUrl = getUrl(fieldValues.videoUrl) || '';
  const processedVideoUrl = rawVideoUrl ? convertToEmbedUrl(rawVideoUrl) : '';
  
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

  // Get background image from field or use default
  const bgImage = fieldValues.backgroundImage?.src || '/_hcms/themes/gai-world-2026-theme/assets/images/bg.jpg';
  const heroStyle = {
    backgroundImage: `url(${bgImage})`,
    backgroundSize: 'contain',
    backgroundPosition: 'top left',
    backgroundRepeat: 'no-repeat',
  };

  const sectionId = fieldValues.sectionId || '2025';

  return (
    <div className="hero" id={sectionId} style={heroStyle}>
      <div className="container">
        <div className="hero-content">
          <div className="row g-5 align-items-center">
            <div className="col-md-6">
              <div className="left-area">
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
                {ctaText && (
                  <a href={ctaUrl} className="fill-btn">
                    {ctaText}
                  </a>
                )}
              </div>
            </div>
            <div className="col-md-6">
              {hasVideo && (
                <div className="right-area">
                  <div className="banner-video">
                    {hasVideoUrl ? (
                      // Use URL (YouTube, Vimeo, or direct video file)
                      isDirectVideo ? (
                        // Direct video file from URL - use <video> tag
                        <video
                          width="625"
                          height="380"
                          controls
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
                        style={{ width: '100%', height: 'auto', maxWidth: '625px' }}
                      >
                        <source src={videoFileSrc} type="video/mp4" />
                        <source src={videoFileSrc} type="video/ogg" />
                        <source src={videoFileSrc} type="video/webm" />
                        Your browser does not support the video tag.
                      </video>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </div>
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

            // Handle Hero CTA button (fill-btn)
            const heroCtaBtn = document.querySelector('.hero .fill-btn');
            if (heroCtaBtn) {
              heroCtaBtn.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                // Only handle if not opening in new window and is anchor link
                if (!this.getAttribute('target') && href && href.startsWith('#')) {
                  handleAnchorClick(e, href);
                }
              });
            }

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
              const heroSection = document.querySelector('.hero[id="${sectionId}"]');
              if (heroSection) {
                heroSection.addEventListener('cms:unmount', function() {
                  if (timeoutId) {
                    clearTimeout(timeoutId);
                  }
                });
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
    <UrlField
      name="downArrowUrl"
      label="Down arrow button URL"
      helpText="Link URL for the down arrow button. Use #sectionid for smooth scrolling to a section, or any URL/page link. Leave empty to hide the button."
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
  </ModuleFields>
);

export const meta = {
  label: 'Hero',
};
