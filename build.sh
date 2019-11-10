mkdir -p .bin

gcc -o .bin/test.out src/*.c test.c

# github.com/emscripten-core/emscripten/blob/master/src/settings.js
emcc src/*.c \
  -DED25519_NO_SEED \
  -o .bin/wasm.js \
  -s EXPORT_NAME='_ed25519' \
  -s MODULARIZE=1 \
  -Oz \
  -s DEFAULT_LIBRARY_FUNCS_TO_INCLUDE=[] \
  -s FILESYSTEM=0 \
  -s TOTAL_MEMORY=1048576 \
  -s TOTAL_STACK=524288 \
  -s GLOBAL_BASE=1024 \

ls -l .bin
