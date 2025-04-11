# Gradebook Documentation

This directory contains auto-generated documentation for the Gradebook application:

- [Frontend Documentation](./frontend/index.html) - Documentation for the Angular frontend
- [Backend Documentation](./backend/index.html) - Documentation for the NestJS backend API

## Generating Documentation Locally

To generate documentation locally:

1. Navigate to the project root directory
2. Run the documentation generation script:

```bash
node docs/scripts/generate-docs.js
```

3. Open the generated documentation:

```bash
# On Windows
start docs/index.html

# On macOS
open docs/index.html

# On Linux
xdg-open docs/index.html
```

## Documentation Structure

- Frontend documentation is organized by components, services, and interfaces
- Backend documentation is organized by controllers, services, and entities

## Automatic Documentation Generation

Documentation is automatically generated and published to GitHub Pages when changes are merged to the main branch.