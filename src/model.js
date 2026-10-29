/** @typedef {{id:string,name:string,folder:string,size:number,safe:boolean}} FileRecord */
/** @typedef {{id:number,name:string,os:string,capacity:number,files:FileRecord[]}} Host */
export const GB = 1e9;
/** @type {[string,string,number,number,number][]} */
const seeds = [
  ['Atlas', 'Windows', 1000, 910, 42],
  ['Nova', 'macOS', 500, 330, 28],
  ['Orbit', 'Linux', 2000, 1280, 96],
  ['Cedar', 'Windows', 500, 465, 34],
  ['Lumen', 'macOS', 1000, 620, 54],
  ['Relay', 'Linux', 1000, 760, 68],
  ['Pixel', 'Windows', 2000, 1190, 120],
  ['Echo', 'Linux', 500, 390, 31],
];
/** @returns {Host[]} */
export function initialFleet() {
  return seeds.map(([name, os, capacity, used, cleanup], id) => ({
    id,
    name,
    os,
    capacity: capacity * GB,
    files: [
      {
        id: 'cache',
        name: 'Application cache',
        folder: 'Caches',
        size: cleanup * 0.5 * GB,
        safe: true,
      },
      {
        id: 'build',
        name: 'Old build artifacts',
        folder: 'Builds',
        size: cleanup * 0.3 * GB,
        safe: true,
      },
      {
        id: 'download',
        name: 'Archived installer',
        folder: 'Downloads',
        size: cleanup * 0.2 * GB,
        safe: true,
      },
      {
        id: 'project',
        name: 'Active project',
        folder: 'Projects',
        size: 18 * GB,
        safe: false,
      },
      {
        id: 'system',
        name: 'System & other data',
        folder: 'System',
        size: (used - cleanup - 18) * GB,
        safe: false,
      },
    ],
  }));
}
/** @param {Host} h */
export const used = (h) => h.files.reduce((n, f) => n + f.size, 0);
/** @param {Host} h */
export const available = (h) => h.capacity - used(h);
/** @param {Host} h */
export const needsAttention = (h) => available(h) / h.capacity < 0.15;
/** @param {number} n */
export const fmt = (n) =>
  n >= 1e12
    ? (n / 1e12).toFixed(2) + ' TB'
    : (n / GB).toLocaleString('en-US', { maximumFractionDigits: 1 }) + ' GB';
export class FleetState {
  fleet = initialFleet();
  active = 0;
  folder = 'All files';
  os = 'All systems';
  /** @type {Set<string>} */ selected = new Set();
  /** @type {Host[][]} */ history = [];
  get host() {
    return this.fleet[this.active];
  }
  get chosen() {
    return this.host.files.filter((f) => f.safe && this.selected.has(f.id));
  }
  get selectedBytes() {
    return this.chosen.reduce((n, f) => n + f.size, 0);
  }
  /** @param {number} id */
  chooseHost(id) {
    this.active = id;
    this.folder = 'All files';
    this.selected.clear();
  }
  /** @param {string} os */
  filter(os) {
    this.os = os;
    const hosts = this.visibleHosts;
    if (!hosts.includes(this.host)) {
      this.chooseHost(hosts[0].id);
    }
  }
  get visibleHosts() {
    return this.fleet.filter(
      (h) => this.os === 'All systems' || h.os === this.os,
    );
  }
  selectAll() {
    this.selected = new Set(
      this.host.files.filter((f) => f.safe).map((f) => f.id),
    );
  }
  apply() {
    const reclaimed = this.selectedBytes;
    if (!reclaimed) {
      return 0;
    }
    this.history.push(structuredClone(this.fleet));
    this.host.files = this.host.files.filter(
      (f) => !f.safe || !this.selected.has(f.id),
    );
    this.selected.clear();
    return reclaimed;
  }
  undo() {
    const previous = this.history.pop();
    if (previous) {
      this.fleet = previous;
      this.selected.clear();
    }
    return Boolean(previous);
  }
  reset() {
    this.fleet = initialFleet();
    this.history = [];
    this.selected.clear();
    this.active = 0;
    this.folder = 'All files';
    this.os = 'All systems';
  }
}
