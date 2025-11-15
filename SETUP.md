# Setup Instructions

## PowerShell Execution Policy Issue

If you encountered the PowerShell execution policy error, you need to run the following command in PowerShell as Administrator:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Or run commands using CMD instead of PowerShell.

## Install Dependencies

After fixing the execution policy, install all required packages:

```bash
npm install
```

This will install:
- **ol** (OpenLayers) - for map functionality
- **typescript** - for TypeScript support
- **vue-tsc** - for Vue TypeScript type checking
- **@dataport/eslint-config-geodev** - ESLint configuration
- **eslint** - code linting
- **@types/node** - Node.js type definitions

## Next Steps

1. **Configure WMS/WFS Services**: 
   - Edit `src/components/MapView.vue` to add your actual WMS and WFS service URLs
   - Replace the example WMS URL with your service
   - Configure the WFS service in the WFSService class

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Test Accessibility**:
   - Test keyboard navigation (Tab, Enter, Arrow keys)
   - Test with screen reader (NVDA on Windows)
   - Run Lighthouse audit in Chrome DevTools

4. **Test Responsiveness**:
   - Test on mobile device (portrait and landscape)
   - Test on tablet
   - Test on desktop
   - Use Chrome DevTools device emulation

5. **Lint Your Code**:
   ```bash
   npm run lint
   ```

6. **Type Check**:
   ```bash
   npm run type-check
   ```

7. **Build for Production**:
   ```bash
   npm run build
   ```

## Project Structure Created

```
✓ TypeScript configuration (tsconfig.json, tsconfig.node.json)
✓ ESLint configuration (.eslintrc.json)
✓ Main application (src/App.vue, src/main.ts)
✓ Map component (src/components/MapView.vue)
✓ WFS service (src/services/wfsService.ts)
✓ Type definitions (src/types/index.ts)
✓ Responsive CSS (src/assets/main.css)
✓ Accessible HTML (index.html)
✓ Updated README.md
✓ Updated package.json with all dependencies
```

## What's Included

### Accessibility Features
- Semantic HTML5 tags (header, main, footer, section)
- ARIA labels and roles
- Skip to main content link
- Keyboard navigation support
- Focus indicators
- Screen reader compatible

### Responsive Design
- Mobile-first approach
- Flexible layouts with flexbox
- Responsive typography with clamp()
- Media queries for different screen sizes
- Landscape orientation support

### TypeScript
- Strict type checking enabled
- Type definitions for Vue components
- Typed service classes
- Interface definitions for data models

### OpenLayers Integration
- Base OSM layer
- WMS layer support
- WFS vector layer support
- Custom marker styling
- Map controls

## Customization Needed

You'll need to customize:

1. **WMS Service URL** in `src/components/MapView.vue`
2. **WFS Service URL** in `src/components/MapView.vue`
3. **Map Center Coordinates** (currently set to Hamburg, Germany)
4. **Water Dispenser Data Source** - connect to your actual WFS service
5. **Marker Icon** - customize the SVG icon if needed

## Git Repository

Initialize Git and push to GitLab/GitHub:

```bash
git init
git add .
git commit -m "Initial commit: Water dispenser map project setup"
git remote add origin <your-repository-url>
git push -u origin main
```

Make sure your repository is public so it's accessible to course participants and the lecturer.
