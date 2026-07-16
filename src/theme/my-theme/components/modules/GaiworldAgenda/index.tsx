import React from 'react';
import {
  ModuleFields,
  TextField,
  UrlField,
  RepeatedFieldGroup,
} from '@hubspot/cms-components/fields';
import './styles.css';

interface Theme {
  icon?: string;
  title?: string;
  description?: string;
}

interface FieldValues {
  eyebrow: string;
  heading: string;
  intro: string;
  themes: Theme[];
  cta1_text: string;
  cta1_url: { href: string };
  cta2_text: string;
  cta2_url: { href: string };
}

export function Component({ fieldValues }: { fieldValues: FieldValues; hublParameters?: any; hublData?: any }) {
  return (
    <section className="gw gw-section gw-section--mist gw-agenda" id="agenda">
      <div className="gw-wrap">
        <div className="gw-sec-head">
          <div className="gw-eyebrow" style={{ color: 'var(--gw-electric)' }}>
            {fieldValues.eyebrow}
          </div>
          <h2>{fieldValues.heading}</h2>
          <p>{fieldValues.intro}</p>
        </div>
        <div className="gw-themes">
          {fieldValues.themes &&
            fieldValues.themes.map((t, idx) => (
              <div key={idx} className="gw-theme">
                <div className="gw-theme__icon">
                  <i className={t.icon}></i>
                </div>
                <h3>{t.title}</h3>
                <p>{t.description}</p>
              </div>
            ))}
        </div>
        <div className="gw-ctas">
          <a href={fieldValues.cta1_url?.href || '#'} className="gw-btn gw-btn--purple">
            {fieldValues.cta1_text}
          </a>
          <a href={fieldValues.cta2_url?.href || '#'} className="gw-btn gw-btn--ticket">
            {fieldValues.cta2_text}
          </a>
        </div>
      </div>
    </section>
  );
}

export const meta = {
  label: 'GW — Agenda Preview (Key Themes)',
};

export const fields = (
  <ModuleFields>
    <TextField
      name="eyebrow"
      label="Eyebrow"
      default="Agenda preview"
    />
    <TextField
      name="heading"
      label="Heading"
      default="6 Questions You Will Get Answers To At GAI World 2026"
    />
    <TextField
      name="intro"
      label="Intro"
      default="Three days of sessions built on real deployments, peer-tested frameworks, and honest assessments from executives who have already done the hard part."
    />
    <RepeatedFieldGroup
      name="themes"
      label="Themes"
      occurrence={{ min: 1, max: 12, default: 6 }}
      default={[
        {
          icon: 'fa-solid fa-chart-line',
          title: 'Demonstrating ROI',
          description: "How do you measure AI's impact, benchmark against peers, and make the case to your board while managing the exploding cost of tokens and compute?",
        },
        {
          icon: 'fa-solid fa-calendar-days',
          title: 'Refining Your 2027 AI Strategy and Budget',
          description: 'How do you build a credible AI roadmap without proven playbooks, and adjust your budget without cannibalizing core operations?',
        },
        {
          icon: 'fa-solid fa-people-arrows',
          title: 'Change Management',
          description: 'How do you move teams from AI anxiety to ownership and productivity and overcome the internal resistance that stalls most AI programs?',
        },
        {
          icon: 'fa-solid fa-lock',
          title: 'Avoiding Vendor Lock-In',
          description: 'How do you navigate dependence on major cloud and AI providers and structure vendor relationships that keep you competitive without trapping you?',
        },
        {
          icon: 'fa-solid fa-graduation-cap',
          title: 'Hands-On Claude Training',
          description: '12 hands-on Claude 201 workshops covering due diligence, financial modeling, PowerPoint creation, quarterly book closing, and more.',
        },
        {
          icon: 'fa-solid fa-rocket',
          title: 'Staying Current With the Pace of AI Innovation',
          description: 'How do you keep up when the landscape shifts every 90 days, and what does Harvard and MIT research say about building durable competitive advantage with AI?',
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
    <TextField
      name="cta1_text"
      label="Secondary CTA text (purple)"
      default="View the agenda"
    />
    <UrlField
      name="cta1_url"
      label="Secondary CTA link (agenda page)"
      default={{ href: '/agenda' }}
    />
    <TextField
      name="cta2_text"
      label="Primary CTA text (ticket)"
      default="Secure your spot"
    />
    <UrlField
      name="cta2_url"
      label="Primary CTA link (ticket page)"
      default={{ href: '/tickets' }}
    />
  </ModuleFields>
);
