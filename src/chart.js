import { available, fmt } from './model.js';
/** @typedef {import('./model.js').Host} Host */
/** @type {Record<string,string>} */
export const colors = {
  System: '#708679',
  Projects: '#527c83',
  Caches: '#b47b42',
  Builds: '#a28b54',
  Downloads: '#c7aa75',
  Free: '#dce4d6',
};
/** @param {number} angle @param {number} radius */
function point(angle, radius) {
  return [170 + Math.cos(angle) * radius, 170 + Math.sin(angle) * radius].join(
    ',',
  );
}
/** @param {number[]} angles @param {number[]} radii */
export function arc(angles, radii) {
  const [start, end] = angles;
  const [inner, outer] = radii;
  const large = end - start > Math.PI ? 1 : 0;
  return `M${point(start, outer)} A${outer},${outer} 0 ${large} 1 ${point(end, outer)} L${point(end, inner)} A${inner},${inner} 0 ${large} 0 ${point(start, inner)} Z`;
}
/** @param {Host} h @param {string} selected */
export function diskMap(h, selected) {
  let angle = -Math.PI / 2;
  const entries = h.files.map((f) => ({ ...f, color: colors[f.folder] }));
  entries.push({
    id: 'free',
    name: 'Available',
    folder: 'Free',
    size: available(h),
    safe: false,
    color: colors.Free,
  });
  const paths = entries
    .map((f) => {
      const end = angle + (f.size / h.capacity) * Math.PI * 2;
      const d = arc([angle, end], [79, 133]);
      const marker = f.safe
        ? `<path d="${arc([angle, end], [139, 146])}" fill="${f.color}" aria-hidden="true"/>`
        : '';
      const target = f.folder === 'Free' ? 'All files' : f.folder;
      const path = `<path class="sector" d="${d}" fill="${f.color}" role="button" tabindex="0" data-folder="${target}" aria-pressed="${selected === f.folder}" aria-label="${f.name}: ${fmt(f.size)}, ${((f.size / h.capacity) * 100).toFixed(1)} percent of capacity"><title>${f.name}: ${fmt(f.size)}</title></path>${marker}`;
      angle = end;
      return path;
    })
    .join('');
  return `<svg viewBox="0 0 340 340" role="group" aria-label="Disk capacity map for ${h.name}">${paths}<text class="disk-center" x="170" y="167" text-anchor="middle">${fmt(available(h))}</text><text class="disk-label" x="170" y="188" text-anchor="middle">AVAILABLE / ${fmt(h.capacity)}</text></svg>`;
}
