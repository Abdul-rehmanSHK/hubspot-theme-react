import {
  ModuleFields,
  TextField,
  UrlField,
  ImageField,
  RepeatedFieldGroup,
} from '@hubspot/cms-components/fields';

export function Component({ fieldValues }) {
  // Handle UrlField structure - it can be a string or an object with url/href property
  const getUrl = (urlField) => {
    if (!urlField) return '#';
    if (typeof urlField === 'string') return urlField;
    if (typeof urlField === 'object') {
      return urlField.url || urlField.href || urlField.link || '#';
    }
    return '#';
  };

  const heading = fieldValues.heading || 'Why Attend GAI?';
  const ctaUrl = getUrl(fieldValues.ctaUrl) || '#';
  const benefits = fieldValues.benefits || [];
  const sectionId = fieldValues.sectionId;
  const sectionClass = fieldValues.sectionClass || 'benefits-section';

  return (
    <div className={sectionClass} id={sectionId || undefined}>
      <div className="container">
        <div className="benefits-inner">
          <div className="row">
            <div className="col-md-4 custom-45 p-0">
              <div className="benefits-left">
                <h2>{heading}</h2>
                {fieldValues.ctaText && (
                  <div className="benefits-btn">
                    <a href={ctaUrl} className="transparent-btn benefits-cta-btn">
                      {fieldValues.ctaText}
                    </a>
                  </div>
                )}
                {fieldValues.image?.src && (
                  <div className="benefits-img">
                    <img
                      src={fieldValues.image.src}
                      alt={fieldValues.image.alt || 'Benefits image'}
                      className="img-fluid"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="col-md-8 custom-md-full p-0">
              <div className="benefits-right">
                {benefits.map((benefit: any, index: number) => {
                  // Get items from the RepeatedFieldGroup
                  const items = benefit.items && Array.isArray(benefit.items)
                    ? benefit.items.map((item: any) => {
                        // Handle both string and object formats
                        return typeof item === 'string' ? item : (item.item || item.text || '');
                      }).filter((item: string) => item.trim())
                    : [];
                  
                  // Get paragraph text
                  const paragraph = benefit.paragraph || '';
                  const hasItems = items.length > 0;
                  const hasParagraph = paragraph && paragraph.trim() !== '';
                  
                  return (
                    <div key={index} className="benefits-div">
                      <h3>{benefit.title || ''}</h3>
                      {hasItems ? (
                        // If items exist, show list (list takes priority)
                      <ul>
                          {items.map((item: string, itemIndex: number) => (
                            <li key={itemIndex}>{item}</li>
                          ))}
                        </ul>
                      ) : hasParagraph ? (
                        // If no items but paragraph exists, show paragraph
                        <p>{paragraph}</p>
                      ) : (
                        // Fallback if neither exists
                        <ul>
                          <li>No items added</li>
                        </ul>
                        )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
          (function() {
            // Handle smooth scrolling for Benefits CTA button
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

            const benefitsCtaBtn = document.querySelector('.benefits-section .benefits-cta-btn');
            if (benefitsCtaBtn) {
              benefitsCtaBtn.addEventListener('click', function(e) {
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
    <TextField name="heading" label="Heading" default="Why Attend GAI?" />
    <TextField name="ctaText" label="CTA text" default="Convince Your Boss to Send You" />
    <UrlField name="ctaUrl" label="CTA URL" />
    <ImageField
      name="image"
      label="Side image"
      helpText="Upload the vertical image for the left side"
    />
    <RepeatedFieldGroup
      name="benefits"
      label="Benefits"
      required={true}
      children={[
        <TextField name="title" label="Benefit title" required={true} default="Grow" />,
        <TextField
          name="paragraph"
          label="Paragraph (optional)"
          multiline={true}
          helpText="Optional paragraph text. If both paragraph and list items are provided, list items will be displayed."
        />,
        <RepeatedFieldGroup
          name="items"
          label="Benefit items"
          required={false}
          helpText="List items. If provided, will take priority over paragraph."
          children={[
            <TextField
              name="item"
              label="List item"
              required={true}
              default="Enterprise AI Leaders"
            />,
          ]}
        />,
      ]}
    />
    <TextField
      name="sectionId"
      label="Section ID (optional)"
      helpText="ID for anchor links (e.g., #benefits). Leave empty for no ID."
    />
    <TextField
      name="sectionClass"
      label="Section CSS Class"
      default="benefits-section"
      helpText="Custom CSS class for this section. Default: benefits-section"
    />
  </ModuleFields>
);

export const meta = {
  label: 'Why Attend GAI?',
};

