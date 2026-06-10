#!/usr/bin/env bash
# Builds a PDF-enabled CanvasKit WASM bundle from the Skia source tree.
#
# Prerequisites:
#   - git, python3, emscripten (emsdk activated)
#   - depot_tools on PATH (for gn/ninja) when building from google/skia
#
# Usage:
#   ./scripts/build-canvaskit.sh [output_dir]
#
# The script copies canvaskit-pdf.js / canvaskit-pdf.wasm into public/canvaskit/.
# For local development without building from source, the project ships prebuilt
# binaries extracted from @rollerbird/canvaskit-wasm-pdf (see npm run setup:canvaskit).

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR="${1:-$ROOT_DIR/public/canvaskit}"
SKIA_DIR="${SKIA_DIR:-$ROOT_DIR/.skia}"
BUILD_DIR="$SKIA_DIR/out/canvaskit-wasm-pdf"

mkdir -p "$OUTPUT_DIR"

if [[ ! -d "$SKIA_DIR/.git" ]]; then
  echo "Cloning Skia into $SKIA_DIR …"
  git clone --depth 1 https://github.com/google/skia.git "$SKIA_DIR"
  pushd "$SKIA_DIR" >/dev/null
  python3 tools/git-sync-deps
  popd >/dev/null
fi

pushd "$SKIA_DIR" >/dev/null

python3 modules/canvaskit/make_canvaskit.py \
  --release \
  --pdf \
  --output "$BUILD_DIR"

cp "$BUILD_DIR/canvaskit.js" "$OUTPUT_DIR/canvaskit-pdf.js"
cp "$BUILD_DIR/canvaskit.wasm" "$OUTPUT_DIR/canvaskit-pdf.wasm"

popd >/dev/null

echo "PDF-enabled CanvasKit copied to $OUTPUT_DIR"
