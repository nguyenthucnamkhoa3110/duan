import { copyFile, cp, mkdir, readdir } from 'node:fs/promises';

await mkdir('dist/client', { recursive: true });
await mkdir('dist/server', { recursive: true });

const entries = await readdir('dist', { withFileTypes: true });
for (const entry of entries) {
  if (entry.name === 'server' || entry.name === 'client') continue;
  await cp(`dist/${entry.name}`, `dist/client/${entry.name}`, { recursive: true });
}

await copyFile('worker/index.js', 'dist/server/index.js');
