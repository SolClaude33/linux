import {
  BatteryMedium,
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  Coins,
  Download,
  ExternalLink,
  FileText,
  FileType2,
  Folder,
  FolderOpen,
  Grid3x3,
  Home,
  Image,
  Maximize2,
  Minimize2,
  Minus,
  Search,
  Settings,
  SquareTerminal,
  Volume2,
  Wifi,
  X,
  createIcons,
} from 'lucide';
import { projectConfig } from './config.js';
import './styles.css';

const assetPath = Object.freeze({
  character: '/assets/character.webp',
  guide: '/assets/mascot-guide.webp',
});

const icons = {
  BatteryMedium, ChevronDown, ChevronRight, CircleUserRound, Coins, Download,
  ExternalLink, FileText, FileType2, Folder, FolderOpen, Grid3x3, Home, Image,
  Maximize2, Minimize2, Minus, Search, Settings, SquareTerminal, Volume2, Wifi, X,
};

const apps = Object.freeze({
  readme: { title: 'README.md', icon: 'file-text', className: 'app-readme', position: [176, 72], size: [760, 570] },
  token: { title: 'token.txt', icon: 'coins', className: 'app-token', position: [280, 118], size: [620, 470] },
  files: { title: 'Files', icon: 'folder', className: 'app-files', position: [218, 92], size: [800, 560] },
  terminal: { title: 'Terminal', icon: 'square-terminal', className: 'app-terminal', position: [245, 108], size: [700, 470] },
  settings: { title: 'Settings', icon: 'settings', className: 'app-settings', position: [370, 100], size: [660, 510] },
});

const desktopShortcuts = ['readme', 'token', 'files'];
const dockApps = ['readme', 'files', 'terminal', 'settings'];
const guideTips = Object.freeze({
  readme: 'Start here: enter /home for the art, or open Terminal for a few good commands.',
  token: 'Linux runs on Solana. This note keeps the pack facts together.',
  files: 'Grab a meme. Use the download buttons and release the good boy into the wild.',
  terminal: 'Try help, neofetch, or sudo woof. History is waiting on the arrow keys.',
  settings: 'Choose your habitat. Switch wallpapers or turn Motion off for a calmer good boy.',
});
const state = {
  windows: new Map(),
  topZ: 10,
  activeApp: null,
  settings: loadSettings(),
};

const root = document.querySelector('#app');
root.innerHTML = `
  <main class="desktop wallpaper-${state.settings.wallpaper}" aria-label="Linux desktop">
    <div class="unicorn-wallpaper" id="unicorn-wallpaper" aria-hidden="true"></div>
    <header class="topbar">
      <button class="topbar__activities" type="button" aria-haspopup="dialog" aria-controls="activities">Activities</button>
      <div class="topbar__active" aria-live="polite">Linux Desktop</div>
      <button class="topbar__clock" type="button" aria-label="Open date and time"><span data-clock></span></button>
      <button class="topbar__system" type="button" aria-label="Open system menu" aria-expanded="false">
        <i data-lucide="wifi" aria-hidden="true"></i><i data-lucide="volume-2" aria-hidden="true"></i><i data-lucide="battery-medium" aria-hidden="true"></i><i data-lucide="chevron-down" aria-hidden="true"></i>
      </button>
    </header>

    <section class="date-popover" aria-label="Date and time" hidden>
      <p data-full-date></p><strong data-large-time></strong><small>Linux local time</small>
    </section>

    <aside class="dock" aria-label="Favorite applications">
      <div class="dock__apps">${dockApps.map(dockButton).join('')}</div>
      <span class="dock__rule" aria-hidden="true"></span>
      <button class="dock__button dock__launcher" type="button" aria-label="Show applications" data-open-activities>
        <i data-lucide="grid-3x3" aria-hidden="true"></i>
      </button>
    </aside>

    <section class="desktop-files" aria-label="Desktop files">
      ${desktopShortcuts.map(shortcutButton).join('')}
    </section>

    <div class="wallpaper-wordmark" aria-hidden="true">
      <span class="wordmark">L<span>inu</span>x</span>
      <small>GOOD BOY SYSTEMS</small>
    </div>

    <section class="window-layer" aria-label="Open windows"></section>

    <section class="activities" id="activities" role="dialog" aria-modal="true" aria-labelledby="activities-title" hidden>
      <div class="activities__bar">
        <h2 id="activities-title">Activities</h2>
        <label class="search-field">
          <i data-lucide="search" aria-hidden="true"></i>
          <span class="sr-only">Search applications</span>
          <input type="search" placeholder="Type to search" autocomplete="off" data-activities-search />
        </label>
        <button class="icon-button" type="button" aria-label="Close Activities" data-close-activities><i data-lucide="x" aria-hidden="true"></i></button>
      </div>
      <div class="activities__content">
        <p class="eyebrow">Applications</p>
        <div class="app-grid">${Object.keys(apps).map(launcherButton).join('')}</div>
        <p class="activities__empty" role="status" hidden>No apps found. Try “terminal” or “files”.</p>
      </div>
    </section>

    <div class="system-popover" hidden>
      <div><i data-lucide="circle-user-round" aria-hidden="true"></i><span><strong>linux</strong><small>All systems: good boy</small></span></div>
      <button type="button" data-open-app="settings"><i data-lucide="settings" aria-hidden="true"></i> Settings</button>
    </div>

    <aside class="mascot-guide is-collapsed" aria-label="Linux desktop guide">
      <div class="mascot-guide__bubble" role="status" aria-live="polite" aria-atomic="true">
        <span class="mascot-guide__label">GOOD BOY GUIDE</span>
        <p data-guide-tip></p>
        <button type="button" aria-label="Dismiss guide tip" data-dismiss-guide><i data-lucide="x" aria-hidden="true"></i></button>
      </div>
      <button class="mascot-guide__mascot" type="button" aria-label="Repeat guide tip" data-repeat-guide>
        <img src="${assetPath.guide}" alt="" />
      </button>
    </aside>

    <div class="toast" role="status" aria-live="polite" aria-atomic="true"></div>
  </main>`;

