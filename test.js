const WASM_FN_NAME = '_ed25519';
const WASM_VAR_NAME = 'wasm';

function init() {
  console.log('init');
  window[WASM_VAR_NAME] = window[WASM_FN_NAME].call(null);
  console.log(`${WASM_VAR_NAME} = ${WASM_FN_NAME}() =`, wasm);
  console.log('done');
}

window.onload = () => init();
