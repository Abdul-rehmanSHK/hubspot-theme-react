import React from 'react';
import {
  ModuleFields,
  TextField,
  ImageField,
  UrlField,
  RepeatedFieldGroup,
} from '@hubspot/cms-components/fields';
import './styles.css';

interface Card {
  image?: { src: string; alt: string };
  title?: string;
  description?: string;
  cta_text?: string;
  cta_url?: { href: string };
}

interface FieldValues {
  eyebrow: string;
  heading: string;
  cards: Card[];
}

export function Component({ fieldValues }: { fieldValues: FieldValues; hublParameters?: any; hublData?: any }) {
  return (
    <section className="gw gw-section gw-section--mist gw-community-sec">
      <div className="gw-wrap">
        <div className="gw-sec-head">
          <div className="gw-eyebrow">{fieldValues.eyebrow}</div>
          <h2>{fieldValues.heading}</h2>
        </div>
        <div className="gw-community">
          {fieldValues.cards &&
            fieldValues.cards.map((c, idx) => (
              <div key={idx} className="gw-commcard">
                <div className="gw-commcard__img">
                  <img src={c.image?.src} alt={c.image?.alt || c.title} loading="lazy" />
                </div>
                <div className="gw-commcard__body">
                  <h3>{c.title}</h3>
                  <p>{c.description}</p>
                  {c.cta_text && (
                    <a href={c.cta_url?.href || '#'} className="gw-btn gw-btn--purple-outline">
                      {c.cta_text}
                    </a>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}

export const meta = {
  label: 'GW — Community Gatherings',
};

export const fields = (
  <ModuleFields>
    <TextField
      name="eyebrow"
      label="Eyebrow"
      default="Community"
    />
    <TextField
      name="heading"
      label="Heading"
      default="Inclusive Networking and Community-Led Gatherings"
    />
    <RepeatedFieldGroup
      name="cards"
      label="Gatherings"
      occurrence={{ min: 1, max: 4, default: 2 }}
      default={[
        {
          image: {
            src: 'https://www.gaiworld.com/hubfs/WOMEN-IN-AI-BREAKFAST-1.jpg',
            alt: 'Women in AI Breakfast',
          },
          title: 'Women in AI Breakfast',
          description: 'Women leading across AI come together for a focused exchange of perspective, experience, and insight. The conversation is grounded in real-world execution, with an emphasis on how impact is being delivered inside organizations.',
          cta_text: 'Learn more',
          cta_url: { href: '#' },
        },
        {
          image: {
            src: 'https://www.gaiworld.com/hubfs/BLACK-PIONEERS.jpg',
            alt: 'Black Pioneers Luncheon',
          },
          title: 'Black Pioneers Luncheon',
          description: 'Black leaders advancing AI across industries take part in a program centered on influence, visibility, and forward-looking dialogue. The focus is on the ideas, access, and leadership shaping the next phase of the industry.',
          cta_text: 'Learn more',
          cta_url: { href: '#' },
        },
      ]}
      children={[
        <ImageField
          name="image"
          label="Image"
          required={true}
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
        <TextField
          name="cta_text"
          label="CTA text"
          default="Learn more"
        />,
        <UrlField
          name="cta_url"
          label="CTA link"
          default={{ href: '#' }}
        />,
      ]}
    />
  </ModuleFields>
);
