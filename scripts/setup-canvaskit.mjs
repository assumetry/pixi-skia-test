#!/usr/bin/env node
/**
 * Copies prebuilt PDF-enabled CanvasKit binaries from node_modules into public/canvaskit.
 * Use scripts/build-canvaskit.sh to compile a custom WASM build from Skia source.
 */
import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = join(rootDir, 'node_modules', '@rollerbird', 'canvaskit-wasm-pdf', 'bin');
const targetDir = join(rootDir, 'public', 'canvaskit');

mkdirSync(targetDir, { recursive: true });
cpSync(join(sourceDir, 'canvaskit-pdf.js'), join(targetDir, 'canvaskit-pdf.js'));
cpSync(join(sourceDir, 'canvaskit-pdf.wasm'), join(targetDir, 'canvaskit-pdf.wasm'));

// WASM _MakePDFDocument requires _rootTag; upstream only sets it when rootTag is passed.
const jsPath = join(targetDir, 'canvaskit-pdf.js');
const brokenRootTag = 'g.rootTag&&(g._rootTag=g._rootTag||c(g.rootTag));';
const fixedRootTag = 'g._rootTag=g._rootTag||(g.rootTag?c(g.rootTag):null);';
let js = readFileSync(jsPath, 'utf8');
if (js.includes(brokenRootTag)) {
  js = js.replace(brokenRootTag, fixedRootTag);
  writeFileSync(jsPath, js);
} else if (!js.includes(fixedRootTag)) {
  console.warn('Could not patch MakePDFDocument _rootTag default in canvaskit-pdf.js');
}

console.log(`CanvasKit PDF binaries copied to ${targetDir}`);
