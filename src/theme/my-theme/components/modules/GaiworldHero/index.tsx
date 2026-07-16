import {
  ModuleFields,
  TextField,
  RichTextField,
  ImageField,
  UrlField,
  BooleanField,
  ColorField,
  NumberField,
} from '@hubspot/cms-components/fields';
import './styles.css';

interface Speaker {
  photo?: { src: string; alt: string };
  speaker_name: string;
  title: string;
  company_logo_white?: { src: string; alt: string };
}

interface FieldValues {
  eyebrow: string;
  title_main: string;
  title_year: string;
  date_line: string;
  tagline: string;
  description: string;
  background_image: { src: string; alt: string };
  overlay_color: string;
  overlay_opacity: number;
  show_bg_video: boolean;
  bg_video_url: string;
  bg_poster: { src: string; alt: string };
  view_all_text: string;
  view_all_url: { href: string };
  primary_cta_text: string;
  primary_cta_url: { href: string };
  moduleInstanceId?: string;
}

export function Component({ fieldValues }: { fieldValues: FieldValues; hublParameters?: any; hublData?: any }) {
  const moduleId = `gaiworld-hero-${fieldValues.moduleInstanceId || Math.random().toString(36).slice(2)}`;

  return (
    <section
      className="gw gw-hero"
      style={{
        backgroundImage: fieldValues.background_image?.src ? `url(${fieldValues.background_image.src})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
      }}
    >
      {fieldValues.show_bg_video && fieldValues.bg_video_url && (
        <video
          className="gw-hero__video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={fieldValues.bg_poster?.src}
          aria-hidden="true"
          tabIndex={-1}
        >
          <source src={fieldValues.bg_video_url} type="video/mp4" />
        </video>
      )}
      {fieldValues.overlay_color && (
        <div
          className="gw-section__overlay"
          style={{
            backgroundColor: fieldValues.overlay_color,
            opacity: fieldValues.overlay_opacity ?? 1,
          }}
        />
      )}
      {fieldValues.show_bg_video && <div className="gw-hero__scrim"></div>}
      <div className="gw-hero__glow"></div>

      <div className="gw-stack">
        <div className="gw-wrap">
          <div className="gw-eyebrow gw-hero__eyebrow">{fieldValues.eyebrow}</div>
          <h1 className="gw-hero__title">
            {fieldValues.title_main} <span>{fieldValues.title_year}</span>
          </h1>
          <div className="gw-hero__date">{fieldValues.date_line}</div>
          <div className="gw-hero__tagline">{fieldValues.tagline}</div>
          {fieldValues.description && (
            <p className="gw-hero__description">{fieldValues.description}</p>
          )}

          {/* Speakers carousel - populated by JavaScript */}
          <div id={`speakers-container-${moduleId}`}></div>

          <div className="gw-hero__ctablock">
            <a
              href={fieldValues.primary_cta_url?.href || '#'}
              className="gw-btn gw-btn--ticket"
            >
              {fieldValues.primary_cta_text}
            </a>
          </div>
        </div>
      </div>

      {/* Fetch speakers from HubDB and render carousel */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
          (function() {
            const portalId = '39650877';
            const tableId = '323606672';
            const moduleId = '${moduleId}';
            const container = document.querySelector('#speakers-container-' + moduleId);

            if (!container) return;

            async function fetchAndRenderSpeakers() {
              try {
                const apiUrl = 'https://api.hubapi.com/cms/v3/hubdb/tables/' + tableId + '/rows?portalId=' + portalId;

                const response = await fetch(apiUrl);

                if (!response.ok) {
                  throw new Error('Failed to fetch: ' + response.status);
                }

                const data = await response.json();

                const speakers = (data.results || [])
                  .filter(function(row) {
                    return row.values?.featured === 1;
                  })
                  .map(function(row) {
                    return {
                      speaker_name: row.values?.name || 'Featured Speaker',
                      title: row.values?.title || 'Title',
                      photo: row.values?.image ? {
                        src: row.values.image.url || '',
                        alt: row.values.image.altText || row.values?.name || 'Speaker'
                      } : null,
                      company_logo_white: row.values?.company_logo_white ? {
                        src: row.values.company_logo_white.url || row.values.company_logo_white,
                        alt: row.values?.company || 'Company'
                      } : null
                    };
                  });

                if (speakers.length === 0) {
                  container.innerHTML = '<div style="color: #fff; padding: 20px;">No speakers found</div>';
                  return;
                }

                // Build carousel HTML
                let html = '<div class="gw-carousel" data-carousel-id="speakers">';
                html += '<button class="gw-carousel__arrow" data-carousel-btn="prev" style="cursor: pointer;">‹</button>';
                html += '<div class="gw-carousel__track">';

                speakers.forEach(function(speaker, idx) {
                  html += '<div class="gw-speaker">';
                  if (speaker.photo?.src) {
                    html += '<img class="gw-speaker__ph" src="' + speaker.photo.src + '" alt="' + (speaker.photo.alt || speaker.speaker_name) + '" loading="lazy" />';
                  } else {
                    html += '<div class="gw-speaker__ph">★</div>';
                  }
                  html += '<div class="gw-speaker__name">' + speaker.speaker_name + '</div>';
                  html += '<div class="gw-speaker__title">' + speaker.title + '</div>';
                  if (speaker.company_logo_white?.src) {
                    html += '<img class="gw-speaker__logo" src="' + speaker.company_logo_white.src + '" alt="' + (speaker.company_logo_white.alt || 'Company logo') + '" />';
                  }
                  html += '</div>';
                });

                html += '<a href="${fieldValues.view_all_url.href}" class="gw-speaker gw-speaker--all">';
                html += '<span style="font-size: 28px; margin-bottom: 6px;">👥</span>';
                html += '<span>${fieldValues.view_all_text}</span>';
                html += '</a>';

                html += '</div>';
                html += '<button class="gw-carousel__arrow" data-carousel-btn="next" style="cursor: pointer;">›</button>';
                html += '</div>';

                container.innerHTML = html;

                // Initialize carousel
                initCarousel();
              } catch (error) {
                container.innerHTML = '<div style="color: #fff; padding: 20px;">Error loading speakers</div>';
              }
            }

            function initCarousel() {
              const carousel = document.querySelector('[data-carousel-id="speakers"]');
              if (!carousel) return;
              const track = carousel.querySelector('.gw-carousel__track');
              const prevBtn = carousel.querySelector('[data-carousel-btn="prev"]');
              const nextBtn = carousel.querySelector('[data-carousel-btn="next"]');
              if (!track || !prevBtn || !nextBtn) return;
              const scroll = function(direction) {
                track.scrollLeft += direction === 'left' ? -172 : 172;
              };
              prevBtn.addEventListener('click', function() { scroll('left'); });
              nextBtn.addEventListener('click', function() { scroll('right'); });
            }

            // Start fetching
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', function() {
                setTimeout(fetchAndRenderSpeakers, 100);
              });
            } else {
              setTimeout(fetchAndRenderSpeakers, 100);
            }
          })();
        `,
        }}
      />
    </section>
  );
}

