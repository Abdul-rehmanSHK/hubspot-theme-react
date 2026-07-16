import React from 'react';
import {
  ModuleFields,
  TextField,
  RepeatedFieldGroup,
} from '@hubspot/cms-components/fields';
import './styles.css';

interface Track {
  icon?: string;
  title?: string;
  description?: string;
}

interface FieldValues {
  eyebrow: string;
  heading: string;
  tracks: Track[];
}

export function Component({ fieldValues }: { fieldValues: FieldValues; hublParameters?: any; hublData?: any }) {
  const gridColumns = fieldValues.tracks?.length ? fieldValues.tracks.length : 4;

  return (
    <section className="gw gw-section gw-section--dark" id="tracks">
      <div className="gw-wrap">
        <div className="gw-sec-head">
          <div className="gw-eyebrow">{fieldValues.eyebrow}</div>
          <h2>{fieldValues.heading}</h2>
        </div>
        <div className="gw-tracks" style={{ gridTemplateColumns: `repeat(${gridColumns}, 1fr)` }}>
          {fieldValues.tracks &&
            fieldValues.tracks.map((t, idx) => (
              <div key={idx} className="gw-track">
                <div className="gw-track__icon">
                  <i className={t.icon}></i>
                </div>
                <h4>{t.title}</h4>
                <p>{t.description}</p>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}

export const meta = {
  label: 'GW — Tracks (industry)',
};

export const fields = (
  <ModuleFields>
    <TextField
      name="eyebrow"
      label="Eyebrow"
      default="Explore our tracks"
    />
    <TextField
      name="heading"
      label="Heading"
      default="Built for your industry"
    />
    <RepeatedFieldGroup
      name="tracks"
      label="Tracks"
      occurrence={{ min: 1, max: 8, default: 4 }}
      default={[
        {
          icon: 'fa-solid fa-building-columns',
          title: 'Asset Management',
          description: 'Hear from financial institutions and investors on how AI is being deployed, evaluated, and scaled across equity analysis, asset management, and portfolios.',
        },
        {
          icon: 'fa-solid fa-heart-pulse',
          title: 'Healthcare & Life Sciences',
          description: 'Join healthcare and pharma leaders applying AI across clinical systems, drug development, and patient operations.',
        },
        {
          icon: 'fa-solid fa-bullhorn',
          title: 'Sales, Marketing & Customer Operations',
          description: 'Hear how organizations are applying AI across sales, marketing, and customer service to drive revenue and improve conversion.',
        },
        {
          icon: 'fa-solid fa-user-graduate',
          title: 'Workforce Upskilling & AI Adoption',
          description: 'See how organizations are reskilling teams, redesigning roles, and driving AI adoption across the workforce.',
        },
      ]}
      children={[
        <TextField
          name="icon"
          label="Font Awesome icon class"
          default="fa-solid fa-star"
          helpText="e.g. fa-solid fa-chart-line"
        />,
        <TextField
          name="title"
          label="Title"
          required={true}
          default=""
        />,
        <TextField
          name="description"
          label="Description"
          required={true}
          default=""
        />,
      ]}
    />
  </ModuleFields>
);
