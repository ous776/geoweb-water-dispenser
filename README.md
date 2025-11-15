# Water Dispenser Locations Map

A Vue.js web application that displays water dispenser locations on an interactive map using OpenLayers, WMS, and WFS services.

## Project Description

This application helps users find water dispenser locations in their area through an interactive map interface. The project is built with Vue 3, TypeScript, and OpenLayers, following accessibility standards (WCAG) and responsive design principles.

## Features

- Interactive map with OpenLayers
- WMS (Web Map Service) integration for base layers
- WFS (Web Feature Service) for water dispenser locations
- Fully responsive design (mobile portrait/landscape, tablet, desktop)
- Accessible interface (WCAG compliant, keyboard navigable, screen reader compatible)
- TypeScript for type safety
- ESLint with @dataport/eslint-config-geodev

## Requirements

- Node.js: ^20.19.0 || >=22.12.0
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <your-repository-url>
cd geoweb-water-dispenser
```

2. Install dependencies:
```bash
npm install
```

## Development

Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Build

Build for production:
```bash
npm run build
```

The built files will be in the `dist` directory.

## Preview Production Build

Preview the production build locally:
```bash
npm run preview
```

## Linting

Run ESLint to check code quality:
```bash
npm run lint
```

## Type Checking

Run TypeScript type checking:
```bash
npm run type-check
```

## Project Structure

```
geoweb-water-dispenser/
├── public/              # Static assets
├── src/
│   ├── assets/         # CSS and other assets
│   ├── components/     # Vue components
│   │   └── MapView.vue # Main map component
│   ├── App.vue         # Root component
│   ├── main.ts         # Application entry point
│   └── env.d.ts        # TypeScript declarations
├── index.html          # HTML entry point
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Project dependencies
```

## Technologies Used

- **Vue 3**: Progressive JavaScript framework
- **TypeScript**: Typed superset of JavaScript
- **OpenLayers**: High-performance mapping library
- **Vite**: Next-generation frontend tooling
- **ESLint**: Code quality and style checking

## Accessibility

This application follows WCAG guidelines:
- Semantic HTML tags
- Keyboard navigation support
- ARIA labels and roles
- Focus indicators
- Screen reader compatibility
- Skip to main content link

## Testing

Test the application on:
- Mobile devices (portrait and landscape)
- Tablets
- Desktop browsers
- Screen readers (NVDA, JAWS, VoiceOver)
- Lighthouse accessibility audit (target: 100%)

## License

This project is for educational purposes.

## Author

[Your Name]
