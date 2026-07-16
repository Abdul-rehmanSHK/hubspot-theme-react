import React from 'react';
import {
  ModuleFields,
  TextField,
  TextAreaField,
  ImageField,
  UrlField,
  BooleanField,
  RepeatedFieldGroup,
} from '@hubspot/cms-components/fields';
import './styles.css';

interface Speaker {
  photo?: { src: string; alt: string };
  speaker_name: string;
  title: string;
  company: string;
}

interface FieldValues {
  eyebrow: string;
  title_main: string;
  title_year: string;
  date_line: string;
  tagline: string;
  bg_video_url: string;
  bg_poster: { src: string; alt: string };
  speakers: Speaker[];
  view_all_text: string;
  view_all_url: { href: string };
  primary_cta_text: string;
  primary_cta_url: { href: string };
  pricing_badge: string;
  countdown_enable: boolean;
  countdown_target: string;
  moduleInstanceId?: string;
}

function CountdownDisplay({ targetDate }: { targetDate: number }) {
  const scriptContent = `
    (function() {
      const container = document.querySelector('[data-countdown-target]');
      if (!container) return;
      const targetDate = parseInt(container.getAttribute('data-countdown-target'), 10);
      if (!targetDate || isNaN(targetDate)) return;
      const updateDisplay = function() {
        const now = new Date().getTime();
        const diff = Math.max(0, targetDate - now);
        const days = String(Math.floor(diff / 86400000)).padStart(2, '0');
        const hours = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0');
        const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
        const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
        const daysSpan = container.querySelector('[data-countdown="days"]');
        const hoursSpan = container.querySelector('[data-countdown="hours"]');
        const minutesSpan = container.querySelector('[data-countdown="minutes"]');
        const secondsSpan = container.querySelector('[data-countdown="seconds"]');
        if (daysSpan) daysSpan.textContent = days;
        if (hoursSpan) hoursSpan.textContent = hours;
        if (minutesSpan) minutesSpan.textContent = minutes;
        if (secondsSpan) secondsSpan.textContent = seconds;
      };
      updateDisplay();
      setInterval(updateDisplay, 1000);
    })();
  `;

  return (
    <>
      <div className="gw-countdown" data-countdown-target={targetDate}>
        <div className="gw-cd">
          <span className="gw-cd__num" data-countdown="days">00</span>
          <span className="gw-cd__label">Days</span>
        </div>
        <div className="gw-cd">
          <span className="gw-cd__num" data-countdown="hours">00</span>
          <span className="gw-cd__label">Hours</span>
        </div>
        <div className="gw-cd">
          <span className="gw-cd__num" data-countdown="minutes">00</span>
          <span className="gw-cd__label">Minutes</span>
        </div>
        <div className="gw-cd">
          <span className="gw-cd__num" data-countdown="seconds">00</span>
          <span className="gw-cd__label">Seconds</span>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: scriptContent }} />
    </>
  );
}

function SpeakerCarousel({ speakers, viewAllText, viewAllUrl }: {
  speakers: Speaker[];
  viewAllText: string;
  viewAllUrl: { href: string };
}) {
  const scriptContent = `
    (function() {
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
    })();
  `;

  return (
    <div className="gw-carousel" data-carousel-id="speakers">
      <button
        className="gw-carousel__arrow"
        data-carousel-btn="prev"
        aria-label="Previous speakers"
        type="button"
        style={{ cursor: 'pointer' }}
      >
        ‹
      </button>
      <div className="gw-carousel__track">
        {speakers.map((speaker, idx) => (
          <div key={idx} className="gw-speaker">
            {speaker.photo?.src ? (
              <img
                className="gw-speaker__ph"
                src={speaker.photo.src}
                alt={speaker.photo.alt || speaker.speaker_name}
                loading="lazy"
              />
            ) : (
              <div className="gw-speaker__ph">★</div>
            )}
            <div className="gw-speaker__name">{speaker.speaker_name}</div>
            <div className="gw-speaker__title">{speaker.title}</div>
            <div className="gw-speaker__co">{speaker.company}</div>
          </div>
        ))}
        {viewAllText && (
          <a href={viewAllUrl.href} className="gw-speaker gw-speaker--all">
            <span style={{ fontSize: '28px', marginBottom: '6px' }}>👥</span>
            <span>{viewAllText}</span>
          </a>
        )}
      </div>
      <button
        className="gw-carousel__arrow"
        data-carousel-btn="next"
        aria-label="Next speakers"
        type="button"
        style={{ cursor: 'pointer' }}
      >
        ›
      </button>
      <script dangerouslySetInnerHTML={{ __html: scriptContent }} />
    </div>
  );
}

