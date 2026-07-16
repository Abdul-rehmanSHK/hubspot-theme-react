import React from 'react';
import {
  ModuleFields,
  TextField,
  BooleanField,
  UrlField,
  RepeatedFieldGroup,
} from '@hubspot/cms-components/fields';
import './styles.css';

interface Feature {
  text?: string;
}

interface Ticket {
  featured?: boolean;
  top_label?: string;
  pass_name?: string;
  dates?: string;
  features?: Feature[];
}

interface FieldValues {
  eyebrow: string;
  heading: string;
  intro: string;
  tickets: Ticket[];
  cta_text: string;
  cta_url: { href: string };
}

export function Component({ fieldValues }: { fieldValues: FieldValues; hublParameters?: any; hublData?: any }) {
  return (
    <section className="gw gw-section gw-section--mist gw-tickets-sec" id="tickets">
      <div className="gw-wrap">
        <div className="gw-sec-head">
          <div className="gw-eyebrow">{fieldValues.eyebrow}</div>
          <h2>{fieldValues.heading}</h2>
          <p>{fieldValues.intro}</p>
        </div>
        <div className="gw-tickets">
          {fieldValues.tickets &&
            fieldValues.tickets.map((tk, idx) => (
              <div key={idx} className={`gw-ticket${tk.featured ? ' gw-ticket--featured' : ''}`}>
                <span className="gw-ticket__label">{tk.top_label}</span>
                <h3>{tk.pass_name}</h3>
                <span className="gw-ticket__dates">{tk.dates}</span>
                <ul>
                  {tk.features &&
                    tk.features.map((f, fidx) => (
                      <li key={fidx}>
                        <i className="fa-solid fa-check"></i>
                        {f.text}
                      </li>
                    ))}
                </ul>
              </div>
            ))}
        </div>
        {fieldValues.cta_text && (
          <div style={{ textAlign: 'center' }}>
            <a href={fieldValues.cta_url?.href || '#'} className="gw-btn gw-btn--ticket">
              {fieldValues.cta_text}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

export const meta = {
  label: "GW — Tickets / What's Included",
};

export const fields = (
  <ModuleFields>
    <TextField
      name="eyebrow"
      label="Eyebrow"
      default="Before you purchase"
    />
    <TextField
      name="heading"
      label="Heading"
      default="Know Exactly What's Included"
    />
    <TextField
      name="intro"
      label="Intro"
      default="Passes are available for individuals and groups of up to 8 team members."
    />
    <RepeatedFieldGroup
      name="tickets"
      label="Passes"
      occurrence={{ min: 1, max: 4, default: 2 }}
      default={[
        {
          featured: false,
          top_label: 'Included in all passes',
          pass_name: 'Days 1 & 2',
          dates: 'September 28–29, 2026',
          features: [
            { text: 'Real-world case studies from finance, healthcare, and technology leaders' },
            { text: 'Agentic AI deep dives and live demonstrations' },
            { text: 'Breakout sessions and roundtable discussions' },
            { text: 'Peer-led conversations and curated networking' },
            { text: 'Exhibit hall access and partner engagement' },
            { text: 'Welcome reception' },
            { text: 'Breakfast, lunch, and continuous refreshments' },
            { text: 'Women in AI Breakfast and Black Pioneers Luncheon' },
          ],
        },
        {
          featured: true,
          top_label: 'VIP Full Experience',
          pass_name: 'Days 1–3: Executive Capstone',
          dates: 'September 28–30, 2026 — Exclusive, closed-door',
          features: [
            { text: 'All standard pass benefits' },
            { text: '12-month implementation roadmap' },
            { text: 'Private 1:1 analyst briefings (optional)' },
            { text: 'Peer-only, closed-door environment' },
            { text: 'Dedicated VIP space' },
            { text: 'VIP breakfast and executive farewell lunch' },
            { text: 'Continuous refreshments throughout the day' },
          ],
        },
      ]}
      children={[
        <BooleanField
          name="featured"
          label="Highlight (amber border)"
          default={false}
        />,
        <TextField
          name="top_label"
          label="Top label"
          default=""
        />,
        <TextField
          name="pass_name"
          label="Pass name"
          default=""
          required={true}
        />,
        <TextField
          name="dates"
          label="Dates line"
          default=""
        />,
        <RepeatedFieldGroup
          name="features"
          label="Features"
          occurrence={{ min: 1, max: 20, default: 3 }}
          default={[]}
          children={[
            <TextField
              name="text"
              label="Feature"
              default=""
              required={true}
            />,
          ]}
        />,
      ]}
    />
    <TextField
      name="cta_text"
      label="CTA text"
      default="Secure your spot"
    />
    <UrlField
      name="cta_url"
      label="CTA link (ticket page)"
      default={{ href: '/tickets' }}
    />
  </ModuleFields>
);
