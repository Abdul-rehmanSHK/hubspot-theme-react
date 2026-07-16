import {
  ModuleFields,
  TextField,
  ImageField,
  RichTextField,
  RepeatedFieldGroup,
  BooleanField,
  UrlField,
  FileField,
} from '@hubspot/cms-components/fields';

export function Component({ fieldValues }) {
  // Helper for UrlField structure
  const getUrl = (urlField) => {
    if (!urlField) return '';
    if (typeof urlField === 'string') return urlField;
    if (typeof urlField === 'object') {
      return urlField.url || urlField.href || urlField.link || '';
    }
    return '';
  };

  // Video conversion logic (from Hero)
  const convertToEmbedUrl = (url, autoplay = false) => {
    if (!url || typeof url !== 'string') return '';
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return '';

    const directVideoExtensions = /\.(mp4|webm|ogg|ogv|mov|m4v|avi|wmv|flv)(\?.*)?$/i;
    if (directVideoExtensions.test(trimmedUrl)) return trimmedUrl;

    // YouTube
    if (trimmedUrl.includes('youtube.com/embed/')) {
      const embedMatch = trimmedUrl.match(/youtube\.com\/embed\/([^&\n?#]+)/);
      if (embedMatch && embedMatch[1]) {
        const videoId = embedMatch[1];
        if (autoplay) return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`;
        return `https://www.youtube.com/embed/${videoId}`;
      }
      return trimmedUrl;
    }

    let videoId = '';
    const watchMatch = trimmedUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/v\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (watchMatch && watchMatch[1]) videoId = watchMatch[1];
    if (!videoId) {
      const shortMatch = trimmedUrl.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
      if (shortMatch && shortMatch[1]) videoId = shortMatch[1];
    }
    if (videoId) {
      if (autoplay) return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`;
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // Vimeo
    if (trimmedUrl.includes('vimeo.com/')) {
      const vimeoMatch = trimmedUrl.match(/vimeo\.com\/(?:.*\/)?(\d+)/);
      if (vimeoMatch && vimeoMatch[1]) {
        const vimeoId = vimeoMatch[1];
        if (autoplay) return `https://player.vimeo.com/video/${vimeoId}?autoplay=1&muted=1&loop=1`;
        return `https://player.vimeo.com/video/${vimeoId}`;
      }
      if (trimmedUrl.includes('player.vimeo.com')) {
        if (autoplay && !trimmedUrl.includes('autoplay=1')) {
          const separator = trimmedUrl.includes('?') ? '&' : '?';
          return `${trimmedUrl}${separator}autoplay=1&muted=1&loop=1`;
        }
        return trimmedUrl;
      }
    }

    if (trimmedUrl.includes('/embed/') || trimmedUrl.includes('/player/')) return trimmedUrl;
    return trimmedUrl;
  };

  const isDirectVideoFile = (url) => {
    if (!url || typeof url !== 'string') return false;
    const directVideoExtensions = /\.(mp4|webm|ogg|ogv|mov|m4v|avi|wmv|flv)(\?.*)?$/i;
    return directVideoExtensions.test(url.trim());
  };

  // Values
  const heading = fieldValues.heading || '';
  const benefitsContent = fieldValues.content || '';
  const sectionId = fieldValues.sectionId;
  const sectionClass = fieldValues.sectionClass || 'benefits-section gai-advantage';
  const moduleId = `gai-advantage-${fieldValues.moduleInstanceId || Math.random().toString(36).slice(2)}`;

  // Video handling
  const videoAutoplay = fieldValues.videoAutoplay === true;
  const rawVideoUrl = getUrl(fieldValues.videoUrl) || '';
  const processedVideoUrl = rawVideoUrl ? convertToEmbedUrl(rawVideoUrl, videoAutoplay) : '';
  const videoFile = fieldValues.videoFile;
  let videoFileSrc = '';
  if (videoFile && !processedVideoUrl) {
    if (typeof videoFile === 'string') videoFileSrc = videoFile;
    else if (typeof videoFile === 'object') videoFileSrc = videoFile.src || videoFile.url || videoFile.href || videoFile.path || '';
  }
  const hasVideoUrl = !!processedVideoUrl;
  const hasVideoFile = !!videoFileSrc;
  const isDirectVideo = hasVideoUrl && isDirectVideoFile(processedVideoUrl);
  const hasVideo = hasVideoUrl || hasVideoFile;
  const videoTitle = fieldValues.videoTitle || 'Video';

  // Subheadings (animated)
  const subheadings = fieldValues.subheadings || [];
  const allSubheadings = subheadings.map((item: any) => item.text || '').filter((text: string) => text && text.trim());

  return (
    <div className={sectionClass} id={sectionId || undefined} data-benefits-id={moduleId}>
      <div className="container">
        <div className="benefits-inner">
          <div className="row">
            <div className="col-md-12">
              <div className="benefits-top text-center w-100">
                {heading && (
                  <div className="benefits-heading centered-heading" dangerouslySetInnerHTML={{ __html: heading }} />
                )}

                {hasVideo && (
                  <div className="video-area-centered mb-5">
                    <div className="banner-video mx-auto" style={{ maxWidth: '800px' }}>
                      {hasVideoUrl ? (
                        isDirectVideo ? (
                          <video width="100%" height="auto" controls {...(videoAutoplay ? { autoPlay: true, loop: true, muted: true } : {})}>
                            <source src={processedVideoUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <iframe
                            width="100%"
                            height="450"
                            src={processedVideoUrl}
                            title={videoTitle}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ borderRadius: '10px' }}
                          />
                        )
                      ) : (
                        <video width="100%" height="auto" controls {...(videoAutoplay ? { autoPlay: true, loop: true, muted: true } : {})}>
                          <source src={videoFileSrc} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {allSubheadings.length > 0 && (
                <div className="hero-subheading-container">
                  <h2 className="hero-subheading" id={`subheading-${moduleId}`}>
                    {allSubheadings.length === 1 ? allSubheadings[0] : ''}
                  </h2>
                  {allSubheadings.length > 1 && <span className="typewriter-cursor">|</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
          (function() {
            const root = document.querySelector('[data-benefits-id="${moduleId}"]');
            if (!root) return;
            
            const benefitsRight = root.querySelector('.benefits-right');
            const rawContent = root.querySelector('.benefits-content-raw');
            if (benefitsRight && rawContent) {
              function parseBenefitsContent() {
                const html = rawContent.innerHTML.trim();
                if (!html) return;
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                const sections = [];
                let currentSection = null;
                const nodes = Array.from(tempDiv.childNodes);

                nodes.forEach((node) => {
                  if (node.nodeType === Node.ELEMENT_NODE) {
                    const tagName = node.tagName.toLowerCase();
                    if (tagName === 'hr' || tagName === 'h3') {
                      if (currentSection) sections.push(currentSection);
                      currentSection = tagName === 'h3' ? { heading: node.outerHTML, content: [] } : null;
                    } else if (currentSection) {
                      currentSection.content.push(node.outerHTML);
                    } else {
                      if (/h[12456]/.test(tagName)) currentSection = { heading: node.outerHTML, content: [] };
                      else currentSection = { heading: null, content: [node.outerHTML] };
                    }
                  } else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() && currentSection) {
                    currentSection.content.push(node.textContent);
                  }
                });
                if (currentSection) sections.push(currentSection);
                rawContent.innerHTML = '';
                sections.forEach((section) => {
                  const div = document.createElement('div');
                  div.className = 'benefits-div';
                  if (section.heading) {
                    const h = document.createElement('div');
                    h.innerHTML = section.heading;
                    while (h.firstChild) div.appendChild(h.firstChild);
                  }
                  const c = document.createElement('div');
                  c.innerHTML = section.content.join('');
                  while (c.firstChild) div.appendChild(c.firstChild);
                  benefitsRight.appendChild(div);
                });
              }
              if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', parseBenefitsContent);
              else parseBenefitsContent();
            }

            // Typewriter logic
            const subElement = document.getElementById('subheading-${moduleId}');
            const subs = ${JSON.stringify(allSubheadings)};
            if (subElement && subs.length > 1) {
              let idx = 0, txt = '', isTyping = true, isDel = false;
              let timeout = null;
              function type() {
                const full = subs[idx];
                if (isTyping && !isDel) {
                  if (txt.length < full.length) {
                    txt = full.substring(0, txt.length + 1);
                    subElement.textContent = txt;
                    timeout = setTimeout(type, 50);
                  } else {
                    isTyping = false;
                    timeout = setTimeout(() => { isDel = true; type(); }, 2000);
                  }
                } else if (isDel) {
                  if (txt.length > 0) {
                    txt = txt.substring(0, txt.length - 1);
                    subElement.textContent = txt;
                    timeout = setTimeout(type, 10);
                  } else {
                    isDel = false; isTyping = true;
                    idx = (idx + 1) % subs.length;
                    timeout = setTimeout(type, 100);
                  }
                }
              }
              type();
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
    <RichTextField name="heading" label="Heading" default="" helpText="Main heading at the top." />
    <UrlField name="videoUrl" label="Video URL (YouTube/Vimeo)" helpText="Priority over file upload." />
    <FileField name="videoFile" label="Video File (MP4)" acceptedFormats="video/*" />
    <BooleanField name="videoAutoplay" label="Autoplay Video" default={false} />
    <TextField name="videoTitle" label="Video Title" default="Video" />
    <RichTextField
      name="content"
      label="Benefits Content"
      default="<h3>Grow</h3><ul><li>Item 1</li></ul><hr><h3>Connect</h3><ul><li>Item 1</li></ul>"
      helpText="H3/HR split logic."
    />
    <RepeatedFieldGroup
      name="subheadings"
      label="Animated Subheadings"
      children={[<TextField name="text" label="Text" required={true} default="" />]}
    />
    <TextField name="sectionId" label="Section ID" />
    <TextField name="sectionClass" label="Section CSS Class" default="benefits-section gai-advantage" />
  </ModuleFields>
);

export const meta = {
  label: 'Gai Advantage',
};
