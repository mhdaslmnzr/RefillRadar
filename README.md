# RefillRadar

RefillRadar is a modern Progressive Web App (PWA) that helps users locate nearby water refill points using OpenStreetMap and Leaflet. It is designed to be fast, mobile-friendly, installable, and beautiful on all devices.

## Features
- Interactive map with user geolocation
- Nearby water refill points (drinking water, refill stations)
- Modern, minimal UI inspired by Google Maps
- Responsive design: desktop split view, mobile bottom sheet
- Language toggle (EN/DE) as a compact pill switch
- Emoji markers: 🧑 (user), 💧 (refill point)
- Floating "Locate Me" button (top right of map)
- Poppins font for all text, Waterfall font for heading
- PWA: installable, offline-ready, home screen icon
- Accessible and keyboard-friendly

## Tech Stack
- HTML5, CSS3 (custom, no frameworks)
- JavaScript (vanilla, no frameworks)
- [Leaflet.js](https://leafletjs.com/) for maps
- [OpenStreetMap](https://www.openstreetmap.org/) for data
- [Overpass API](https://overpass-api.de/) for refill points

## How to Run Locally
1. Clone or download this repo.
2. Place a `pwa.png` icon (192x192 and 512x512) in the root directory.
3. Open `Index.html` in your browser, or use a local server for best results.
4. For PWA install prompt, serve over HTTPS (e.g., with [http-server](https://www.npmjs.com/package/http-server)).

## How to Deploy (GitHub Pages or Netlify)
- **GitHub Pages:**
  1. Push your code to a GitHub repo.
  2. In repo settings, enable Pages for the `main` branch (root or `/docs`).
  3. Access your app at `https://yourusername.github.io/yourrepo/`.
- **Netlify:**
  1. Drag and drop your folder at [netlify.com](https://www.netlify.com/).
  2. Or connect your GitHub repo for auto-deploy.

## PWA Details
- Manifest: `manifest.json` with `pwa.png` as icon
- Service Worker: `service-worker.js` for offline support and font caching
- Works on Android, iOS, and desktop browsers

## License
MIT