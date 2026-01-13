import {
  ModuleFields,
  ImageField,
  TextField,
  UrlField,
  RepeatedFieldGroup,
  BooleanField,
} from '@hubspot/cms-components/fields';
import logo from '../../../assets/images/gai-insights-logo.png';

export function Component({ fieldValues }) {
  const navItems = fieldValues.navItems || [];
  
  // Handle UrlField structure - it can be a string or an object with url/href property
  const getUrl = (urlField) => {
    if (!urlField) return '#';
    if (typeof urlField === 'string') return urlField;
    if (typeof urlField === 'object') {
      return urlField.url || urlField.href || urlField.link || '#';
    }
    return '#';
  };
  
  const logoLink = getUrl(fieldValues.logoLink);
  const ctaLink = getUrl(fieldValues.ctaLink);

  return (
    <header className="header">
      <div className="header-wrapper">
        <div className="logo-div">
        <a href={logoLink}>
          <img src={fieldValues.logo?.src} alt={fieldValues.logo?.alt || 'Logo'} />
        </a>
      </div>
      <nav className="navbar navbar-expand-lg navbar-light">
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavDropdown"
          aria-controls="navbarNavDropdown"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNavDropdown">
          <ul className="navbar-nav">
            {navItems.map((item, index) => {
              const linkUrl = getUrl(item.link);
              const openInNewWindow = item.openInNewWindow === true || item.openInNewWindow === 'true';
              const isActive = item.active === true || item.active === 'true';
              
              return (
                <li className={`nav-item ${isActive ? 'active' : ''}`} key={index}>
                  <a
                    className="nav-link"
                    href={linkUrl}
                    target={openInNewWindow ? '_blank' : undefined}
                    rel={openInNewWindow ? 'noopener noreferrer' : undefined}
                  >
                    {item.text}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
      <div className="header-btn">
        <a 
          href={ctaLink || '#conatct-us'} 
          className="transparent-btn"
          target={fieldValues.ctaOpenInNewWindow ? '_blank' : undefined}
          rel={fieldValues.ctaOpenInNewWindow ? 'noopener noreferrer' : undefined}
        >
          {fieldValues.ctaText || 'Contact Us'}
        </a>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
          (function() {
            // Handle smooth scrolling for anchor links in header
            function handleAnchorClick(e, href) {
              // Only handle anchor links (starting with #) on same page
              if (href && href.startsWith('#') && href.length > 1) {
                e.preventDefault();
                const targetId = href.substring(1); // Remove the #
                const target = document.getElementById(targetId);
                if (target) {
                  target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                  });
                }
              }
            }

            // Handle navigation links
            document.querySelectorAll('.header .nav-link').forEach(function(link) {
              link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                // Only handle if not opening in new window
                if (!this.getAttribute('target')) {
                  handleAnchorClick(e, href);
                }
              });
            });

            // Handle CTA button
            const ctaBtn = document.querySelector('.header .transparent-btn');
            if (ctaBtn) {
              ctaBtn.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                // Only handle if not opening in new window
                if (!this.getAttribute('target')) {
                  handleAnchorClick(e, href);
                }
              });
            }

            // Handle header transparency on scroll
            const header = document.querySelector('.header');
            if (header) {
              let lastScrollTop = 0;
              let ticking = false;
              
              // Throttle function for better performance
              function throttle(func, wait) {
                let timeout;
                return function executedFunction(...args) {
                  const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                  };
                  clearTimeout(timeout);
                  timeout = setTimeout(later, wait);
                };
              }
              
              // Function to handle scroll
              function handleScroll() {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                // Add 'scrolled' class when scrolled down more than 50px
                if (scrollTop > 50) {
                  header.classList.add('scrolled');
                } else {
                  header.classList.remove('scrolled');
                }
                
                lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
                ticking = false;
              }
              
              // Throttled scroll handler (runs max once every 10ms)
              const throttledScrollHandler = throttle(handleScroll, 10);
              
              // Initial check on page load
              handleScroll();
              
              // Listen to scroll events
              window.addEventListener('scroll', function() {
                if (!ticking) {
                  window.requestAnimationFrame(throttledScrollHandler);
                  ticking = true;
                }
              }, { passive: true });
            }
          })();
        `,
        }}
      />
      </div>
    </header>
  );
}

export const fields = (
  <ModuleFields>
    <ImageField
      name="logo"
      label="Logo"
      default={{ src: logo, alt: 'GAI Insights', width: 180, height: 60 }}
      resizable={true}
    />
    <UrlField
      name="logoLink"
      label="Logo link"
    />
    <RepeatedFieldGroup
      name="navItems"
      label="Navigation links"
      required={true}
      children={[
        <TextField
          name="text"
          label="Label"
          required={true}
          default="GAI World 2025"
        />,
        <UrlField
          name="link"
          label="Link URL"
          required={true}
          helpText="Enter the URL for this navigation link"
        />,
        <BooleanField
          name="openInNewWindow"
          label="Open in new window"
          default={false}
          helpText="Check to open this link in a new tab/window"
        />,
        <BooleanField
          name="active"
          label="Active"
          default={false}
          helpText="Check to mark this navigation link as active"
        />,
      ]}
    />
    <TextField name="ctaText" label="CTA text" default="Contact Us" />
    <UrlField
      name="ctaLink"
      label="CTA link"
      helpText="URL for the Contact Us button"
    />
    <BooleanField
      name="ctaOpenInNewWindow"
      label="CTA open in new window"
      default={false}
      helpText="Check to open the CTA link in a new tab/window"
    />
  </ModuleFields>
);

export const meta = {
  label: 'GAI Header',
};