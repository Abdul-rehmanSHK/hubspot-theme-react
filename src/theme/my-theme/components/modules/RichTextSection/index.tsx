import { ModuleFields, TextField, RichTextField } from '@hubspot/cms-components/fields';

export function Component({ fieldValues }) {
  const sectionClass = fieldValues.sectionClass || 'enterprise-hero';
  const richText = fieldValues.richText || '';

  return (
    <div className={sectionClass}>
      <div className="container">
        <div className="enterprise-hero-inner" dangerouslySetInnerHTML={{ __html: richText }} />
      </div>
    </div>
  );
}

export const fields = (
  <ModuleFields>
    <TextField
      name="sectionClass"
      label="Section CSS class"
      default="enterprise-hero"
      helpText="CSS class for the section wrapper. Default: enterprise-hero"
    />
    <RichTextField
      name="richText"
      label="Rich text"
      default=""
      helpText="Content for this section."
    />
  </ModuleFields>
);

export const meta = {
  label: 'Rich Text',
};
