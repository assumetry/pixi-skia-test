/**
 * Adds PDF export bindings to an upstream Skia CanvasKit checkout.
 * Based on https://github.com/pushpagarwal/skia/tree/canvas-kit-pdf
 */
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..');
const PATCH_DIR = join(ROOT_DIR, 'deps/canvaskit-pdf-patch');

const skiaDir = process.argv[2];

if (!skiaDir) {
  console.error('Usage: node scripts/apply-canvaskit-pdf-patch.mjs <skia-dir>');
  process.exit(1);
}

const canvaskitDir = join(skiaDir, 'modules/canvaskit');
const compileSh = join(canvaskitDir, 'compile.sh');
const canvaskitGni = join(canvaskitDir, 'canvaskit.gni');
const buildGn = join(canvaskitDir, 'BUILD.gn');

const requireFile = (path) => {
  try {
    readFileSync(path);
  } catch {
    console.error(`Error: expected file not found: ${path}`);
    process.exit(1);
  }
};

requireFile(compileSh);
requireFile(canvaskitGni);
requireFile(buildGn);

copyFileSync(join(PATCH_DIR, 'pdf_bindings.cpp'), join(canvaskitDir, 'pdf_bindings.cpp'));
copyFileSync(join(PATCH_DIR, 'pdf.js'), join(canvaskitDir, 'pdf.js'));

const externsPath = join(canvaskitDir, 'externs.js');
const pdfExternsMarker = 'CanvasKit.MakePDFDocument';
let externs = readFileSync(externsPath, 'utf8');
if (!externs.includes(pdfExternsMarker)) {
  const pdfExterns = readFileSync(join(PATCH_DIR, 'pdf-externs.js'), 'utf8');
  externs = `${externs.trimEnd()}\n\n${pdfExterns.trim()}\n`;
  writeFileSync(externsPath, externs);
  console.log('Patched externs.js (PDF API names for closure)');
} else {
  console.log('externs.js already patched for PDF');
}

let gni = readFileSync(canvaskitGni, 'utf8');
if (!gni.includes('skia_canvaskit_enable_pdf')) {
  gni = gni.replace(
    'skia_canvaskit_enable_bidi = false',
    'skia_canvaskit_enable_bidi = false\n  skia_canvaskit_enable_pdf = false',
  );
  writeFileSync(canvaskitGni, gni);
  console.log('Patched canvaskit.gni');
} else {
  console.log('canvaskit.gni already patched');
}

let build = readFileSync(buildGn, 'utf8');
if (!build.includes('pdf_bindings.cpp')) {
  build = build.replace(
    `  if (skia_canvaskit_enable_rt_shader) {
    sources += [ "../../tools/sksltrace/SkSLTraceUtils.cpp" ]
  }`,
    `  if (skia_canvaskit_enable_rt_shader) {
    sources += [ "../../tools/sksltrace/SkSLTraceUtils.cpp" ]
  }
  if (skia_canvaskit_enable_pdf) {
    sources += [ "pdf_bindings.cpp" ]
  }`,
  );

  build = build.replace(
    `  if (skia_canvaskit_enable_canvas_bindings) {`,
    `  if (skia_canvaskit_enable_pdf) {
    ldflags += [
      "--pre-js",
      rebase_path("pdf.js"),
    ]
  }

  if (skia_canvaskit_enable_canvas_bindings) {`,
  );

  build = build.replace(
    `  if (!skia_canvaskit_enable_font) {
    defines += [ "CK_NO_FONTS" ]
  }
}`,
    `  if (!skia_canvaskit_enable_font) {
    defines += [ "CK_NO_FONTS" ]
  }
  if (skia_canvaskit_enable_pdf) {
    defines += [ "CK_INCLUDE_PDF" ]
  }
}`,
  );

  writeFileSync(buildGn, build);
  console.log('Patched BUILD.gn');
} else {
  console.log('BUILD.gn already patched');
}

let compile = readFileSync(compileSh, 'utf8');
if (!compile.includes('skia_canvaskit_enable_pdf')) {
  compile = compile.replace(
    'skia_enable_pdf=false \\',
    'skia_enable_pdf=true \\\n skia_canvaskit_enable_pdf=true \\',
  );
  writeFileSync(compileSh, compile);
  console.log('Patched compile.sh (skia_enable_pdf + skia_canvaskit_enable_pdf)');
} else {
  console.log('compile.sh already patched');
}

console.log(`PDF patch applied to ${canvaskitDir}`);
