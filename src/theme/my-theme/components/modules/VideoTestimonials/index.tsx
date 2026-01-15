import {
  ModuleFields,
  TextField,
  RepeatedFieldGroup,
  FileField,
  UrlField,
  ImageField,
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
  const sectionClass = fieldValues.sectionClass || 'videos-area';

  const moduleId = `videos-${fieldValues.moduleInstanceId || Math.random().toString(36).slice(2)}`;

  return (
    <div className={sectionClass} id={sectionId || undefined} data-videos-id={moduleId}>
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
                    
                    // Handle thumbnail image
                    const thumbnailImage = video.thumbnailImage;
                    let thumbnailSrc = '';
                    if (thumbnailImage) {
                      if (typeof thumbnailImage === 'string') {
                        thumbnailSrc = thumbnailImage;
                      } else if (typeof thumbnailImage === 'object') {
                        thumbnailSrc = thumbnailImage.src || thumbnailImage.url || thumbnailImage.href || thumbnailImage.path || '';
                      }
                    }
                    const hasThumbnail = !!thumbnailSrc;
                    
                    // Determine which video source to use
                    const hasVideoUrl = !!processedVideoUrl;
                    const hasVideoFile = !!videoFileSrc;
                    const isDirectVideo = hasVideoUrl && isDirectVideoFile(processedVideoUrl);
                    const hasVideo = hasVideoUrl || hasVideoFile;
                    
                    // Unique ID for this video item
                    const videoItemId = `video-item-${moduleId}-${idx}`;
                    
                    return (
                      <div
                        key={idx}
                        className="swiper-slide"
                      >
                        <div className="video-item" id={videoItemId}>
                          {hasThumbnail && hasVideo ? (
                            <>
                              {/* Show thumbnail with play button overlay */}
                              <div className="video-thumbnail-wrapper" style={{ position: 'relative', width: '350px', height: '250px', borderRadius: '10px 10px 0 0', overflow: 'hidden', cursor: 'pointer' }}>
                                <img 
                                  src={thumbnailSrc} 
                                  alt={video.thumbnailAlt || 'Video thumbnail'}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                  className="video-thumbnail-image"
                                />
                                <div className="video-thumbnail-overlay" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s ease' }}>
                                  <div className="video-play-button" style={{ width: '60px', height: '60px', background: '#06C7EE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}>
                                    <i className="fa-solid fa-play" style={{ marginLeft: '4px' }}></i>
                                  </div>
                                </div>
                              </div>
                              {/* Hidden video player - will be shown when thumbnail is clicked */}
                              <div className="video-player-container" style={{ display: 'none', width: '350px', height: '250px', borderRadius: '10px 10px 0 0', overflow: 'hidden' }}>
                                {hasVideoUrl ? (
                                  isDirectVideo ? (
                                    <video width="350" height="250" controls style={{ width: '100%', height: '100%', display: 'block' }}>
                                      <source src={processedVideoUrl} type="video/mp4" />
                                      <source src={processedVideoUrl} type="video/ogg" />
                                      <source src={processedVideoUrl} type="video/webm" />
                                      Your browser does not support the video tag.
                                    </video>
                                  ) : (
                                    <iframe
                                      width="350"
                                      height="250"
                                      src={processedVideoUrl}
                                      frameBorder="0"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                      style={{ borderRadius: '10px 10px 0 0', display: 'block', width: '100%', height: '100%' }}
                                    ></iframe>
                                  )
                                ) : hasVideoFile ? (
                                  <video width="350" height="250" controls style={{ width: '100%', height: '100%', display: 'block' }}>
                                    <source src={videoFileSrc} type="video/mp4" />
                                    <source src={videoFileSrc} type="video/ogg" />
                                    <source src={videoFileSrc} type="video/webm" />
                                    Your browser does not support the video tag.
                                  </video>
                                ) : null}
                              </div>
                            </>
                          ) : hasVideoUrl ? (
                            // Use URL (YouTube, Vimeo, or direct video file) - no thumbnail
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

      {/* Swiper.js initialization with video play/pause autoplay control */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
          (function() {
            const root = document.querySelector('[data-videos-id="${moduleId}"]');
            if (!root) return;
            const slider = root.querySelector('.videos-carousel');
            if (!slider) return;
            
            let swiperInstance = null;
            let youtubePlayers = {}; // Store YouTube player instances by video ID
            let vimeoPlayers = {}; // Store Vimeo player instances by video ID
            let videoElementToPlayer = {}; // Map video elements to their player instances
            let currentlyPlayingVideo = null; // Track which video element is currently playing
            let currentlyPlayingVideoType = null; // Track type: 'html5', 'youtube', 'vimeo'
            
            // Handle thumbnail clicks to show video
            function setupThumbnailClicks() {
              const thumbnailWrappers = root.querySelectorAll('.video-thumbnail-wrapper');
              thumbnailWrappers.forEach(function(wrapper) {
                wrapper.addEventListener('click', function() {
                  const videoItem = this.closest('.video-item');
                  const thumbnailWrapper = this;
                  // Find the player container as a sibling within the same video-item
                  const playerContainer = videoItem ? videoItem.querySelector('.video-player-container') : null;
                  
                  if (playerContainer) {
                    // Hide thumbnail
                    thumbnailWrapper.style.display = 'none';
                    // Show video player
                    playerContainer.style.display = 'block';
                    
                    // For iframes, update src to trigger autoplay if needed
                    const iframe = playerContainer.querySelector('iframe');
                    if (iframe) {
                      const currentSrc = iframe.src;
                      // Check if it's YouTube or Vimeo
                      if (currentSrc.includes('youtube.com')) {
                        // Add autoplay parameter if not present
                        if (!currentSrc.includes('autoplay=1')) {
                          const separator = currentSrc.includes('?') ? '&' : '?';
                          iframe.src = currentSrc + separator + 'autoplay=1';
                        }
                      } else if (currentSrc.includes('vimeo.com')) {
                        // Add autoplay parameter if not present
                        if (!currentSrc.includes('autoplay=1')) {
                          const separator = currentSrc.includes('?') ? '&' : '?';
                          iframe.src = currentSrc + separator + 'autoplay=1';
                        }
                      }
                    }
                    
                    // For HTML5 video, try to play
                    const video = playerContainer.querySelector('video');
                    if (video) {
                      video.play().catch(function(e) {
                        console.warn('Could not autoplay video:', e);
                      });
                    }
                  }
                });
              });
            }
            
            // Setup thumbnail clicks
            setupThumbnailClicks();
            
            // Extract YouTube video ID from URL
            function extractYouTubeId(url) {
              if (!url) return null;
              const match = url.match(/(?:youtube\\.com\\/embed\\/|youtube\\.com\\/watch\\?v=|youtu\\.be\\/)([a-zA-Z0-9_-]{11})/);
              return match ? match[1] : null;
            }
            
            // Extract Vimeo video ID from URL
            function extractVimeoId(url) {
              if (!url) return null;
              const match = url.match(/(?:vimeo\\.com\\/|player\\.vimeo\\.com\\/video\\/)(\\d+)/);
              return match ? match[1] : null;
            }
            
            // Pause the currently playing video
            function pauseCurrentVideo() {
              if (!currentlyPlayingVideo) return;
              
              try {
                if (currentlyPlayingVideoType === 'html5') {
                  // HTML5 video element - use native pause method
                  if (currentlyPlayingVideo.pause && !currentlyPlayingVideo.paused) {
                    currentlyPlayingVideo.pause();
                  }
                } else if (currentlyPlayingVideoType === 'youtube') {
                  // YouTube player - get videoId from iframe src
                  const iframeSrc = currentlyPlayingVideo.src || currentlyPlayingVideo.getAttribute('src') || '';
                  const videoId = extractYouTubeId(iframeSrc);
                  if (videoId && youtubePlayers[videoId]) {
                    try {
                      const playerState = youtubePlayers[videoId].getPlayerState();
                      // YT.PlayerState.PLAYING = 1
                      if (playerState === 1) {
                        youtubePlayers[videoId].pauseVideo();
                      }
                    } catch (e) {
                      // If we can't check state, just try to pause
                      youtubePlayers[videoId].pauseVideo();
                    }
                  }
                } else if (currentlyPlayingVideoType === 'vimeo') {
                  // Vimeo player - get videoId from iframe src
                  const iframeSrc = currentlyPlayingVideo.src || currentlyPlayingVideo.getAttribute('src') || '';
                  const videoId = extractVimeoId(iframeSrc);
                  if (videoId && vimeoPlayers[videoId]) {
                    vimeoPlayers[videoId].getPaused().then(function(paused) {
                      if (!paused) {
                        vimeoPlayers[videoId].pause();
                      }
                    }).catch(function(e) {
                      // If we can't check paused state, just try to pause
                      vimeoPlayers[videoId].pause();
                    });
                  }
                }
              } catch (e) {
                console.warn('Error pausing current video:', e);
              }
            }
            
            // Pause slider autoplay when video plays and stop any other playing video
            function pauseAutoplay(videoElement, videoType) {
              // If another video is playing, pause it first
              if (currentlyPlayingVideo && currentlyPlayingVideo !== videoElement) {
                pauseCurrentVideo();
              }
              
              // Pause slider autoplay
              if (swiperInstance && swiperInstance.autoplay) {
                swiperInstance.autoplay.stop();
              }
              
              // Update currently playing video
              currentlyPlayingVideo = videoElement;
              currentlyPlayingVideoType = videoType;
            }
            
            // Resume slider autoplay when video stops
            function resumeAutoplay(videoElement) {
              if (swiperInstance && swiperInstance.autoplay && currentlyPlayingVideo === videoElement) {
                swiperInstance.autoplay.start();
                currentlyPlayingVideo = null;
                currentlyPlayingVideoType = null;
              }
            }
            
            // Setup event listeners for HTML5 video elements
            function setupVideoListeners() {
              const videoElements = root.querySelectorAll('video');
              videoElements.forEach(function(video) {
                // Check if listeners are already attached (using data attribute)
                if (video.dataset.listenersAttached === 'true') {
                  return;
                }
                
                // Mark as having listeners attached
                video.dataset.listenersAttached = 'true';
                
                // Add play event listener
                video.addEventListener('play', function() {
                  pauseAutoplay(video, 'html5');
                });
                
                // Add pause event listener
                video.addEventListener('pause', function() {
                  resumeAutoplay(video);
                });
                
                // Add ended event listener
                video.addEventListener('ended', function() {
                  resumeAutoplay(video);
                });
              });
            }
            
            // Load YouTube IFrame API and initialize players
            function loadYouTubeAPI() {
              if (window.YT && window.YT.Player) {
                initializeYouTubePlayers();
                return;
              }
              
              // Check if script is already loading
              if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
                // Wait for API to load
                const checkInterval = setInterval(function() {
                  if (window.YT && window.YT.Player) {
                    clearInterval(checkInterval);
                    initializeYouTubePlayers();
                  }
                }, 100);
                return;
              }
              
              // Load YouTube IFrame API
              const tag = document.createElement('script');
              tag.src = 'https://www.youtube.com/iframe_api';
              tag.async = true;
              const firstScriptTag = document.getElementsByTagName('script')[0];
              firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
              
              // Wait for API to be ready
              window.onYouTubeIframeAPIReady = function() {
                initializeYouTubePlayers();
              };
            }
            
            // Initialize YouTube players
            function initializeYouTubePlayers() {
              const iframes = root.querySelectorAll('iframe[src*="youtube.com"]');
              iframes.forEach(function(iframe, index) {
                const videoId = extractYouTubeId(iframe.src);
                if (videoId && !youtubePlayers[videoId]) {
                  try {
                    // YouTube API requires an ID on the iframe
                    const iframeId = 'youtube-player-' + videoId + '-' + index;
                    if (!iframe.id) {
                      iframe.id = iframeId;
                    }
                    
                    const player = new window.YT.Player(iframe.id || iframeId, {
                      events: {
                        onStateChange: function(event) {
                          // YT.PlayerState.PLAYING = 1
                          // YT.PlayerState.PAUSED = 2
                          // YT.PlayerState.ENDED = 0
                          if (event.data === 1) { // Playing
                            pauseAutoplay(iframe, 'youtube');
                          } else if (event.data === 2 || event.data === 0) { // Paused or Ended
                            resumeAutoplay(iframe);
                          }
                        }
                      }
                    });
                    youtubePlayers[videoId] = player;
                    videoElementToPlayer[iframe] = { type: 'youtube', player: player, videoId: videoId };
                  } catch (e) {
                    console.warn('Failed to initialize YouTube player:', e);
                  }
                }
              });
            }
            
            // Load Vimeo Player API and initialize players
            function loadVimeoAPI() {
              if (window.Vimeo && window.Vimeo.Player) {
                initializeVimeoPlayers();
                return;
              }
              
              // Check if script is already loading
              if (document.querySelector('script[src*="player.vimeo.com/api"]')) {
                // Wait for API to load
                const checkInterval = setInterval(function() {
                  if (window.Vimeo && window.Vimeo.Player) {
                    clearInterval(checkInterval);
                    initializeVimeoPlayers();
                  }
                }, 100);
                return;
              }
              
              // Load Vimeo Player API
              const tag = document.createElement('script');
              tag.src = 'https://player.vimeo.com/api/player.js';
              tag.async = true;
              const firstScriptTag = document.getElementsByTagName('script')[0];
              firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
              
              // Wait for API to be ready
              tag.onload = function() {
                setTimeout(initializeVimeoPlayers, 100);
              };
            }
            
            // Initialize Vimeo players
            function initializeVimeoPlayers() {
              const iframes = root.querySelectorAll('iframe[src*="vimeo.com"]');
              iframes.forEach(function(iframe) {
                const videoId = extractVimeoId(iframe.src);
                if (videoId && !vimeoPlayers[videoId]) {
                  try {
                    const player = new window.Vimeo.Player(iframe);
                    vimeoPlayers[videoId] = player;
                    
                    // Listen for play event
                    player.on('play', function() {
                      pauseAutoplay(iframe, 'vimeo');
                    });
                    
                    // Listen for pause event
                    player.on('pause', function() {
                      resumeAutoplay(iframe);
                    });
                    
                    // Listen for ended event
                    player.on('ended', function() {
                      resumeAutoplay(iframe);
                    });
                    
                    videoElementToPlayer[iframe] = { type: 'vimeo', player: player, videoId: videoId };
                  } catch (e) {
                    console.warn('Failed to initialize Vimeo player:', e);
                  }
                }
              });
            }
            
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
              swiperInstance = new Swiper(slider, {
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
              
              // Setup video event listeners after Swiper is initialized
              setTimeout(function() {
                setupThumbnailClicks(); // Re-setup thumbnail clicks after Swiper initialization
                setupVideoListeners();
                loadYouTubeAPI();
                loadVimeoAPI();
              }, 300);
              
              // Clean up on unmount
              root.addEventListener('cms:unmount', () => {
                // Destroy YouTube players
                Object.keys(youtubePlayers).forEach(function(videoId) {
                  try {
                    if (youtubePlayers[videoId] && youtubePlayers[videoId].destroy) {
                      youtubePlayers[videoId].destroy();
                    }
                  } catch (e) {}
                });
                
                // Destroy Vimeo players
                Object.keys(vimeoPlayers).forEach(function(videoId) {
                  try {
                    if (vimeoPlayers[videoId] && vimeoPlayers[videoId].destroy) {
                      vimeoPlayers[videoId].destroy();
                    }
                  } catch (e) {}
                });
                
                if (swiperInstance && swiperInstance.destroy) {
                  swiperInstance.destroy(true, true);
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
        <ImageField
          name="thumbnailImage"
          label="Thumbnail Image (optional)"
          required={false}
          helpText="Upload a thumbnail image for this video. If provided, the thumbnail will be shown instead of the video player until clicked."
        />,
        <TextField
          name="thumbnailAlt"
          label="Thumbnail Alt Text (optional)"
          required={false}
          helpText="Alternative text for the thumbnail image (for accessibility)."
        />,
        <TextField
          name="personName"
          label="Person Name (optional)"
          required={false}
          default="Whitney Bower"
          helpText="Person's name. Leave empty to hide this field."
        />,
        <TextField
          name="company"
          label="Company (optional)"
          required={false}
          default="Noble Rock Software"
          helpText="Company name. Leave empty to hide this field."
        />,
        <TextField
          name="jobTitle"
          label="Job Title (optional)"
          required={false}
          default="Founder, Investor"
          helpText="Job title/role. Leave empty to hide this field."
        />,
      ]}
    />
    <TextField
      name="sectionId"
      label="Section ID (optional)"
      helpText="ID for anchor links (e.g., #video-testimonials). Leave empty for no ID."
    />
    <TextField
      name="sectionClass"
      label="Section CSS Class"
      default="videos-area"
      helpText="Custom CSS class for this section. Default: videos-area"
    />
  </ModuleFields>
);

export const meta = {
  label: 'AI Leaders rave about GAI World',
};

