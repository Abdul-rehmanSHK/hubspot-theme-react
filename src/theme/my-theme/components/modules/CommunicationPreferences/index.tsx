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
      <style
        dangerouslySetInnerHTML={{
          __html: `
    /* ---- Section surface (override global dark body background) ---- */
    #${sectionId}.${sectionClass} {
      background: #f6f8fb !important;
      color: #020e26 !important;
      padding: 90px 0;
    }
    #${sectionId} .comm-prefs-inner { max-width: 1140px; margin: 0 auto; }

    /* ---- Intro copy ---- */
    #${sectionId} .comm-prefs-content { padding-right: 20px; }
    #${sectionId} .comm-prefs-content h1,
    #${sectionId} .comm-prefs-content h2 {
      color: #020e26 !important;
      font-size: 40px;
      line-height: 1.12;
      font-weight: 700;
      margin: 0 0 18px;
    }
    #${sectionId} .comm-prefs-content p {
      color: #3a4256 !important;
      font-size: 17px;
      line-height: 1.7;
      margin: 0 0 14px;
    }
    #${sectionId} .comm-prefs-content ul { margin: 0 0 8px; padding-left: 20px; }
    #${sectionId} .comm-prefs-content li {
      color: #3a4256 !important;
      font-size: 16px;
      line-height: 1.7;
      margin-bottom: 8px;
    }
    #${sectionId} .comm-prefs-note { margin-top: 22px; font-size: 13.5px; color: #6b7280 !important; line-height: 1.6; }

    /* ---- Form card ---- */
    #${sectionId} .comm-prefs-form {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      padding: 36px;
      box-shadow: 0 14px 40px rgba(2,14,38,0.08);
    }
    #${sectionId} .comm-prefs-form-placeholder,
    #${sectionId} .comm-prefs-form-error {
      padding: 24px; text-align: center; color: #6b7280;
      border: 2px dashed #cbd5e1; border-radius: 10px; font-size: 15px;
    }
    #${sectionId} .comm-prefs-form-error { color: #d32f2f; border-color: #f0b4b4; }

    /* ---- Embedded HubSpot form styling ---- */
    #${sectionId} .hs-form fieldset { max-width: 100% !important; }
    #${sectionId} .hs-form label {
      color: #020e26 !important;
      font-size: 15px !important;
      font-weight: 600 !important;
      display: block;
      margin-bottom: 8px;
    }
    #${sectionId} .hs-form .hs-field-desc { color: #6b7280 !important; font-weight: 400 !important; font-size: 13px !important; }
    #${sectionId} .hs-form .input { margin-bottom: 18px; }
    #${sectionId} .hs-form input.hs-input,
    #${sectionId} .hs-form textarea.hs-input,
    #${sectionId} .hs-form select.hs-input {
      width: 100% !important;
      background: #ffffff !important;
      color: #020e26 !important;
      border: 1px solid #cbd5e1 !important;
      border-radius: 8px !important;
      padding: 12px 14px !important;
      font-size: 15px !important;
      box-shadow: none !important;
    }
    #${sectionId} .hs-form input.hs-input:focus,
    #${sectionId} .hs-form textarea.hs-input:focus,
    #${sectionId} .hs-form select.hs-input:focus {
      border-color: #fbcc24 !important;
      outline: none !important;
      box-shadow: 0 0 0 3px rgba(251,204,36,0.25) !important;
    }
    /* Checkbox / subscription preference list */
    #${sectionId} .hs-form ul.inputs-list { list-style: none; margin: 6px 0 18px; padding: 0; }
    #${sectionId} .hs-form ul.inputs-list li { margin-bottom: 12px; }
    #${sectionId} .hs-form ul.inputs-list li label {
      display: flex !important;
      align-items: center;
      gap: 10px;
      font-weight: 500 !important;
      color: #1f2937 !important;
      margin: 0 !important;
      cursor: pointer;
    }
    #${sectionId} .hs-form ul.inputs-list input[type="checkbox"],
    #${sectionId} .hs-form ul.inputs-list input[type="radio"] {
      width: 18px; height: 18px; margin: 0; flex-shrink: 0; accent-color: #020e26;
    }
    /* Submit button (brand amber) */
    #${sectionId} .hs-form .hs-submit input[type="submit"],
    #${sectionId} .hs-form .hs-button {
      background: #fbcc24 !important;
      color: #020e26 !important;
      border: 0 !important;
      border-radius: 50px !important;
      padding: 14px 34px !important;
      font-size: 16px !important;
      font-weight: 700 !important;
      cursor: pointer;
      transition: .25s ease-in-out;
      -webkit-appearance: none;
    }
    #${sectionId} .hs-form .hs-submit input[type="submit"]:hover,
    #${sectionId} .hs-form .hs-button:hover {
      background: #f0bc10 !important;
      box-shadow: 0 6px 18px rgba(251,204,36,0.40);
      transform: translateY(-2px);
    }
    #${sectionId} .hs-form .hs-error-msg,
    #${sectionId} .hs-form .hs-error-msgs label { color: #d32f2f !important; font-weight: 500 !important; }

    @media (max-width: 991px) {
      #${sectionId}.${sectionClass} { padding: 56px 0; }
      #${sectionId} .comm-prefs-content { padding-right: 0; margin-bottom: 32px; text-align: center; }
      #${sectionId} .comm-prefs-content h1,
      #${sectionId} .comm-prefs-content h2 { font-size: 30px; }
      #${sectionId} .comm-prefs-form { padding: 26px; }
    }
    `,
        }}
      />
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