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

function parseCardDetails(
    rawHtml: any,
    defaultLabel: string,
    defaultEmail: string,
    defaultCtaText: string,
    defaultCtaUrl: string
) {
    if (!rawHtml) {
        return {
            label: defaultLabel,
            email: defaultEmail,
            ctaText: defaultCtaText,
            ctaUrl: defaultCtaUrl,
            iconUrl: `mailto:${defaultEmail}`
        };
    }
    const htmlStr = String(rawHtml);

    // Label
    const labelMatch = htmlStr.match(/<span[^>]*class=["'][^"']*label[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
    const label = labelMatch ? stripHtml(labelMatch[1]) : defaultLabel;

    // Email link text & mailto
    const emailMatch = htmlStr.match(/<a[^>]*class=["'][^"']*main-contact-link[^"']*["'][^>]*>([\s\S]*?)<\/a>/i);
    const emailStr = emailMatch ? stripHtml(emailMatch[1]) : extractEmail(htmlStr) || defaultEmail;

    // CTA link href & text
    const ctaMatch = htmlStr.match(/<a[^>]*class=["'][^"']*cta-link[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
    let ctaUrl = defaultCtaUrl;
    let ctaText = defaultCtaText;
    if (ctaMatch) {
        ctaUrl = ctaMatch[1];
        ctaText = stripHtml(ctaMatch[2]);
    } else {
        const allLinks = [...htmlStr.matchAll(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
        if (allLinks.length > 1) {
            ctaUrl = allLinks[allLinks.length - 1][1];
            ctaText = stripHtml(allLinks[allLinks.length - 1][2]);
        }
    }

    // Icon href
    const iconMatch = htmlStr.match(/<div[^>]*class=["'][^"']*bar-icons[^"']*["'][^>]*>[\s\S]*?<a[^>]*href=["']([^"']+)["']/i);
    const iconUrl = iconMatch ? iconMatch[1] : (ctaUrl || `mailto:${emailStr}`);

    return { label, email: emailStr, ctaText, ctaUrl, iconUrl };
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
    const hasH6InSocial = /<h6\b/i.test(socialHtml);

    // Parse Cards from HubDB columns
    const regCard = parseCardDetails(
        db?.registration_support,
        'Registration Support',
        'laura@gaiinsights.com',
        'Secure Your Spot \u2192',
        'https://www.gaiworld.com/buy-tickets'
    );
    const sponCard = parseCardDetails(
        db?.sponsorship_detail,
        'Sponsorships',
        'mdavis@gaiinsights.com',
        'Become a Sponsor \u2192',
        'https://www.gaiworld.com/sponsors#sponsor-form'
    );
    const spkCard = parseCardDetails(
        db?.speakers_application,
        'Press Inquiries',
        'karin@gaiinsights.com',
        'Apply to Inquiries \u2192',
        'mailto:karin@gaiinsights.com'
    );

    // Navigation — HubSpot menu (hublData) > HubDB footer_menu
    const menuLinks = getMenuLinks(hublData?.menuItems);
    const navItems  = menuLinks.length > 0 ? menuLinks : parseDbMenu(db?.footer_menu);

    // Module fields
    const hashtag   = fieldValues?.hashtag || '#GAIWorld2026';
    const copyright = stripHtml(db?.copyright_text) || `© ${new Date().getFullYear()} by GAI Insights`;

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-div">

                    {/* ── Row 1: Logo + Social ──────────────────────── */}
                    <div className="row g-5">
                        <div className="col-md-6 test">
                            <div className="footer-top">
                                <a href={logoHref} data-footer-logo-link>
                                    <img
                                        src={logoSrc}
                                        alt={logoAlt}
                                        data-footer-logo-img
                                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                </a>
                            </div>
                        </div>
                        <div className="col-md-6 test-class">
                            <div className="footer-social">
                                <div className="social-icons">
                                    {!hasH6InSocial && <h6 data-footer-hashtag>{hashtag}</h6>}
                                    {socialHtml ? (
                                        <div
                                            data-footer-social
                                            dangerouslySetInnerHTML={{ __html: socialHtml }}
                                        />
                                    ) : (
                                        <div data-footer-social />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Row 2: Contact Info Section (Matches gai-insights.css structure) ── */}
                    <div className="contact-info-section">
                        <div className="row">
                            <div className="contact-container">

                                {/* Card 1: Registration Support */}
                                <div className="contact-card">
                                    <div className="bar-icons">
                                        <a href={regCard.iconUrl} data-footer-reg-mailto>
                                            <i className="fa-solid fa-envelope">&nbsp;</i>
                                        </a>
                                    </div>
                                    <div className="content">
                                        <span className="label" style={{ fontFamily: "'Barlow', sans-serif" }} data-footer-reg-label>
                                            {regCard.label}
                                        </span>
                                        <h3>
                                            <a
                                                href={`mailto:${regCard.email}`}
                                                className="main-contact-link"
                                                data-footer-reg-email
                                            >
                                                {regCard.email}
                                            </a>
                                        </h3>
                                        <a
                                            href={regCard.ctaUrl}
                                            className="cta-link"
                                            data-footer-reg-link
                                        >
                                            {regCard.ctaText}
                                        </a>
                                    </div>
                                </div>

                                {/* Card 2: Sponsorships */}
                                <div className="contact-card">
                                    <div className="bar-icons">
                                        <a href={sponCard.iconUrl} data-footer-spon-mailto>
                                            <i className="fa-solid fa-handshake">&nbsp;</i>
                                        </a>
                                    </div>
                                    <div className="content">
                                        <span className="label" style={{ fontFamily: "'Barlow', sans-serif" }} data-footer-spon-label>
                                            {sponCard.label}
                                        </span>
                                        <h3>
                                            <a
                                                href={`mailto:${sponCard.email}`}
                                                className="main-contact-link"
                                                data-footer-spon-email
                                            >
                                                {sponCard.email}
                                            </a>
                                        </h3>
                                        <a
                                            href={sponCard.ctaUrl}
                                            className="cta-link"
                                            data-footer-spon-link
                                        >
                                            {sponCard.ctaText}
                                        </a>
                                    </div>
                                </div>

                                {/* Card 3: Press Inquiries / Speakers */}
                                <div className="contact-card">
                                    <div className="bar-icons">
                                        <a href={spkCard.iconUrl} data-footer-spk-mailto>
                                            <i className="fa-solid fa-file-circle-question">&nbsp;</i>
                                        </a>
                                    </div>
                                    <div className="content">
                                        <span className="label" style={{ fontFamily: "'Barlow', sans-serif" }} data-footer-spk-label>
                                            {spkCard.label}
                                        </span>
                                        <h3>
                                            <a
                                                href={`mailto:${spkCard.email}`}
                                                className="main-contact-link"
                                                data-footer-spk-email
                                            >
                                                {spkCard.email}
                                            </a>
                                        </h3>
                                        <a
                                            href={spkCard.ctaUrl}
                                            className="cta-link"
                                            data-footer-spk-link
                                        >
                                            {spkCard.ctaText}
                                        </a>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* ── Row 3: Footer Nav ── */}
                    <div
                        className="footer-nav"
                        data-footer-nav
                        style={{ display: navItems.length === 0 ? 'none' : undefined }}
                    >
                        <ul>
                            {navItems.map((item, i) => (
                                <li key={i}>
                                    <a href={item.url}>{item.label}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ── Row 4: Copyright ── */}
                    <div className="footer-copy-right">
                        <p data-footer-copyright>{copyright}</p>
                    </div>

                </div>
            </div>

            {/* Client-side HubDB fetch */}
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

    function parseCard(raw, defaultLabel, defaultEmail, defaultCtaText, defaultCtaUrl) {
        if (!raw) return { label: defaultLabel, email: defaultEmail, emailHref: 'mailto:' + defaultEmail, ctaText: defaultCtaText, ctaUrl: defaultCtaUrl, iconUrl: 'mailto:' + defaultEmail };
        var temp = document.createElement('div');
        temp.innerHTML = raw;

        var lblElem = temp.querySelector('.label') || temp.querySelector('span');
        var label = lblElem ? sh(lblElem.textContent) : defaultLabel;

        var mainLink = temp.querySelector('.main-contact-link') || temp.querySelector('h3 a') || temp.querySelector('h3');
        var emailStr = mainLink ? sh(mainLink.textContent) : (email(raw) || defaultEmail);
        var emailHref = (mainLink && mainLink.getAttribute && mainLink.getAttribute('href')) || ('mailto:' + emailStr);

        var ctaLink = temp.querySelector('.cta-link') || temp.querySelectorAll('a')[1] || temp.querySelector('a');
        var ctaText = ctaLink ? sh(ctaLink.textContent) : defaultCtaText;
        var ctaUrl = (ctaLink && ctaLink.getAttribute && ctaLink.getAttribute('href')) || defaultCtaUrl;

        var iconLink = temp.querySelector('.bar-icons a') || temp.querySelector('a');
        var iconUrl = (iconLink && iconLink.getAttribute && iconLink.getAttribute('href')) || emailHref;

        return { label: label, email: emailStr, emailHref: emailHref, ctaText: ctaText, ctaUrl: ctaUrl, iconUrl: iconUrl };
    }

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

        /* ── social icons ── */
        var soc = q('data-footer-social');
        var hashElem = q('data-footer-hashtag');
        if (soc && v.footer_social_icon) {
            soc.innerHTML = v.footer_social_icon;
            if (soc.querySelector('h6') && hashElem) {
                hashElem.style.display = 'none';
            }
            var socAs = soc.querySelectorAll('a');
            for (var si = 0; si < socAs.length; si++) {
                socAs[si].setAttribute('target', '_blank');
                socAs[si].setAttribute('rel', 'noopener noreferrer');
            }
        }

        /* ── registration ── */
        var regC = parseCard(v.registration_support, 'Registration Support', 'laura@gaiinsights.com', 'Secure Your Spot \u2192', 'https://www.gaiworld.com/buy-tickets');
        var rel = q('data-footer-reg-label'); if (rel) rel.textContent = regC.label;
        var re  = q('data-footer-reg-email'); if (re) { re.textContent = regC.email; re.setAttribute('href', regC.emailHref); }
        var rl  = q('data-footer-reg-link');  if (rl) { rl.textContent = regC.ctaText; rl.setAttribute('href', regC.ctaUrl); }
        var rm  = q('data-footer-reg-mailto');if (rm) rm.setAttribute('href', regC.iconUrl);

        /* ── sponsorship ── */
        var sponC = parseCard(v.sponsorship_detail, 'Sponsorships', 'mdavis@gaiinsights.com', 'Become a Sponsor \u2192', 'https://www.gaiworld.com/sponsors#sponsor-form');
        var sel = q('data-footer-spon-label'); if (sel) sel.textContent = sponC.label;
        var se  = q('data-footer-spon-email'); if (se) { se.textContent = sponC.email; se.setAttribute('href', sponC.emailHref); }
        var sl  = q('data-footer-spon-link');  if (sl) { sl.textContent = sponC.ctaText; sl.setAttribute('href', sponC.ctaUrl); }
        var sm  = q('data-footer-spon-mailto');if (sm) sm.setAttribute('href', sponC.iconUrl);

        /* ── speakers / press inquiries ── */
        var spkC = parseCard(v.speakers_application, 'Press Inquiries', 'karin@gaiinsights.com', 'Apply to Inquiries \u2192', 'mailto:karin@gaiinsights.com');
        var skel = q('data-footer-spk-label'); if (skel) skel.textContent = spkC.label;
        var ske  = q('data-footer-spk-email'); if (ske) { ske.textContent = spkC.email; ske.setAttribute('href', spkC.emailHref); }
        var skl  = q('data-footer-spk-link');  if (skl) { skl.textContent = spkC.ctaText; skl.setAttribute('href', spkC.ctaUrl); }
        var skm  = q('data-footer-spk-mailto');if (skm) skm.setAttribute('href', spkC.iconUrl);

        /* ── copyright ── */
        var cp = q('data-footer-copyright');
        if (cp && v.copyright_text) cp.textContent = sh(v.copyright_text);

        /* ── footer nav ── */
        var nav = q('data-footer-nav');
        if (nav && v.footer_menu) {
            var links = parseMenu(v.footer_menu);
            if (links.length > 0) {
                var ul = nav.querySelector('ul');
                var htmlStr = links.map(function(l) {
                    return '<li><a href="' + esc(l.url) + '">' + esc(l.label) + '</a></li>';
                }).join('');
                if (ul) { ul.innerHTML = htmlStr; } else { nav.innerHTML = '<ul>' + htmlStr + '</ul>'; }
                nav.style.display = '';
            }
        }
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
            default="#GAIWorld2026"
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

const _o = '\x7b\x25';
const _c = '\x25\x7d';
export const hublDataTemplate =
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
    _o + ' set _db = {"footer_logo": {"url": _lu, "altText": _la}, "footer_logo_url": _ll, "registration_support": _reg, "sponsorship_detail": _sp, "speakers_application": _spk, "footer_social_icon": _soc, "footer_menu": _fm, "copyright_text": _cp} ' + _c +
    _o + ' set hublData = {"menuItems": _menu_items, "db": _db} '                                  + _c;
