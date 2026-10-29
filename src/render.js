import { available, used, needsAttention, fmt } from './model.js';
import { diskMap, colors } from './chart.js';
/** @typedef {import('./model.js').Host} Host */
/** @typedef {import('./model.js').FileRecord} FileRecord */
/** @typedef {import('./model.js').FleetState} FleetState */
/** @param {string} id @returns {HTMLElement} */
export function element(id) {
  const node = document.getElementById(id);
  if (!node) {
    throw new Error(`Missing element: ${id}`);
  }
  return node;
}
/** @param {string} id @param {boolean} disabled */
function disable(id, disabled) {
  const button = element(id);
  if (button instanceof HTMLButtonElement) {
    button.disabled = disabled;
  }
}
/** @param {Host} h @param {number} active */
function hostRow(h, active) {
  const pct = (used(h) / h.capacity) * 100;
  const warning = needsAttention(h);
  return `<button class="host" data-host="${h.id}" aria-pressed="${h.id === active}" aria-label="${h.name}, ${h.os}, ${fmt(available(h))} free"><span class="host-row"><strong>${h.name}</strong><span>${fmt(available(h))} / ${fmt(h.capacity)}</span></span><span class="host-meta"><span>${h.os}</span><span class="${warning ? 'warning' : ''}">${(100 - pct).toFixed(1)}% free${warning ? ' · low' : ''}</span></span><span class="bar"><span class="${warning ? 'warn' : ''}" style="width:${pct}%"></span></span></button>`;
}
/** @param {FleetState} state */
function metrics(state) {
  const total = state.fleet.reduce((n, h) => n + h.capacity, 0);
  const free = state.fleet.reduce((n, h) => n + available(h), 0);
  const eligible = state.fleet
    .flatMap((h) => h.files)
    .filter((f) => f.safe)
    .reduce((n, f) => n + f.size, 0);
  element('total').textContent = fmt(total);
  element('free').textContent = fmt(free);
  element('free-percent').textContent =
    ((free / total) * 100).toFixed(1) + '% of fleet capacity';
  element('reclaimable').textContent = fmt(eligible);
  element('attention').textContent =
    state.fleet.filter(needsAttention).length + ' / 8';
}
/** @param {FileRecord} f @param {Set<string>} selected */
function fileRow(f, selected) {
  return `<tr><td><label class="file-label"><input type="checkbox" data-file="${f.id}" ${f.safe ? '' : 'disabled'} ${selected.has(f.id) ? 'checked' : ''} aria-label="${f.safe ? 'Select' : 'Protected'} ${f.name}"><span>${f.name}<small>${f.folder}</small></span></label></td><td>${f.safe ? 'Candidate' : 'Protected'}</td><td>${fmt(f.size)}</td></tr>`;
}
/** @param {Host} h */
function legend(h) {
  const entries = h.files.map((f) => ({ name: f.folder, size: f.size }));
  entries.push({ name: 'Free', size: available(h) });
  return entries
    .map(
      (f) =>
        `<button class="legend-item" data-folder="${f.name === 'Free' ? 'All files' : f.name}" aria-label="Inspect ${f.name}"><span class="swatch" style="background:${colors[f.name]}"></span><span>${f.name}</span><small>${fmt(f.size)} · ${((f.size / h.capacity) * 100).toFixed(1)}%</small></button>`,
    )
    .join('');
}
/** @param {FleetState} state */
function browser(state) {
  const h = state.host;
  const roots = {
    Windows: 'C:\\Demo\\',
    macOS: '/Users/demo/',
    Linux: '/home/demo/',
  };
  element('browser-title').textContent = h.name + ' / ' + h.os;
  element('host-free').textContent =
    ((available(h) / h.capacity) * 100).toFixed(1) + '% available';
  element('path').textContent =
    roots[/** @type {keyof typeof roots} */ (h.os)] +
    (state.folder === 'All files' ? '' : state.folder);
  element('disk-map').innerHTML = diskMap(h, state.folder);
  element('legend').innerHTML = legend(h);
  element('folders').innerHTML = [
    'All files',
    'Caches',
    'Builds',
    'Downloads',
    'Projects',
    'System',
  ]
    .map(
      (f) =>
        `<button data-folder="${f}" aria-pressed="${state.folder === f}">${f}</button>`,
    )
    .join('');
  const files = h.files.filter(
    (f) => state.folder === 'All files' || f.folder === state.folder,
  );
  element('files').innerHTML = files.length
    ? files.map((f) => fileRow(f, state.selected)).join('')
    : '<tr><td colspan="3" class="empty">This demo folder is empty.</td></tr>';
}
/** @param {FleetState} state */
export function renderSelection(state) {
  element('selected-size').textContent = fmt(state.selectedBytes);
  element('selected-count').textContent =
    state.chosen.length + ' items across this machine';
  disable('preview', !state.chosen.length);
}
/** @param {FleetState} state */
export function render(state) {
  metrics(state);
  element('hosts').innerHTML = state.visibleHosts
    .map((h) => hostRow(h, state.active))
    .join('');
  browser(state);
  disable('undo', !state.history.length);
  disable('select-all', !state.host.files.some((f) => f.safe));
  renderSelection(state);
}
