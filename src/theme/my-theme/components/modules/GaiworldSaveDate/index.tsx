import React from 'react';
import {
  ModuleFields,
  TextField,
} from '@hubspot/cms-components/fields';
import './styles.css';

interface FieldValues {
  eyebrow: string;
  heading: string;
  subhead: string;
  button_text: string;
}

export function Component({
  fieldValues,
}: {
  fieldValues: FieldValues;
  hublParameters?: any;
  hublData?: any;
}) {
  const scriptContent = `
    (function() {
      const loadHubSpotForm = function() {
        if (!window.hbspt) return setTimeout(loadHubSpotForm, 100);
        window.hbspt.forms.create({
          portalId: '39650877',
          formId: 'b2d07091-c16c-437a-be46-7b8ac07f1b48',
          region: 'na1',
          target: '#hubspot-form-container'
        });
      };
      const script = document.createElement('script');
      script.src = 'https://js.hsforms.net/forms/embed/v2.js';
      script.async = true;
      script.onload = loadHubSpotForm;
      document.body.appendChild(script);
    })();
  `;

  return (
    <section className="gw gw-section gw-section--dark gw-save" id="venue">
      <div className="gw-wrap">
        <div className="gw-eyebrow">{fieldValues.eyebrow}</div>
        <h2 className="gw-save__title">{fieldValues.heading}</h2>
        <p className="gw-save__sub">{fieldValues.subhead}</p>
        <div id="hubspot-form-container" className="gw-save__form" />
      </div>
      <script dangerouslySetInnerHTML={{ __html: scriptContent }} />
    </section>
  );
}

export const meta = {
  label: 'GW — Save the Date',
};

export const fields = (
  <ModuleFields>
    <TextField
      name="eyebrow"
      label="Eyebrow"
      default="Save the date"
    />

    <TextField
      name="heading"
      label="Heading (date)"
      default="September 28–30, 2026"
    />

    <TextField
      name="subhead"
      label="Subhead (venue)"
      default="Hynes Convention Center | Boston, MA"
    />

    <TextField
      name="button_text"
      label="Fallback button text"
      default="Save the date"
    />
  </ModuleFields>
);