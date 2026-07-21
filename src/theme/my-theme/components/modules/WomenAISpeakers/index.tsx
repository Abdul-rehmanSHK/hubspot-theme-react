import React from 'react';
import {
  ModuleFields,
  TextField,
  RichTextField,
  NumberField,
} from '@hubspot/cms-components/fields';
import './styles.css';

interface FieldValues {
  heading: string;
  portalId: string;
  tableId: string;
  sectionId: string;
  sectionClass: string;
  autoplayDelay: number;
  speed: number;
}

function decodeHtmlEntities(value: string) {
  const entities: Record<string, string> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
  };

  return value.replace(/&(#\d+|#x[\da-f]+|[a-z]+);/gi, (match, entity) => {
    const normalized = entity.toLowerCase();

    if (normalized.charAt(0) === '#') {
      const codePoint = normalized.charAt(1) === 'x'
        ? parseInt(normalized.slice(2), 16)
        : parseInt(normalized.slice(1), 10);

      return Number.isNaN(codePoint) ? match : String.fromCharCode(codePoint);
    }

    return entities[normalized] ?? match;
  });
}

function stripHtmlText(value?: string) {
  if (!value) return '';

  return decodeHtmlEntities(String(value))
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function Component({ fieldValues, hublData }: { fieldValues: FieldValues; hublData?: any }) {
  // Use config values or standard defaults
  const heading = fieldValues.heading || '<h2>Roundtable Leaders At Women In AI Breakfast</h2>';
  const portalId = fieldValues.portalId || '39650877';
  const tableId = fieldValues.tableId || '351853163';
  const sectionId = fieldValues.sectionId || 'women-ai-speakers-section';
  const sectionClass = fieldValues.sectionClass || 'women-speakers-section';
  const autoplayDelay = fieldValues.autoplayDelay ?? 3000;
  const speed = fieldValues.speed ?? 600;

  // Retrieve server-side rendered speakers list
  const speakers = hublData?.speakers || [];

  // Generate a unique instance ID for multiple sliders on the same page
  const instanceId = `women-speakers-${Math.random().toString(36).slice(2, 11)}`;

  return (
    <section className={sectionClass} id={sectionId} data-instance-id={instanceId}>
      <div className="container">
        
        {heading && (
          <div className="women-speakers-header">
            <div className="women-speakers-heading" dangerouslySetInnerHTML={{ __html: heading }} />
          </div>
        )}

        <div className="women-speakers-slider-container">
          {/* Swiper Slider */}
          <div className="women-speakers-slider swiper">
            <div className="swiper-wrapper" id={`wrapper-${instanceId}`}>
              {/* Server-side rendered slides (no client-side layout shift or 403 errors) */}
              {speakers.map((speaker: any, index: number) => (
                <div className="swiper-slide" key={index}>
                  <div className="women-speaker-card">
                    <div className="women-speaker-card-content">
                      <h3 className="women-speaker-name">{speaker.name || ''}</h3>
                      <div className="women-speaker-meta">
                        {speaker.company && <div className="women-speaker-designation">{speaker.company}</div>}
                        {speaker.logo?.url && (
                          <div className="women-speaker-logo-wrap">
                            <img src={speaker.logo.url} alt={speaker.logo.altText || speaker.company || speaker.name} className="women-speaker-logo" />
                          </div>
                        )}
                        {speaker.title && <div className="women-speaker-description">{speaker.title}</div>}
                        {stripHtmlText(speaker.description) && <div className="women-speaker-description">{stripHtmlText(speaker.description)}</div>}
                      </div>
                    </div>
                    <div className="women-speaker-card-image-wrap">
                      {speaker.image?.url ? (
                        <div className="women-speaker-avatar-border">
                          <img src={speaker.image.url} alt={speaker.image.altText || speaker.name} className="women-speaker-avatar" />
                        </div>
                      ) : (
                        <div className="women-speaker-avatar-border">
                          <div className="women-speaker-avatar" style={{ background: '#090e43', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {speaker.name ? speaker.name.charAt(0).toUpperCase() : ''}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Swiper Pagination Dots */}
            <div className="swiper-pagination"></div>
          </div>

          {/* Navigation Arrows */}
          <div className="women-speakers-controls">
            <div className="women-speakers-arrow swiper-button-prev">
              <i className="fa-solid fa-arrow-left"></i>
            </div>
            <div className="women-speakers-arrow swiper-button-next">
              <i className="fa-solid fa-arrow-right"></i>
            </div>
          </div>
        </div>

        {/* Loading & Error States */}
        <div id={`loading-${instanceId}`} className="women-speakers-loading" style={{ display: speakers.length > 0 ? 'none' : 'block' }}>
          Loading AI speakers...
        </div>
        <div id={`error-${instanceId}`} className="women-speakers-error" style={{ display: 'none' }}>
          Error loading speakers. Please verify your HubDB table connection.
        </div>

        {/* Debug helper: inspect values directly in HTML markup comments */}
        <div style={{ display: 'none' }} data-debug-hubldata={JSON.stringify(hublData)}></div>
      </div>

      {/* Dynamic Data Fetch and Slider Initialization */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
          (function() {
            const root = document.querySelector('[data-instance-id="${instanceId}"]');
            if (!root) return;

            const portalId = '${portalId}';
            const tableId = '${tableId}';
            const wrapper = root.querySelector('#wrapper-${instanceId}');
            const loadingEl = root.querySelector('#loading-${instanceId}');
            const errorEl = root.querySelector('#error-${instanceId}');
            
            let swiperInstance = null;

            async function fetchSpeakers() {
              // If server-side rendering already populated the slides, just initialize Swiper
              const existingSlides = wrapper.querySelectorAll('.swiper-slide');
              if (existingSlides.length > 0) {
                loadingEl.style.display = 'none';
                errorEl.style.display = 'none';
                initSwiper();
                return;
              }

              // Fallback to client-side fetch (e.g. during local developer preview)
              try {
                if (wrapper) wrapper.innerHTML = '';
                
                const apiUrl = 'https://api.hubapi.com/cms/v3/hubdb/tables/' + tableId + '/rows?portalId=' + portalId;
                const response = await fetch(apiUrl);
                
                if (!response.ok) {
                  throw new Error('HubDB fetch failed: ' + response.status);
                }
                
                const data = await response.json();
                const rows = data.results || [];
                
                if (rows.length === 0) {
                  loadingEl.innerHTML = 'No speaker data found in HubDB table.';
                  loadingEl.style.display = 'block';
                  return;
                }

                loadingEl.style.display = 'none';
                errorEl.style.display = 'none';

                rows.forEach(function(row) {
                  const name = escapeHtml(row.values?.name || '');
                  const title = escapeHtml(row.values?.title || '');
                  const company = escapeHtml(row.values?.company || '');
                  const description = escapeHtml(stripHtmlText(row.values?.description || ''));
                  
                  const imageSrc = escapeHtml(row.values?.image ? (row.values.image.url || '') : '');
                  const imageAlt = escapeHtml(row.values?.image?.altText || row.values?.name || 'Speaker Headshot');
                  
                  const logoSrc = escapeHtml(row.values?.logo ? (row.values.logo.url || '') : '');
                  const logoAlt = escapeHtml(row.values?.logo?.altText || row.values?.company || row.values?.name || 'Company Logo');

                  const slide = document.createElement('div');
                  slide.className = 'swiper-slide';

                  slide.innerHTML = 
                    '<div class="women-speaker-card">' +
                      '<div class="women-speaker-card-content">' +
                        '<h3 class="women-speaker-name">' + name + '</h3>' +
                        '<div class="women-speaker-meta">' +
                          (company ? '<div class="women-speaker-designation">' + company + '</div>' : '') +
                          (logoSrc ?
                            '<div class="women-speaker-logo-wrap">' +
                              '<img src="' + logoSrc + '" alt="' + logoAlt + '" class="women-speaker-logo" />' +
                            '</div>' :
                            ''
                          ) +
                          (title ? '<div class="women-speaker-description">' + title + '</div>' : '') +
                          (description ? '<div class="women-speaker-description">' + description + '</div>' : '') +
                        '</div>' +
                      '</div>' +
                      '<div class="women-speaker-card-image-wrap">' +
                        '<div class="women-speaker-avatar-border">' +
                          (imageSrc ? 
                            '<img src="' + imageSrc + '" alt="' + imageAlt + '" class="women-speaker-avatar" />' :
                            '<div class="women-speaker-avatar" style="background:#090e43; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:bold;">' + (name ? name.charAt(0).toUpperCase() : '') + '</div>'
                          ) +
                        '</div>' +
                      '</div>' +
                    '</div>';

                  wrapper.appendChild(slide);
                });

                initSwiper();

              } catch (err) {
                console.error(err);
                loadingEl.style.display = 'none';
                errorEl.style.display = 'block';
                errorEl.innerHTML = 'Error loading speakers: ' + (err.message || 'Check database connection');
              }
            }

            function decodeHtmlEntities(value) {
              const textarea = document.createElement('textarea');
              textarea.innerHTML = value || '';
              return textarea.value;
            }

            function stripHtmlText(value) {
              return decodeHtmlEntities(String(value || ''))
                .replace(/<style\\b[^>]*>[\\s\\S]*?<\\/style>/gi, ' ')
                .replace(/<script\\b[^>]*>[\\s\\S]*?<\\/script>/gi, ' ')
                .replace(/<[^>]+>/g, ' ')
                .replace(/\\s+/g, ' ')
                .trim();
            }

            function escapeHtml(value) {
              return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
            }

            function initSwiper() {
              const sliderEl = root.querySelector('.women-speakers-slider');
              if (!sliderEl) {
                setTimeout(initSwiper, 100);
                return;
              }

              if (sliderEl.swiper) return;

              if (typeof Swiper === 'undefined') {
                setTimeout(initSwiper, 100);
                return;
              }

              const nextBtn = root.querySelector('.swiper-button-next');
              const prevBtn = root.querySelector('.swiper-button-prev');
              const paginationEl = root.querySelector('.swiper-pagination');

              swiperInstance = new Swiper(sliderEl, {
                slidesPerView: 3,
                spaceBetween: 30,
                centeredSlides: false,
                loop: true,
                rewind: true,
                grabCursor: true,
                watchSlidesProgress: true,
                speed: ${speed},
                autoplay: {
                  delay: ${autoplayDelay},
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                },
                navigation: {
                  nextEl: nextBtn,
                  prevEl: prevBtn,
                },
                pagination: {
                  el: paginationEl,
                  clickable: true,
                },
                breakpoints: {
                  0: {
                    slidesPerView: 1,
                    spaceBetween: 20,
                  },
                  768: {
                    slidesPerView: 2,
                    spaceBetween: 24,
                  },
                  992: {
                    slidesPerView: 3,
                    spaceBetween: 30,
                  }
                }
              });

              setTimeout(function() {
                root.querySelectorAll('.women-speakers-slider .swiper-slide').forEach(function(slide) {
                  slide.addEventListener('click', function() {
                    if (swiperInstance) {
                      const index = swiperInstance.getSlideIndex(slide);
                      if (index !== undefined && index !== null) {
                        swiperInstance.slideToLoop(index);
                      }
                    }
                  });
                });
              }, 200);
            }

            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', function() {
                setTimeout(fetchSpeakers, 100);
              });
            } else {
              setTimeout(fetchSpeakers, 100);
            }

            root.addEventListener('cms:unmount', function() {
              if (swiperInstance && swiperInstance.destroy) {
                swiperInstance.destroy(true, true);
              }
            });

          })();
        `,
        }}
      />
    </section>
  );
}

export const meta = {
  label: 'Women AI Speakers Slider',
};

// ── HubL data template ────────────────────────────────────────────────────────
// Fetches the HubDB data server-side so it works seamlessly and has zero layout shifts or 403 issues.
const _o = '\x7b\x25';
const _c = '\x25\x7d';

export const hublDataTemplate =
  _o + ' set _table_id = module.tableId|default("351853163", true) ' + _c +
  _o + ' set _mapped_rows = [] ' + _c +
  _o + ' if _table_id ' + _c +
  _o + '   set _rows = hubdb_table_rows(_table_id|trim|int) ' + _c +
  _o + '   for _row in _rows ' + _c +
  _o + '     set _name = _row.name ' + _c +
  _o + '     set _title = _row.title ' + _c +
  _o + '     set _company = _row.company ' + _c +
  _o + '     set _description = _row.description ' + _c +
  // image
  _o + '     set _img_url = "" ' + _c +
  _o + '     set _img_alt = "" ' + _c +
  _o + '     if _row.image ' + _c +
  _o + '       set _img_url = _row.image.url ' + _c +
  _o + '       set _img_alt = _row.image.altText ' + _c +
  _o + '     endif ' + _c +
  // logo
  _o + '     set _logo_url = "" ' + _c +
  _o + '     set _logo_alt = "" ' + _c +
  _o + '     if _row.logo ' + _c +
  _o + '       set _logo_url = _row.logo.url ' + _c +
  _o + '       set _logo_alt = _row.logo.altText ' + _c +
  _o + '     endif ' + _c +
  // build dictionary
  _o + '     set _item = {"name": _name, "title": _title, "company": _company, "description": _description, "image": {"url": _img_url, "altText": _img_alt}, "logo": {"url": _logo_url, "altText": _logo_alt}} ' + _c +
  _o + '     set _dummy = _mapped_rows.append(_item) ' + _c +
  _o + '   endfor ' + _c +
  _o + ' endif ' + _c +
  _o + ' set hublData = {"speakers": _mapped_rows} ' + _c;

export const fields = (
  <ModuleFields>
    <RichTextField
      name="heading"
      label="Module Heading"
      default="<h2>Roundtable Leaders At Women In AI Breakfast</h2>"
      helpText="Enter the heading content (H2 recommended)."
    />
    <TextField
      name="portalId"
      label="HubSpot Portal ID"
      default="39650877"
      helpText="The HubSpot portal ID where your HubDB resides."
    />
    <TextField
      name="tableId"
      label="HubDB Table ID"
      default="351853163"
      helpText="The ID of the HubDB table containing speaker records."
    />
    <TextField
      name="sectionId"
      label="HTML Section ID"
      default="women-ai-speakers"
      helpText="Custom ID for anchor links (e.g. #women-ai-speakers)."
    />
    <TextField
      name="sectionClass"
      label="HTML Section CSS Class"
      default="women-speakers-section"
      helpText="Custom CSS class name for styling the section wrapper."
    />
    <NumberField
      name="autoplayDelay"
      label="Autoplay Delay (ms)"
      default={3000}
      helpText="Slide delay in milliseconds. E.g., 3000 = 3 seconds."
    />
    <NumberField
      name="speed"
      label="Slide Speed (ms)"
      default={600}
      helpText="Slide animation transition duration in milliseconds."
    />
  </ModuleFields>
);
