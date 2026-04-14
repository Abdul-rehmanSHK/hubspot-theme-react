import { ModuleFields, RepeatedFieldGroup, ImageField, TextField, UrlField, BooleanField, RichTextField, NumberField } from '@hubspot/cms-components/fields';

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
  const moduleId = `gallery-${fieldValues.moduleInstanceId || Math.random().toString(36).slice(2)}`;
  const sectionId = fieldValues.sectionId;
  const sectionClass = fieldValues.sectionClass || 'gallery-section-area';

  // Gallery configuration
  const imagesPerRow = fieldValues.imagesPerRow || 5;

  // Get all gallery images
  const galleryImages = (fieldValues.galleryImages || []).map((item: any) => imagePath(item?.image?.src)).filter(Boolean);

  // Marquee text items
  const marqueeItems = fieldValues.marqueeItems || [];

  return (
    <div className={sectionClass} id={sectionId || undefined} data-gallery-id={moduleId}>
      <div className="container">
        {/* Heading */}
        {fieldValues.heading && (
          <h2 className="gallery-heading">{fieldValues.heading}</h2>
        )}

        {/* Gallery with Navigation */}
        <div className="gallery-wrapper" id={`galleryWrapper-${moduleId}`}>
          {/* Previous Button */}
          <button
            className="gallery-nav gallery-nav-prev"
            id={`prevBtn-${moduleId}`}
            aria-label="Previous images"
          >
            <span className="nav-arrow">‹</span>
          </button>

          {/* Gallery Content */}
          <div className="gallery-container">
            <div className="gallery-track" id={`galleryTrack-${moduleId}`}>
              {galleryImages.map((src, idx) => (
                <div
                  className="gallery-item"
                  key={`gallery-img-${idx}`}
                >
                  <img
                    src={src}
                    alt={`Gallery image ${idx + 1}`}
                    className="gallery-image"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Next Button */}
          <button
            className="gallery-nav gallery-nav-next"
            id={`nextBtn-${moduleId}`}
            aria-label="Next images"
          >
            <span className="nav-arrow">›</span>
          </button>
        </div>

        {/* Gallery Controls - Dots Indicator */}
        <div className="gallery-dots" id={`galleryDots-${moduleId}`}>
          {Array.from({ length: 1 }).map((_, idx) => (
            <button
              key={`dot-${idx}`}
              className={`dot active`}
              id={`dot-${moduleId}-${idx}`}
              aria-label={`Gallery`}
            />
          ))}
        </div>

        {/* Marquee Text Section */}
        {marqueeItems && marqueeItems.length > 0 && (
          <div className="marquee-container">
            <div className="marquee-wrapper">
              <div className="marquee-content" id={`marqueeContent-${moduleId}`}>
                {marqueeItems.map((item: any, idx: number) => (
                  <span key={`marquee-${idx}`} className="marquee-text">
                    {item.marqueeText}
                    {idx < marqueeItems.length - 1 && <span className="marquee-separator">•</span>}
                  </span>
                ))}
                {/* Duplicate for seamless loop - quadruple for smooth animation */}
                {marqueeItems.map((item: any, idx: number) => (
                  <span key={`marquee-dup-${idx}`} className="marquee-text">
                    {item.marqueeText}
                    {idx < marqueeItems.length - 1 && <span className="marquee-separator">•</span>}
                  </span>
                ))}
                {marqueeItems.map((item: any, idx: number) => (
                  <span key={`marquee-dup2-${idx}`} className="marquee-text">
                    {item.marqueeText}
                    {idx < marqueeItems.length - 1 && <span className="marquee-separator">•</span>}
                  </span>
                ))}
                {marqueeItems.map((item: any, idx: number) => (
                  <span key={`marquee-dup3-${idx}`} className="marquee-text">
                    {item.marqueeText}
                    {idx < marqueeItems.length - 1 && <span className="marquee-separator">•</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      <div className="image-modal" id={`imageModal-${moduleId}`}>
        <span className="close-modal">&times;</span>
        <img id={`modalImg-${moduleId}`} alt="Modal display" />
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
          (function() {
            const root = document.querySelector('[data-gallery-id="${moduleId}"]');
            if (!root) return;

            const track = root.querySelector('#galleryTrack-${moduleId}');
            const prevBtn = root.querySelector('#prevBtn-${moduleId}');
            const nextBtn = root.querySelector('#nextBtn-${moduleId}');
            const gallery = root.querySelector('.gallery-container');
            const actualImages = ${galleryImages.length};
            
            // Scroll amount - adjust based on image width and gap
            const scrollAmount = 250; // Adjust this value to scroll by image count

            function scrollGallery(direction) {
              const currentScroll = gallery.scrollLeft;
              const newScroll = direction === 'next' 
                ? currentScroll + scrollAmount 
                : currentScroll - scrollAmount;
              
              gallery.scrollTo({
                left: newScroll,
                behavior: 'smooth'
              });
            }

            if (nextBtn) nextBtn.addEventListener('click', () => scrollGallery('next'));
            if (prevBtn) prevBtn.addEventListener('click', () => scrollGallery('prev'));

            // Image modal functionality
            const modal = root.querySelector('#imageModal-${moduleId}');
            const modalImg = root.querySelector('#modalImg-${moduleId}');
            
            if (modal && modalImg) {
              root.addEventListener('click', function(e) {
                const img = e.target.closest('.gallery-image');
                if (!img) return;
                modalImg.src = img.src;
                modal.style.display = 'flex';
              });

              const closeBtn = modal.querySelector('.close-modal');
              if (closeBtn) {
                closeBtn.addEventListener('click', function() {
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

            // Marquee animation
            const marqueeContent = root.querySelector('#marqueeContent-${moduleId}');
            if (marqueeContent) {
              const marqueeWrapper = root.querySelector('.marquee-wrapper');
              // Calculate animation duration based on content width
              setTimeout(() => {
                const scrollWidth = marqueeContent.scrollWidth / 4; // Divide by 4 because we quadrupled content
                const wrapperWidth = marqueeWrapper.clientWidth;
                const duration = (scrollWidth / wrapperWidth) * 20; // Adjust speed multiplier as needed
                
                if (scrollWidth > wrapperWidth) {
                  marqueeContent.style.animation = 'marquee ' + duration + 's linear infinite';
                }
              }, 100);
            }

            // Autoplay gallery slider
            let autoplayInterval;
            const autoplayDelay = 5000; // 5 seconds
            
            function startAutoplay() {
              autoplayInterval = setInterval(() => {
                scrollGallery('next');
              }, autoplayDelay);
            }
            
            function resetAutoplay() {
              clearInterval(autoplayInterval);
              startAutoplay();
            }
            
            // Start autoplay
            startAutoplay();
            
            // Pause autoplay on manual navigation
            if (nextBtn) nextBtn.addEventListener('click', resetAutoplay);
            if (prevBtn) prevBtn.addEventListener('click', resetAutoplay);
            
            // Pause on hover
            if (gallery) {
              gallery.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
              gallery.addEventListener('mouseleave', startAutoplay);
            }
          })();
        `,
        }}
      />

      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-25%);
          }
        }
      `}</style>
    </div>
  );
}

export const fields = (
  <ModuleFields>
    <TextField
      name="heading"
      label="Gallery Heading"
      placeholder="Enter gallery heading"
      helpText="Optional heading text to display above the gallery"
    />
    <NumberField
      name="imagesPerRow"
      label="Images Per Row"
      default={5}
      helpText="Number of images to display in each row (default: 5)"
      min={1}
      max={20}
    />
    <RepeatedFieldGroup
      name="galleryImages"
      label="Gallery Images"
      children={[
        <ImageField
          name="image"
          label="Gallery image"
          required={true}
        />
      ]}
    />
    <RepeatedFieldGroup
      name="marqueeItems"
      label="Marquee Text Items"
      children={[
        <TextField
          name="marqueeText"
          label="Marquee Text"
          required={true}
          placeholder="Enter text for marquee"
        />
      ]}
    />
    <TextField
      name="sectionId"
      label="Section ID (optional)"
      helpText="ID for anchor links (e.g., #gallery). Leave empty for no ID."
    />
    <TextField
      name="sectionClass"
      label="Section CSS Class"
      default="gallery-section-area"
      helpText="Custom CSS class for this section. Default: gallery-section-area"
    />
  </ModuleFields>
);

export const meta = {
  label: 'Gallery Section',
};
