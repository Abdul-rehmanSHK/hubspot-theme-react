import {
    ModuleFields,
    ImageField,
    TextField,
    UrlField,
    RepeatedFieldGroup,
    BooleanField,
    RichTextField,
    FormField,
} from '@hubspot/cms-components/fields';

// Helper for consistent URL handling
const getUrl = (linkField: any) => {
    if (typeof linkField === 'string') return linkField;
    return linkField?.url || linkField?.href || '#';
};

export function Component({ fieldValues, hubdbData }) {
    // Use HubDB data if available, otherwise fall back to Module Fields
    // Assuming row 0 is your primary footer data
    const db = hubdbData?.results?.[0]?.values || {};

    const {
        socialLinks = [],
        footerLinks = [],
        customRows = [],
        logo,
        footerContent,
        hashtag = db.hashtag || '#GAIWorld2026'
    } = fieldValues;

    return (
        <footer className="footer bg-primary text-white py-5">
            <div className="container">
                {/* Top Section: Logo & Socials */}
                <div className="row align-items-center mb-5">
                    <div className="col-md-6">
                        <a href={getUrl(fieldValues.footerLogoLink)}>
                            <img
                                src={db.footer_logo_url || logo?.src}
                                alt={logo?.alt || 'GAI Insights'}
                                style={{ maxWidth: '200px' }}
                            />
                        </a>
                    </div>
                    <div className="col-md-6 text-md-end">
                        <div className="social-wrapper">
                            <span className="me-3 fw-bold">{hashtag}</span>
                            {socialLinks.map((item, i) => (
                                <a key={i} href={getUrl(item.link)} className="text-white ms-2 fs-4">
                                    <i className={item.icon}></i>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content: The 4 Columns from your Screenshot */}
                <div className="row g-4 mb-5">
                    {/* Column 1: Call Us */}
                    <div className="col-lg-3 col-md-6">
                        <div className="footer-info-block">
                            <i className="fa fa-phone mb-3 fs-3"></i>
                            <h6>CALL US</h6>
                            <p className="mb-1">{db.call_us_detail || '+1 (800) 555-0199'}</p>
                            <a href={`tel:${db.call_us_detail}`} className="text-info small">Tap to call →</a>
                        </div>
                    </div>

                    {/* Column 2: Support */}
                    <div className="col-lg-3 col-md-6">
                        <div className="footer-info-block">
                            <i className="fa fa-envelope mb-3 fs-3"></i>
                            <h6>REGISTRATION SUPPORT</h6>
                            <p className="mb-1">{db.registration_support || 'registration@gaiworld.com'}</p>
                            <a href={`mailto:${db.registration_support}`} className="text-info small">Send an email →</a>
                        </div>
                    </div>

                    {/* Column 3: Sponsorship */}
                    <div className="col-lg-3 col-md-6">
                        <div className="footer-info-block">
                            <i className="fa fa-handshake mb-3 fs-3"></i>
                            <h6>SPONSORSHIPS</h6>
                            <p className="mb-1">{db.sponsorship_detail || 'sponsors@gaiworld.com'}</p>
                            <a href="/packages" className="text-info small">Explore packages →</a>
                        </div>
                    </div>

                    {/* Column 4: Speakers */}
                    <div className="col-lg-3 col-md-6">
                        <div className="footer-info-block">
                            <i className="fa fa-microphone mb-3 fs-3"></i>
                            <h6>SPEAKER APPLICATIONS</h6>
                            <p className="mb-1">{db.speakers_application || 'speakers@gaiworld.com'}</p>
                            <a href="/speak" className="text-info small">Apply to speak →</a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar: Copyright & Legal */}
                <div className="border-top pt-4">
                    <div className="row">
                        <div className="col-md-12 text-center">
                            <div className="footer-nav mb-2">
                                {footerLinks.map((item, i) => (
                                    <a key={i} href={getUrl(item.link)} className="text-white mx-3 text-decoration-none small">
                                        {item.text}
                                    </a>
                                ))}
                            </div>
                            <p className="small opacity-75">
                                © {fieldValues.copyrightYear || new Date().getFullYear()} {db.copyright_text || 'by GAI Insights'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export const fields = (
    <ModuleFields>
        {/* Keep your existing fields here */}
    </ModuleFields>
);