const desktop = root.querySelector('.desktop');
const windowLayer = root.querySelector('.window-layer');
const activities = root.querySelector('.activities');
const systemPopover = root.querySelector('.system-popover');
const datePopover = root.querySelector('.date-popover');
const guide = root.querySelector('.mascot-guide');
const guideTip = root.querySelector('[data-guide-tip]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let activitiesReturnFocus = null;
let toastTimer;
let activeGuideApp = 'readme';
let unicornScene = null;
let unicornScenePromise = null;
let unicornScriptPromise = null;

function dockButton(id) {
  const app = apps[id];
  return `<button class="dock__button" type="button" aria-label="Open ${app.title}" title="${app.title}" data-open-app="${id}" data-dock-app="${id}">
    <i data-lucide="${app.icon}" aria-hidden="true"></i><span class="dock__dot" aria-hidden="true"></span>
  </button>`;
}

function shortcutButton(id) {
  const app = apps[id];
  return `<button class="desktop-file" type="button" data-open-app="${id}">
    <span class="desktop-file__icon"><i data-lucide="${app.icon}" aria-hidden="true"></i></span>
    <span>${app.title}</span>
  </button>`;
}

function launcherButton(id) {
  const app = apps[id];
  return `<button class="app-tile" type="button" data-open-app="${id}" data-search="${app.title.toLowerCase()} ${id}">
    <span><i data-lucide="${app.icon}" aria-hidden="true"></i></span><strong>${app.title}</strong>
  </button>`;
}

function loadSettings() {
  const defaults = { wallpaper: 'yellow', motion: true };
  try {
    const saved = JSON.parse(localStorage.getItem('linux.settings'));
    const savedWallpaper = saved?.wallpaper === 'illustration' ? 'yellow' : saved?.wallpaper;
    return {
      wallpaper: ['yellow', 'dark', 'photo'].includes(savedWallpaper) ? savedWallpaper : defaults.wallpaper,
      motion: typeof saved?.motion === 'boolean' ? saved.motion : defaults.motion,
    };
  } catch {
    return defaults;
  }
}

function saveSettings() {
  try {
    localStorage.setItem('linux.settings', JSON.stringify({ ...state.settings, version: 2 }));
  } catch {
    showToast('Settings applied for this session.');
  }
}

function refreshIcons(scope = document) {
  createIcons({ icons, attrs: { 'stroke-width': 1.8 }, nameAttr: 'data-lucide', root: scope });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character]);
}

