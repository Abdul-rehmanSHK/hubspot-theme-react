import { ModuleFields, MenuField, ImageField, TextField, BooleanField, RepeatedFieldGroup } from '@hubspot/cms-components/fields';

const FOOTER_TABLE = '245423957';
const FOOTER_ROW_ID = '210829801378';

// ── Helpers ───────────────────────────────────────────────────────────────────

const stripHtml = (v: any): string =>
    v ? String(v).replace(/<[^>]*>/g, '').trim() : '';

const extractEmail = (v: any): string => {
    if (!v) return '';
    const text = stripHtml(v);
    const m = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    return m ? m[0] : text;
};

function extractImageUrl(field: any): string {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field.url || field.src || field.file_url || field.href
        || field.file?.url || field.file?.src || '';
}

function sanitizeUrl(url: string) {
    if (!url || typeof url !== 'string') return url;
    if (url.includes('gaiinsights.com/hubfs/')) {
        return url.replace(/^https?:\/\/[^\/]+\/(hubfs\/.*)/, '/$1');
    }
    return url;
}

const IMAGE_EXT = /\.(png|jpe?g|webp|svg|gif|avif)/i;

function findLogoUrl(vals: any): string {
    if (!vals) return '';
    for (const k of ['footer_logo', 'logo_image', 'logo']) {
        const u = extractImageUrl(vals[k]);
        if (u) return u;
    }
    for (const k of Object.keys(vals)) {
        const v = vals[k];
        if (typeof v === 'string' && IMAGE_EXT.test(v)) return v;
        if (v && typeof v === 'object') {
            const u = extractImageUrl(v);
            if (u && IMAGE_EXT.test(u)) return u;
        }
    }
    return '';
}

function findLogoAlt(vals: any): string {
    if (!vals) return '';
    for (const k of ['footer_logo', 'logo_image', 'logo']) {
        const f = vals[k];
        if (f?.altText) return f.altText;
        if (f?.alt) return f.alt;
    }
    return '';
}

function findLogoLink(vals: any): string {
    if (!vals) return '';
    for (const k of ['logo_url', 'footer_logo_url']) {
        if (vals[k] && typeof vals[k] === 'string') return vals[k];
    }
    return '/';
}

function getMenuItems(tree: any): Array<{ label: string; url: string }> {
    if (!tree) return [];
    const items: any[] = Array.isArray(tree) ? tree
        : Array.isArray(tree.children) ? tree.children
            : Array.isArray(tree.items) ? tree.items
                : [];
    return items
        .map((it: any) => it && typeof it === 'object' ? {
            label: String(it.label ?? it.name ?? it.text ?? '').trim(),
            url: String(it.url ?? it.link ?? it.href ?? '#').trim() || '#',
        } : null)
        .filter((it): it is { label: string; url: string } => !!it?.label);
}

function parseHubDbMenu(raw: any): Array<{ label: string; url: string }> {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
        try {
            const p = JSON.parse(raw);
            if (Array.isArray(p)) return p;
        } catch { }
        const re = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
        const out: Array<{ label: string; url: string }> = [];
        let m;
        while ((m = re.exec(raw)) !== null) out.push({ url: m[1], label: stripHtml(m[2]) });
        if (out.length) return out;
    }
    return [];
}

// ── Types ─────────────────────────────────────────────────────────────────────

type SocialLink = { icon: string; url: string; new_window: boolean };

// ── Component ─────────────────────────────────────────────────────────────────

