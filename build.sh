mkdir -p .bin
mkdir -p dist

gcc -o .bin/test.out src/*.c test.c

# github.com/emscripten-core/emscripten/blob/master/src/settings.js
emcc src/*.c \
  -DED25519_NO_SEED \
  -o dist/wasm.js \
  -s EXPORT_NAME='_ed25519' \
  -s MODULARIZE=1 \
  -Oz \
  -s DYNAMIC_EXECUTION=0 \
  -s STRICT=1 \
  -s DEFAULT_LIBRARY_FUNCS_TO_INCLUDE=[] \
  -s LIBRARY_DEPS_TO_AUTOEXPORT=[] \
  -s FILESYSTEM=0 \
  -s TOTAL_MEMORY=65536 \
  -s TOTAL_STACK=1024 \
  -s GLOBAL_BASE=1024 \

ls -l .bin
ls -l dist