function openApp(id) {
  if (!apps[id]) return;
  closeActivities();
  systemPopover.hidden = true;
  let record = state.windows.get(id);
  if (!record) {
    record = createWindow(id);
    state.windows.set(id, record);
  }
  record.minimized = false;
  record.element.hidden = false;
  focusWindow(id);
  updateDock();
  showGuide(id);
  requestAnimationFrame(() => {
    const focusTarget = id === 'terminal' ? record.element.querySelector('.terminal__form input') : record.element.querySelector('[data-window-close]');
    focusTarget?.focus({ preventScroll: true });
  });
}

function createWindow(id) {
  const app = apps[id];
  const [left, top] = app.position;
  const [width, height] = app.size;
  const element = document.createElement('article');
  element.className = `window ${app.className}`;
  element.dataset.window = id;
  element.setAttribute('role', 'dialog');
  element.setAttribute('aria-label', app.title);
  element.style.setProperty('--window-left', `${left}px`);
  element.style.setProperty('--window-top', `${top}px`);
  element.style.setProperty('--window-width', `${width}px`);
  element.style.setProperty('--window-height', `${height}px`);
  element.innerHTML = `
    <header class="window__titlebar" data-drag-handle>
      <span class="window__identity"><i data-lucide="${app.icon}" aria-hidden="true"></i><strong>${app.title}</strong></span>
      <span class="window__controls">
        <button type="button" aria-label="Minimize ${app.title}" data-window-minimize><i data-lucide="minus" aria-hidden="true"></i></button>
        <button type="button" aria-label="Maximize ${app.title}" data-window-maximize><i data-lucide="maximize-2" aria-hidden="true"></i></button>
        <button type="button" aria-label="Close ${app.title}" data-window-close><i data-lucide="x" aria-hidden="true"></i></button>
      </span>
    </header>
    <div class="window__content">${renderApp(id)}</div>`;
  windowLayer.append(element);
  clampWindow(element);
  bindWindow(element, id);
  if (id === 'terminal') bindTerminal(element);
  if (id === 'settings') bindSettings(element);
  if (id === 'files') bindFiles(element);
  if (id === 'token') bindToken(element);
  bindAssetFallbacks(element);
  refreshIcons(element);
  return { element, minimized: false, maximized: false };
}

function clampWindow(element) {
  if (window.matchMedia('(max-width: 767px)').matches || element.classList.contains('is-maximized')) return;
  const app = apps[element.dataset.window];
  const dockSafe = 80;
  const edge = 8;
  const width = Math.min(app.size[0], Math.max(420, windowLayer.clientWidth - dockSafe - edge));
  const height = Math.min(app.size[1], Math.max(310, windowLayer.clientHeight - edge * 2));
  const currentLeft = Number.parseFloat(element.style.getPropertyValue('--window-left')) || app.position[0];
  const currentTop = Number.parseFloat(element.style.getPropertyValue('--window-top')) || app.position[1];
  const left = Math.min(Math.max(dockSafe, currentLeft), Math.max(dockSafe, windowLayer.clientWidth - width - edge));
  const top = Math.min(Math.max(edge, currentTop), Math.max(edge, windowLayer.clientHeight - height - edge));
  element.style.setProperty('--window-width', `${width}px`);
  element.style.setProperty('--window-height', `${height}px`);
  element.style.setProperty('--window-left', `${left}px`);
  element.style.setProperty('--window-top', `${top}px`);
}

function bindWindow(element, id) {
  element.addEventListener('pointerdown', () => focusWindow(id));
  element.querySelector('[data-window-close]').addEventListener('click', () => closeWindow(id));
  element.querySelector('[data-window-minimize]').addEventListener('click', () => minimizeWindow(id));
  element.querySelector('[data-window-maximize]').addEventListener('click', () => toggleMaximize(id));
  element.querySelector('[data-drag-handle]').addEventListener('dblclick', (event) => {
    if (!event.target.closest('button')) toggleMaximize(id);
  });
  element.querySelector('[data-drag-handle]').addEventListener('pointerdown', startDrag);
}

function focusWindow(id) {
  const record = state.windows.get(id);
  if (!record || record.minimized) return;
  state.activeApp = id;
  state.topZ += 1;
  state.windows.forEach(({ element }, key) => element.classList.toggle('is-focused', key === id));
  record.element.style.zIndex = state.topZ;
  root.querySelector('.topbar__active').textContent = apps[id].title;
  updateDock();
}

function closeWindow(id) {
  const record = state.windows.get(id);
  if (!record) return;
  record.element.remove();
  state.windows.delete(id);
  if (state.activeApp === id) focusTopWindow();
  updateDock();
  restoreWindowFocus(id);
}

