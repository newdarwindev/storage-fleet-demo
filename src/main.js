import './style.css';
import { FleetState, available, fmt } from './model.js';
import { element, render, renderSelection } from './render.js';
const state = new FleetState();
const dialog = element('confirm');
if (!(dialog instanceof HTMLDialogElement)) {
  throw new Error('Confirmation dialog missing');
}
const confirmation = dialog;
/** @param {string} text */
function announce(text) {
  element('status').textContent = text;
}
/** @param {Event} event @param {string} selector */
function target(event, selector) {
  return event.target instanceof Element
    ? event.target.closest(selector)
    : null;
}
/** @param {Event} event */
function chooseFolder(event) {
  const button = target(event, '[data-folder]');
  if (!button) {
    return;
  }
  state.folder = button.getAttribute('data-folder') ?? 'All files';
  render(state);
  const replacement = Array.from(
    element('folders').querySelectorAll('button'),
  ).find((b) => b.dataset.folder === state.folder);
  replacement?.focus();
}
function preview() {
  if (!state.chosen.length) {
    return;
  }
  element('summary').textContent =
    `Simulate removing ${state.chosen.length} demo items from ${state.host.name} to reclaim ${fmt(state.selectedBytes)}? Available space would become ${fmt(available(state.host) + state.selectedBytes)}.`;
  confirmation.showModal();
}
function apply() {
  const name = state.host.name;
  const bytes = state.apply();
  confirmation.close();
  render(state);
  element('undo').focus();
  announce(
    `Simulated ${fmt(bytes)} reclaimed on ${name}. No real files changed.`,
  );
}
function reset() {
  state.reset();
  const filter = element('os');
  if (filter instanceof HTMLSelectElement) {
    filter.value = state.os;
  }
  confirmation.close();
  render(state);
  announce('Demo reset. All eight fictional machines restored.');
}
element('hosts').addEventListener('click', (event) => {
  const button = target(event, '[data-host]');
  if (!button) {
    return;
  }
  const id = Number(button.getAttribute('data-host'));
  state.chooseHost(id);
  render(state);
  const current = element('hosts').querySelector(`[data-host="${id}"]`);
  if (current instanceof HTMLElement) {
    current.focus();
  }
});
for (const id of ['folders', 'disk-map', 'legend']) {
  element(id).addEventListener('click', chooseFolder);
}
element('disk-map').addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    chooseFolder(event);
  }
});
element('files').addEventListener('change', (event) => {
  if (!(event.target instanceof HTMLInputElement)) {
    return;
  }
  const id = event.target.dataset.file;
  if (!id) {
    return;
  }
  if (event.target.checked) {
    state.selected.add(id);
  } else {
    state.selected.delete(id);
  }
  renderSelection(state);
});
element('os').addEventListener('change', (event) => {
  if (event.target instanceof HTMLSelectElement) {
    state.filter(event.target.value);
    render(state);
  }
});
element('select-all').onclick = () => {
  state.selectAll();
  render(state);
};
element('preview').onclick = preview;
element('cancel').onclick = () => confirmation.close();
element('apply').onclick = apply;
element('undo').onclick = () => {
  state.undo();
  render(state);
  announce('Last simulated cleanup undone.');
  element('select-all').focus();
};
element('reset').onclick = reset;
render(state);
