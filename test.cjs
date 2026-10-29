// Keep the original dependency-free entry point while exercising the extracted model.
const { spawnSync } = require('node:child_process');
const result = spawnSync(process.execPath, ['--test', 'tests/unit.test.js'], {
  stdio: 'inherit',
});
process.exitCode = result.status ?? 1;
