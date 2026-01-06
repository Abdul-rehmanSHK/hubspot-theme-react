import {
  ModuleFields,
  TextField,
  UrlField,
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

  const heading = fieldValues.heading || 'Frequently Asked Questions';
  const ctaText = fieldValues.ctaText || '';
  const ctaUrl = getUrl(fieldValues.ctaUrl) || '#';
  const faqs = fieldValues.faqs || [];
  const sectionId = fieldValues.sectionId;
  const sectionClass = fieldValues.sectionClass || 'faq-section';

  const moduleId = `faq-${fieldValues.moduleInstanceId || Math.random().toString(36).slice(2)}`;

  return (
    <div className={sectionClass} id={sectionId || undefined} data-faq-id={moduleId}>
      <div className="container">
        <div className="faq-inner">
          <div className="faq-header">
            <h2>{heading}</h2>
            {ctaText && (
              <a href={ctaUrl} className="transparent-btn faq-cta-btn">
                {ctaText}
              </a>
            )}
          </div>
          <div className="faq-list">
            {faqs.length > 0 ? (
              faqs.map((faq: any, index: number) => {
                const question = faq.question || '';
                const answer = faq.answer || '';
                const faqId = `faq-item-${moduleId}-${index}`;
                
                return (
                  <div key={index} className="faq-item">
                    <button
                      className="faq-question"
                      type="button"
                      aria-expanded="false"
                      aria-controls={faqId}
                      id={`faq-question-${faqId}`}
                    >
                      <span className="faq-question-text">{question}</span>
                      <span className="faq-icon">
                        <i className="fa-solid fa-chevron-down"></i>
                      </span>
                    </button>
                    <div
                      className="faq-answer"
                      id={faqId}
                      aria-labelledby={`faq-question-${faqId}`}
                    >
                      <div className="faq-answer-content">
                        {answer}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="faq-empty">
                <p>No FAQs added yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
          (function() {
            const root = document.querySelector('[data-faq-id="${moduleId}"]');
            if (!root) return;
            
            const faqItems = root.querySelectorAll('.faq-item');
            
            faqItems.forEach(function(item) {
              const questionBtn = item.querySelector('.faq-question');
              const answerDiv = item.querySelector('.faq-answer');
              
              if (!questionBtn || !answerDiv) return;
              
              // Get the answer content height for smooth animation
              const answerContent = answerDiv.querySelector('.faq-answer-content');
              if (!answerContent) return;
              
              // Set initial state - closed
              answerDiv.style.maxHeight = '0';
              answerDiv.style.overflow = 'hidden';
              answerDiv.style.transition = 'max-height 0.3s ease-out, padding 0.3s ease-out';
              
              questionBtn.addEventListener('click', function() {
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                const icon = this.querySelector('.faq-icon i');
                
                // Close all other FAQ items (optional - remove if you want multiple open)
                faqItems.forEach(function(otherItem) {
                  if (otherItem !== item) {
                    const otherBtn = otherItem.querySelector('.faq-question');
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    const otherIcon = otherItem.querySelector('.faq-icon i');
                    
                    if (otherBtn && otherAnswer && otherIcon) {
                      otherBtn.setAttribute('aria-expanded', 'false');
                      otherBtn.classList.remove('active');
                      otherAnswer.style.maxHeight = '0';
                      otherAnswer.style.paddingTop = '0';
                      otherAnswer.style.paddingBottom = '0';
                      otherIcon.style.transform = 'rotate(0deg)';
                    }
                  }
                });
                
                if (isExpanded) {
                  // Close this FAQ
                  this.setAttribute('aria-expanded', 'false');
                  this.classList.remove('active');
                  answerDiv.style.maxHeight = '0';
                  answerDiv.style.paddingTop = '0';
                  answerDiv.style.paddingBottom = '0';
                  if (icon) {
                    icon.style.transform = 'rotate(0deg)';
                  }
                } else {
                  // Open this FAQ
                  this.setAttribute('aria-expanded', 'true');
                  this.classList.add('active');
                  
                  // Get the actual height of the content
                  const contentHeight = answerContent.scrollHeight;
                  answerDiv.style.maxHeight = contentHeight + '%';
                  answerDiv.style.paddingTop = '20px';
                  answerDiv.style.paddingBottom = '20px';
                  
                  if (icon) {
                    icon.style.transform = 'rotate(180deg)';
                  }
                }
              });
            });
            
            // Handle smooth scrolling for FAQ CTA button
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

            const faqCtaBtn = root.querySelector('.faq-cta-btn');
            if (faqCtaBtn) {
              faqCtaBtn.addEventListener('click', function(e) {
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
    <TextField
      name="heading"
      label="Heading"
      default="Frequently Asked Questions"
    />
    <TextField
      name="ctaText"
      label="CTA button text (optional)"
      helpText="Leave empty to hide the CTA button"
    />
    <UrlField
      name="ctaUrl"
      label="CTA button URL"
      helpText="URL for the CTA button. Use #sectionid for smooth scrolling to a section."
    />
    <RepeatedFieldGroup
      name="faqs"
      label="FAQ Items"
      required={true}
      children={[
        <TextField
          name="question"
          label="Question"
          required={true}
          default="What is GAI World?"
        />,
        <TextField
          name="answer"
          label="Answer"
          required={true}
          multiline={true}
          default="GAI World is a premier conference for Generative AI leaders and innovators."
        />,
      ]}
    />
    <TextField
      name="sectionId"
      label="Section ID (optional)"
      helpText="ID for anchor links (e.g., #faq). Leave empty for no ID."
    />
    <TextField
      name="sectionClass"
      label="Section CSS Class"
      default="faq-section"
      helpText="Custom CSS class for this section. Default: faq-section"
    />
  </ModuleFields>
);

export const meta = {
  label: 'FAQ Section',
};

