# GAI World 2026 - HubSpot CMS React Theme

A premium, high-performance HubSpot theme built with **React** and **Bootstrap 5**, designed specifically for the GAI Insights event ecosystem. This theme leverages HubSpot's latest CMS features, including HubDB integration and component-based modularity.

## 🚀 Key Features

-   **Component-Based Architecture:** Built using HubSpot CMS React for a modern, maintainable development experience.
-   **HubDB Powered:** Seamlessly pulls event data (speakers, attendees, sponsors) directly from HubDB tables.
-   **Fully Customizable Modules:** Every module includes a rich set of HubSpot UI fields (TextFields, ImageFields, RepeatedGroups) for no-code editing.
-   **Responsive Design:** Optimized for all screen sizes using a custom Bootstrap 5 implementation.
-   **Global Styling:** Centralized design system in `gai-insights.css` with a premium dark-mode aesthetic.

## 🛠 Recent Core Improvements

### 🆕 Footer Global V2
-   Complete overhaul of the site-wide footer.
-   Now includes full editor fields for Logos, Social Links, and Copyright text.
-   Structurally aligned with the latest site design.

### 🐛 Past Attendees Logo Banner (Fixed)
-   Resolved a critical `ReferenceError` during server-side rendering.
-   Added a new **Sponsorship Subheading** field for better context above CTA buttons.
-   Optimized the logo slider to handle dynamic data from HubDB reliably.

### 🎨 Global Styling Optimizations
-   Extracted and centralized CSS for modular reuse.
-   Refined the **Header** and **Hero** sections for a more professional look.
-   Migrated all assets to a dedicated GitHub repository for version control.

## 📂 Project Structure

```text
├── src/theme/my-theme/
│   ├── assets/             # Images, fonts, and static files
│   ├── components/
│   │   └── modules/        # React-powered HubSpot modules
│   │       ├── FooterGlobalV2/
│   │       ├── PastAttendeesLogoBanner/
│   │       └── Hero/
│   ├── styles/             # Modular and global CSS files
│   └── templates/          # HubL layout templates (page.hubl.html, base.hubl.html)
├── hs-project.json         # HubSpot project configuration
└── README.md
```

## 📝 Deployment

To deploy your changes to HubSpot, use the following commands:

1.  **Stage all changes:**
    ```bash
    git add .
    git commit -m "Describe your changes"
    ```
2.  **Upload to HubSpot:**
    ```bash
    hs project upload
    ```
3.  **Deploy Build:**
    ```bash
    hs project deploy --build=<build_number>
    ```

## 🔐 Repository Info

**Owner:** Abdul-rehmanSHK  
**Project:** hubspot-theme-react  
**URL:** [https://github.com/Abdul-rehmanSHK/hubspot-theme-react](https://github.com/Abdul-rehmanSHK/hubspot-theme-react)

---
*Created and maintained as part of the GAI World 2026 ecosystem.*
