# Water Dispenser Locations Map

A Vue.js web application that displays water dispenser locations on an interactive map using OpenLayers, WFS-T (Transactional Web Feature Service), and PostgreSQL/PostGIS.

## Project Description

This application helps users find and manage water dispenser locations through an interactive map interface. Users can view, add, edit, and delete water dispenser locations with different types (still, sparkling, filtered) and locations (indoor/outdoor). The project is built with Vue 3, TypeScript, OpenLayers, and GeoServer, following accessibility standards (WCAG) and responsive design principles.

## Features

- **Interactive Map**: OpenLayers-based map with zoom controls, scale line, and fullscreen mode
- **Water Dispenser Management**: 
  - Add new water dispensers with location, type, and details
  - Edit existing dispensers
  - Delete dispensers
  - Click on markers to view/edit details
- **Visual Coding System**:
  - Color-coded markers by water type (Blue=Still, Red=Sparkling, Green=Filtered)
  - Shape-coded by location (Circle=Outdoor, Square=Indoor)
  - Text labels on markers (S, SP, F)
- **WFS-T Integration**: Real-time data synchronization with GeoServer
- **PostgreSQL/PostGIS Backend**: Robust spatial database storage
- **Responsive Design**: Works on mobile (portrait/landscape), tablet, and desktop
- **Accessibility**: WCAG compliant, keyboard navigable, screen reader compatible
- **TypeScript**: Full type safety throughout the application
- **ESLint**: Code quality with @dataport/eslint-config-geodev

## Requirements

