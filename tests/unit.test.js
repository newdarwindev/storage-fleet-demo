import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { arc, diskMap } from '../src/chart.js';
import {
  FleetState,
  initialFleet,
  used,
  available,
  needsAttention,
  fmt,
  GB,
} from '../src/model.js';

/** @param {FleetState} state */
function invariant(state) {
  for (const host of state.fleet) {
    assert.ok(available(host) >= 0);
    assert.ok(used(host) >= 0);
    assert.equal(used(host) + available(host), host.capacity);
    assert.equal(
      new Set(host.files.map((file) => file.id)).size,
      host.files.length,
    );
    const original = initialFleet()[host.id].files.filter((file) => !file.safe);
    assert.deepEqual(
      host.files.filter((file) => !file.safe),
      original,
    );
  }
  assert.equal(
    state.selectedBytes,
    state.chosen.reduce((n, file) => n + file.size, 0),
  );
  assert.ok(state.chosen.every((file) => file.safe));
}

test('original eight-host fixtures, OS mix, totals and formatting remain exact', () => {
  const state = new FleetState();
  assert.equal(state.fleet.length, 8);
  assert.equal(new Set(state.fleet.map((host) => host.os)).size, 3);
  assert.equal(
    state.fleet.reduce((n, host) => n + host.capacity, 0),
    8.5e12,
  );
  assert.equal(
    state.fleet.reduce((n, host) => n + available(host), 0),
    2.555e12,
  );
  assert.equal(state.fleet.filter(needsAttention).length, 2);
  assert.equal(fmt(42 * GB), '42 GB');
  assert.equal(fmt(8.5e12), '8.50 TB');
  invariant(state);
});

test('each host supports selected cleanup, repeat guard, protected data and undo', () => {
  const state = new FleetState();
  for (const original of initialFleet()) {
    state.chooseHost(original.id);
    assert.equal(used(state.host), used(original));
    state.selectAll();
    assert.equal(state.chosen.length, 3);
    const bytes = state.selectedBytes;
    const before = available(state.host);
    assert.ok(bytes > 0);
    state.selected.add('system');
    assert.equal(state.apply(), bytes);
    assert.equal(available(state.host), before + bytes);
    assert.equal(state.host.files.length, 2);
    assert.equal(state.apply(), 0);
    assert.equal(state.history.length, 1);
    invariant(state);
    assert.equal(state.undo(), true);
    assert.deepEqual(state.host, original);
    assert.equal(state.undo(), false);
  }
});

test('partial selection and multi-host undo restore snapshots in reverse order', () => {
  const state = new FleetState();
  const original = structuredClone(state.fleet);
  state.selected.add('cache');
  assert.equal(state.chosen.length, 1);
  assert.equal(state.apply(), 21 * GB);
  const afterFirst = structuredClone(state.fleet);
  state.chooseHost(2);
  state.selectAll();
  assert.equal(state.apply(), 96 * GB);
  invariant(state);
  state.undo();
  assert.deepEqual(state.fleet, afterFirst);
  state.undo();
  assert.deepEqual(state.fleet, original);
  invariant(state);
});

test('filter changes clear incompatible selection; folder selection is machine-wide; reset restores all', () => {
  const state = new FleetState();
  state.selectAll();
  state.filter('macOS');
  assert.equal(state.host.os, 'macOS');
  assert.equal(state.selected.size, 0);
  assert.equal(state.visibleHosts.length, 2);
  state.folder = 'Caches';
  state.selectAll();
  assert.equal(state.chosen.length, 3);
  state.apply();
  assert.equal(
    state.host.files.filter((file) => file.folder === 'Caches').length,
    0,
  );
  state.reset();
  assert.deepEqual(state.fleet, initialFleet());
  assert.equal(state.active, 0);
  assert.equal(state.folder, 'All files');
  assert.equal(state.os, 'All systems');
  assert.equal(state.selected.size, 0);
  assert.equal(state.history.length, 0);
});

test('attention is strictly below fifteen percent, independent of display rounding', () => {
  const host = initialFleet()[0];
  host.capacity = 100 * GB;
  host.files = [
    {
      id: 'fixture',
      name: 'Boundary fixture',
      folder: 'System',
      safe: false,
      size: 85 * GB,
    },
  ];
  assert.equal(needsAttention(host), false);
  host.files[0].size += 1;
  assert.equal(needsAttention(host), true);
  host.files[0].size -= 2;
  assert.equal(needsAttention(host), false);
});

test('deterministic seed 4919 maintains invariants across 150 mixed actions', () => {
  const state = new FleetState();
  let seed = 4919;
  for (let step = 0; step < 150; step += 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const actions = [
      () => state.chooseHost(seed % 8),
      () => state.selectAll(),
      () => state.apply(),
      () => state.undo(),
      () => state.filter(['Windows', 'Linux', 'macOS'][seed % 3]),
      () => state.reset(),
    ];
    actions[(seed >>> 8) % actions.length]();
    assert.doesNotThrow(
      () => invariant(state),
      `Seed 4919, step ${step}, state ${seed}`,
    );
  }
});

test('application source has no network, persistence or real filesystem APIs', () => {
  const source = readdirSync('src')
    .filter((name) => name.endsWith('.js'))
    .map((name) => readFileSync(`src/${name}`, 'utf8'))
    .join('\n');
  assert.doesNotMatch(
    source,
    /fetch\(|XMLHttpRequest|WebSocket|localStorage|indexedDB|showDirectoryPicker|node:fs/u,
  );
});

test('disk geometry is finite and every real category has a labelled keyboard target', () => {
  const state = new FleetState();
  for (const host of state.fleet) {
    const map = diskMap(host, 'All files');
    assert.doesNotMatch(map, /NaN|Infinity|undefined/u);
    assert.equal((map.match(/role="button"/gu) ?? []).length, 6);
    assert.equal((map.match(/tabindex="0"/gu) ?? []).length, 6);
    assert.match(map, /data-folder="Caches"/u);
    assert.match(map, /AVAILABLE/u);
  }
  assert.match(arc([0, Math.PI * 1.5], [79, 133]), /A133,133 0 1 1/u);
  state.selectAll();
  state.apply();
  const cleaned = diskMap(state.host, 'All files');
  assert.equal((cleaned.match(/role="button"/gu) ?? []).length, 3);
  assert.doesNotMatch(cleaned, /data-folder="Caches"/u);
});
