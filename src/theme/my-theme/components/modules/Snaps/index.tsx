import { ModuleFields, RepeatedFieldGroup, ImageField, TextField } from '@hubspot/cms-components/fields';

const imagePath = (src?: string) =>
  src ? src : '';

export function Component({ fieldValues }) {
  const heading = fieldValues.heading || 'Snaps From GAI Insights';
  const description = fieldValues.description || 'At GAI Insights, we help organizations cut through the noise and make GenAI work where it matters most, specific to their organizational needs.';

  const top = (fieldValues.topSnaps || []).map((item: any) => imagePath(item?.image?.src)).filter(Boolean);
  const bottom = (fieldValues.bottomSnaps || []).map((item: any) => imagePath(item?.image?.src)).filter(Boolean);

  // Duplicate arrays for seamless infinite scroll
  const topImages = [...top, ...top];
  const bottomImages = [...bottom, ...bottom];

  const moduleId = `snaps-${fieldValues.moduleInstanceId || Math.random().toString(36).slice(2)}`;
  const sectionId = fieldValues.sectionId;

  return (
    <div className="snaps-area" id={sectionId || undefined} data-snaps-id={moduleId}>
      <div className="container">
        <div className="snaps-text">
          <h2>{heading}</h2>
          <p>{description}</p>
        </div>
      </div>
      <div className="event-slider">
        <div className="slider-row top-row" id={`topRow-${moduleId}`}>
          <div className="slide-track">
            {topImages.map((src, idx) => (
              <div className="slide-card" key={`top-snap-${idx}`}>
                <img src={src} alt={`Snap ${idx + 1}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="slider-row bottom-row" id={`bottomRow-${moduleId}`}>
          <div className="slide-track">
            {bottomImages.map((src, idx) => (
              <div className="slide-card" key={`bottom-snap-${idx}`}>
                <img src={src} alt={`Snap ${idx + 1}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="image-modal" id={`imageModal-${moduleId}`}>
          <span className="close-modal">&times;</span>
          <img id={`modalImg-${moduleId}`} />
        </div>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
          (function() {
            const root = document.querySelector('[data-snaps-id="${moduleId}"]');
            if (!root) return;
            
            function startContinuousScroll(rowSelector, direction = 'left', speed = 0.35) {
              const row = root.querySelector(rowSelector);
              if (!row) return;
              const track = row.querySelector('.slide-track');
              if (!track) return;
              
              // Ensure seamless loop by checking track width
              const trackWidth = track.scrollWidth;
              const halfWidth = trackWidth / 2;
              
              // For right-moving sliders, start from negative position for seamless loop
              let position = direction === 'right' ? -halfWidth : 0;
              
              function animate() {
                position += (direction === 'left' ? -speed : speed);
                
                // Reset position when we've scrolled exactly half the track width
                // This creates seamless loop since we duplicated the content
                if (direction === 'left') {
                  // Moving left: reset when position reaches -halfWidth
                  if (position <= -halfWidth) {
                    position = 0;
                  }
                } else {
                  // Moving right: reset when position reaches 0
                  if (position >= 0) {
                    position = -halfWidth;
                  }
                }
                
                track.style.transform = 'translateX(' + position + 'px)';
                requestAnimationFrame(animate);
              }
              
              animate();
            }

            startContinuousScroll('#topRow-${moduleId}', 'left', 0.35);
            startContinuousScroll('#bottomRow-${moduleId}', 'right', 0.35);

            const modal = root.querySelector('#imageModal-${moduleId}');
            const modalImg = root.querySelector('#modalImg-${moduleId}');
            if (modal && modalImg) {
              root.addEventListener('click', function (e) {
                const img = e.target.closest('.slide-card img');
                if (!img) return;
                modalImg.src = img.src;
                modal.style.display = 'flex';
              });
              const closeBtn = modal.querySelector('.close-modal');
              if (closeBtn) {
                closeBtn.addEventListener('click', function () { 
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
          })();
        `,
        }}
      />
    </div>
  );
}

export const fields = (
  <ModuleFields>
    <TextField name="heading" label="Heading" default="Snaps From GAI Insights" />
    <TextField
      name="description"
      label="Description"
      default="At GAI Insights, we help organizations cut through the noise and make GenAI work where it matters most, specific to their organizational needs."
      multiline={true}
    />
    <RepeatedFieldGroup
      name="topSnaps"
      label="Top row snap images"
      children={[<ImageField name="image" label="Snap image" required={true} />]}
    />

    <RepeatedFieldGroup
      name="bottomSnaps"
      label="Bottom row snap images"
      children={[<ImageField name="image" label="Snap image" required={true} />]}
    />
    <TextField
      name="sectionId"
      label="Section ID (optional)"
      helpText="ID for anchor links (e.g., #snaps). Leave empty for no ID."
    />
  </ModuleFields>
);

export const meta = {
  label: 'Snaps From GAI Insights',
};

