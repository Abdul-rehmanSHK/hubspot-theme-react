import React from 'react';
import {
  ModuleFields,
  TextField,
  ImageField,
  UrlField,
  RepeatedFieldGroup,
} from '@hubspot/cms-components/fields';
import './styles.css';

interface Testimonial {
  video_url?: string;
  poster?: { src: string; alt: string };
  title?: string;
  role?: string;
}

interface FieldValues {
  eyebrow: string;
  heading: string;
  items: Testimonial[];
  cta_text: string;
  cta_url: { href: string };
}

export function Component({ fieldValues }: { fieldValues: FieldValues; hublParameters?: any; hublData?: any }) {
  const gridColumns = fieldValues.items?.length ? fieldValues.items.length : 3;

  return (
    <section className="gw gw-section gw-section--dark gw-testimonials-sec">
      <div className="gw-wrap">
        <div className="gw-sec-head">
          <div className="gw-eyebrow">{fieldValues.eyebrow}</div>
          <h2>{fieldValues.heading}</h2>
        </div>
        <div className="gw-testimonials">
          {fieldValues.items &&
            fieldValues.items.map((t, idx) => (
              <div key={idx} className="gw-testimonial">
                {t.video_url ? (
                  <video
                    className="gw-testimonial__thumb"
                    controls
                    preload="none"
                    playsInline
                    poster={t.poster?.src}
                    aria-label={`${t.title} video testimonial`}
                  >
                    <source src={t.video_url} type="video/mp4" />
                  </video>
                ) : (
                  <div className="gw-testimonial__thumb">
                    <img src={t.poster?.src} alt={t.title} />
                  </div>
                )}
                <div className="gw-testimonial__body">
                  <h4>{t.title}</h4>
                  <span>{t.role}</span>
                </div>
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
  label: 'GW — Video Testimonials',
};

export const fields = (
  <ModuleFields>
    <TextField
      name="eyebrow"
      label="Eyebrow"
      default="GAI World AI Conference Insights"
    />
    <TextField
      name="heading"
      label="Heading"
      default="What executives say about GAI World"
    />
    <RepeatedFieldGroup
      name="items"
      label="Testimonials"
      occurrence={{ min: 1, max: 9, default: 3 }}
      default={[
        {
          video_url: 'https://www.gaiworld.com/hubfs/GAI%20World%202026/Sarah%20Frame%202026.mp4',
          poster: { src: 'https://www.gaiworld.com/hubfs/gallery-img-new02.jpeg', alt: 'Sara Fraim' },
          title: 'Sara Fraim',
          role: 'CEO · Massachusetts Technology Leadership Council',
        },
        {
          video_url: 'https://www.gaiworld.com/hubfs/GAI%20World%202026/Jonathan%20Isaacson%202026.mp4',
          poster: { src: 'https://www.gaiworld.com/hubfs/gallery-img-new03.jpeg', alt: 'Jonathan Isaacson' },
          title: 'Jonathan Isaacson',
          role: 'CEO · Gemline',
        },
        {
          video_url: 'https://www.gaiworld.com/hubfs/GAI%20World%202026/Pam%20Boris%202026.mp4',
          poster: { src: 'https://www.gaiworld.com/hubfs/gallery-img-new04.jpeg', alt: 'Pam Boiros' },
          title: 'Pam Boiros',
          role: 'CMO · Reclaim Health',
        },
      ]}
      children={[
        <TextField
          name="video_url"
          label="Testimonial video URL (mp4)"
          default=""
        />,
        <ImageField
          name="poster"
          label="Poster image"
          required={true}
        />,
        <TextField
          name="title"
          label="Title"
          required={true}
          default=""
        />,
        <TextField
          name="role"
          label="Role / company"
          required={true}
          default=""
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
