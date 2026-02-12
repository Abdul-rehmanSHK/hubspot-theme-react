import {
  ModuleFields,
  TextField,
  FormField,
  RichTextField,
} from '@hubspot/cms-components/fields';

export function Component({ fieldValues }) {
  const sectionId = fieldValues.sectionId || 'contact-us';
  const sectionClass = fieldValues.sectionClass || 'help-area';
  
  // Get selected form from FormField
  // FormField returns an object with form information
  const selectedForm = fieldValues.selectedForm || null;
  
  // Extract form details from FormField value
  // FormField can return: { guid, name, portalId, region } or just a string GUID
  let formId = '';
  let portalId = '39650877'; // Default portal ID
  let region = 'na1'; // Default region
  
  if (selectedForm) {
    if (typeof selectedForm === 'string') {
      // If it's just a string, it's the form GUID
      formId = selectedForm.trim();
    } else if (typeof selectedForm === 'object' && selectedForm !== null) {
      // If it's an object, extract properties
      // Try multiple possible property names
      formId = selectedForm.guid || 
               selectedForm.formId || 
               selectedForm.id || 
               selectedForm.value || 
               selectedForm.form_id ||
               (selectedForm.form && (selectedForm.form.guid || selectedForm.form.formId || selectedForm.form.id)) ||
               '';
      
      // Extract portal ID
      portalId = selectedForm.portalId || 
                 selectedForm.portal_id || 
                 (selectedForm.form && selectedForm.form.portalId) ||
                 '39650877';
      
      // Extract region
      region = selectedForm.region || 
               (selectedForm.form && selectedForm.form.region) ||
               'na1';
      
      // Clean up formId
      if (formId) {
        formId = String(formId).trim();
      }
    }
  }
  
  // Create unique container ID for this form instance
  const formContainerId = `hs-form-container-${sectionId}-${formId ? formId.replace(/[^a-zA-Z0-9]/g, '') : 'empty'}`;

  return (
    <div className={sectionClass} id={sectionId}>
      <div className="container">
        <div className="help-inner">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="help-content">
                {fieldValues.content && (
                  <div dangerouslySetInnerHTML={{ __html: fieldValues.content }} />
                )}
              </div>
            </div>
            <div className="col-md-6">
              <div className="contact-form">
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
                          const maxRetries = 50; // 5 seconds max wait time
                          
                          function initializeForm() {
                            const container = document.getElementById(containerId);
                            if (!container) {
                              retryCount++;
                              if (retryCount < maxRetries) {
                                setTimeout(initializeForm, 100);
                              }
                              return;
                            }
                            
                            // Check if form is already initialized
                            if (container.querySelector('iframe') || container.querySelector('.hs-form') || container.querySelector('form')) {
                              return;
                            }
                            
                            // Check if hbspt is available
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
                                container.innerHTML = '<div style="padding: 20px; text-align: center; color: #d32f2f; border: 2px dashed #ccc; border-radius: 5px;">Error loading form. Please check the form ID.</div>';
                              }
                            } else {
                              // Wait for HubSpot forms script to load
                              retryCount++;
                              if (retryCount < maxRetries) {
                                setTimeout(initializeForm, 100);
                              } else {
                                // Script didn't load, show error
                                container.innerHTML = '<div style="padding: 20px; text-align: center; color: #d32f2f; border: 2px dashed #ccc; border-radius: 5px;">HubSpot forms script failed to load. Please refresh the page.</div>';
                              }
                            }
                          }
                          
                          // Start initialization after a short delay to ensure DOM is ready
                          function startInit() {
                            setTimeout(initializeForm, 200);
                          }
                          
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
                  <div style={{ padding: '20px', textAlign: 'center', color: '#666', border: '2px dashed #ccc', borderRadius: '5px' }}>
                    Please select a form in the content editor
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
      label="Contact Content"
      default="<h2>Contact Us Today</h2><p>GAI Insights is the premier source of GenAI news, research, and learning communities for companies and AI vendors.</p>"
      helpText="Add your contact heading and description here. Use H2 for the heading and P for the paragraph text."
    />
    <FormField
      name="selectedForm"
      label="Select HubSpot Form"
      helpText="Choose a form from your HubSpot account. The form will be displayed in this section."
    />
    <TextField
      name="sectionId"
      label="Section ID"
      default="contact-us"
      helpText="ID for anchor links (e.g., #contact-us). Leave empty for no ID."
    />
    <TextField
      name="sectionClass"
      label="Section CSS Class"
      default="help-area"
      helpText="Custom CSS class for this section. Default: help-area"
    />
  </ModuleFields>
);

export const meta = {
  label: 'Contact Us Today',
};