function minimizeWindow(id) {
  const record = state.windows.get(id);
  if (!record) return;
  record.minimized = true;
  record.element.hidden = true;
  if (state.activeApp === id) focusTopWindow();
  updateDock();
  restoreWindowFocus(id);
}

function restoreWindowFocus(closedId) {
  requestAnimationFrame(() => {
    const activeWindow = state.activeApp && state.windows.get(state.activeApp)?.element;
    if (activeWindow) activeWindow.querySelector('[data-window-close]')?.focus({ preventScroll: true });
    else root.querySelector(`[data-dock-app="${closedId}"]`)?.focus({ preventScroll: true });
  });
}

function focusTopWindow() {
  const candidates = [...state.windows.entries()].filter(([, record]) => !record.minimized);
  const next = candidates.sort((a, b) => Number(b[1].element.style.zIndex) - Number(a[1].element.style.zIndex))[0];
  if (next) focusWindow(next[0]);
  else {
    state.activeApp = null;
    root.querySelector('.topbar__active').textContent = 'Linux Desktop';
    state.windows.forEach(({ element }) => element.classList.remove('is-focused'));
  }
}

function toggleMaximize(id) {
  const record = state.windows.get(id);
  if (!record) return;
  record.maximized = !record.maximized;
  record.element.classList.toggle('is-maximized', record.maximized);
  const button = record.element.querySelector('[data-window-maximize]');
  button.innerHTML = `<i data-lucide="${record.maximized ? 'minimize-2' : 'maximize-2'}" aria-hidden="true"></i>`;
  button.setAttribute('aria-label', `${record.maximized ? 'Restore' : 'Maximize'} ${apps[id].title}`);
  refreshIcons(button);
}

function startDrag(event) {
  if (event.button !== 0 || event.target.closest('button') || window.matchMedia('(max-width: 767px)').matches) return;
  const handle = event.currentTarget;
  const element = handle.closest('.window');
  const record = state.windows.get(element.dataset.window);
  if (record?.maximized) return;
  handle.setPointerCapture(event.pointerId);
  const rect = element.getBoundingClientRect();
  const layerRect = windowLayer.getBoundingClientRect();
  const start = { x: event.clientX, y: event.clientY, left: rect.left, top: rect.top - layerRect.top };
  const move = (moveEvent) => {
    const dockSafe = 80;
    const maxLeft = Math.max(dockSafe, window.innerWidth - rect.width - 8);
    const maxTop = Math.max(8, windowLayer.clientHeight - rect.height - 8);
    const nextLeft = Math.min(maxLeft, Math.max(dockSafe, start.left + moveEvent.clientX - start.x));
    const nextTop = Math.min(maxTop, Math.max(8, start.top + moveEvent.clientY - start.y));
    element.style.setProperty('--window-left', `${nextLeft}px`);
    element.style.setProperty('--window-top', `${nextTop}px`);
  };
  const stop = () => {
    handle.removeEventListener('pointermove', move);
    handle.removeEventListener('pointerup', stop);
    handle.removeEventListener('pointercancel', stop);
  };
  handle.addEventListener('pointermove', move);
  handle.addEventListener('pointerup', stop);
  handle.addEventListener('pointercancel', stop);
}

function updateDock() {
  root.querySelectorAll('[data-dock-app]').forEach((button) => {
    const record = state.windows.get(button.dataset.dockApp);
    button.classList.toggle('is-running', Boolean(record));
    button.classList.toggle('is-active', state.activeApp === button.dataset.dockApp && !record?.minimized);
  });
}

function renderApp(id) {
  const renderers = { readme: renderReadme, token: renderToken, files: renderFiles, terminal: renderTerminal, settings: renderSettings };
  return renderers[id]();
}

