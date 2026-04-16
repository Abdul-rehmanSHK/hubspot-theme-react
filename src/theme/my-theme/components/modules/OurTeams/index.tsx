import {
  ModuleFields,
  TextField,
  RichTextField,
  ImageField,
  UrlField,
  RepeatedFieldGroup,
} from '@hubspot/cms-components/fields';

export function Component({ fieldValues }) {
  const {
    heading,
    teamMembers = [],
    sectionId = 'team-section',
    sectionClass = 'team-area',
  } = fieldValues;

  const getUrl = (urlField) => {
    if (!urlField) return '';
    if (typeof urlField === 'string') return urlField;
    if (typeof urlField === 'object') {
      return urlField.url || urlField.href || urlField.link || '';
    }
    return '';
  };

  return (
    <div className={sectionClass} id={sectionId}>
      {/* FontAwesome 6 StyleSheet */}
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" 
      />
      
      <div className="container">
        {heading && (
          <div className="row mb-5">
            <div className="col-12 text-center">
              <div className="main-heading" dangerouslySetInnerHTML={{ __html: heading }} />
            </div>
          </div>
        )}
        
        <div className="team-grid">
          {teamMembers.map((member, index) => {
            const profileLink = getUrl(member.profileLink);
            const imageUrl = member.image?.src || '';
            const imageAlt = member.image?.alt || member.memberName || 'Team Member';
            
            return (
              <div key={index} className="team-card">
                {profileLink ? (
                  <a href={profileLink} target="_blank" rel="noopener">
                    {imageUrl && (
                      <img 
                        src={imageUrl} 
                        alt={imageAlt} 
                        loading="lazy" 
                      />
                    )}
                  </a>
                ) : (
                  imageUrl && (
                    <img 
                      src={imageUrl} 
                      alt={imageAlt} 
                      loading="lazy" 
                    />
                  )
                )}
                
                {member.memberName && <h3>{member.memberName}</h3>}
                {member.designation && <p className="designation">{member.designation}</p>}
                {member.description && (
                  <div className="desc" dangerouslySetInnerHTML={{ __html: member.description }} />
                )}
                
                <div className="social">
                  {(member.socialLinks || []).map((social, sIndex) => {
                    const socialUrl = getUrl(social.socialUrl);
                    if (!socialUrl) return null;
                    
                    return (
                      <a key={sIndex} href={socialUrl} target="_blank" rel="noopener">
                        <i className={social.iconClass || 'fas fa-globe'}></i>
                      </a>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const fields = (
  <ModuleFields>
    <RichTextField
      name="heading"
      label="Section Heading"
      default="<h2>Meet Our Team</h2>"
    />
    <RepeatedFieldGroup
      name="teamMembers"
      label="Team Members"
      default={[]}
      children={[
        <TextField
          name="memberName"
          label="Name"
          default="Team Member Name"
        />,
        <TextField
          name="designation"
          label="Designation"
          default="Co-Founder"
        />,
        <ImageField
          name="image"
          label="Profile Image"
        />,
        <UrlField
          name="profileLink"
          label="Profile/Substack Link"
          helpText="Optional link surrounding the image"
        />,
        <RichTextField
          name="description"
          label="Biography/Description"
          default="<p>Member biography goes here...</p>"
        />,
        <RepeatedFieldGroup
          name="socialLinks"
          label="Social Links"
          children={[
            <TextField
              name="iconClass"
              label="Icon CSS Class"
              default="fab fa-linkedin-in"
              helpText="FontAwesome class (e.g., fab fa-linkedin-in, fas fa-globe)"
            />,
            <UrlField
              name="socialUrl"
              label="Social URL"
            />,
          ]}
        />,
      ]}
    />
    <TextField
      name="sectionId"
      label="Section ID"
      default="team-section"
    />
    <TextField
      name="sectionClass"
      label="Section CSS Class"
      default="team-area"
    />
  </ModuleFields>
);

export const meta = {
  label: 'Our Teams',
};
