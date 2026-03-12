import {
  ModuleFields,
  ImageField,
  TextField,
  UrlField,
  RepeatedFieldGroup,
  BooleanField,
  RichTextField,
  FormField,
} from '@hubspot/cms-components/fields';
import logo from '../../../assets/images/gai-insights-logo.png';

// Helper function to get URL from UrlField
const getUrl = (linkField: any) => {
  if (typeof linkField === 'string') {
    return linkField;
  }
  if (linkField && typeof linkField === 'object') {
    return linkField.url || linkField.href || linkField.link || '#';
  }
  return '#';
};

export function Component({ fieldValues }) {
  const socialLinks = fieldValues.socialLinks || [];
  const footerLinks = fieldValues.footerLinks || [];
  const footerLogoLink = getUrl(fieldValues.footerLogoLink);

  const selectedForm = fieldValues.footerForm || null;
  let formId = '';
  let portalId = '39650877';
  let region = 'na1';
  if (selectedForm) {
    if (typeof selectedForm === 'string') {
      formId = selectedForm.trim();
    } else if (typeof selectedForm === 'object' && selectedForm !== null) {
      formId = selectedForm.guid || selectedForm.formId || selectedForm.id || selectedForm.value || selectedForm.form_id ||
        (selectedForm.form && (selectedForm.form.guid || selectedForm.form.formId || selectedForm.form.id)) || '';
      portalId = selectedForm.portalId || selectedForm.portal_id || (selectedForm.form && selectedForm.form.portalId) || '39650877';
      region = selectedForm.region || (selectedForm.form && selectedForm.form.region) || 'na1';
      if (formId) formId = String(formId).trim();
    }
  }
  const formContainerId = `hs-form-footer-${formId ? formId.replace(/[^a-zA-Z0-9]/g, '') : 'empty'}`;

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-div">
          <div className="row g-5">
            <div className="col-md-6">
              <div className="footer-top">
                <a href={footerLogoLink} data-footer-logo>
                  <img src={fieldValues.logo?.src} alt={fieldValues.logo?.alt || 'logo'} data-footer-logo-img />
                </a>
              </div>
              <div className="footer-text">
                {fieldValues.footerContent && (
                  <div dangerouslySetInnerHTML={{ __html: fieldValues.footerContent }} />
                )}
              </div>
              <div className="footer-bottom">
                <p>© {fieldValues.copyrightYear || new Date().getFullYear()} by GAI Insights</p>
                {footerLinks.map((item, index) => {
                  const linkUrl = getUrl(item.link);
                  return (
                    <a key={index} href={linkUrl}>
                      {item.text}
                    </a>
                  );
                })}
              </div>
            </div>
            <div className="col-md-6">
              <div className="footer-social">
                <div className="social-icons">
                  <h6>{fieldValues.hashtag || '#GAIWorld'}</h6>
                  {socialLinks.map((item, index) => {
                    const linkUrl = getUrl(item.link);
                    // Handle BooleanField - it can be boolean, string "true"/"false", or undefined
                    const shouldOpenInNewWindow = item.openInNewWindow === true || 
                                                  item.openInNewWindow === "true" || 
                                                  item.openInNewWindow === 1;
                    return (
                      <a
                        key={index}
                        href={linkUrl}
                        target={shouldOpenInNewWindow ? "_blank" : undefined}
                        rel={shouldOpenInNewWindow ? "noopener noreferrer" : undefined}
                        aria-label={item.ariaLabel || item.text || 'Social link'}
                      >
                        <i className={item.icon || 'fab fa-facebook-f'}></i>
                      </a>
                    );
                  })}
                </div>
                {formId ? (
                  <>
                    <div id={formContainerId} className="newsletter-form" />
                    <script
                      dangerouslySetInnerHTML={{
                        __html: `
                        (function() {
                          var containerId = '${formContainerId}';
                          var formId = '${formId}';
                          var portalId = '${portalId}';
                          var region = '${region}';
                          var retryCount = 0;
                          var maxRetries = 50;
                          function initForm() {
                            var container = document.getElementById(containerId);
                            if (!container) {
                              retryCount++;
                              if (retryCount < maxRetries) setTimeout(initForm, 100);
                              return;
                            }
                            if (container.querySelector('iframe') || container.querySelector('.hs-form') || container.querySelector('form')) return;
                            if (typeof hbspt !== 'undefined' && hbspt.forms && typeof hbspt.forms.create === 'function') {
                              try {
                                hbspt.forms.create({ portalId: portalId, formId: formId, region: region, target: '#' + containerId });
                              } catch (e) {
                                container.innerHTML = '<div style="padding:20px;text-align:center;color:#d32f2f;">Error loading form.</div>';
                              }
                            } else {
                              retryCount++;
                              if (retryCount < maxRetries) setTimeout(initForm, 100);
                            }
                          }
                          if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function() { setTimeout(initForm, 200); });
                          else setTimeout(initForm, 200);
                        })();
                        `,
                      }}
                    />
                  </>
                ) : (
                  <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                    <input
                      type="email"
                      placeholder={fieldValues.newsletterPlaceholder || 'Enter your email address'}
                      required
                    />
                    <button type="submit">{fieldValues.newsletterButtonText || 'SUBSCRIBE'}</button>
                  </form>
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
            function applyHubDbFooterLogo() {
              var logoLink = document.querySelector('.footer [data-footer-logo]');
              var logoImg = document.querySelector('.footer [data-footer-logo-img]');
              fetch('https://api.hubapi.com/cms/v3/hubdb/tables/199638385/rows?portalId=39650877')
                .then(function(r) { return r.json(); })
                .then(function(data) {
                  var results = data && data.results;
                  if (!results || results.length === 0) return;
                  var last = results[results.length - 1];
                  var values = last && last.values;
                  if (!values) return;
                  if (logoLink && values.logo_url) logoLink.setAttribute('href', values.logo_url);
                  if (logoImg && values.logo_image && values.logo_image.url) {
                    logoImg.setAttribute('src', values.logo_image.url);
                    if (values.logo_image.altText) logoImg.setAttribute('alt', values.logo_image.altText);
                  }
                })
                .catch(function() {});
            }
            if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyHubDbFooterLogo);
            else applyHubDbFooterLogo();
          })();
          `,
        }}
      />
    </footer>
  );
}

export const fields = (
  <ModuleFields>
    <ImageField
      name="logo"
      label="Logo"
      default={{ src: logo, alt: 'GAI Insights', width: 180, height: 60 }}
      resizable={true}
    />
    <UrlField
      name="footerLogoLink"
      label="Logo link"
    />
    <TextField name="hashtag" label="Hashtag" default="#GAIWorld" />
    <RepeatedFieldGroup
      name="socialLinks"
      label="Social links"
      children={[
        <TextField name="text" label="Label" required={true} default="Facebook" />,
        <TextField
          name="icon"
          label="Font Awesome icon class"
          required={true}
          default="fab fa-facebook-f"
        />,
        <TextField
          name="ariaLabel"
          label="Aria label"
          default="Facebook"
        />,
        <UrlField
          name="link"
          label="Link"
        />,
        <BooleanField
          name="openInNewWindow"
          label="Open in new window"
          default={true}
        />,
      ]}
    />
    <TextField
      name="newsletterPlaceholder"
      label="Newsletter placeholder"
      default="Enter your email address"
    />
    <TextField name="newsletterButtonText" label="Newsletter button" default="SUBSCRIBE" />
    <FormField
      name="footerForm"
      label="Footer form"
      helpText="Optional. Select a HubSpot form to show instead of the email placeholder and button. Leave unset to keep the default email input and Subscribe button."
    />
    <RichTextField
      name="footerContent"
      label="Footer Content"
      default="<h4>Stay ahead of what's next. Get first access to GAI news and updates.</h4><p>We're committed to your privacy. GAI Insights uses the information you provide to us to contact you about GAI Insights content and events. You may unsubscribe from these communications at any time. For more information, check out our privacy policy.</p>"
      helpText="Add your footer headline and copy here. Use H4 for the headline and P for the paragraph text."
    />
    <TextField
      name="copyrightYear"
      label="Copyright year"
      default="2026"
    />
    <RepeatedFieldGroup
      name="footerLinks"
      label="Footer links"
      children={[
        <TextField name="text" label="Label" required={true} default="Manage Cookies" />,
        <UrlField
          name="link"
          label="Link"
        />,
      ]}
    />
  </ModuleFields>
);

export const meta = {
  label: 'GAI Footer',
};
