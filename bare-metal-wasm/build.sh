#!/usr/bin/env bash

set -euo pipefail

TARGET=wasm32-unknown-unknown
BINARY=target/$TARGET/release/bare_metal_wasm.wasm

cargo build --target $TARGET --release
# cargo build --target $TARGET
wasm-strip $BINARY
mkdir -p dist
wasm-opt -o dist/bare_metal_wasm.wasm -Oz $BINARY
ls -lh dist/bare_metal_wasm.wasm
cp dist/bare_metal_wasm.wasm ../www/assets/bare_metal_wasm.wasm