- Node.js: ^20.19.0 || >=22.12.0
- npm or yarn
- PostgreSQL 15+ with PostGIS extension
- GeoServer 2.24+ (running on http://localhost:8080/geoserver)
- Modern web browser (Chrome, Firefox, Safari, Edge)





## Installation & Setup

### Prerequisites

- Node.js v20.19.0 or >= 22.12.0
- npm or yarn
- PostgreSQL 15+ with PostGIS extension
- GeoServer 2.24+
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Git (for version control)

### Step 1: Install PostgreSQL with PostGIS

1. Download and install PostgreSQL from https://www.postgresql.org/download/
2. During installation, use Stack Builder to install PostGIS extension
3. Remember your postgres user password

### Step 2: Create Database and Table

Open pgAdmin or psql and run:

```sql
CREATE DATABASE water_dispensers;
\c water_dispensers
CREATE EXTENSION postgis;

CREATE TABLE dispensers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    water_types VARCHAR(255),
    is_indoor BOOLEAN DEFAULT false,
    floor VARCHAR(100),
    description TEXT,
    the_geom GEOMETRY(Point, 4326)
);

CREATE INDEX idx_dispensers_geom ON dispensers USING GIST(the_geom);
```

### Step 3: Configure GeoServer

1. Access GeoServer Admin: http://localhost:8080/geoserver
2. Login (default: admin/geoserver)
3. Create Workspace:
   - Go to **Workspaces** → **Add new workspace**
   - Name: `water_dispensers`
   - Namespace URI: `http://water_dispensers`
   - Click **Save**

4. Add PostGIS Data Store:
   - Go to **Stores** → **Add new Store** → **PostGIS**
   - Workspace: `water_dispensers`
   - Data Source Name: `dispensers_postgis`
   - host: `localhost`
   - port: `5432`
   - database: `water_dispensers`
   - schema: `public`
   - user: `postgres`
   - passwd: (your postgres password)
   - Check: **Expose primary keys**
   - Click **Save**

5. Publish Layer:
   - Click **Publish** next to the `dispensers` table
   - Name: `dispensers`
   - Click **Compute from data** and **Compute from native bounds**
   - Click **Save**

6. Enable WFS-T:
   - Go to **Services** → **WFS**
   - Ensure Service Level is "Complete" or "Transactional"
   - Click **Submit**

### Step 4: Setup Frontend Application

```bash
# Clone the repository
git clone <your-repository-url>
cd geoweb-water-dispenser

# Install dependencies
npm install

# Start development server
npm run dev
```

Application will be available at http://localhost:5173

### Verification Checklist

- [ ] PostgreSQL installed and running
- [ ] PostGIS extension enabled
- [ ] `dispensers` table created
- [ ] GeoServer running (http://localhost:8080/geoserver accessible)
- [ ] GeoServer workspace `water_dispensers` created
- [ ] PostGIS store configured and connected
- [ ] Layer `water_dispensers:dispensers` published
- [ ] WFS-T enabled
- [ ] Node.js and npm installed
- [ ] Frontend dependencies installed
- [ ] Development server running (http://localhost:5173 accessible)
- [ ] Map displays correctly
- [ ] Can add, edit, and delete dispensers



## Development Commands

### Install Dependencies
```bash
npm install
```

### Development Server (with hot reload)
```bash
npm run dev
```
Application available at http://localhost:5173

### Build for Production
```bash
npm run build
```
Built files will be in the `dist` directory

### Preview Production Build
```bash
npm run preview
```

### Code Quality Checks
```bash
# Run ESLint
npm run lint

# TypeScript type checking
npm run type-check
```

## Development Workflow

1. **Ensure PostgreSQL is running**
   - Check Services: postgresql-x64-16 should be "Running"

2. **Ensure GeoServer is running**
   - Access: http://localhost:8080/geoserver
   - Should show GeoServer admin interface

3. **Start Frontend Dev Server**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   - Navigate to http://localhost:5173
   - Map should load with existing dispensers

5. **Make Changes**
   - Edit Vue components in `src/`
   - Changes hot-reload automatically
   - Check browser console for errors

6. **Test Features**
   - Add new dispensers by clicking "Add New Dispenser"
   - Click on markers to edit/delete
   - Check different water types and locations
   - Test on mobile devices

## Code Quality

**ESLint Configuration:**
- Using @dataport/eslint-config-geodev
- Enforces GIS development best practices
- Run: `npm run lint`

**TypeScript:**
- Strict mode enabled
- Full type coverage
- No `any` types allowed
- Run: `npm run type-check`

## Project Structure

```
geoweb-water-dispenser/
├── public/                  # Static assets
│   └── favicon.ico
├── src/
│   ├── assets/             # CSS and styles
│   │   └── main.css        # Global styles with accessibility features
│   ├── components/         # Vue components
│   │   └── MapView.vue     # Main map component with CRUD operations
│   ├── services/           # Service classes
│   │   └── wfsService.ts   # WFS service utilities
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts        # Interfaces for WaterDispenser, etc.
│   ├── App.vue             # Root component with layout
│   ├── main.ts             # Application entry point
│   └── env.d.ts            # TypeScript declarations
├── index.html              # HTML entry point with semantic structure
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration (strict mode)
├── tsconfig.node.json      # TypeScript config for Node
├── .eslintrc.json          # ESLint configuration
├── package.json            # Project dependencies
├── README.md               # This file
└── SETUP.md                # Detailed setup instructions
```

## Technologies Used

- **Vue 3**: Progressive JavaScript framework with Composition API
- **TypeScript**: Typed superset of JavaScript (strict mode)
- **OpenLayers 10**: High-performance web mapping library
- **PostgreSQL + PostGIS**: Spatial database for storing dispenser locations
- **GeoServer**: OGC-compliant server for WFS-T operations
- **Vite**: Next-generation frontend build tool
- **ESLint**: Code quality with @dataport/eslint-config-geodev

## Architecture

**Frontend (Vue 3 + TypeScript):**
- MapView component handles map rendering and user interactions
- WFS-T transactions for Create, Read, Update, Delete operations
- OpenLayers for map visualization and controls
- Responsive CSS with mobile-first approach

**Backend (GeoServer + PostgreSQL):**
- GeoServer provides WFS-T endpoint
- PostgreSQL with PostGIS stores spatial data
- Auto-incrementing IDs for unique feature identification
- Spatial indexing for performance

**Data Flow:**
1. User interacts with map (add/edit/delete)
2. Frontend sends WFS-T transaction to GeoServer
3. GeoServer validates and writes to PostgreSQL
4. Frontend refreshes and displays updated data
5. Map automatically zooms to show all features

## Accessibility (WCAG Compliance)

This application follows WCAG 2.1 Level AA guidelines:

**Semantic HTML:**
- Proper use of `<header>`, `<main>`, `<footer>`, `<section>`, `<aside>`
- Semantic form elements with labels
- Proper heading hierarchy

**Keyboard Navigation:**
- All interactive elements accessible via Tab key
- Map controls keyboard accessible
- Form inputs navigable with Tab/Shift+Tab
- Enter key submits forms

**ARIA Support:**
- `role="application"` for map container
- `role="complementary"` for sidebars
- `aria-label` on interactive elements
- Proper form labels with `for` attributes

**Visual Accessibility:**
- High contrast colors for markers
- Focus indicators on all interactive elements
- Responsive typography with `clamp()`
- Skip to main content link

**Screen Reader Compatibility:**
- Tested with NVDA (Windows)
- Descriptive labels for all controls
- Status messages for actions

## Testing

**Responsive Design Testing:**
- ✅ Mobile portrait (320px - 768px)
- ✅ Mobile landscape
- ✅ Tablet (768px - 1024px)
- ✅ Desktop (1024px+)

**Browser Testing:**
- Chrome/Edge (Chromium)
- Firefox
- Safari

**Accessibility Testing:**
- Keyboard navigation
- Screen reader (NVDA)
- Lighthouse accessibility audit (target: 100%)
- Color contrast checker

**Functional Testing:**
- Add new dispensers
- Edit existing dispensers
- Delete dispensers
- Map zoom and pan
- Marker click interactions
- Form validation

## Troubleshooting

**Map doesn't load:**
- Check GeoServer is running: http://localhost:8080/geoserver
- Verify PostgreSQL service is running
- Check browser console for errors

**Can't add dispensers:**
- Ensure WFS-T is enabled in GeoServer
- Check layer is not read-only
- Verify PostgreSQL user has write permissions

**Features not displaying:**
- Click "🔄 Refresh Map" button
- Check WFS URL in browser: http://localhost:8080/geoserver/water_dispensers/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=water_dispensers:dispensers&outputFormat=application/json
- Verify data exists in PostgreSQL: `SELECT * FROM dispensers;`

**Delete removes all features:**
- This was fixed - ensure you're using the latest code
- Features should have unique IDs from PostgreSQL SERIAL column

## Future Enhancements

- Clustering for overlapping markers
- Search/filter by water type or location
- User authentication
- Mobile app version
- Export data to CSV/GeoJSON
- Routing to nearest dispenser

## License

This project is for educational purposes as part of the GeoWeb course at HAW-Kiel.

## Author

Ousman Camara
HAW-Kiel, GeoWeb Course
December 2025

## Acknowledgments

- OpenLayers community
- GeoServer project
- PostGIS developers
- Vue.js team