function renderReadme() {
  return `<div class="readme-layout">
    <section class="readme-copy">
      <p class="eyebrow">README / HOME</p>
      <h1>Your new favorite<br><span>operating system.</span></h1>
      <p class="readme-lead">A Solana memecoin. Linux energy. Inu personality. A pack with root access.</p>
      <div class="readme-actions">
        <button class="primary-button" type="button" data-open-app="files"><i data-lucide="folder-open" aria-hidden="true"></i> Enter /home</button>
        <button class="secondary-button" type="button" data-open-app="terminal"><i data-lucide="square-terminal" aria-hidden="true"></i> Open Terminal</button>
        ${projectConfig.xUrl ? `<a class="secondary-button" href="${projectConfig.xUrl}" target="_blank" rel="noreferrer"><i data-lucide="external-link" aria-hidden="true"></i> Follow on X</a>` : ''}
      </div>
      <dl class="system-facts">
        <div><dt>Status</dt><dd><span class="status-dot"></span> All systems: good boy</dd></div>
        <div><dt>Home</dt><dd>/home/linux</dd></div>
        <div><dt>Kernel</dt><dd>Powered by snacks</dd></div>
      </dl>
    </section>
    <figure class="character-card">
      <div class="character-halo"></div>
      <img src="${assetPath.character}" alt="Shiba Inu wearing a penguin suit" />
      <figcaption><span>linux@home</span><strong>Make yourself at /home.</strong></figcaption>
    </figure>
  </div>`;
}

