mkdir -p .bin
mkdir -p dist

gcc -o .bin/test.out src/*.c test.c

# github.com/emscripten-core/emscripten/blob/master/src/settings.js
emcc src/*.c \
  -DED25519_NO_SEED \
  -o dist/wasm.js \
  -s EXPORT_NAME='_ed25519' \
  -s EXPORTED_FUNCTIONS=['_malloc','_free'] \
  -s MALLOC=emmalloc \
  -s MODULARIZE=1 \
  -Oz \
  -s STRICT=1 \
  -s FILESYSTEM=0 \
  -s TOTAL_MEMORY=65536 \
  -s TOTAL_STACK=8192 \

ls -l .bin
ls -l dist
