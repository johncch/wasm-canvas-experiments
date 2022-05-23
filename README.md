# WASM Canvas Experiments

## Introduction

This repository contains a demo of an algorithmically generated image that is drawn onto a canvas surface, three ways:

1. The image is generated in Rust WASM, memory mapped and rendered in JS.
2. The image is generated and rendered in pure JS.
3. The image is generated and rendered in Rust WASM.

The first and third Rust WASM implementations are different, with the former being a crunched small WASM binary with 2 exposed ABI. The latter is a wasm project with all the full wasm-bindgen bindings. The difference in size is staggering! The former is only 213 Bytes and the latter 39KB, not including all the other generated interfaces.

## Build

Ensure that all the dependencies are available and installed on your system. You will need:

- Rust
- `cargo`
- `wasm-pack`
- `node` & `npm`
- `wasm-strip`
- `wasm-opt`

Run the build script in the root folder.

```
./build.sh
```

### Building bare-metal-wasm

There is a build.sh in the folder. Run the script to generate the wasm binary and copy it to the www folder.

### Building wasm-bindgen-canvas

`wasm-pack build` will generate all the appropriate and correct binaries.

### Building www

This is standard webpack 5 project. `npm install` then `npm run start` or `npm run build` will provide the desired outputs.

## Results

There are no discernable performance differences on Firefox and Chrome. Tested on 2021 M1 MBP.

Since this is simply a lightweight manipulation of the image buffer there are no real computational costs that would benefit or penalized by the js wasm buffer.

## Acknowledgements

This repository is heavily based off a few internet resources. Thank you to the original authors!

- The [Rust-WASM game of life guide](https://rustwasm.github.io/docs/book/introduction.html)
- This [blog post by Cliff Biffle](https://cliffle.com/blog/bare-metal-wasm/)

## License

MIT
