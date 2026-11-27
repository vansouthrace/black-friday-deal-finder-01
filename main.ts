// DealBeacon's hand-in program (Node 22, standard library only): it copies this repository's
// app/ (the static deal-finder site) and screenshots/ (its renders in a browser) into the
// output directory and writes /output/dossier.json with the vendored make.fun library, the
// summary the judge reads — the screenshots, the first load's files and bytes, and the site's
// source. vendor/makefun-frontend.ts is the kit's copy, left exactly as it is: the scorer
// rebuilds the dossier with its own copy and the two must match byte for byte. The program
// runs twice in grading and must write the same bytes both times; it only copies files and
// writes the dossier, so it does.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (from the kit's gate): only text_max_bytes shapes the bytes; the
// others refuse an entry the scorer would refuse — more than 4 screenshots or one over
// 256 KiB; more than 993 files and directories in app/ or 16 MiB of app files, since app/
// counts beside /output's own 1000-entry cap with screenshots/ and dossier.json.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 16777216 }),
);