export function Component({ fieldValues }: { fieldValues: FieldValues; hublParameters?: any; hublData?: any }) {
  return (
    <section className="gw gw-hero">
      {fieldValues.bg_video_url && (
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
      <div className="gw-hero__scrim"></div>
      <div className="gw-hero__glow"></div>

      <div className="gw-wrap">
        <div className="gw-eyebrow gw-hero__eyebrow">{fieldValues.eyebrow}</div>
        <h1 className="gw-hero__title">
          {fieldValues.title_main} <span>{fieldValues.title_year}</span>
        </h1>
        <div className="gw-hero__date">{fieldValues.date_line}</div>
        <div className="gw-hero__tagline">{fieldValues.tagline}</div>

        {fieldValues.speakers && fieldValues.speakers.length > 0 && (
          <SpeakerCarousel
            speakers={fieldValues.speakers}
            viewAllText={fieldValues.view_all_text}
            viewAllUrl={fieldValues.view_all_url}
          />
        )}

        <div className="gw-hero__ctablock">
          <a
            href={fieldValues.primary_cta_url?.href || '#'}
            className="gw-btn gw-btn--ticket"
          >
            {fieldValues.primary_cta_text}
          </a>
          {fieldValues.pricing_badge && (
            <div className="gw-pricing-badge">{fieldValues.pricing_badge}</div>
          )}
        </div>

        {fieldValues.countdown_enable && fieldValues.countdown_target && (() => {
          const targetTime = new Date(fieldValues.countdown_target).getTime();
          return !isNaN(targetTime) && targetTime > 0 ? <CountdownDisplay targetDate={targetTime} /> : null;
        })()}
      </div>
    </section>
  );
}

export const meta = {
  label: 'GAI World Hero',
};

export const fields = (
  <ModuleFields>
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
    <RepeatedFieldGroup
      name="speakers"
      label="Featured speakers"
      occurrence={{ min: 0, max: 20, default: 5 }}
      default={[
        { speaker_name: 'Featured Speaker', title: 'Title', company: 'Company' },
        { speaker_name: 'Featured Speaker', title: 'Title', company: 'Company' },
        { speaker_name: 'Featured Speaker', title: 'Title', company: 'Company' },
        { speaker_name: 'Featured Speaker', title: 'Title', company: 'Company' },
        { speaker_name: 'Featured Speaker', title: 'Title', company: 'Company' },
      ]}
      children={[
        <ImageField
          name="photo"
          label="Speaker photo"
          required={false}
        />,
        <TextField
          name="speaker_name"
          label="Speaker name"
          required={true}
          default="Featured Speaker"
        />,
        <TextField
          name="title"
          label="Title"
          required={true}
          default="Title"
        />,
        <TextField
          name="company"
          label="Company"
          required={true}
          default="Company"
        />,
      ]}
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
    <TextField
      name="pricing_badge"
      label="Pricing badge"
      default="Preferred Pricing in Effect Through August 16, 2026 - Save $700"
    />
    <BooleanField
      name="countdown_enable"
      label="Show countdown"
      default={true}
    />
    <TextField
      name="countdown_target"
      label="Countdown target (ISO 8601 with offset)"
      default="2026-08-16T23:59:00-04:00"
      helpText="e.g. 2026-08-16T23:59:00-04:00 (deadline in ET)."
    />
  </ModuleFields>
);
