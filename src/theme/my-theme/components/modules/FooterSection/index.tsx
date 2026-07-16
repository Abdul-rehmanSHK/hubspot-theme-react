import {
    ModuleFields,
    MenuField,
    ImageField,
    TextField,
} from '@hubspot/cms-components/fields';
import defaultLogo from '../../../assets/images/gai-insights-logo-1.webp';

const PORTAL_ID     = '39650877';
const FOOTER_TABLE  = '245423957';
const FOOTER_ROW_ID = '210829801378';

// ── Helpers ───────────────────────────────────────────────────────────────────

function stripHtml(html: any): string {
    return html ? String(html).replace(/<[^>]*>/g, '').trim() : '';
}

function extractEmail(raw: any): string {
    if (!raw) return '';
    const text = stripHtml(raw);
    const m = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
    return m ? m[0] : text;
}

function getMenuLinks(tree: any): Array<{ label: string; url: string }> {
    if (!tree) return [];
    const items: any[] = Array.isArray(tree) ? tree
        : Array.isArray(tree.children) ? tree.children
        : Array.isArray(tree.items)    ? tree.items
        : [];
    return items
        .map((it: any) => it && typeof it === 'object' ? {
            label: String(it.label ?? it.name ?? it.text ?? '').trim(),
            url:   String(it.url   ?? it.link ?? it.href ?? '#').trim() || '#',
        } : null)
        .filter((it): it is { label: string; url: string } => !!it?.label);
}

function parseDbMenu(raw: any): Array<{ label: string; url: string }> {
    if (!raw) return [];
    if (typeof raw === 'string') {
        try {
            const p = JSON.parse(raw);
            if (Array.isArray(p)) return p;
        } catch { }
        const links: Array<{ label: string; url: string }> = [];
        const re = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
        let m: RegExpExecArray | null;
        while ((m = re.exec(raw)) !== null) links.push({ url: m[1], label: stripHtml(m[2]) });
        return links;
    }
    return [];
}

