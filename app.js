// --- Minimal RefillRadar App (No Onboarding, No Username) ---
// Assumes new index.html and styles.css layout

let userLatLng = null;
let map = null;
let markerClusterGroup = null;
let refillPoints = [];
let routeLine = null;
let selectedMarker = null;
let showSingleCardIdx = null;
const KARLSRUHE_BOUNDS = { minLat: 48.9, maxLat: 49.2, minLon: 8.2, maxLon: 8.6 };
const KIT_UNI = { lat: 49.0128, lng: 8.4178, name: 'KIT University' };

// --- DOM Elements ---
const langSwitchApp = document.getElementById('langSwitchApp');
const locateBtn = document.getElementById('locateBtn');
const statusMessage = document.getElementById('statusMessage');
const cardsList = document.getElementById('cardsList');

// --- Language ---
const LANGUAGES = {
  en: {
    greeting: (time) => `${time}!`,
    times: [
      { from: 5, to: 11, text: 'Good morning' },
      { from: 11, to: 17, text: 'Good afternoon' },
      { from: 17, to: 22, text: 'Good evening' },
      { from: 22, to: 24, text: 'Good night' },
      { from: 0, to: 5, text: 'Good night' }
    ],
    locate: 'Locate',
    refillPoints: 'Nearby Refill Points',
    distance: 'Distance',
    noPoints: 'No refill points found',
    loading: 'Loading...',
    error: 'Error loading data.'
  },
  de: {
    greeting: (time) => `${time}!`,
    times: [
      { from: 5, to: 11, text: 'Guten Morgen' },
      { from: 11, to: 17, text: 'Guten Tag' },
      { from: 17, to: 22, text: 'Guten Abend' },
      { from: 22, to: 24, text: 'Gute Nacht' },
      { from: 0, to: 5, text: 'Gute Nacht' }
    ],
    locate: 'Lokalisieren',
    refillPoints: 'Wasserstellen in der Nähe',
    distance: 'Entfernung',
    noPoints: 'Keine Wasserstellen gefunden',
    loading: 'Lädt...',
    error: 'Fehler beim Laden der Daten.'
  }
};
let lang = localStorage.getItem('lang') || 'en';

// --- App Init ---
window.addEventListener('DOMContentLoaded', () => {
  setThemeByTime();
  getUserLocationAndInit();
  // --- Language Switcher Toggle ---
  langSwitchApp.addEventListener('click', e => {
    if (e.target.tagName === 'BUTTON' && e.target.dataset.lang) {
      setLanguage(e.target.dataset.lang);
      Array.from(langSwitchApp.children).forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
    }
  });
  locateBtn.addEventListener('click', () => {
    if (userLatLng && map) map.setView([userLatLng.lat, userLatLng.lng], 15);
  });
});

