# Pageant Calculator

## Overview
Pageant Calculator is a Progressive Web App (PWA) designed to streamline score calculation at pageant competitions. It eliminates the tedious manual counting process and provides a fast, reliable digital solution.

**Current State**: Fully functional and ready to use in the Replit environment.

## Recent Changes (December 7, 2025)
- Imported from GitHub and configured for Replit environment
- Fixed manifest.json and service worker paths (changed from `/Score-Calculator/` to `/`)
- Removed duplicate service worker registration from improved.js
- Created Python HTTP server with cache control headers
- Configured workflow to serve the application on port 5000
- Set up static deployment configuration
- Added service worker registration to index.html

## Project Architecture

### Frontend (Static PWA)
- **index.html**: Main application page with navigation and setup sections
- **stylesheet.css**: Custom styling for the pageant calculator UI
- **improved.js**: Core application logic for score calculation
- **manifest.json**: PWA manifest for installable app experience
- **sw.js**: Service worker for offline functionality and caching

### Server Setup
- **server.py**: Simple Python HTTP server that serves static files on port 5000
  - Configured with cache control headers to prevent caching issues
  - Uses `allow_reuse_address` for graceful restarts
  - Binds to `0.0.0.0:5000` for Replit compatibility

### Data Files
- **example.json**: Demo data with sample pageant scores for testing

### Assets
- **Photos/icon/icon.png**: PWA app icon (192x192 and 512x512)
- **Photos/**: Additional screenshot images

## Features
1. **Contestant Management**: Set up contestants with custom numbers
2. **Category Setup**: Define multiple scoring categories
3. **Judge Configuration**: Configure number of judges
4. **Score Entry**: Input scores in organized tables by category
5. **Outlier Removal**: Optional removal of highest/lowest scores
6. **CSV Import/Export**: 
   - Export scores to CSV
   - Download blank score sheets
   - Import scores from CSV files
7. **Demo Data**: Load sample data for testing
8. **PWA Capabilities**: 
   - Installable as standalone app
   - Offline functionality via service worker
   - LocalStorage for data persistence

## Technology Stack
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **UI Framework**: jQuery + jQuery UI (Accordion component)
- **Server**: Python 3.11 HTTP server
- **PWA**: Service Worker API, Web App Manifest

## Development

### Running Locally
The application automatically runs via the "Start application" workflow which executes:
```bash
python server.py
```

The server runs on port 5000 and serves all static files.

### Deployment
Configured as a static site deployment. The entire current directory is served as the public directory.

## User Workflow
1. Enter number of contestants, judges, and categories
2. Name each category
3. Input scores for each contestant/judge combination per category
4. Optionally enable outlier removal
5. Calculate final scores
6. Export results to CSV

## Important Notes
- All data is stored in browser localStorage
- The app works offline once loaded (PWA feature)
- Cache control headers prevent stale content in development
- Service worker caches static assets for offline use