// Ensure every <a> in social icon HTML opens in a new tab
function ensureNewTab(html: string): string {
    if (!html) return '';
    return html
        .replace(/\s+target=["'][^"']*["']/gi, '')
        .replace(/\s+rel=["'][^"']*["']/gi, '')
        .replace(/<a\b/gi, '<a target="_blank" rel="noopener noreferrer"');
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Component({ fieldValues, hublData }: { fieldValues?: any; hublData?: any }) {
    const db = hublData?.db || {};

    // Logo — HubDB is primary source; module field is an editor override only if HubDB has nothing
    const logoSrc  = db?.footer_logo?.url || fieldValues?.footer_logo?.src || defaultLogo;
    const logoAlt  = db?.footer_logo?.altText || fieldValues?.footer_logo?.alt || 'GAI Insights';
    const logoHref = db?.footer_logo_url || '/';

    // Social icons — ensure every link opens in a new tab
    const socialHtml = ensureNewTab(db?.footer_social_icon || '');

    // Contact emails
    const regEmail  = extractEmail(db?.registration_support);
    const sponEmail = extractEmail(db?.sponsorship_detail);
    const spkEmail  = extractEmail(db?.speakers_application);

    // Navigation — HubSpot menu (hublData) > HubDB footer_menu
    const menuLinks = getMenuLinks(hublData?.menuItems);
    const navItems  = menuLinks.length > 0 ? menuLinks : parseDbMenu(db?.footer_menu);

    // Module fields
    const hashtag   = fieldValues?.hashtag || '';
    const copyright = stripHtml(db?.copyright_text) || `© ${new Date().getFullYear()} by GAI Insights`;

    return (
        <footer className="footer bg-primary text-white py-5">
            <div className="container">

                {/* ── Row 1: Logo + Hashtag + Social ──────────────────────── */}
                <div className="row align-items-center mb-5">
                    <div className="col-md-6 footer-top">
                        <a href={logoHref} data-footer-logo-link>
                            <img
                                src={logoSrc}
                                alt={logoAlt}
                                data-footer-logo-img
                                style={{ maxWidth: '200px' }}
                                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                        </a>
                     
                    </div>
                    <div className="col-md-6">
                        {socialHtml ? (
                            <div
                                className="footer-social-icons d-flex gap-3 justify-content-md-end justify-content-start"
                                data-footer-social
                                dangerouslySetInnerHTML={{ __html: socialHtml }}
                            />
                        ) : (
                            <div
                                className="footer-social-icons d-flex gap-3 justify-content-md-end justify-content-start"
                                data-footer-social
                            />
                        )}
                    </div>
                </div>

                {/* ── Row 2: Contact columns ──────────────────────────────── */}
                <div className="row g-4 mb-5">
                    <div className="col-lg-4 col-md-6 text-center">
                        <div className="footer-icon-circle mb-3">
                            <i className="fa fa-envelope"></i>
                        </div>
                        <h6>Registration Support</h6>
                        <p className="mb-1 fw-bold" data-footer-reg-email>{regEmail}</p>
                        <a
                            href={regEmail ? `mailto:${regEmail}` : '#'}
                            className="text-info small"
                            data-footer-reg-link
                        >
                            Secure Your Spot &rarr;
                        </a>
                    </div>
                    <div className="col-lg-4 col-md-6 text-center">
                        <div className="footer-icon-circle mb-3">
                            <i className="fa fa-video"></i>
                        </div>
                        <h6>Sponsorships</h6>
                        <p className="mb-1 fw-bold" data-footer-spon-email>{sponEmail}</p>
                        <a
                            href={sponEmail ? `mailto:${sponEmail}` : '#'}
                            className="text-info small"
                            data-footer-spon-link
                        >
                            Become a Sponsor &rarr;
                        </a>
                    </div>
                    <div className="col-lg-4 col-md-6 text-center">
                        <div className="footer-icon-circle mb-3">
                            <i className="fa fa-microphone"></i>
                        </div>
                        <h6>Speaker Applications</h6>
                        <p className="mb-1 fw-bold" data-footer-spk-email>{spkEmail}</p>
                        <a
                            href={spkEmail ? `mailto:${spkEmail}` : '#'}
                            className="text-info small"
                            data-footer-spk-link
                        >
                            Apply to speak &rarr;
                        </a>
                    </div>
                </div>

                {/* ── Row 3: Nav + copyright ──────────────────────────────── */}
                <div className="border-top pt-4 text-center">
                    {/* Always rendered so client-side script can inject HubDB footer_menu links */}
                    <nav
                        className="footer-nav mb-3"
                        data-footer-nav
                        style={{ display: navItems.length === 0 ? 'none' : undefined }}
                    >
                        {navItems.map((item, i) => (
                            <a
                                key={i}
                                href={item.url}
                                className="text-white mx-3 text-decoration-none small"
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>
                    <p className="small opacity-75" data-footer-copyright>{copyright}</p>
                </div>

            </div>

            {/*
              Client-side HubDB fetch — same proven pattern as the Header module.
              Runs after DOM ready and updates every data-footer-* element directly,
              so the footer is always live even if hublDataTemplate cache is stale.
            */}
            <script dangerouslySetInnerHTML={{ __html: `
(function () {
    var TABLE  = '${FOOTER_TABLE}';
    var ROW    = '${FOOTER_ROW_ID}';
    var PORTAL = '${PORTAL_ID}';

    function sh(h) { return h ? String(h).replace(/<[^>]*>/g, '').trim() : ''; }
    function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
    function email(v) {
        if (!v) return '';
        var t = sh(String(v));
        var m = t.match(/[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}/);
        return m ? m[0] : t;
    }
    function q(attr) { return document.querySelector('[' + attr + ']'); }

    /* parse footer_menu: JSON array or HTML <a> tags */
    function parseMenu(raw) {
        if (!raw) return [];
        try { var p = JSON.parse(raw); if (Array.isArray(p)) return p; } catch(e) {}
        var links = [], re = /<a[^>]+href=["']([^"']+)["'][^>]*>([\\s\\S]*?)<\\/a>/gi, m;
        while ((m = re.exec(raw))) links.push({ url: m[1], label: sh(m[2]) });
        return links;
    }

    function apply(v) {
        if (!v) return;

        /* ── logo ── */
        var li = q('data-footer-logo-img');
        var ll = q('data-footer-logo-link');
        if (li && v.footer_logo && v.footer_logo.url) {
            li.setAttribute('src', v.footer_logo.url);
            if (v.footer_logo.altText) li.setAttribute('alt', v.footer_logo.altText);
            li.style.display = '';
        }
        if (ll && v.footer_logo_url) ll.setAttribute('href', v.footer_logo_url);

        /* ── social icons: inject HTML then force all links to open in new tab ── */
        var soc = q('data-footer-social');
        if (soc && v.footer_social_icon) {
            soc.innerHTML = v.footer_social_icon;
            var socAs = soc.querySelectorAll('a');
            for (var si = 0; si < socAs.length; si++) {
                socAs[si].setAttribute('target', '_blank');
                socAs[si].setAttribute('rel', 'noopener noreferrer');
            }
        }

        /* ── footer nav from HubDB footer_menu ── */
        var nav = q('data-footer-nav');
        if (nav && v.footer_menu) {
            var links = parseMenu(v.footer_menu);
            if (links.length > 0) {
                nav.innerHTML = links.map(function(l) {
                    return '<a href="' + esc(l.url) + '" class="text-white mx-3 text-decoration-none small">' + esc(l.label) + '</a>';
                }).join('');
                nav.style.display = '';
            }
        }

        /* ── registration ── */
        var reg = email(v.registration_support);
        var re  = q('data-footer-reg-email');
        var rl  = q('data-footer-reg-link');
        if (re && reg) re.textContent = reg;
        if (rl && reg) rl.setAttribute('href', 'mailto:' + reg);

        /* ── sponsorship ── */
        var spon = email(v.sponsorship_detail);
        var se   = q('data-footer-spon-email');
        var sl   = q('data-footer-spon-link');
        if (se && spon) se.textContent = spon;
        if (sl && spon) sl.setAttribute('href', 'mailto:' + spon);

        /* ── speakers ── */
        var spk = email(v.speakers_application);
        var ske = q('data-footer-spk-email');
        var skl = q('data-footer-spk-link');
        if (ske && spk) ske.textContent = spk;
        if (skl && spk) skl.setAttribute('href', 'mailto:' + spk);

        /* ── copyright ── */
        var cp = q('data-footer-copyright');
        if (cp && v.copyright_text) cp.textContent = sh(v.copyright_text);
    }

    function load() {
        var url = 'https://api.hubapi.com/cms/v3/hubdb/tables/' + TABLE + '/rows/' + ROW + '?portalId=' + PORTAL;
        fetch(url)
            .then(function (r) { return r.json(); })
            .then(function (d) { apply(d && d.values); })
            .catch(function () {});
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', load);
    } else {
        load();
    }
})();
            ` }} />
        </footer>
    );
}

// ── Fields ────────────────────────────────────────────────────────────────────

export const fields = (
    <ModuleFields>
        <ImageField
            name="footer_logo"
            label="Footer Logo (overrides HubDB)"
            default={{ src: defaultLogo, alt: 'GAI Insights', width: 200, height: 60 }}
            resizable={true}
        />
        <TextField
            name="hashtag"
            label="Hashtag Text"
            default="#GAIWorld"
        />
        <MenuField
            name="footerMenu"
            label="Footer Navigation Menu"
            helpText="Select the HubSpot navigation menu for the footer. Overrides HubDB footer_menu."
        />
    </ModuleFields>
);

export const meta = {
    label: 'Footer Section',
};

// ── HubL data template ────────────────────────────────────────────────────────
// Resolves the nav menu server-side (same pattern as Header module).
// Also pre-fetches HubDB row so the initial render is populated without
// waiting for the client-side fetch.

const _o = '\x7b\x25';
const _c = '\x25\x7d';
export const hublDataTemplate =
    // resolve nav menu
    _o + ' set _fmid = module.footerMenu '                                                          + _c +
    _o + ' if _fmid is mapping and _fmid.id is defined '                                           + _c +
    _o + '   set _fmid = _fmid.id '                                                                 + _c +
    _o + ' endif '                                                                                   + _c +
    _o + ' if not _fmid '                                                                           + _c +
    _o + '   set _tid = theme.footer_menu_id|default(0) '                                          + _c +
    _o + '   if _tid is mapping and _tid.id is defined '                                           + _c +
    _o + '     set _tid = _tid.id '                                                                 + _c +
    _o + '   endif '                                                                                 + _c +
    _o + '   set _tid = _tid|string|replace(",","")|replace(" ","")|trim|int '                     + _c +
    _o + '   if _tid '                                                                               + _c +
    _o + '     set _fmid = _tid '                                                                   + _c +
    _o + '   endif '                                                                                 + _c +
    _o + ' endif '                                                                                   + _c +
    _o + ' set _menu_items = _fmid ? menu(_fmid) : [] '                                            + _c +
    // fetch footer row — extract each column into a plain variable so it serializes to JSON
    _o + ' set _row = hubdb_table_row(' + FOOTER_TABLE + ', ' + FOOTER_ROW_ID + ') '               + _c +
    _o + ' set _li  = _row.footer_logo if _row else null '                                         + _c +
    _o + ' set _lu  = _li.url if _li else "" '                                                     + _c +
    _o + ' set _la  = _li.altText if _li else "" '                                                 + _c +
    _o + ' set _ll  = _row.footer_logo_url        if _row else "" '                                + _c +
    _o + ' set _reg = _row.registration_support   if _row else "" '                                + _c +
    _o + ' set _sp  = _row.sponsorship_detail     if _row else "" '                                + _c +
    _o + ' set _spk = _row.speakers_application   if _row else "" '                                + _c +
    _o + ' set _soc = _row.footer_social_icon     if _row else "" '                                + _c +
    _o + ' set _fm  = _row.footer_menu            if _row else "" '                                + _c +
    _o + ' set _cp  = _row.copyright_text         if _row else "" '                                + _c +
    // build plain serialisable dict
    _o + ' set _db = {"footer_logo": {"url": _lu, "altText": _la}, "footer_logo_url": _ll, "registration_support": _reg, "sponsorship_detail": _sp, "speakers_application": _spk, "footer_social_icon": _soc, "footer_menu": _fm, "copyright_text": _cp} ' + _c +
    _o + ' set hublData = {"menuItems": _menu_items, "db": _db} '                                  + _c;
