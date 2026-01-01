import {
  ModuleFields,
  TextField,
} from '@hubspot/cms-components/fields';

export function Component({ fieldValues }) {
  const sectionId = fieldValues.sectionId || '';

  // Only render if sectionId is provided, and make it completely invisible
  if (!sectionId) {
    return null;
  }

  return (
    <div 
      id={sectionId} 
      style={{ 
        height: '0', 
        width: '100%', 
        margin: '0', 
        padding: '0', 
        overflow: 'hidden',
        visibility: 'hidden',
        pointerEvents: 'none',
        position: 'relative'
      }} 
      aria-hidden="true"
    ></div>
  );
}

export const fields = (
  <ModuleFields>
    <TextField
      name="sectionId"
      label="Section ID"
      required={true}
      helpText="ID for anchor links (e.g., #my-section). This section will be completely invisible and used only as an anchor point."
    />
  </ModuleFields>
);

export const meta = {
  label: 'Empty Section',
};

