import {
  ModuleFields,
  TextField,
  RepeatedFieldGroup,
  RichTextField,
} from '@hubspot/cms-components/fields';

export function Component({ fieldValues }) {
  const sectionClass = fieldValues.sectionClass || 'feature-banner';
  const contentAbove = fieldValues.contentAbove || '';
  const cards = fieldValues.cards || [];
  const contentBelow = fieldValues.contentBelow || '';

  return (
    <section className={sectionClass}>
      <div className="container">
        {contentAbove && (
          <div className="banner-content" dangerouslySetInnerHTML={{ __html: contentAbove }} />
        )}
        <div className="leaders-section">
          <div className="cards-grid">
            {cards.map((card, index) => (
              <div key={index} className="gai-card">
                <div className="card-text" dangerouslySetInnerHTML={{ __html: card.cardContent || '' }} />
              </div>
            ))}
          </div>
          {contentBelow && (
            <div className="section-footer" dangerouslySetInnerHTML={{ __html: contentBelow }} />
          )}
        </div>
      </div>
    </section>
  );
}

export const fields = (
  <ModuleFields>
    <TextField
      name="sectionClass"
      label="Section CSS class"
      default="feature-banner"
      helpText="CSS class for the section wrapper (e.g. feature-banner)."
    />
    <RichTextField
      name="contentAbove"
      label="Content above cards"
      default=""
      helpText="Rich text shown above the cards (banner-content area)."
    />
    <RepeatedFieldGroup
      name="cards"
      label="Cards"
      helpText="Add one or more cards. Each card has rich text content."
      children={[
        <RichTextField
          name="cardContent"
          label="Card content"
          default=""
          helpText="Rich text content for this card (card-text area)."
        />,
      ]}
    />
    <RichTextField
      name="contentBelow"
      label="Content below cards"
      default=""
      helpText="Rich text shown below the cards (section-footer area)."
    />
  </ModuleFields>
);

export const meta = {
  label: 'Event Component',
};
