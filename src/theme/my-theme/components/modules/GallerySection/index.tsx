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

  const isSliderEnabled = galleryImages.length > 0;

  // Marquee text items
  const marqueeItems = fieldValues.marqueeItems || [];

  return (
    <div className={sectionClass} id={sectionId || undefined} data-gallery-id={moduleId}>
      <div className="container">
        {/* Heading */}
        {fieldValues.heading && (
          <h2 className="gallery-heading">{fieldValues.heading}</h2>
        )}

        {/* Gallery with Swiper */}
        <div className={`gallery-wrapper swiper ${!isSliderEnabled ? 'is-static' : ''}`} id={`galleryWrapper-${moduleId}`}>
          <div className="swiper-wrapper">
            {galleryImages.map((src, idx) => (
              <div
                className="gallery-item swiper-slide"
                key={`gallery-img-${idx}`}
              >
                <img
                  src={src}
                  alt={`Gallery image ${idx + 1}`}
                  className="gallery-image"
                  data-index={idx}
                />
              </div>
            ))}
          </div>

          {/* Swiper Pagination (Dots) */}
          {isSliderEnabled && (
            <div className="swiper-pagination"></div>
          )}
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
        <span className="close-modal" title="Close">&times;</span>
        <button className="modal-nav modal-prev" id={`modalPrev-${moduleId}`} aria-label="Previous image">‹</button>
        <div className="modal-img-container">
          <img id={`modalImg-${moduleId}`} alt="Modal display" />
        </div>
        <button className="modal-nav modal-next" id={`modalNext-${moduleId}`} aria-label="Next image">›</button>
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
            const allImages = ${JSON.stringify(galleryImages)};
            const isSliderEnabled = ${isSliderEnabled};
            let currentModalIndex = 0;
            let swiperInstance = null;

            // Initialize Swiper
            if (isSliderEnabled) {
              function initGallerySwiper() {
                const sliderEl = root.querySelector('.gallery-wrapper');
                if (!sliderEl) return;
                
                // Wait for Swiper library to be ready
                if (typeof Swiper === 'undefined') {
                  setTimeout(initGallerySwiper, 100);
                  return;
                }

                swiperInstance = new Swiper(sliderEl, {
                  slidesPerView: 1,
                  spaceBetween: 20,
                  loop: true,
                  centeredSlides: false,
                  speed: 800,
                  watchSlidesProgress: true,
                  autoplay: {
                    delay: 4000,
                    disableOnInteraction: false,
                  },
                  pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                  },
                  breakpoints: {
                    480: {
                      slidesPerView: 1,
                      spaceBetween: 20,
                    },
                    768: {
                      slidesPerView: 2,
                      spaceBetween: 20,
                    },
                    1024: {
                      slidesPerView: 3,
                      spaceBetween: 30,
                    }
                  }
                });
              }

              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initGallerySwiper);
              } else {
                initGallerySwiper();
              }
            }

            // Image modal functionality
            const modal = root.querySelector('#imageModal-${moduleId}');
            const modalImg = root.querySelector('#modalImg-${moduleId}');
            const modalPrev = root.querySelector('#modalPrev-${moduleId}');
            const modalNext = root.querySelector('#modalNext-${moduleId}');
            
            function updateModalImage(index) {
              if (index < 0) index = allImages.length - 1;
              if (index >= allImages.length) index = 0;
              
              currentModalIndex = index;
              
              // Fade effect
              modalImg.style.opacity = '0';
              setTimeout(() => {
                modalImg.src = allImages[currentModalIndex];
                modalImg.style.opacity = '1';
              }, 200);
            }

            if (modal && modalImg) {
              root.addEventListener('click', function(e) {
                const img = e.target.closest('.gallery-image');
                if (!img) return;
                
                const index = parseInt(img.getAttribute('data-index'), 10);
                if (!isNaN(index)) {
                  updateModalImage(index);
                  modal.style.display = 'flex';
                  document.body.style.overflow = 'hidden'; // Prevent scroll
                }
              });

              if (modalPrev) modalPrev.addEventListener('click', (e) => {
                e.stopPropagation();
                updateModalImage(currentModalIndex - 1);
              });

              if (modalNext) modalNext.addEventListener('click', (e) => {
                e.stopPropagation();
                updateModalImage(currentModalIndex + 1);
              });

              const closeBtn = modal.querySelector('.close-modal');
              if (closeBtn) {
                closeBtn.addEventListener('click', function() {
                  modal.style.display = 'none';
                  document.body.style.overflow = ''; // Restore scroll
                });
              }

              // Close on background click
              modal.addEventListener('click', function(e) {
                if (e.target === modal || e.target.classList.contains('modal-img-container')) {
                  modal.style.display = 'none';
                  document.body.style.overflow = '';
                }
              });

              // Keyboard navigation
              document.addEventListener('keydown', function(e) {
                if (modal.style.display === 'flex') {
                  if (e.key === 'ArrowLeft') updateModalImage(currentModalIndex - 1);
                  if (e.key === 'ArrowRight') updateModalImage(currentModalIndex + 1);
                  if (e.key === 'Escape') {
                    modal.style.display = 'none';
                    document.body.style.overflow = '';
                  }
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

          })();
        `,
        }}
      />

      <style>{`
        .gallery-wrapper {
          overflow: hidden !important;
        }
        .swiper-slide {
          height: auto !important;
        }
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