function setLanguage(newLang) {
  lang = newLang;
  localStorage.setItem('lang', lang);
  renderCards();
}
function getGreetingTime() {
  const hour = new Date().getHours();
  const t = LANGUAGES[lang].times.find(t => hour >= t.from && hour < t.to);
  return t ? t.text : '';
}
function setThemeByTime() {
  const hour = new Date().getHours();
  if (hour < 7 || hour > 20) {
    // Dark theme
    document.body.style.setProperty('--theme-bg', '#1a2233');
    document.body.style.setProperty('--theme-text', '#ffffff');
    document.body.style.setProperty('--theme-text-secondary', '#b0b8c1');
    document.body.style.setProperty('--theme-header', '#232b3b');
    document.body.style.setProperty('--theme-card', '#2a3441');
    document.body.style.setProperty('--theme-card-bg', '#2a3441');
    document.body.style.setProperty('--theme-card-selected', '#1e2a3a');
    document.body.style.setProperty('--theme-card-border', '#3a4a5a');
    document.body.style.setProperty('--theme-border', '#3a4a5a');
    document.body.style.setProperty('--theme-header-bg', '#232b3b');
    document.body.style.setProperty('--theme-primary', '#64b5f6');
    document.body.style.setProperty('--theme-secondary', '#90caf9');
    document.body.style.setProperty('--theme-status-bg', '#2d3748');
    document.body.style.setProperty('--theme-status-text', '#f7fafc');
  } else {
    // Light theme
    document.body.style.setProperty('--theme-bg', '#eaf6fb');
    document.body.style.setProperty('--theme-text', '#222222');
    document.body.style.setProperty('--theme-text-secondary', '#666666');
    document.body.style.setProperty('--theme-header', '#ffffff');
    document.body.style.setProperty('--theme-card', '#ffffff');
    document.body.style.setProperty('--theme-card-bg', '#f6fbff');
    document.body.style.setProperty('--theme-card-selected', '#eaf6fb');
    document.body.style.setProperty('--theme-card-border', '#b3e0ef');
    document.body.style.setProperty('--theme-border', '#e0e0e0');
    document.body.style.setProperty('--theme-header-bg', '#f8f9fa');
    document.body.style.setProperty('--theme-primary', '#2196f3');
    document.body.style.setProperty('--theme-secondary', '#1769aa');
    document.body.style.setProperty('--theme-status-bg', '#fff3cd');
    document.body.style.setProperty('--theme-status-text', '#856404');
  }
}
function getUserLocationAndInit() {
  if (!navigator.geolocation) {
    useMockLocation();
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos => {
      let lat = pos.coords.latitude;
      let lng = pos.coords.longitude;
      const isInKarlsruhe = lat > KARLSRUHE_BOUNDS.minLat && lat < KARLSRUHE_BOUNDS.maxLat && lng > KARLSRUHE_BOUNDS.minLon && lng < KARLSRUHE_BOUNDS.maxLon;
      if (!isInKarlsruhe) {
        useMockLocation();
      } else {
        userLatLng = { lat, lng };
        initMap();
      }
    },
    () => useMockLocation()
  );
}
function useMockLocation() {
  userLatLng = { ...KIT_UNI };
  showStatus('Using mock location: KIT University, Karlsruhe');
  initMap();
}
function initMap() {
  if (map) return;
  map = L.map('map').setView([userLatLng.lat, userLatLng.lng], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  markerClusterGroup = L.markerClusterGroup();
  map.addLayer(markerClusterGroup);
  addUserMarker(userLatLng.lat, userLatLng.lng);
  loadRefillPoints();
}
// --- Marker Icons ---
const userIcon = L.divIcon({
  className: 'user-marker',
  html: '<span style="font-size:2rem;line-height:1;">🧑</span>',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});
const refillIcon = L.divIcon({
  className: 'refill-marker',
  html: '<span style="font-size:2rem;line-height:1;">💧</span>',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

function addUserMarker(lat, lng) {
  L.marker([lat, lng], { icon: userIcon }).addTo(map).bindPopup('You are here').openPopup();
}
function loadRefillPoints() {
  showStatus(LANGUAGES[lang].loading);
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="drinking_water"](around:5000,${userLatLng.lat},${userLatLng.lng});
      node["refill:water"="yes"](around:5000,${userLatLng.lat},${userLatLng.lng});
    );
    out body;
    >;
    out skel qt;
  `;
  const url = "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);
  fetch(url)
    .then(res => res.json())
    .then(data => {
      markerClusterGroup.clearLayers();
      refillPoints = [];
      data.elements.forEach((point, idx) => {
        if (point.type !== 'node') return;
        const lat = point.lat;
        const lon = point.lon;
        const name = point.tags?.name || LANGUAGES[lang].refillPoints;
        const dist = getDistance(userLatLng.lat, userLatLng.lng, lat, lon);
        const marker = L.marker([lat, lon], { icon: refillIcon });
        marker.on('click', () => selectPoint(idx));
        markerClusterGroup.addLayer(marker);
        refillPoints.push({ name, lat, lon, tags: point.tags, dist });
      });
      refillPoints.sort((a, b) => a.dist - b.dist);
      renderCards();
      showStatus(refillPoints.length ? `${refillPoints.length} ${LANGUAGES[lang].refillPoints}` : LANGUAGES[lang].noPoints);
    })
    .catch(() => showStatus(LANGUAGES[lang].error));
}
function renderCards() {
  cardsList.innerHTML = '';
  if (!refillPoints.length) {
    cardsList.innerHTML = `<div style="color:#888;">${LANGUAGES[lang].noPoints}</div>`;
    return;
  }
  // If a single card is selected, show only that card
  if (showSingleCardIdx !== null) {
    const point = refillPoints[showSingleCardIdx];
    const card = document.createElement('div');
    card.className = 'refill-card selected';
    card.tabIndex = 0;
    card.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <div class="card-title">${point.name || 'Refill Point'}</div>
        <button class="close-details" aria-label="Close">&times;</button>
      </div>
      <div class="card-distance"><b>${LANGUAGES[lang].distance}:</b> ${Math.round(point.dist)} m</div>
      <div class="card-tags">
        <b>Type:</b> ${point.tags?.amenity === 'drinking_water' ? 'Drinking Water' : 'Refill'}<br>
        ${point.tags?.fountain ? `<b>Fountain:</b> ${point.tags.fountain}` : ''}
        ${point.tags?.fee ? `<b>Fee:</b> ${point.tags.fee}` : ''}
        ${point.tags?.operator ? `<b>Operator:</b> ${point.tags.operator}` : ''}
        ${point.tags?.wheelchair ? `<b>Wheelchair:</b> ${point.tags.wheelchair}` : ''}
      </div>
    `;
    card.querySelector('.close-details').onclick = () => {
      showSingleCardIdx = null;
      selectedMarker = null;
      if (routeLine) { map.removeLayer(routeLine); routeLine = null; }
      renderCards();
    };
    cardsList.appendChild(card);
    // Scroll card into view if needed
    setTimeout(() => card.scrollIntoView({behavior:'smooth',block:'center'}), 0);
    return;
  }
  // Show all cards
  refillPoints.forEach((point, idx) => {
    const card = document.createElement('div');
    card.className = 'refill-card' + (selectedMarker === idx ? ' selected' : '');
    card.tabIndex = 0;
    card.innerHTML = `
      <div class="card-title">${point.name || 'Refill Point'}</div>
      <div class="card-distance"><b>${LANGUAGES[lang].distance}:</b> ${Math.round(point.dist)} m</div>
      <div class="card-tags">
        <b>Type:</b> ${point.tags?.amenity === 'drinking_water' ? 'Drinking Water' : 'Refill'}<br>
        ${point.tags?.fountain ? `<b>Fountain:</b> ${point.tags.fountain}` : ''}
        ${point.tags?.fee ? `<b>Fee:</b> ${point.tags.fee}` : ''}
        ${point.tags?.operator ? `<b>Operator:</b> ${point.tags.operator}` : ''}
        ${point.tags?.wheelchair ? `<b>Wheelchair:</b> ${point.tags.wheelchair}` : ''}
      </div>
    `;
    card.onclick = () => {
      selectedMarker = idx;
      showSingleCardIdx = idx;
      map.setView([point.lat, point.lon], 16);
      drawDottedLine(userLatLng, point);
      renderCards();
    };
    card.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') card.onclick(); };
    cardsList.appendChild(card);
  });
}

// Marker click shows only that card
function selectPoint(idx) {
  selectedMarker = idx;
  showSingleCardIdx = idx;
  renderCards();
  const point = refillPoints[idx];
  map.setView([point.lat, point.lon], 16);
  drawDottedLine(userLatLng, point);
}
function drawDottedLine(from, to) {
  if (routeLine) { map.removeLayer(routeLine); routeLine = null; }
  routeLine = L.polyline([[from.lat, from.lng], [to.lat, to.lon]], {
    color: '#2196f3',
    weight: 4,
    opacity: 0.8,
    dashArray: '6, 8',
    className: 'dotted-route'
  }).addTo(map);
}
function showStatus(msg) {
  statusMessage.textContent = msg;
  statusMessage.style.display = 'block';
  setTimeout(() => { statusMessage.style.display = 'none'; }, 3000);
}
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI/180, φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180, Δλ = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
} 
// Register service worker for PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
} 