export function Component({
    hublData,
    footer_logo,
    social_links,
    hashtag,
}: {
    hublData?: any;
    footer_logo?: { src?: string; alt?: string };
    social_links?: SocialLink[];
    hashtag?: string;
}) {
    const db = hublData?.db || {};
    const dbMenu = parseHubDbMenu(db.footer_menu);

    // Logo — module field first, then HubDB
    const logoSrc = sanitizeUrl(footer_logo?.src || findLogoUrl(db));
    const logoAlt = footer_logo?.alt || findLogoAlt(db) || 'GAI Insights';
    const logoHref = findLogoLink(db);

    // Social icons — module field first, then HubDB rich-text HTML
    const hasSocialLinks = Array.isArray(social_links) && social_links.length > 0;

    // Navigation menu
    const navItems = getMenuItems(hublData?.menuItems).length > 0
        ? getMenuItems(hublData?.menuItems)
        : dbMenu;

    // Contact details
    const regEmail = extractEmail(db.registration_support);
    const sponEmail = extractEmail(db.sponsorship_detail);
    const spkEmail = extractEmail(db.speakers_application);
    const copyright = stripHtml(db.copyright_text) || `© ${new Date().getFullYear()} by GAI Insights`;

    return (
        <footer className="footer bg-primary text-white py-5">
            <div className="container">

                {/* Logo + hashtag + social icons */}
                <div className="row align-items-center mb-5">
                    <div className="col-md-6 footer-top">
                        <a href={logoHref}>
                            {logoSrc && (
                                <img
                                    src={logoSrc}
                                    alt={logoAlt}
                                    style={{ maxWidth: '200px' }}
                                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                            )}
                        </a>
                        {hashtag && (
                            <p className="footer-hashtag mt-2 mb-0 text-info fw-semibold">{hashtag}</p>
                        )}
                    </div>
                    <div className="col-md-6 text-md-end">
                        {hasSocialLinks ? (
                            <div className="footer-social-icons d-flex gap-3 justify-content-md-end justify-content-start mt-3 mt-md-0">
                                {social_links!.map((link, i) => (
                                    <a
                                        key={i}
                                        href={link.url}
                                        target={link.new_window ? '_blank' : undefined}
                                        rel={link.new_window ? 'noopener noreferrer' : undefined}
                                        className="footer-social-link"
                                        aria-label={link.icon}
                                    >
                                        <i className={link.icon}></i>
                                    </a>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Contact columns */}
                <div className="row g-4 mb-5">
                    <div className="col-lg-4 col-md-6 text-center">
                        <div className="footer-icon-circle mb-3">
                            <i className="fa fa-envelope"></i>
                        </div>
                        <h6>Registration Support</h6>
                        <p className="mb-1 fw-bold">{regEmail}</p>
                        <a href={`mailto:${regEmail}`} className="text-info small">
                            Secure Your Spot →
                        </a>
                    </div>
                    <div className="col-lg-4 col-md-6 text-center">
                        <div className="footer-icon-circle mb-3">
                            <i className="fa fa-video"></i>
                        </div>
                        <h6>Sponsorships</h6>
                        <p className="mb-1 fw-bold">{sponEmail}</p>
                        <a href={`mailto:${sponEmail}`} className="text-info small">
                            Become a Sponsor →
                        </a>
                    </div>
                    <div className="col-lg-4 col-md-6 text-center">
                        <div className="footer-icon-circle mb-3">
                            <i className="fa fa-microphone"></i>
                        </div>
                        <h6>Speaker Applications</h6>
                        <p className="mb-1 fw-bold">{spkEmail}</p>
                        <a href={`mailto:${spkEmail}`} className="text-info small">
                            Apply to speak →
                        </a>
                    </div>
                </div>

                {/* Footer nav + copyright */}
                <div className="border-top pt-4 text-center">
                    {navItems.length > 0 && (
                        <nav className="footer-nav mb-3">
                            {navItems.map((item, i) => (
                                <a key={i} href={item.url}
                                    className="text-white mx-3 text-decoration-none small">
                                    {item.label}
                                </a>
                            ))}
                        </nav>
                    )}
                    <p className="small opacity-75">{copyright}</p>
                </div>

            </div>
        </footer>
    );
}

// ── Fields ────────────────────────────────────────────────────────────────────

export const fields = (
    <ModuleFields>
        <ImageField
            name="footer_logo"
            label="Footer Logo"
            default={{ src: '', alt: 'GAI Insights' }}
        />
        <TextField
            name="hashtag"
            label="Hashtag Text"
            default="#GAIWorld"
        />
        <RepeatedFieldGroup
            name="social_links"
            label="Social Media Links"
            default={[
                { icon: 'fab fa-linkedin-in', url: 'https://www.linkedin.com/company/gai-insights/', new_window: true },
                { icon: 'fab fa-youtube', url: 'https://www.youtube.com/@GAIInsights/videos', new_window: true },
            ]}
            children={[
                <TextField
                    name="icon"
                    label="Icon Class (Font Awesome, e.g. fab fa-linkedin-in)"
                    default="fab fa-linkedin-in"
                />,
                <TextField
                    name="url"
                    label="URL"
                    default=""
                />,
                <BooleanField
                    name="new_window"
                    label="Open in New Window"
                    default={true}
                />,
            ]}
        />
        <MenuField
            name="footerMenu"
            label="Footer Navigation Menu"
            helpText="Select the HubSpot navigation menu to show in the footer."
        />
    </ModuleFields>
);

export const meta = {
    label: 'Footer Global V2',
};

// ── HubL data template ────────────────────────────────────────────────────────
// Raw HubDB row objects do NOT serialize to JSON — each column must be
// extracted into a plain HubL variable before being passed to hublData.

const _o = '\x7b\x25';
const _c = '\x25\x7d';
export const hublDataTemplate =
    // ── resolve footer navigation menu ──
    _o + ' set _fmid = module.footerMenu ' + _c +
    _o + ' if _fmid is mapping and _fmid.id is defined ' + _c +
    _o + '   set _fmid = _fmid.id ' + _c +
    _o + ' endif ' + _c +
    _o + ' if not _fmid ' + _c +
    _o + '   set _tid = theme.footer_menu_id|default(0) ' + _c +
    _o + '   if _tid is mapping and _tid.id is defined ' + _c +
    _o + '     set _tid = _tid.id ' + _c +
    _o + '   endif ' + _c +
    _o + '   set _tid = _tid|string|replace(",","")|replace(" ","")|trim|int ' + _c +
    _o + '   if _tid ' + _c +
    _o + '     set _fmid = _tid ' + _c +
    _o + '   endif ' + _c +
    _o + ' endif ' + _c +
    _o + ' set _menu_items = _fmid ? menu(_fmid) : [] ' + _c +
    // ── fetch the specific footer row by ID ──
    _o + ' set _row = hubdb_table_row(' + FOOTER_TABLE + ', ' + FOOTER_ROW_ID + ') ' + _c +
    // ── image field: extract primitives so they serialize to JSON ──
    _o + ' set _logo_img = _row.footer_logo if _row else null ' + _c +
    _o + ' set _logo_url = _logo_img.url if _logo_img else "" ' + _c +
    _o + ' set _logo_alt = _logo_img.altText if _logo_img else "" ' + _c +
    // ── text / rich-text columns ──
    _o + ' set _reg   = _row.registration_support  if _row else "" ' + _c +
    _o + ' set _spon  = _row.sponsorship_detail     if _row else "" ' + _c +
    _o + ' set _spk   = _row.speakers_application   if _row else "" ' + _c +
    _o + ' set _copy  = _row.copyright_text          if _row else "" ' + _c +
    _o + ' set _soci  = _row.footer_social_icon      if _row else "" ' + _c +
    _o + ' set _fmenu = _row.footer_menu             if _row else "" ' + _c +
    // ── assemble a plain serializable dict ──
    _o + ' set _db_vals = {"footer_logo": {"url": _logo_url, "altText": _logo_alt}, "registration_support": _reg, "sponsorship_detail": _spon, "speakers_application": _spk, "copyright_text": _copy, "footer_social_icon": _soci, "footer_menu": _fmenu} ' + _c +
    _o + ' set hublData = {"menuItems": _menu_items, "db": _db_vals} ' + _c;
