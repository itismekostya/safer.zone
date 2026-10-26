import { initialState, editPrice, activate, tone, symbol } from './price.js';
import { content, settings } from './content.js';

const storageKey = 'safer-price-selection-v1';
let saved = {};
if (settings.rememberSelections) {
  try { saved = JSON.parse(localStorage.getItem(storageKey)) || {}; } catch { /* Storage may be unavailable. */ }
}
const video = document.querySelector('video');
const episodeToggle = document.querySelector('.episode-toggle');
const items = new Map();

for (const section of document.querySelectorAll('[data-item]')) {
  const key = section.dataset.item;
  const config = content[key];
  const item = {
    key, config, section,
    control: section.querySelector('.price-control'),
    field: section.querySelector('.price-field'),
    input: section.querySelector('input'),
    measure: section.querySelector('.amount-measure'),
    button: section.querySelector('.circle'),
    message: section.querySelector('.message'),
    state: initialState(config.suggested, saved[key]),
  };
  items.set(key, item);
  item.input.addEventListener('input', () => {
    item.state = editPrice(item.state, item.input.value);
    hideMessage(item);
    render(item);
  });
  item.input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.isComposing) { event.preventDefault(); press(item); }
  });
  item.button.addEventListener('click', () => press(item));
  if (key === 'episode') episodeToggle.addEventListener('click', () => {
    if (item.state.unlocked) press(item);
  });
  render(item);
}

function render(item) {
  const { state } = item;
  item.control.dataset.tone = tone(state);
  item.control.dataset.unlocked = String(state.unlocked);
  item.control.dataset.state = state.unlocked ? (state.active ? 'active' : 'available') : (state.amount === null ? 'empty' : 'ready');
  item.field.hidden = state.unlocked;
  if (item.input.value !== state.draft) item.input.value = state.draft;
  item.measure.textContent = state.draft || item.input.placeholder;
  item.button.dataset.symbol = symbol(state);
  const label = state.unlocked
    ? `${state.active ? 'Stop' : 'Open'} ${item.config.title}`
    : state.amount === null ? `Choose the suggested price for ${item.config.title}`
      : `Confirm $${(state.amount / 100).toFixed(2)} and open ${item.config.title}`;
  item.button.setAttribute('aria-label', label);
  if (state.unlocked) item.button.setAttribute('aria-pressed', String(state.active));
  else item.button.removeAttribute('aria-pressed');
  if (item.key === 'episode') {
    episodeToggle.disabled = !state.unlocked;
    episodeToggle.setAttribute('aria-pressed', String(state.active));
    item.button.setAttribute('aria-controls', 'episode-video');
  }
}

function hideMessage(item) { item.message.hidden = true; item.message.textContent = ''; item.input.removeAttribute('aria-invalid'); }
function showMessage(item, text) { item.message.textContent = text; item.message.hidden = false; }

function press(item) {
  hideMessage(item);
  const next = activate(item.state);
  if (next.action === 'invalid') {
    item.input.setAttribute('aria-invalid', 'true');
    showMessage(item, 'Enter a non-negative amount with up to two decimal places.');
    item.input.focus();
    return;
  }
  if (next.action === 'open' && !item.config.url) {
    showMessage(item, 'Catalog.pdf has not been added yet.');
    return;
  }
  item.state = next.state;
  render(item);
  if (next.action === 'open') {
    // Remember confirmed amounts in this browser; no payment request is made.
    saved[item.key] = item.state.amount;
    if (settings.rememberSelections) {
      try { localStorage.setItem(storageKey, JSON.stringify(saved)); } catch { /* Selection still works for this visit. */ }
    }
    if (item.config.type === 'video') {
      item.input.blur();
      setVideoMode(true);
      video.play().catch(error => {
        if (error.name === 'AbortError') return;
        syncPlaying(false);
        showMessage(item, 'The video could not be played. Press the title or circle to try again.');
      });
    } else {
      const link = document.createElement('a');
      link.href = item.config.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
      item.state = { ...item.state, active: false };
      render(item);
    }
  } else if (next.action === 'pause' && item.config.type === 'video') {
    video.pause();
    setVideoMode(false);
  }
}

function setVideoMode(active) {
  document.body.classList.toggle('watching', active);
  video.hidden = !active;
}

function syncPlaying(active) {
  const item = items.get('episode');
  if (!item.state.unlocked) return;
  item.state = { ...item.state, active };
  render(item);
  setVideoMode(active);
}
video.addEventListener('play', () => syncPlaying(true));
video.addEventListener('pause', () => syncPlaying(false));
video.addEventListener('ended', () => syncPlaying(false));
video.addEventListener('error', () => {
  syncPlaying(false);
  showMessage(items.get('episode'), 'The video could not be loaded. Press the circle to try again.');
});
video.addEventListener('contextmenu', event => event.preventDefault());
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && items.get('episode').state.active) press(items.get('episode'));
});
