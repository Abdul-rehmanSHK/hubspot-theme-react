import {
  ModuleFields,
  TextField,
  ImageField,
  RichTextField,
} from '@hubspot/cms-components/fields';

export function Component({ fieldValues }) {
  const heading = fieldValues.heading || 'Why Attend GAI?';
  const benefitsContent = fieldValues.content || '';
  const sectionId = fieldValues.sectionId;
  const sectionClass = fieldValues.sectionClass || 'benefits-section';
  const moduleId = `benefits-${fieldValues.moduleInstanceId || Math.random().toString(36).slice(2)}`;

  return (
    <div className={sectionClass} id={sectionId || undefined} data-benefits-id={moduleId}>
      <div className="container">
        <div className="benefits-inner">
          <div className="row">
            <div className="col-md-4 custom-45 p-0">
              <div className="benefits-left">
                {heading && (
                  <div className="benefits-heading" dangerouslySetInnerHTML={{ __html: heading }} />
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
                {benefitsContent && (
                  <div 
                    className="benefits-content-raw" 
                    dangerouslySetInnerHTML={{ __html: benefitsContent }}
                  />
                )}
              </div>
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
            if (!benefitsRight || !rawContent) return;

            // Parse and restructure the rich text content
            function parseBenefitsContent() {
              const html = rawContent.innerHTML.trim();
              if (!html) return;

              // Create a temporary container to parse HTML
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = html;

              // Split content by HR tags or detect H3 patterns
              const sections = [];
              let currentSection = null;
              const nodes = Array.from(tempDiv.childNodes);

              nodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  const tagName = node.tagName.toLowerCase();
                  
                  // If it's an HR tag, finalize current section and start new one
                  if (tagName === 'hr') {
                    if (currentSection) {
                      sections.push(currentSection);
                    }
                    currentSection = null;
                    return;
                  }
                  
                  // If it's an H3, finalize previous section and start new one
                  if (tagName === 'h3') {
                    if (currentSection) {
                      sections.push(currentSection);
                    }
                    currentSection = {
                      heading: node.outerHTML,
                      content: []
                    };
                    return;
                  }
                  
                  // Add content to current section
                  if (currentSection) {
                    currentSection.content.push(node.outerHTML);
                  } else {
                    // If no section exists yet, create one with this as heading or content
                    if (tagName === 'h1' || tagName === 'h2' || tagName === 'h4' || tagName === 'h5' || tagName === 'h6') {
                      currentSection = {
                        heading: node.outerHTML,
                        content: []
                      };
                    } else {
                      // Create a section without heading
                      currentSection = {
                        heading: null,
                        content: [node.outerHTML]
                      };
                    }
                  }
                } else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
                  // Handle text nodes
                  if (currentSection) {
                    currentSection.content.push(node.textContent);
                  }
                }
              });

              // Add the last section
              if (currentSection) {
                sections.push(currentSection);
              }

              // Clear the raw content
              rawContent.innerHTML = '';

              // Build the structured HTML with .benefits-div containers
              sections.forEach((section, index) => {
                const benefitsDiv = document.createElement('div');
                benefitsDiv.className = 'benefits-div';
                
                // Add heading if it exists
                if (section.heading) {
                  const tempHeading = document.createElement('div');
                  tempHeading.innerHTML = section.heading;
                  // Move heading node to benefitsDiv
                  while (tempHeading.firstChild) {
                    benefitsDiv.appendChild(tempHeading.firstChild);
                  }
                }
                
                // Add content directly (ul, p, etc.) - CSS will handle flex layout
                const contentHTML = section.content.join('');
                if (contentHTML) {
                  // Create a temporary div to parse the content
                  const tempContent = document.createElement('div');
                  tempContent.innerHTML = contentHTML;
                  
                  // Move all child nodes directly to benefitsDiv (CSS expects direct children)
                  while (tempContent.firstChild) {
                    benefitsDiv.appendChild(tempContent.firstChild);
                  }
                }
                
                benefitsRight.appendChild(benefitsDiv);
              });
            }

            // Initialize on page load
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', parseBenefitsContent);
            } else {
              parseBenefitsContent();
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
      default="Why Attend GAI?"
      helpText="Add your heading content here. Use H2 for the main heading."
    />
    <ImageField
      name="image"
      label="Side image"
      helpText="Upload the vertical image for the left side"
    />
    <RichTextField
      name="content"
      label="Benefits Content"
      default="<h3>Grow</h3><ul><li>Enterprise AI Leaders</li><li>CEOs and Top-Level Executives</li><li>Industry leading AI Experts</li><li>Investors (Public, PE, VC)</li><li>Enterprise AI Solutions Providers</li></ul><hr><h3>Connect</h3><ul><li>View from the Top: C-Suite and the Boardroom on GenAI</li><li>Experts on AI law and regulation</li><li>Innovative AI Startups</li><li>How is ROI being measured from GenAI?</li><li>How do you navigate top security?</li></ul><hr><h3>Get Inspired</h3><ul><li>AI readiness assessments</li><li>Vendor and tech stack evaluations</li><li>GenAI roadmap development</li><li>Responsible deployment planning</li><li>Enterprise LLMs are generating immediate ROI.</li></ul><hr><h3>Enjoy</h3><ul><li>Deliver critical insights to executive leadership.</li><li>Tailor coverage to focus on GenAI use cases</li><li>Stay current with the latest GenAI news.</li><li>Keep track of how peers and competitors are using GenAI.</li><li>Get actionable intelligence by tracking practical.</li></ul>"
      helpText="Add your benefits content here. Use H3 headings for section titles, UL/LI for lists, and HR tags to separate sections. Each section will be automatically wrapped in a benefits container."
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

