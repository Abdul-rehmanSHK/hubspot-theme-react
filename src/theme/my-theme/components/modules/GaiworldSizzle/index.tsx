import {
  ModuleFields,
  TextField,
  ImageField,
  UrlField,
  RepeatedFieldGroup,
  ColorField,
  NumberField,
} from '@hubspot/cms-components/fields';
import './styles.css';

interface FieldValues {
  eyebrow: string;
  heading_l1: string;
  background_image: { src: string; alt: string };
  overlay_color: string;
  overlay_opacity: number;
  media_type: string;
  video_url: string;
  video_poster: { src: string; alt: string };
  sizzle_image: { src: string; alt: string };
  iframe_url: string;
  cta_text: string;
  cta_url: { href: string };
}

export function Component({ fieldValues }: { fieldValues: FieldValues; hublParameters?: any; hublData?: any }) {
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
      {fieldValues.overlay_color && (fieldValues.overlay_opacity ?? 1) > 0 && (
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
            <h2 dangerouslySetInnerHTML={{ __html: fieldValues.heading_l1 }} />
          </div>

          <div className="gw-sizzle__video-container">
            {fieldValues.media_type === 'image' ? (
              <img
                className="gw-sizzle__image"
                src={fieldValues.sizzle_image?.src}
                alt={fieldValues.sizzle_image?.alt || 'GAI World 2026'}
              />
            ) : fieldValues.media_type === 'iframe' ? (
              <iframe
                className="gw-sizzle__iframe"
                src={fieldValues.iframe_url}
                title="GAI World 2026 video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
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
          </div>

          {fieldValues.cta_text && (
            <div className="gw-sizzle__cta">
              <a href={fieldValues.cta_url?.href || '#'} className="gw-btn gw-btn--ticket">
                {fieldValues.cta_text}
              </a>
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
      name="eyebrow"
      label="Eyebrow"
      default="Sizzle Reel"
    />
    <TextField
      name="heading_l1"
      label="Heading"
      default="See GAI World in Action"
    />
    <TextField
      name="media_type"
      label="Media type"
      default="iframe"
      helpText="Enter 'video', 'image', or 'iframe'"
    />
    <ImageField
      name="sizzle_image"
      label="Sizzle image"
      default={{
        src: 'https://www.gaiworld.com/hubfs/gallery-img-new06.jpeg',
        alt: 'GAI World 2026',
      }}
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
      name="iframe_url"
      label="Iframe URL (YouTube, Vimeo, etc.)"
      default="https://www.youtube.com/embed/kIpO-wUqV9Q"
      helpText="Use embed URL for YouTube (youtube.com/embed/...) or Vimeo"
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
