import React from 'react';
import {
  ModuleFields,
  TextField,
  RichTextField,
  ImageField,
  UrlField,
  RepeatedFieldGroup,
  ColorField,
  NumberField,
} from '@hubspot/cms-components/fields';
import './styles.css';

interface Stat {
  num?: string;
  description?: string;
}

interface FieldValues {
  eyebrow: string;
  eyebrow_color: string;
  heading_l1: string;
  heading_l2: string;
  heading_color: string;
  description: string;
  description_color: string;
  background_image: { src: string; alt: string };
  overlay_color: string;
  overlay_opacity: number;
  left_content_type: string;
  video_url: string;
  video_poster: { src: string; alt: string };
  left_image: { src: string; alt: string };
  cta_text: string;
  cta_url: { href: string };
  stats: Stat[];
}

export function Component({ fieldValues }: { fieldValues: FieldValues; hublParameters?: any; hublData?: any }) {
  const gridColumns = fieldValues.stats?.length ? fieldValues.stats.length : 5;

  return (
    <section
      className="gw gw-section gw-section--mist gw-sizzle"
      style={{
        backgroundImage: fieldValues.background_image?.src ? `url(${fieldValues.background_image.src})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
      }}
    >
      {fieldValues.overlay_color && (
        <div
          className="gw-section__overlay"
          style={{
            backgroundColor: fieldValues.overlay_color,
            opacity: fieldValues.overlay_opacity ?? 1,
          }}
        />
      )}
      <div className="gw-stack">
        <div className="gw-wrap">
          <div className="gw-sizzle__grid">
            {fieldValues.left_content_type === 'image' ? (
              <img
                className="gw-sizzle__image"
                src={fieldValues.left_image?.src}
                alt={fieldValues.left_image?.alt || 'GAI World 2026'}
              />
            ) : (
              <video
                className="gw-video"
                controls
                preload="none"
                playsInline
                poster={fieldValues.video_poster?.src}
                aria-label="GAI World 2026 sizzle reel"
              >
                <source src={fieldValues.video_url} type="video/mp4" />
              </video>
            )}
            <div className="gw-sizzle__right">
              <div
                className="gw-eyebrow gw-sizzle__label"
                style={{ color: fieldValues.eyebrow_color }}
              >
                {fieldValues.eyebrow}
              </div>
              <h2 style={{ color: fieldValues.heading_color }}>
                {fieldValues.heading_l1}
                {fieldValues.heading_l2 && (
                  <>
                    <br />
                    {fieldValues.heading_l2}
                  </>
                )}
              </h2>
              <p
                style={{ color: fieldValues.description_color }}
                dangerouslySetInnerHTML={{ __html: fieldValues.description }}
              />
              <a href={fieldValues.cta_url?.href || '#'} className="gw-btn gw-btn--ticket">
                {fieldValues.cta_text}
              </a>
            </div>
          </div>
          {fieldValues.stats && fieldValues.stats.length > 0 && (
            <div className="gw-stats" style={{ gridTemplateColumns: `repeat(${gridColumns}, 1fr)` }}>
              {fieldValues.stats.map((st, idx) => (
                <div key={idx} className="gw-stat">
                  <span className="gw-stat__num">{st.num}</span>
                  <span className="gw-stat__label">{st.description}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export const meta = {
  label: 'GW — Sizzle Video + Stats',
};

export const fields = (
  <ModuleFields>
    <ImageField
      name="background_image"
      label="Background image"
      default={{
        src: 'https://www.gaiworld.com/hubfs/gallery-img-new04.jpeg',
        alt: 'GAI World 2026 background',
      }}
    />
    <ColorField
      name="overlay_color"
      label="Overlay color"
      default="#050D51"
    />
    <NumberField
      name="overlay_opacity"
      label="Overlay opacity"
      default={0.7}
      min={0}
      max={1}
      step={0.1}
      helpText="Range: 0 (transparent) to 1 (opaque)"
    />
    <TextField
      name="left_content_type"
      label="Left content type (video or image)"
      default="image"
      helpText="Enter 'video' or 'image'"
    />
    <ImageField
      name="left_image"
      label="Left side image"
      default={{
        src: 'https://www.gaiworld.com/hubfs/gallery-img-new06.jpeg',
        alt: 'GAI World 2026',
      }}
    />
    <TextField
      name="eyebrow"
      label="Eyebrow"
      default="Join GAI World 2026"
    />
    <ColorField
      name="eyebrow_color"
      label="Eyebrow color"
      default="#06c7ee"
    />
    <TextField
      name="heading_l1"
      label="Heading line 1"
      default="This isn't a trade show."
    />
    <TextField
      name="heading_l2"
      label="Heading line 2"
      default="It's where decisions get made."
    />
    <ColorField
      name="heading_color"
      label="Heading color"
      default="#ffffff"
    />
    <RichTextField
      name="description"
      label="Description"
      default="Presented by GAI Insights, the 4th annual GAI World brings together executives, operators, and practitioners to explore how AI is driving measurable results. Through real-world case studies and peer discussions, this enterprise AI conference focuses on what delivers impact today. Join peers to exchange insights, challenge assumptions, and leave with clarity you can act on."
    />
    <ColorField
      name="description_color"
      label="Description color"
      default="#bdbdbd"
    />
    <TextField
      name="video_url"
      label="Sizzle video URL (mp4)"
      default="https://gaiinsights.com/hubfs/gaiworld-into-video.mp4"
    />
    <ImageField
      name="video_poster"
      label="Video poster image"
      default={{
        src: 'https://www.gaiworld.com/hubfs/gallery-img-new03.jpeg',
        alt: 'GAI World 2026 panel',
      }}
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
    <RepeatedFieldGroup
      name="stats"
      label="Stats"
      occurrence={{ min: 0, max: 6, default: 5 }}
      default={[
        { num: '3', description: 'Days' },
        { num: '60+', description: 'Speakers' },
        { num: '1,000', description: 'In-person attendees' },
        { num: '12+', description: 'Hours of Claude training' },
        { num: '35+', description: 'Sessions' },
      ]}
      children={[
        <TextField
          name="num"
          label="Number"
          required={true}
          default=""
        />,
        <TextField
          name="description"
          label="Small description"
          required={true}
          default=""
        />,
      ]}
    />
  </ModuleFields>
);
