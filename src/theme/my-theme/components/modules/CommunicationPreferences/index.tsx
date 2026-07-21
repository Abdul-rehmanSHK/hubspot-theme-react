import {
  ModuleFields,
  TextField,
  FormField,
  RichTextField,
} from '@hubspot/cms-components/fields';

export function Component({ fieldValues }) {
  const sectionId = fieldValues.sectionId || 'communication-preferences';
  const sectionClass = fieldValues.sectionClass || 'comm-prefs-area';

  // FormField can return a GUID string or an object with form metadata
  const selectedForm = fieldValues.selectedForm || null;

  let formId = '';
  let portalId = '39650877'; // Default portal ID
  let region = 'na1'; // Default region

  if (selectedForm) {
    if (typeof selectedForm === 'string') {
      formId = selectedForm.trim();
    } else if (typeof selectedForm === 'object') {
      formId =
        selectedForm.guid ||
        selectedForm.formId ||
        selectedForm.id ||
        selectedForm.value ||
        selectedForm.form_id ||
        (selectedForm.form &&
          (selectedForm.form.guid ||
            selectedForm.form.formId ||
            selectedForm.form.id)) ||
        '';

      portalId =
        selectedForm.portalId ||
        selectedForm.portal_id ||
        (selectedForm.form && selectedForm.form.portalId) ||
        '39650877';

      region =
        selectedForm.region ||
        (selectedForm.form && selectedForm.form.region) ||
        'na1';

      if (formId) {
        formId = String(formId).trim();
      }
    }
  }

  const formContainerId = `hs-comm-prefs-${sectionId}-${
    formId ? formId.replace(/[^a-zA-Z0-9]/g, '') : 'empty'
  }`;

  return (
    <div
      className={sectionClass}
      id={sectionId}
      style={{ background: '#f6f8fb' }}
    >
      <div className="container">
        <div className="comm-prefs-inner">
          <div className="row align-items-start justify-content-center">
            <div className="col-lg-6">
              <div className="comm-prefs-content">
                {fieldValues.content && (
                  <div dangerouslySetInnerHTML={{ __html: fieldValues.content }} />
                )}
                {fieldValues.helperNote && (
                  <p
                    className="comm-prefs-note"
                    dangerouslySetInnerHTML={{ __html: fieldValues.helperNote }}
                  />
                )}
              </div>
            </div>
            <div className="col-lg-6">
              <div className="comm-prefs-form">
                {formId ? (
                  <>
                    <div id={formContainerId}></div>
                    <script
                      dangerouslySetInnerHTML={{
                        __html: `
                        (function() {
                          const containerId = '${formContainerId}';
                          const formId = '${formId}';
                          const portalId = '${portalId}';
                          const region = '${region}';
                          let retryCount = 0;
                          const maxRetries = 50; // ~5s max wait

                          function initializeForm() {
                            const container = document.getElementById(containerId);
                            if (!container) {
                              retryCount++;
                              if (retryCount < maxRetries) setTimeout(initializeForm, 100);
                              return;
                            }
                            if (container.querySelector('iframe') || container.querySelector('.hs-form') || container.querySelector('form')) {
                              return;
                            }
                            if (typeof hbspt !== 'undefined' && hbspt.forms && typeof hbspt.forms.create === 'function') {
                              try {
                                hbspt.forms.create({
                                  portalId: portalId,
                                  formId: formId,
                                  region: region,
                                  target: '#' + containerId
                                });
                              } catch (e) {
                                console.error('Error creating HubSpot form:', e);
                                container.innerHTML = '<div class="comm-prefs-form-error">Error loading form. Please check the form ID.</div>';
                              }
                            } else {
                              retryCount++;
                              if (retryCount < maxRetries) {
                                setTimeout(initializeForm, 100);
                              } else {
                                container.innerHTML = '<div class="comm-prefs-form-error">Preferences form failed to load. Please refresh the page.</div>';
                              }
                            }
                          }

                          function startInit() { setTimeout(initializeForm, 200); }
                          if (document.readyState === 'loading') {
                            document.addEventListener('DOMContentLoaded', startInit);
                          } else {
                            startInit();
                          }
                        })();
                      `,
                      }}
                    />
                  </>
                ) : (
                  <div className="comm-prefs-form-placeholder">
                    Select your communication-preferences form in the content editor.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const fields = (
  <ModuleFields>
    <RichTextField
      name="content"
      label="Heading & Description"
      default="<h2>Manage your email preferences</h2><p>Tell us what you want to hear about from GAI Insights. Choose the topics and how often you'd like to hear from us — you're in control, and you can update these settings any time.</p><ul><li>GenAI news &amp; research briefings</li><li>Event invitations &amp; webinars</li><li>Product &amp; community updates</li></ul>"
      helpText="Heading and supporting copy shown next to the form. Use H2 for the heading."
    />
    <FormField
      name="selectedForm"
      label="Select Communication Preferences Form"
      helpText="Choose the HubSpot form that captures email/subscription preferences. Build the preference checkboxes (subscription types) in the HubSpot form editor."
    />
    <RichTextField
      name="helperNote"
      label="Fine-print / Privacy Note"
      default="We respect your privacy. You can unsubscribe or update your preferences at any time using the link in every email."
      helpText="Small print shown below the description."
    />
    <TextField
      name="sectionId"
      label="Section ID"
      default="communication-preferences"
      helpText="ID for anchor links (e.g. #communication-preferences)."
    />
    <TextField
      name="sectionClass"
      label="Section CSS Class"
      default="comm-prefs-area"
      helpText="Custom CSS class for this section. Default: comm-prefs-area"
    />
  </ModuleFields>
);

export const meta = {
  label: 'Communication Preferences (Form)',
};