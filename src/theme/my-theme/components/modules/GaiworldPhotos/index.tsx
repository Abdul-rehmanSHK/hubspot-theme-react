import React from 'react';
import {
  ModuleFields,
  TextField,
  ImageField,
  RepeatedFieldGroup,
  ColorField,
  NumberField,
} from '@hubspot/cms-components/fields';
import './styles.css';

interface Photo {
  image?: { src: string; alt: string };
}

interface FieldValues {
  eyebrow: string;
  heading: string;
  subhead: string;
  background_image: { src: string; alt: string };
  overlay_color: string;
  overlay_opacity: number;
  photos: Photo[];
}

export function Component({ fieldValues }: { fieldValues: FieldValues; hublParameters?: any; hublData?: any }) {
  return (
    <section
      className="gw gw-section gw-photos"
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
        <div className="gw-sec-head">
          <div className="gw-eyebrow">{fieldValues.eyebrow}</div>
          <h2>{fieldValues.heading}</h2>
          {fieldValues.subhead && <p>{fieldValues.subhead}</p>}
        </div>
        <div className="gw-photo-grid">
          {fieldValues.photos &&
            fieldValues.photos.map((p, idx) => (
              <div key={idx} className="gw-photo">
                <img src={p.image?.src} alt={p.image?.alt || 'Inside GAI World'} loading="lazy" />
              </div>
            ))}
        </div>
      </div>
      </div>
    </section>
  );
}

export const meta = {
  label: 'GW — Photo Gallery (Inside GAI World)',
};

export const fields = (
  <ModuleFields>
    <ImageField
      name="background_image"
      label="Background image"
      default={{
        src: 'https://www.gaiworld.com/hubfs/gallery-img-new09.jpeg',
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
      name="eyebrow"
      label="Eyebrow"
      default="Inside GAI World"
    />
    <TextField
      name="heading"
      label="Heading"
      default="A working conference, not a trade show floor"
    />
    <TextField
      name="subhead"
      label="Subhead (optional)"
      default=""
    />
    <RepeatedFieldGroup
      name="photos"
      label="Photos"
      occurrence={{ min: 1, max: 12, default: 6 }}
      default={[
        { image: { src: 'https://www.gaiworld.com/hubfs/gallery-img-new05.jpeg', alt: 'Inside GAI World — keynote' } },
        { image: { src: 'https://www.gaiworld.com/hubfs/gallery-img-new06.jpeg', alt: 'Inside GAI World — session' } },
        { image: { src: 'https://www.gaiworld.com/hubfs/gallery-img-new07.jpeg', alt: 'Inside GAI World — networking' } },
        { image: { src: 'https://www.gaiworld.com/hubfs/gallery-img-new08.jpeg', alt: 'Inside GAI World — roundtable' } },
        { image: { src: 'https://www.gaiworld.com/hubfs/gallery-img-new09.jpeg', alt: 'Inside GAI World — stage' } },
        { image: { src: 'https://www.gaiworld.com/hubfs/gallery-img-new10.jpeg', alt: 'Inside GAI World — audience' } },
      ]}
      children={[
        <ImageField
          name="image"
          label="Photo"
          required={true}
        />,
      ]}
    />
  </ModuleFields>
);