export const meta = {
  label: 'GAI World Hero',
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
      default="4th Annual · By GAI Insights"
    />
    <TextField
      name="title_main"
      label="Title (white part)"
      default="GAI World"
    />
    <TextField
      name="title_year"
      label="Title (amber part)"
      default="2026"
    />
    <TextField
      name="date_line"
      label="Date / location line"
      default="September 28-30 | Hynes Convention Center | Boston, MA"
    />
    <TextField
      name="tagline"
      label="Tagline"
      default="From AI Experimentation to Enterprise Advantage"
    />
    <RichTextField
      name="description"
      label="Description"
      default="Presented by GAI Insights, the 4th annual GAI World brings together executives, operators, and practitioners to explore how AI is driving measurable results. Through real-world case studies, peer discussions, and hands-on training, this enterprise AI conference focuses on what delivers impact today. Join peers to exchange insights, challenge assumptions, and leave with clarity you can act on."
    />
    <BooleanField
      name="show_bg_video"
      label="Show background video"
      default={false}
    />
    <TextField
      name="bg_video_url"
      label="Background video URL (mp4)"
      default="https://gaiinsights.com/hubfs/gaiworld-into-video.mp4"
      helpText="Hosted .mp4. Autoplays muted + looped as the header background. Leave blank to use only the gradient."
    />
    <ImageField
      name="bg_poster"
      label="Video poster / fallback image"
      helpText="Used as placeholder while video loads"
      default={{
        src: 'https://www.gaiworld.com/hubfs/gallery-img-new02.jpeg',
        alt: 'GAI World conference',
      }}
    />
    <TextField
      name="view_all_text"
      label="View-all card text"
      default="View all speakers"
    />
    <UrlField
      name="view_all_url"
      label="View-all link"
      default={{ href: '/speakers' }}
    />
    <TextField
      name="primary_cta_text"
      label="Primary CTA text"
      default="Secure your spot"
    />
    <UrlField
      name="primary_cta_url"
      label="Primary CTA link (ticket page)"
      default={{ href: '/tickets' }}
    />
  </ModuleFields>
);
