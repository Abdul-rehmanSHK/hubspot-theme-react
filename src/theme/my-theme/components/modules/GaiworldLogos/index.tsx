import React from 'react';
import {
  ModuleFields,
  TextField,
  ImageField,
  RepeatedFieldGroup,
} from '@hubspot/cms-components/fields';
import './styles.css';

interface Logo {
  logo?: { src: string; alt: string };
}

interface FieldValues {
  eyebrow: string;
  sub: string;
  logos: Logo[];
  note: string;
}

export function Component({ fieldValues }: { fieldValues: FieldValues; hublParameters?: any; hublData?: any }) {
  return (
    <section className="gw gw-section gw-section--dark gw-logos">
      <div className="gw-wrap">
        <div className="gw-sec-head">
          <div className="gw-eyebrow">{fieldValues.eyebrow}</div>
          <h2>{fieldValues.sub}</h2>
        </div>
        {fieldValues.logos && fieldValues.logos.length > 0 && (
          <div className="gw-logos__marquee">
            <div className="gw-logos__track">
              {fieldValues.logos.map((l, idx) => (
                <div key={idx} className="gw-logo-pill">
                  <img src={l.logo?.src} alt={l.logo?.alt} loading="lazy" />
                </div>
              ))}
              {fieldValues.logos.map((l, idx) => (
                <div key={`duplicate-${idx}`} className="gw-logo-pill" aria-hidden="true">
                  <img src={l.logo?.src} alt="" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        )}
        {fieldValues.note && <div className="gw-logos__note">{fieldValues.note}</div>}
      </div>
    </section>
  );
}

export const meta = {
  label: 'GW — Sponsor Logo Carousel',
};

export const fields = (
  <ModuleFields>
    <TextField
      name="eyebrow"
      label="Eyebrow"
      default="The Enterprise AI Conference"
    />
    <TextField
      name="sub"
      label="Subheading"
      default="Where AI Strategy Meets Execution"
    />
    <RepeatedFieldGroup
      name="logos"
      label="Sponsor logos"
      occurrence={{ min: 1, max: 40, default: 8 }}
      default={[
        { logo: { src: 'https://cdn.simpleicons.org/nvidia/475569', alt: 'NVIDIA' } },
        { logo: { src: 'https://cdn.simpleicons.org/googlecloud/475569', alt: 'Google Cloud' } },
        { logo: { src: 'https://cdn.simpleicons.org/databricks/475569', alt: 'Databricks' } },
        { logo: { src: 'https://cdn.simpleicons.org/snowflake/475569', alt: 'Snowflake' } },
        { logo: { src: 'https://cdn.simpleicons.org/anthropic/475569', alt: 'Anthropic' } },
        { logo: { src: 'https://cdn.simpleicons.org/sap/475569', alt: 'SAP' } },
        { logo: { src: 'https://cdn.simpleicons.org/intel/475569', alt: 'Intel' } },
        { logo: { src: 'https://cdn.simpleicons.org/accenture/475569', alt: 'Accenture' } },
      ]}
      children={[
        <ImageField
          name="logo"
          label="Logo (monochrome PNG/SVG works best)"
          required={true}
        />,
      ]}
    />
    <TextField
      name="note"
      label="Note under carousel"
      default="Representative logos shown — replace with the confirmed 2026 sponsor roster."
    />
  </ModuleFields>
);
