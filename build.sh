#!/usr/bin/env bash

cd bare-metal-wasm
./build.sh
cd ../wasm-bindgen-canvas
wasm-pack build
cd ../www
npm install
npm run build
