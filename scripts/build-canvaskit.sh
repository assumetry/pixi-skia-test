#!/usr/bin/env bash
# Builds a PDF-enabled CanvasKit WASM bundle from the Skia source tree.
#
# Prerequisites (WSL/Ubuntu recommended):
#   - git, python3, build-essential (provides cc/g++ for host tools)
#   - emscripten: source ~/tools/emsdk/emsdk_env.sh
#   - depot_tools on PATH: export PATH="$HOME/depot_tools:$PATH"
#
# Usage:
#   ./scripts/build-canvaskit.sh [output_dir]
#
# Output:
#   public/canvaskit/canvaskit-pdf.js
#   public/canvaskit/canvaskit-pdf.wasm
#
# Skia source is stored in $HOME/.skia-build by default (not inside the project).
# WSL cannot reliably git-clone/build on /mnt/c/ — use the Linux home directory.
# Override: SKIA_DIR=/path/to/skia ./scripts/build-canvaskit.sh
#
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR="${1:-$ROOT_DIR/public/canvaskit}"
SKIA_DIR="${SKIA_DIR:-$HOME/.skia-build}"
CANVASKIT_DIR="$SKIA_DIR/modules/canvaskit"
COMPILE_SH="$CANVASKIT_DIR/compile.sh"
BUILD_DIR="out/canvaskit-wasm-pdf"
ARTIFACT_JS="$SKIA_DIR/$BUILD_DIR/canvaskit.js"
ARTIFACT_WASM="$SKIA_DIR/$BUILD_DIR/canvaskit.wasm"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: '$1' not found. $2" >&2
    exit 1
  fi
}

require_command git "Install git in WSL: sudo apt install git"
require_command python3 "Install python3 in WSL: sudo apt install python3"
require_command node "Install Node.js in WSL for post-build patching"

if ! command -v cc >/dev/null 2>&1 && ! command -v gcc >/dev/null 2>&1; then
  echo "Error: C compiler (cc/gcc) not found." >&2
  echo "  sudo apt update && sudo apt install -y build-essential" >&2
  exit 1
fi

if ! command -v emcc >/dev/null 2>&1; then
  echo "Error: emcc not found. Activate Emscripten first:" >&2
  echo "  source ~/tools/emsdk/emsdk_env.sh" >&2
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

if [[ "$ROOT_DIR" == /mnt/* && -d "$ROOT_DIR/.skia" ]]; then
  echo "Note: remove broken Windows checkout if present: rm -rf \"$ROOT_DIR/.skia\""
fi

if [[ "$ROOT_DIR" == /mnt/* ]]; then
  echo "Using Skia directory on Linux filesystem: $SKIA_DIR"
fi

if [[ ! -d "$SKIA_DIR/.git" ]]; then
  echo "Cloning Skia into $SKIA_DIR …"
  mkdir -p "$(dirname "$SKIA_DIR")"
  git -c core.filemode=false clone --depth 1 https://github.com/google/skia.git "$SKIA_DIR"
fi

if [[ ! -f "$COMPILE_SH" ]]; then
  echo "Error: Skia checkout looks incomplete (missing compile.sh)." >&2
  echo "Remove it and retry: rm -rf \"$SKIA_DIR\"" >&2
  exit 1
fi

DEPS_MARKER="$SKIA_DIR/.deps-sync-complete"
SYNC_ATTEMPTS="${SKIA_SYNC_ATTEMPTS:-10}"
SYNC_RETRY_DELAY="${SKIA_SYNC_RETRY_DELAY:-60}"

sync_skia_deps() {
  local attempt=1

  while (( attempt <= SYNC_ATTEMPTS )); do
    echo "Syncing Skia dependencies (attempt $attempt/$SYNC_ATTEMPTS, first run is slow) …"

    if (cd "$SKIA_DIR" && python3 tools/git-sync-deps); then
      touch "$DEPS_MARKER"
      return 0
    fi

    if (( attempt == SYNC_ATTEMPTS )); then
      break
    fi

    echo "git-sync-deps failed (often HTTP 429 from chromium.googlesource.com)."
    echo "Waiting ${SYNC_RETRY_DELAY}s — already downloaded deps are kept, retry continues …"
    sleep "$SYNC_RETRY_DELAY"
    (( attempt++ ))
  done

  echo "Error: could not sync Skia dependencies after $SYNC_ATTEMPTS attempts." >&2
  echo "Wait 15–30 minutes and run: cd \"$SKIA_DIR\" && python3 tools/git-sync-deps" >&2
  exit 1
}

if [[ ! -f "$DEPS_MARKER" ]]; then
  sync_skia_deps
fi

restore_compile_sh() {
  if [[ -n "${COMPILE_BACKUP:-}" && -f "$COMPILE_BACKUP" ]]; then
    mv -f "$COMPILE_BACKUP" "$COMPILE_SH"
  fi
}

echo "Applying CanvasKit PDF patch (pdf_bindings.cpp + pdf.js) …"
node "$ROOT_DIR/scripts/apply-canvaskit-pdf-patch.mjs" "$SKIA_DIR"

echo "Building CanvasKit with skia_enable_pdf=true and skia_canvaskit_enable_pdf=true …"
echo "Build directory: $SKIA_DIR/$BUILD_DIR"

COMPILE_BACKUP=""
if grep -q 'skia_enable_pdf=false' "$COMPILE_SH"; then
  COMPILE_BACKUP="${COMPILE_SH}.bak-pdf-build"
  cp "$COMPILE_SH" "$COMPILE_BACKUP"
  sed 's/skia_enable_pdf=false/skia_enable_pdf=true/' "$COMPILE_BACKUP" > "$COMPILE_SH"
fi
if ! grep -q 'skia_canvaskit_enable_pdf=true' "$COMPILE_SH"; then
  if [[ -z "$COMPILE_BACKUP" ]]; then
    COMPILE_BACKUP="${COMPILE_SH}.bak-pdf-build"
    cp "$COMPILE_SH" "$COMPILE_BACKUP"
  fi
  sed '/skia_enable_pdf=true/a\ skia_canvaskit_enable_pdf=true \\' "$COMPILE_SH" > "${COMPILE_SH}.tmp"
  mv "${COMPILE_SH}.tmp" "$COMPILE_SH"
fi
trap restore_compile_sh EXIT

(
  cd "$CANVASKIT_DIR"
  BUILD_DIR="$BUILD_DIR" ./compile.sh
)

restore_compile_sh
trap - EXIT

if [[ ! -f "$ARTIFACT_JS" || ! -f "$ARTIFACT_WASM" ]]; then
  echo "Error: build finished but artifacts are missing:" >&2
  echo "  $ARTIFACT_JS" >&2
  echo "  $ARTIFACT_WASM" >&2
  exit 1
fi

cp "$ARTIFACT_JS" "$OUTPUT_DIR/canvaskit-pdf.js"
cp "$ARTIFACT_WASM" "$OUTPUT_DIR/canvaskit-pdf.wasm"
cp "$ARTIFACT_WASM" "$OUTPUT_DIR/canvaskit.wasm"
node "$ROOT_DIR/scripts/patch-canvaskit-pdf.mjs" "$OUTPUT_DIR/canvaskit-pdf.js"

echo "PDF-enabled CanvasKit copied to $OUTPUT_DIR"
