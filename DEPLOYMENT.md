# Deployment Instructions

This application is built as a static website and can be deployed to any static hosting platform.

## Build for Production

Run the following command to create a production build:

```bash
npm run build
```

This will generate optimized static files in the `dist/` directory.

## Build Output

The build process creates:
- `dist/index.html` - Main HTML file
- `dist/assets/` - Bundled CSS and JavaScript files
- `dist/vite.svg` - Favicon

All files are static (HTML, CSS, JS) with no Node.js runtime dependencies.

## Deployment Options

### Option 1: Netlify

1. Install Netlify CLI (optional):
   ```bash
   npm install -g netlify-cli
   ```

2. Deploy using drag-and-drop:
   - Go to https://app.netlify.com/drop
   - Drag the `dist/` folder to the upload area

3. Or deploy via CLI:
   ```bash
   netlify deploy --prod --dir=dist
   ```

### Option 2: Vercel

1. Install Vercel CLI (optional):
   ```bash
   npm install -g vercel
   ```

2. Deploy via CLI:
   ```bash
   vercel --prod
   ```

3. Or connect your Git repository at https://vercel.com

### Option 3: GitHub Pages

1. Build the project:
   ```bash
   npm run build
   ```

2. Push the `dist/` folder to the `gh-pages` branch:
   ```bash
   git subtree push --prefix dca-bitcoin-tracker/dist origin gh-pages
   ```

3. Enable GitHub Pages in repository settings, selecting the `gh-pages` branch

### Option 4: Any Static Host

Simply upload the contents of the `dist/` directory to any static hosting service:
- AWS S3 + CloudFront
- Google Cloud Storage
- Azure Static Web Apps
- Cloudflare Pages
- Firebase Hosting

## Local Testing

Test the production build locally before deploying:

```bash
npm run preview
```

This will serve the built files at http://localhost:4173/

## Configuration Notes

- The app uses `base: './'` in `vite.config.js` for relative paths, making it work in any subdirectory
- All data is stored in browser LocalStorage - no backend required
- No environment variables needed
- No server-side rendering or API endpoints

## Verification Checklist

Before deploying, verify:
- ✅ Build completes without errors
- ✅ `dist/` folder contains only static files (HTML, CSS, JS)
- ✅ Preview server runs successfully
- ✅ All features work in production build
- ✅ No Node.js dependencies in runtime
- ✅ LocalStorage functionality works correctly
