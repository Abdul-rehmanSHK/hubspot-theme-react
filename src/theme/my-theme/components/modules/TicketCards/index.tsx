import {
  ModuleFields,
  TextField,
  RepeatedFieldGroup,
  RichTextField,
  UrlField,
  BooleanField,
} from '@hubspot/cms-components/fields';

const getUrl = (urlField) => {
  if (!urlField) return '#';
  if (typeof urlField === 'string') return urlField;
  if (typeof urlField === 'object') {
    return urlField.url || urlField.href || urlField.link || '#';
  }
  return '#';
};

export function Component({ fieldValues }) {
  const contentAbove = fieldValues.contentAbove || '';
  const cards = fieldValues.cards || [];
  const footerInfo = fieldValues.footerInfo || '';

  return (
    <div className="list-cards">
      <div className="container">
        {contentAbove && (
          <div className="list-cards-intro" dangerouslySetInnerHTML={{ __html: contentAbove }} />
        )}
        <div className="card-grid">
          {cards.map((card, index) => {
            const content = card.content || '';
            const buttonText = card.buttonText || '';
            const buttonUrl = getUrl(card.buttonUrl) || '#';
            const buttonOpenInNewWindow = card.buttonOpenInNewWindow || false;
            return (
              <div key={index} className="card">
                <div className="card-body">
                  {content && (
                    <div
                      className="card-body-content"
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  )}
                  {buttonText && (
                    <div className="hero-cta-buttons">
                      <a
                        href={buttonUrl}
                        className="fill-btn"
                        target={buttonOpenInNewWindow ? '_blank' : undefined}
                        rel={buttonOpenInNewWindow ? 'noopener noreferrer' : undefined}
                      >
                        {buttonText}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {footerInfo && (
          <div className="footer-info" dangerouslySetInnerHTML={{ __html: footerInfo }} />
        )}
      </div>
    </div>
  );
}

export const fields = (
  <ModuleFields>
    <RichTextField
      name="contentAbove"
      label="Content above cards"
      default=""
      helpText="Optional rich text shown above the ticket cards. Leave empty to hide."
    />
    <RepeatedFieldGroup
      name="cards"
      label="Cards"
      helpText="Add one or more ticket cards. Each card has body content and a button."
      children={[
        <RichTextField
          name="content"
          label="Card content"
          default=""
          helpText="Rich text content for this card (above the button)."
        />,
        <TextField
          name="buttonText"
          label="Button text"
          default="Buy Tickets"
        />,
        <UrlField
          name="buttonUrl"
          label="Button URL"
          helpText="Link for the button (e.g. #buy-tickets or full URL)."
        />,
        <BooleanField
          name="buttonOpenInNewWindow"
          label="Open button in new window"
          default={false}
        />,
      ]}
    />
    <RichTextField
      name="footerInfo"
      label="Footer info (below all cards)"
      default=""
      helpText="Optional text below the ticket cards (e.g. payment info, contact note). Leave empty to hide."
    />
  </ModuleFields>
);

export const meta = {
  label: 'Ticket Cards',
};
