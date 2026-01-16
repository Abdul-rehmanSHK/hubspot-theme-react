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
              const childNavItems = item.childNavItems || [];
              const hasChildren = childNavItems.length > 0;
              
              return (
                <li className={`nav-item ${hasChildren ? 'nav-item-dropdown' : ''} ${isActive ? 'active' : ''}`} key={index}>
                  {hasChildren ? (
                    <>
                      <span className="nav-link nav-link-dropdown">
                        {item.text}
                        <i className="fa-solid fa-chevron-down dropdown-icon"></i>
                      </span>
                      <ul className="nav-dropdown-menu">
                        {childNavItems.map((childItem, childIndex) => {
                          const childLinkUrl = getUrl(childItem.link);
                          const childOpenInNewWindow = childItem.openInNewWindow === true || childItem.openInNewWindow === 'true';
                          const childIsActive = childItem.active === true || childItem.active === 'true';
                          return (
                            <li key={childIndex}>
                              <a
                                className={`nav-dropdown-link ${childIsActive ? 'active' : ''}`}
                                href={childLinkUrl}
                                target={childOpenInNewWindow ? '_blank' : undefined}
                                rel={childOpenInNewWindow ? 'noopener noreferrer' : undefined}
                              >
                                {childItem.text}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  ) : (
                    <a
                      className="nav-link"
                      href={linkUrl}
                      target={openInNewWindow ? '_blank' : undefined}
                      rel={openInNewWindow ? 'noopener noreferrer' : undefined}
                    >
                      {item.text}
                    </a>
                  )}
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

            // Handle navigation links (only non-dropdown links)
            document.querySelectorAll('.header .nav-link:not(.nav-link-dropdown)').forEach(function(link) {
              link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                // Only handle if not opening in new window
                if (!this.getAttribute('target')) {
                  handleAnchorClick(e, href);
                }
              });
            });

            // Handle dropdown navigation - hover for desktop, click toggle for mobile/tablet
            document.querySelectorAll('.header .nav-item-dropdown').forEach(function(dropdownItem) {
              const dropdownMenu = dropdownItem.querySelector('.nav-dropdown-menu');
              const navLink = dropdownItem.querySelector('.nav-link-dropdown');
              
              if (dropdownMenu && navLink) {
                // Check if device is mobile/tablet (small screen)
                function isMobileOrTablet() {
                  return window.innerWidth <= 991;
                }
                
                // Flag to track if nav link was just clicked (to prevent click-outside from interfering)
                var navLinkJustClicked = false;
                
                // Handle click on nav link for mobile/tablet ONLY
                // Use both click and touchstart for better mobile support
                function handleNavLinkClick(e) {
                  if (isMobileOrTablet()) {
                    // Set flag to prevent click-outside handler from running
                    navLinkJustClicked = true;
                    setTimeout(function() {
                      navLinkJustClicked = false;
                    }, 200);
                    
                    if (e) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                    
                    // Directly check and toggle
                    var hasActiveClass = dropdownItem.classList.contains('active');
                    
                    if (hasActiveClass) {
                      // Currently open - CLOSE it
                      dropdownItem.classList.remove('active');
                      navLink.classList.remove('dropdown-active');
                    } else {
                      // Currently closed - OPEN it
                      // Close other open dropdowns first
                      document.querySelectorAll('.header .nav-item-dropdown.active').forEach(function(item) {
                        if (item !== dropdownItem) {
                          item.classList.remove('active');
                          var otherLink = item.querySelector('.nav-link-dropdown');
                          if (otherLink) {
                            otherLink.classList.remove('dropdown-active');
                          }
                        }
                      });
                      // Open this dropdown
                      dropdownItem.classList.add('active');
                      navLink.classList.add('dropdown-active');
                    }
                  }
                }
                
                navLink.addEventListener('click', handleNavLinkClick);
                navLink.addEventListener('touchend', function(e) {
                  handleNavLinkClick(e);
                });
                
                // Handle hover for desktop
                dropdownItem.addEventListener('mouseenter', function() {
                  if (!isMobileOrTablet()) {
                    navLink.classList.add('dropdown-active');
                  }
                });
                
                dropdownItem.addEventListener('mouseleave', function() {
                  if (!isMobileOrTablet()) {
                    navLink.classList.remove('dropdown-active');
                  }
                });
                
                // Close dropdown when clicking outside on mobile/tablet
                document.addEventListener('click', function(e) {
                  if (isMobileOrTablet() && !navLinkJustClicked) {
                    // Check if click is outside the dropdown item
                    if (!dropdownItem.contains(e.target)) {
                      dropdownItem.classList.remove('active');
                      navLink.classList.remove('dropdown-active');
                    }
                  }
                });
              }
            });

            // Handle dropdown child links
            document.querySelectorAll('.header .nav-dropdown-link').forEach(function(link) {
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
          helpText="Enter the URL for this navigation link. Leave empty if this is a dropdown parent."
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
        <RepeatedFieldGroup
          name="childNavItems"
          label="Child navigation links (dropdown)"
          helpText="Add child links to create a dropdown menu. If child links are added, the parent link will not be clickable."
          children={[
            <TextField
              name="text"
              label="Child link label"
              required={true}
            />,
            <UrlField
              name="link"
              label="Child link URL"
              required={true}
            />,
            <BooleanField
              name="openInNewWindow"
              label="Open in new window"
              default={false}
            />,
            <BooleanField
              name="active"
              label="Active"
              default={false}
              helpText="Check to mark this child navigation link as active"
            />,
          ]}
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