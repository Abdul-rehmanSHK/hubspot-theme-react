import {
  ModuleFields,
  TextField,
  RepeatedFieldGroup,
  FileField,
  UrlField,
} from '@hubspot/cms-components/fields';

export function Component({ fieldValues }) {
  // Handle UrlField structure - it can be a string or an object with url/href property
  const getUrl = (urlField) => {
    if (!urlField) return '';
    if (typeof urlField === 'string') return urlField;
    if (typeof urlField === 'object') {
      return urlField.url || urlField.href || urlField.link || '';
    }
    return '';
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

  const heading = fieldValues.heading || 'AI Leaders rave about GAI World';
  const videos = fieldValues.videos || [];
  const sectionId = fieldValues.sectionId;

  const moduleId = `videos-${fieldValues.moduleInstanceId || Math.random().toString(36).slice(2)}`;

  return (
    <div className="videos-area" id={sectionId || undefined} data-videos-id={moduleId}>
      <div className="container">
        <div className="videos-slider">
          <h2>{heading}</h2>
          {videos.length > 0 ? (
            <>
              <div className="videos-carousel swiper">
                <div className="swiper-wrapper">
                  {videos.map((video: any, idx: number) => {
                    // Check for video URL first (YouTube, Vimeo, direct video links, etc.)
                    const rawVideoUrl = getUrl(video.videoUrl) || '';
                    const processedVideoUrl = rawVideoUrl ? convertToEmbedUrl(rawVideoUrl) : '';
                    
                    // Fall back to file upload if no URL provided
                    const videoFile = video.videoFile;
                    let videoFileSrc = '';
                    
                    if (videoFile && !processedVideoUrl) {
                      if (typeof videoFile === 'string') {
                        videoFileSrc = videoFile;
                      } else if (typeof videoFile === 'object') {
                        // Try common property names
                        videoFileSrc = videoFile.src || videoFile.url || videoFile.href || videoFile.path || '';
                      }
                    }
                    
                    // Determine which video source to use
                    const hasVideoUrl = !!processedVideoUrl;
                    const hasVideoFile = !!videoFileSrc;
                    const isDirectVideo = hasVideoUrl && isDirectVideoFile(processedVideoUrl);
                    
                    return (
                      <div
                        key={idx}
                        className="swiper-slide"
                      >
                        <div className="video-item">
                          {hasVideoUrl ? (
                            // Use URL (YouTube, Vimeo, or direct video file)
                            isDirectVideo ? (
                              // Direct video file - use <video> tag
                              <video width="350" height="250" controls>
                                <source src={processedVideoUrl} type="video/mp4" />
                                <source src={processedVideoUrl} type="video/ogg" />
                                <source src={processedVideoUrl} type="video/webm" />
                                Your browser does not support the video tag.
                              </video>
                            ) : (
                              // Embed URL (YouTube, Vimeo, etc.) - use <iframe>
                              <iframe
                                width="350"
                                height="250"
                                src={processedVideoUrl}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                style={{ borderRadius: '10px 10px 0 0', display: 'block' }}
                              ></iframe>
                            )
                          ) : hasVideoFile ? (
                            // File upload - use <video> tag
                            <video width="350" height="250" controls>
                              <source src={videoFileSrc} type="video/mp4" />
                              <source src={videoFileSrc} type="video/ogg" />
                              <source src={videoFileSrc} type="video/webm" />
                              Your browser does not support the video tag.
                            </video>
                          ) : (
                            // No video provided
                            <div style={{ width: '350px', height: '250px', background: '#050d51', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', borderRadius: '10px 10px 0 0', padding: '20px', textAlign: 'center' }}>
                              <div>No video provided</div>
                              <div style={{ fontSize: '12px', marginTop: '10px', opacity: 0.7 }}>
                                Please add a video URL or upload a video file
                              </div>
                            </div>
                          )}
                          <div className="video-tab-text">
                            {video.personName && <h3>{video.personName}</h3>}
                            {video.company && <h5>{video.company}</h5>}
                            {video.jobTitle && <p>{video.jobTitle}</p>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="slider-controls-under-active">
                <div className="swiper-button-prev">
                  <i className="fa-solid fa-arrow-left"></i>
                </div>
                <div className="swiper-button-next">
                  <i className="fa-solid fa-arrow-right"></i>
                </div>
              </div>
            </>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#fff' }}>
              Add videos using the content editor
            </div>
          )}
        </div>
      </div>

      {/* Swiper.js initialization - matching Speakers section exactly */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
          (function() {
            const root = document.querySelector('[data-videos-id="${moduleId}"]');
            if (!root) return;
            const slider = root.querySelector('.videos-carousel');
            if (!slider) return;
            
            // Wait for Swiper to be available and DOM ready
            const initSwiper = () => {
              if (typeof Swiper === 'undefined') {
                setTimeout(initSwiper, 100);
                return;
              }
              
              // Check if slides exist
              if (slider.querySelectorAll('.swiper-slide').length === 0) {
                setTimeout(initSwiper, 100);
                return;
              }
              
              // Get navigation buttons from within this root
              const nextBtn = root.querySelector('.swiper-button-next');
              const prevBtn = root.querySelector('.swiper-button-prev');
              
              // Initialize Swiper exactly like Speakers section
              const swiper = new Swiper(slider, {
                slidesPerView: 3,
                spaceBetween: 20,
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
                    spaceBetween: 20,
                  },
                  992: {
                    slidesPerView: 3,
                    spaceBetween: 20,
                  },
                },
              });
              
              // Clean up on unmount
              root.addEventListener('cms:unmount', () => {
                if (swiper && swiper.destroy) {
                  swiper.destroy(true, true);
                }
              });
            };
            
            // Start initialization
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', () => {
                setTimeout(initSwiper, 100);
              });
            } else {
              setTimeout(initSwiper, 100);
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
      default="AI Leaders rave about GAI World"
    />
    <RepeatedFieldGroup
      name="videos"
      label="Videos"
      required={false}
      children={[
        <UrlField
          name="videoUrl"
          label="Video URL (optional)"
          helpText="YouTube, Vimeo, or direct video file URL. Leave empty if uploading a file."
        />,
        <FileField
          name="videoFile"
          label="Video File (optional)"
          required={false}
          helpText="Upload a video file (MP4, OGG, etc.). Leave empty if using a URL."
          acceptedFormats="video/*"
        />,
        <TextField
          name="personName"
          label="Person Name"
          required={true}
          default="Whitney Bower"
          helpText="Person's name"
        />,
        <TextField
          name="company"
          label="Company"
          required={true}
          default="Noble Rock Software"
          helpText="Company name"
        />,
        <TextField
          name="jobTitle"
          label="Job Title"
          required={true}
          default="Founder, Investor"
          helpText="Job title/role"
        />,
      ]}
    />
    <TextField
      name="sectionId"
      label="Section ID (optional)"
      helpText="ID for anchor links (e.g., #video-testimonials). Leave empty for no ID."
    />
  </ModuleFields>
);

export const meta = {
  label: 'AI Leaders rave about GAI World',
};