function renderToken() {
  const { token } = projectConfig;
  const verifiedRows = [
    token.network && ['Network', token.network],
    token.ticker && ['Ticker', token.ticker],
  ].filter(Boolean);
  return `<div class="document-view">
    <div class="document-view__meta"><i data-lucide="file-type-2" aria-hidden="true"></i><span>token.txt</span><small>Plain Text</small></div>
    <article class="token-note">
      <p class="eyebrow">PACK PROTOCOL</p>
      <h2>Meme energy,<br>open-source spirit.</h2>
      <p>Linux is a Solana memecoin and meme character with a command line, a penguin suit, and impeccable sit permissions.</p>
      <blockquote>“A good system listens. A great system also brings the ball back.”</blockquote>
      <dl class="token-data">
        ${verifiedRows.map(([label, value]) => `<div><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}
        ${token.contractAddress ? `<div><dt>Contract</dt><dd class="token-contract"><code>${escapeHtml(token.contractAddress)}</code><button type="button" data-copy-token>Copy</button></dd></div>` : ''}
      </dl>
      ${token.buyUrl ? `<a class="primary-button" href="${token.buyUrl}" target="_blank" rel="noreferrer">Open verified exchange <i data-lucide="external-link" aria-hidden="true"></i></a>` : ''}
    </article>
  </div>`;
}

function renderFiles() {
  const files = [
    { src: '/assets/memes/meme1.webp', name: 'meme1.webp', alt: 'Shiba penguin peeing on the Windows logo' },
    { src: '/assets/memes/meme2.webp', name: 'meme2.webp', alt: 'Shiba penguin drinking from a Windows XP carton' },
    { src: '/assets/memes/meme3.webp', name: 'meme3.webp', alt: 'Shiba penguin at a retro computer' },
    { src: '/assets/memes/meme4.webp', name: 'meme4.webp', alt: 'Photo of a Shiba penguin at a dual-monitor desk' },
    { src: '/assets/memes/meme5.webp', name: 'meme5.webp', alt: 'Seated Shiba penguin on a white background' },
    { src: '/assets/memes/meme6.webp', name: 'meme6.webp', alt: 'Cartoon Shiba penguin shooting at the Windows mascot' },
    { src: '/assets/memes/meme7.webp', name: 'meme7.webp', alt: '3D Shiba penguin on a green wireframe grid' },
  ];
  return `<div class="files-layout">
    <aside class="files-sidebar" aria-label="Places">
      <strong>Places</strong>
      <button type="button" class="is-selected" data-file-place="home"><i data-lucide="home" aria-hidden="true"></i> Home</button>
      <button type="button" data-file-place="memes"><i data-lucide="image" aria-hidden="true"></i> Memes</button>
      <button type="button" data-file-place="downloads"><i data-lucide="download" aria-hidden="true"></i> Downloads</button>
    </aside>
    <section class="files-main">
      <nav class="breadcrumbs" aria-label="Current folder"><button type="button" data-file-place="home"><i data-lucide="home" aria-hidden="true"></i><span class="sr-only">Home</span></button><i data-lucide="chevron-right" aria-hidden="true"></i><strong data-current-folder>home / linux</strong></nav>
      <div class="gallery">
        ${files.map((file) => `<figure class="gallery-item" data-gallery-item data-meme="true"><div class="gallery-item__preview"><img src="${file.src}" alt="${file.alt}" loading="lazy" decoding="async" /></div><figcaption><strong>${file.name}</strong><a href="${file.src}" download="${file.name}" aria-label="Download ${file.name}"><i data-lucide="download" aria-hidden="true"></i></a></figcaption></figure>`).join('')}
      </div>
    </section>
  </div>`;
}

function renderTerminal() {
  return `<div class="terminal" aria-label="Terminal simulator">
    <div class="terminal__output" role="log" aria-live="polite" aria-relevant="additions">
      <div class="terminal__welcome">Linux Terminal 1.0<br>Type <strong>help</strong> to see available commands.</div>
    </div>
    <form class="terminal__form" autocomplete="off">
      <label for="terminal-input"><span>linux@home</span>:<b>~</b>$</label>
      <input id="terminal-input" type="text" autocapitalize="none" spellcheck="false" aria-label="Terminal command" />
    </form>
  </div>`;
}

function bindTerminal(element) {
  const form = element.querySelector('.terminal__form');
  const input = form.querySelector('input');
  const output = element.querySelector('.terminal__output');
  const history = [];
  let historyIndex = 0;
  const commandText = {
    help: 'Commands: help, ls, cat README.md, about, token, memes, clear, neofetch, sudo woof, whoami, pwd, date',
    ls: 'README.md  token.txt  memes/',
    'cat README.md': 'Your new favorite operating system.\nA Shiba in a penguin suit. A pack with root access.\nMake yourself at /home.',
    about: 'Linux: open-source spirit, meme energy, excellent manners.',
    token: 'Meme energy, open-source spirit. Open token.txt for the full note.',
    memes: 'Opening /home/linux/memes…',
    neofetch: `       / \\        linux@home\n      / ^ \\       OS: Linux Good Boy Edition\n     / ᴥ  \\      Shell: snacksh\n    /|   |\\      Uptime: since someone said walk\n     |___|       Status: All systems: good boy`,
    'sudo woof': 'Permission granted. WOOF! 🐾',
    whoami: 'linux',
    pwd: '/home/linux',
  };
  const appendLine = (command, result) => {
    const entry = document.createElement('div');
    entry.className = 'terminal__entry';
    const prompt = document.createElement('div');
    prompt.className = 'terminal__prompt';
    prompt.textContent = `linux@home:~$ ${command}`;
    const response = document.createElement('pre');
    response.textContent = result;
    entry.append(prompt, response);
    output.append(entry);
    output.scrollTop = output.scrollHeight;
  };
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const command = input.value.trim();
    if (!command) return;
    history.push(command);
    historyIndex = history.length;
    input.value = '';
    if (command === 'clear') {
      output.replaceChildren();
      return;
    }
    let result;
    if (command === 'date') result = new Intl.DateTimeFormat('en', { dateStyle: 'full', timeStyle: 'long' }).format(new Date());
    else result = commandText[command] ?? `Command not found: ${command}. Type “help”.`;
    appendLine(command, result);
    if (command === 'memes') {
      openApp('files');
      setFilePlace(state.windows.get('files')?.element, 'memes');
    }
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      historyIndex = Math.max(0, historyIndex - 1);
      input.value = history[historyIndex] ?? '';
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      historyIndex = Math.min(history.length, historyIndex + 1);
      input.value = history[historyIndex] ?? '';
    }
  });
  element.addEventListener('click', (event) => {
    if (!event.target.closest('button')) input.focus();
  });
}

function bindFiles(element) {
  element.querySelectorAll('[data-file-place]').forEach((button) => button.addEventListener('click', () => {
    setFilePlace(element, button.dataset.filePlace);
  }));
}

function setFilePlace(element, place) {
  if (!element) return;
  const folderNames = { home: 'home / linux', memes: 'home / linux / memes', downloads: 'home / linux / Downloads' };
  if (!folderNames[place]) return;
  element.querySelector('[data-current-folder]').textContent = folderNames[place];
  element.querySelectorAll('.files-sidebar [data-file-place]').forEach((navButton) => {
    navButton.classList.toggle('is-selected', navButton.dataset.filePlace === place);
  });
  element.querySelectorAll('[data-gallery-item]').forEach((item) => {
    item.hidden = place === 'memes' && item.dataset.meme !== 'true';
  });
}

function bindToken(element) {
  element.querySelector('[data-copy-token]')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(projectConfig.token.contractAddress);
      showToast('Contract copied');
    } catch {
      showToast('Copy unavailable');
    }
  });
}

function renderSettings() {
  return `<div class="settings-view">
    <aside class="settings-nav"><strong>Settings</strong><div class="is-selected"><i data-lucide="image" aria-hidden="true"></i> Appearance</div></aside>
    <section class="settings-main">
      <p class="eyebrow">APPEARANCE</p><h2>Make it feel like home.</h2>
      <fieldset class="wallpaper-options"><legend>Wallpaper</legend>
        ${wallpaperChoice('yellow', 'Yellow', 'Interactive pack scene')}
        ${wallpaperChoice('dark', 'Graphite', 'Interactive graphite scene')}
        ${wallpaperChoice('photo', 'Good boy', 'The pack wallpaper')}
      </fieldset>
      <div class="setting-row"><span><strong>Interface motion</strong><small>Desktop animations and interactive wallpaper</small></span><label class="switch"><input type="checkbox" data-setting="motion" ${state.settings.motion ? 'checked' : ''}><span></span><b class="sr-only">Toggle interface motion</b></label></div>
    </section>
  </div>`;
}

function wallpaperChoice(value, title, description) {
  return `<label class="wallpaper-choice"><input type="radio" name="wallpaper" value="${value}" ${state.settings.wallpaper === value ? 'checked' : ''}><span class="wallpaper-choice__preview wallpaper-choice__preview--${value}"></span><span><strong>${title}</strong><small>${description}</small></span></label>`;
}

function bindSettings(element) {
  element.querySelectorAll('input').forEach((input) => input.addEventListener('change', () => {
    if (input.name === 'wallpaper') {
      state.settings.wallpaper = input.value;
      desktop.classList.remove('wallpaper-yellow', 'wallpaper-dark', 'wallpaper-photo');
      desktop.classList.add(`wallpaper-${input.value}`);
      updateUnicornScene();
    } else {
      state.settings[input.dataset.setting] = input.checked;
      if (input.dataset.setting === 'motion') {
        desktop.classList.toggle('motion-off', !input.checked);
        updateUnicornScene();
      }
    }
    saveSettings();
    showToast('Settings saved');
  }));
}

function showGuide(id) {
  activeGuideApp = id;
  guide.classList.remove('is-collapsed');
  desktop.classList.add('guide-visible');
  guideTip.textContent = '';
  requestAnimationFrame(() => { guideTip.textContent = guideTips[id]; });
}

function dismissGuide({ restoreFocus = true } = {}) {
  guide.classList.add('is-collapsed');
  desktop.classList.remove('guide-visible');
  if (restoreFocus) guide.querySelector('[data-repeat-guide]').focus({ preventScroll: true });
}

function loadUnicornSdk() {
  if (window.UnicornStudio) return Promise.resolve(window.UnicornStudio);
  if (unicornScriptPromise) return unicornScriptPromise;
  unicornScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-unicorn-sdk]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.UnicornStudio), { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = '/vendor/unicornStudio.umd.js';
    script.dataset.unicornSdk = '';
    script.async = true;
    script.addEventListener('load', () => resolve(window.UnicornStudio), { once: true });
    script.addEventListener('error', reject, { once: true });
    document.head.append(script);
  });
  return unicornScriptPromise;
}

function initUnicornScene() {
  if (unicornScenePromise) return unicornScenePromise;
  unicornScenePromise = loadUnicornSdk()
    .then((sdk) => sdk.addScene({
      elementId: 'unicorn-wallpaper',
      filePath: '/assets/unicorn-yellow.json',
      fps: 30,
      scale: 1,
      dpi: 1,
      fixed: true,
      production: false,
      interactivity: { mouse: { disableMobile: true, disabled: false } },
    }))
    .then((scene) => {
      unicornScene = scene;
      desktop.classList.add('unicorn-ready');
      updateUnicornScene();
      return scene;
    })
    .catch(() => {
      desktop.classList.add('unicorn-fallback');
      return null;
    });
  return unicornScenePromise;
}

function updateUnicornScene() {
  const shouldShow = state.settings.wallpaper === 'yellow' || state.settings.wallpaper === 'dark';
  desktop.classList.toggle('unicorn-active', shouldShow);
  if (shouldShow && !unicornScenePromise) void initUnicornScene();
  if (unicornScene) {
    unicornScene.paused = !shouldShow || !state.settings.motion || reducedMotion.matches;
    if (shouldShow) unicornScene.resize();
  }
}

function bindAssetFallbacks(scope) {
  scope.querySelectorAll('img').forEach((image) => image.addEventListener('error', () => {
    image.closest('figure')?.classList.add('asset-missing');
    image.hidden = true;
  }, { once: true }));
}

function showToast(message) {
  const toast = root.querySelector('.toast');
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 1800);
}

function openActivities() {
  activitiesReturnFocus = document.activeElement;
  activities.hidden = false;
  desktop.classList.add('activities-open');
  setDesktopInert(true);
  const input = activities.querySelector('input');
  input.value = '';
  filterActivities('');
  requestAnimationFrame(() => input.focus());
}

function closeActivities() {
  if (activities.hidden) return;
  activities.hidden = true;
  desktop.classList.remove('activities-open');
  setDesktopInert(false);
  activitiesReturnFocus?.focus?.({ preventScroll: true });
}

function setDesktopInert(value) {
  ['.topbar', '.dock', '.desktop-files', '.wallpaper-wordmark', '.window-layer', '.mascot-guide'].forEach((selector) => {
    const element = root.querySelector(selector);
    if (element) element.inert = value;
  });
}

function trapActivitiesFocus(event) {
  if (event.key !== 'Tab' || activities.hidden) return;
  const focusables = [...activities.querySelectorAll('button:not([hidden]), input:not([hidden])')]
    .filter((element) => !element.disabled && element.offsetParent !== null);
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function filterActivities(value) {
  const query = value.trim().toLowerCase();
  let visible = 0;
  activities.querySelectorAll('.app-tile').forEach((tile) => {
    const matches = tile.dataset.search.includes(query);
    tile.hidden = !matches;
    if (matches) visible += 1;
  });
  activities.querySelector('.activities__empty').hidden = visible > 0;
}

root.addEventListener('click', (event) => {
  if (event.target.closest('[data-dismiss-guide]')) dismissGuide();
  if (event.target.closest('[data-repeat-guide]')) showGuide(activeGuideApp);
  const appButton = event.target.closest('[data-open-app]');
  if (appButton) openApp(appButton.dataset.openApp);
  if (event.target.closest('[data-open-activities]') || event.target.closest('.topbar__activities')) openActivities();
  if (event.target.closest('[data-close-activities]')) closeActivities();
  if (event.target === activities) closeActivities();
  const systemButton = event.target.closest('.topbar__system');
  if (systemButton) {
    systemPopover.hidden = !systemPopover.hidden;
    systemButton.setAttribute('aria-expanded', String(!systemPopover.hidden));
  } else if (!event.target.closest('.system-popover')) {
    systemPopover.hidden = true;
    root.querySelector('.topbar__system').setAttribute('aria-expanded', 'false');
  }
  const clockButton = event.target.closest('.topbar__clock');
  if (clockButton) {
    datePopover.hidden = !datePopover.hidden;
    systemPopover.hidden = true;
  } else if (!event.target.closest('.date-popover')) {
    datePopover.hidden = true;
  }
});

activities.querySelector('[data-activities-search]').addEventListener('input', (event) => filterActivities(event.target.value));
document.addEventListener('keydown', (event) => {
  trapActivitiesFocus(event);
  if (event.key === 'Escape') {
    if (!activities.hidden) closeActivities();
    else if (!systemPopover.hidden) {
      systemPopover.hidden = true;
      root.querySelector('.topbar__system').setAttribute('aria-expanded', 'false');
    }
    else if (!datePopover.hidden) datePopover.hidden = true;
  }
});

function updateClock() {
  const now = new Date();
  root.querySelector('[data-clock]').textContent = new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(now);
  root.querySelector('[data-full-date]').textContent = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(now);
  root.querySelector('[data-large-time]').textContent = new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(now);
}

desktop.classList.toggle('motion-off', !state.settings.motion);
refreshIcons();
bindAssetFallbacks(guide);
updateClock();
setInterval(updateClock, 30_000);
window.addEventListener('resize', () => {
  state.windows.forEach(({ element }) => clampWindow(element));
  if (unicornScene && (state.settings.wallpaper === 'yellow' || state.settings.wallpaper === 'dark')) unicornScene.resize();
});
reducedMotion.addEventListener('change', updateUnicornScene);
updateUnicornScene();
openApp('readme');

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    reducedMotion.removeEventListener('change', updateUnicornScene);
    unicornScene?.destroy();
    unicornScene = null;
  });
}
