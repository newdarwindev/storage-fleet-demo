import { cp, mkdir, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
const destination = 'dist/evidence';
await mkdir(destination, { recursive: true });
const entries = await readdir('test-results', { recursive: true });
const videos = entries.filter((entry) => entry.endsWith('.webm')).sort();
if (videos.length === 0) {
  throw new Error('No UI videos produced; refusing empty evidence.');
}
const cards = [];
if (
  !videos.some((v) => v.includes('desktop')) ||
  !videos.some((v) => v.includes('mobile'))
) {
  throw new Error('Both desktop and mobile recordings are required.');
}
for (const [index, video] of videos.entries()) {
  const name = `${video.includes('mobile') ? 'mobile' : 'desktop'}-${index + 1}.webm`;
  await cp(join('test-results', video), join(destination, name));
  cards.push(
    `<section><h2>${video.includes('mobile') ? 'Mobile' : 'Desktop'} interaction ${index + 1}</h2><video controls preload="metadata" src="${name}"></video><p><a href="${name}">Download WebM</a></p></section>`,
  );
}
const sha = (process.env.GITHUB_SHA ?? 'local').replace(/[^a-zA-Z0-9]/gu, '');
await writeFile(
  join(destination, 'index.html'),
  `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Visual test evidence</title><style>body{font:16px system-ui;max-width:1000px;margin:40px auto;padding:20px;background:#f5f3eb;color:#182b25}video{max-width:100%;border:1px solid #999}section{margin:40px 0}code{overflow-wrap:anywhere}</style><h1>Visual test evidence</h1><p>Successful deployment commit: <code>${sha}</code></p><p>Recordings of automated desktop and mobile interactions; not pixel-diff assertions.</p><a href="../">Back to demo</a>${cards.join('')}</html>`,
);
