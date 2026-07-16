import {
  ModuleFields,
  TextField,
  RepeatedFieldGroup,
} from '@hubspot/cms-components/fields';
import './styles.css';

interface Stat {
  num?: string;
  description?: string;
}

interface FieldValues {
  stats: Stat[];
}

export function Component({ fieldValues }: { fieldValues: FieldValues; hublParameters?: any; hublData?: any }) {
  const defaultStats = [
    { num: '3', description: 'Days' },
    { num: '60+', description: 'Speakers' },
    { num: '1,000', description: 'In-person attendees' },
    { num: '12+', description: 'Hours of Claude training' },
    { num: '35+', description: 'Sessions' },
  ];

  // Use configured stats if available, otherwise use defaults
  const stats = (fieldValues.stats && fieldValues.stats.length > 0) ? fieldValues.stats : defaultStats;

  return (
    <section className="gw gw-section gw-section--white gw-statshighlights">
      <div className="gw-wrap">
        <div className="gw-statshighlights-stats">
          {stats.map((st, idx) => (
            <div key={idx} className="gw-statshighlights-stat">
              <span className="gw-statshighlights-stat__num">{st.num || 'N/A'}</span>
              <span className="gw-statshighlights-stat__label">{st.description || 'Stat'}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export const meta = {
  label: 'GW — Stats',
};

export const fields = (
  <ModuleFields>
    <RepeatedFieldGroup
      name="stats"
      label="Stats"
      occurrence={{ min: 0, max: 6, default: 5 }}
      default={[
        { num: '3', description: 'Days' },
        { num: '60+', description: 'Speakers' },
        { num: '1,000', description: 'In-person attendees' },
        { num: '12+', description: 'Hours of Claude training' },
        { num: '35+', description: 'Sessions' },
      ]}
      children={[
        <TextField
          name="num"
          label="Number"
          default=""
        />,
        <TextField
          name="description"
          label="Description"
          default=""
        />,
      ]}
    />
  </ModuleFields>
);
