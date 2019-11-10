mkdir -p .bin

gcc -o .bin/test.out src/*.c test.c

# https://github.com/emscripten-core/emscripten/blob/master/src/settings.js
emcc src/*.c \
  -o .bin/wasm.js \
  -Oz \
  -s MODULARIZE=1 \
  -s EXPORT_NAME='_ed25519' \
  -s DEFAULT_LIBRARY_FUNCS_TO_INCLUDE=[] \
  -s FILESYSTEM=0

ls -l .bin
